import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import Stripe from "npm:stripe@17.5.0";

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
      .select("stripe_secret_key, stripe_webhook_secret, stripe_test_secret_key, stripe_test_webhook_secret, stripe_mode")
      .limit(1)
      .single();

    const signature = req.headers.get("stripe-signature");
    const rawBody = await req.text();

    // Try to verify against both modes (live and test) so the webhook works
    // regardless of which Stripe environment sent the event.
    const candidates: Array<{ secret: string; webhookSecret: string; label: string }> = [];
    if (gw?.stripe_secret_key) {
      candidates.push({
        secret: gw.stripe_secret_key,
        webhookSecret: gw.stripe_webhook_secret || "",
        label: "live",
      });
    }
    if (gw?.stripe_test_secret_key) {
      candidates.push({
        secret: gw.stripe_test_secret_key,
        webhookSecret: gw.stripe_test_webhook_secret || "",
        label: "test",
      });
    }

    if (candidates.length === 0) {
      return new Response("Stripe not configured", { status: 400, headers: corsHeaders });
    }

    let event: Stripe.Event | null = null;
    let usedSecret = "";
    let lastErr: unknown = null;

    for (const c of candidates) {
      const stripe = new Stripe(c.secret, { apiVersion: "2024-06-20" });
      if (c.webhookSecret && signature) {
        try {
          event = await stripe.webhooks.constructEventAsync(rawBody, signature, c.webhookSecret);
          usedSecret = c.secret;
          console.log(`stripe-webhook verified with ${c.label} keys`);
          break;
        } catch (err) {
          lastErr = err;
          continue;
        }
      } else {
        // No webhook secret: parse without verification (fallback)
        try {
          event = JSON.parse(rawBody) as Stripe.Event;
          usedSecret = c.secret;
          console.warn(`stripe-webhook parsed without signature for ${c.label}`);
          break;
        } catch (err) {
          lastErr = err;
        }
      }
    }

    if (!event) {
      console.error("Signature verification failed for all candidates", lastErr);
      return new Response("Invalid signature", { status: 400, headers: corsHeaders });
    }
    void usedSecret;

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
