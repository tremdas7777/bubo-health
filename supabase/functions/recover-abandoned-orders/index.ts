import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find pending orders older than 30 minutes, with email, not yet sent recovery
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, buyer_name, buyer_email, amount_cents, status, created_at")
      .eq("status", "pending")
      .eq("recovery_email_sent", false)
      .lt("created_at", thirtyMinAgo)
      .gt("created_at", sixHoursAgo)
      .not("buyer_email", "is", null)
      .limit(20);

    if (error) {
      console.error("Error fetching abandoned orders:", error);
      throw error;
    }

    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({ ok: true, recovered: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;

    for (const order of orders) {
      try {
        // Get order items
        const { data: items } = await supabase
          .from("order_items")
          .select("product_name, quantity, price_cents")
          .eq("order_id", order.id);

        // Send recovery email via send-order-email
        const { error: fnError } = await supabase.functions.invoke("send-order-email", {
          body: {
            orderId: order.id,
            buyerEmail: order.buyer_email,
            buyerName: order.buyer_name || "Cliente",
            status: "pending",
            amountCents: order.amount_cents,
            type: "recovery",
            items: (items || []).map(i => ({
              name: i.product_name,
              quantity: i.quantity,
              priceCents: i.price_cents,
            })),
          },
        });

        if (fnError) {
          console.error(`Recovery email failed for order ${order.id}:`, fnError);
          continue;
        }

        // Mark as sent
        await supabase
          .from("orders")
          .update({ recovery_email_sent: true, recovery_email_sent_at: new Date().toISOString() })
          .eq("id", order.id);

        sentCount++;
        console.log(`Recovery email sent for order ${order.id} to ${order.buyer_email}`);
      } catch (e) {
        console.error(`Error processing order ${order.id}:`, e);
      }
    }

    return new Response(JSON.stringify({ ok: true, recovered: sentCount, total: orders.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("recover-abandoned-orders error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
