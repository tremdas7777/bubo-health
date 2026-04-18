import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Webhook público da Beehive — recebe atualizações de status de PIX e Cartão.
// Atualiza o pedido, dispara Utmify (paid/refused), email e webhooks da loja.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json().catch(() => ({}));
    console.log("Beehive webhook payload:", JSON.stringify(payload).slice(0, 1000));

    // Beehive envia em formato { data: {...} } ou direto
    const tx = payload?.data || payload;
    const status: string = String(tx?.status || "").toLowerCase();
    const transactionId = tx?.id;
    const internalOrderId: string | undefined = tx?.metadata?.order_id;
    const paymentMethod: string = String(tx?.paymentMethod || tx?.payment_method || "pix").toLowerCase();
    const amountCents: number = Number(tx?.amount || 0);
    const customer = tx?.customer || {};

    if (!transactionId && !internalOrderId) {
      return new Response(JSON.stringify({ ok: true, skipped: "no_id" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Localiza o pedido: tentamos pelo customer email + amount + gateway beehive (mais recente)
    // (Beehive não devolve nosso UUID nativamente; metadata.order_id é "KZ-timestamp", não o UUID do banco)
    let order: any = null;
    const email = customer?.email || null;
    if (email) {
      const { data } = await supabase
        .from("orders")
        .select("id, status, buyer_name, buyer_email, buyer_phone, buyer_document, amount_cents")
        .eq("buyer_email", email)
        .eq("gateway", "beehive")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      order = data;
    }

    if (!order) {
      console.warn("Beehive webhook: pedido não encontrado para", { email, transactionId });
      return new Response(JSON.stringify({ ok: true, skipped: "order_not_found" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newStatus =
      status === "paid" || status === "approved" ? "paid" :
      status === "refused" || status === "failed" || status === "cancelled" || status === "canceled" ? "cancelled" :
      status === "refunded" ? "refunded" :
      "pending";

    if (newStatus !== order.status) {
      await supabase.from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", order.id);
    }

    // Notifica Utmify: paid OU refused
    const utmifyStatus =
      newStatus === "paid" ? "paid" :
      (status === "refused" || status === "failed") ? "refused" :
      null;

    if (utmifyStatus) {
      try {
        await supabase.functions.invoke("notify-utmify", {
          body: {
            orderId: order.id,
            status: utmifyStatus,
            paymentMethod: paymentMethod === "credit_card" ? "credit_card" : "pix",
            customerName: order.buyer_name || customer?.name || "Cliente",
            customerEmail: order.buyer_email || email || "",
            customerPhone: order.buyer_phone || customer?.phone || null,
            customerDocument: order.buyer_document || customer?.document?.number || null,
            productName: "Pedido Kazoom",
            priceInCents: order.amount_cents || amountCents,
          },
        });
      } catch (e) { console.error("notify-utmify invoke error", e); }
    }

    if (newStatus === "paid") {
      // Email de confirmação
      try {
        await supabase.functions.invoke("send-order-email", {
          body: {
            orderId: order.id,
            buyerEmail: order.buyer_email,
            buyerName: order.buyer_name,
            status: "paid",
            amountCents: order.amount_cents,
            type: "status",
          },
        });
      } catch (e) { console.error("send-order-email invoke error", e); }

      // Webhooks da loja
      try {
        const { data: webhooks } = await supabase
          .from("webhook_endpoints")
          .select("url, events")
          .eq("active", true);
        const targets = (webhooks || []).filter((w: any) =>
          w.url?.trim() && Array.isArray(w.events) && w.events.includes("venda_aprovada")
        );
        await Promise.allSettled(targets.map((w: any) =>
          fetch(w.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "venda_aprovada",
              timestamp: new Date().toISOString(),
              source: "beehive-webhook",
              orderId: order.id,
              buyerName: order.buyer_name,
              buyerEmail: order.buyer_email,
              buyerPhone: order.buyer_phone,
              amount: (order.amount_cents || 0) / 100,
              gateway: "beehive",
            }),
          }).catch(() => null)
        ));
      } catch (e) { console.error("store webhook error", e); }
    }

    return new Response(JSON.stringify({ ok: true, status: newStatus }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("beehive-webhook error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
