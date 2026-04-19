import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  name: string;
  quantity: number;
  amount_cents: number; // unit price in USD cents
  product_id?: string | null;
  image?: string | null;
}

interface Body {
  items: CartItem[];
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  currency?: string; // ISO code, default usd
  shippingCostCents?: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Body;

    if (!body.items || body.items.length === 0) {
      return new Response(JSON.stringify({ error: "Carrinho vazio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body.buyerEmail || !body.buyerEmail.includes("@")) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body.successUrl || !body.cancelUrl) {
      return new Response(JSON.stringify({ error: "URLs de retorno obrigatórias" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Load Stripe secret key from gateway_config
    const { data: gw, error: gwErr } = await supabaseAdmin
      .from("gateway_config")
      .select("stripe_secret_key")
      .limit(1)
      .single();
    if (gwErr || !gw?.stripe_secret_key) {
      return new Response(
        JSON.stringify({ error: "Stripe não configurado. Configure a Secret Key no admin." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(gw.stripe_secret_key, {
      apiVersion: "2024-06-20",
    });

    const currency = (body.currency || "usd").toLowerCase();
    const totalCents =
      body.items.reduce((acc, it) => acc + it.amount_cents * it.quantity, 0) +
      (body.shippingCostCents || 0);

    // Pre-create order so webhook can mark it paid
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        buyer_name: body.buyerName,
        buyer_email: body.buyerEmail,
        buyer_phone: body.buyerPhone || null,
        amount_cents: totalCents,
        shipping_cost_cents: body.shippingCostCents || 0,
        status: "pending",
        gateway: "stripe",
        checkout_step: "payment",
      })
      .select("id")
      .single();

    if (orderErr || !order?.id) {
      return new Response(JSON.stringify({ error: "Erro ao criar pedido", details: orderErr?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save order items
    const itemsRows = body.items.map((it) => ({
      order_id: order.id,
      product_id: it.product_id || null,
      product_name: it.name,
      price_cents: it.amount_cents,
      quantity: it.quantity,
    }));
    await supabaseAdmin.from("order_items").insert(itemsRows);

    const lineItems = body.items.map((it) => ({
      price_data: {
        currency,
        product_data: {
          name: it.name,
          ...(it.image ? { images: [it.image] } : {}),
        },
        unit_amount: it.amount_cents,
      },
      quantity: it.quantity,
    }));

    if (body.shippingCostCents && body.shippingCostCents > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: "Shipping" },
          unit_amount: body.shippingCostCents,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: body.buyerEmail,
      line_items: lineItems,
      success_url: `${body.successUrl}${body.successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}&pedido=${order.id}&metodo=card`,
      cancel_url: body.cancelUrl,
      metadata: {
        order_id: order.id,
        buyer_name: body.buyerName || "",
        buyer_phone: body.buyerPhone || "",
        ...(body.metadata || {}),
      },
    });

    // Persist session id on the order for later reconciliation
    await supabaseAdmin
      .from("orders")
      .update({ pix_code: session.id }) // reuse field as gateway reference
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id, order_id: order.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("stripe-checkout error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
