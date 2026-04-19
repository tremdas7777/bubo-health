import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: gw } = await supabaseAdmin
      .from("gateway_config")
      .select("stripe_secret_key, stripe_webhook_secret")
      .limit(1)
      .single();

    if (!gw?.stripe_secret_key) {
      return new Response("Stripe not configured", { status: 400, headers: corsHeaders });
    }

    const stripe = new Stripe(gw.stripe_secret_key, { apiVersion: "2024-06-20" });
    const signature = req.headers.get("stripe-signature");
    const rawBody = await req.text();

    let event: Stripe.Event;
    if (gw.stripe_webhook_secret && signature) {
      try {
        event = await stripe.webhooks.constructEventAsync(
          rawBody,
          signature,
          gw.stripe_webhook_secret,
        );
      } catch (err) {
        console.error("Signature verification failed", err);
        return new Response("Invalid signature", { status: 400, headers: corsHeaders });
      }
    } else {
      // No webhook secret configured: parse without verification (NOT recommended).
      event = JSON.parse(rawBody) as Stripe.Event;
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await supabaseAdmin
          .from("orders")
          .update({
            status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await supabaseAdmin
          .from("orders")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", orderId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe-webhook error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
