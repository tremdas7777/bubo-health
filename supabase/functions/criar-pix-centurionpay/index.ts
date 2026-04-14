import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, buyerName, buyerEmail, buyerDocument, buyerPhone, externalRef, metadata } = await req.json();

    if (!amount) {
      return new Response(JSON.stringify({ error: "amount é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read keys from gateway_config (server-side)
    const { data: gwConfig, error: gwError } = await supabase
      .from("gateway_config")
      .select("centurionpay_secret_key, centurionpay_company_id")
      .limit(1)
      .single();

    if (gwError || !gwConfig?.centurionpay_secret_key || !gwConfig?.centurionpay_company_id) {
      console.error("Gateway config error:", gwError);
      return new Response(JSON.stringify({ error: "Chaves CenturionPay não configuradas" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const secretKey = gwConfig.centurionpay_secret_key;
    const companyId = gwConfig.centurionpay_company_id;

    const webhookUrl = `${supabaseUrl}/functions/v1/payment-webhook`;
    const authHeader = "Basic " + btoa(`${secretKey}:${companyId}`);
    const amountCents = Math.round(amount * 100);

    const body: Record<string, unknown> = {
      paymentMethod: "pix",
      amount: amountCents,
      postbackUrl: webhookUrl,
      items: [
        {
          title: "Pedido Kazoom",
          unitPrice: amountCents,
          quantity: 1,
          tangible: false,
        },
      ],
    };

    if (buyerName || buyerEmail || buyerDocument || buyerPhone) {
      body.customer = {
        ...(buyerName && { name: buyerName }),
        ...(buyerEmail && { email: buyerEmail }),
        ...(buyerPhone && { phone: buyerPhone.replace(/\D/g, "") }),
        ...(buyerDocument && {
          documents: [{ type: "cpf", number: buyerDocument.replace(/\D/g, "") }],
        }),
      };
    }

    if (externalRef) {
      body.externalRef = externalRef;
    }

    console.log("CenturionPay request:", JSON.stringify(body));

    const response = await fetch("https://api.centurionpay.com.br/functions/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("CenturionPay error:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: data?.refusedReason?.description || data?.message || "Erro na API CenturionPay", details: data }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("CenturionPay success:", JSON.stringify(data));

    const pixCode = data.pix?.qrcode || data.pix?.qr_code || data.pix_qr_code || data.qr_code || data.pix?.emv || "";
    const pixQrCode = data.pix?.qrcodeBase64 || data.pix?.qr_code_base64 || data.pix_qr_code_url || data.qr_code_url || "";

    const { data: orderData, error: orderError } = await supabase.from("orders").insert({
      amount_cents: amountCents,
      status: data.status || "pending",
      pix_code: pixCode,
      pix_qr_code: pixQrCode,
      buyer_name: buyerName || null,
      buyer_email: buyerEmail || null,
      buyer_document: buyerDocument ? buyerDocument.replace(/\D/g, "") : null,
      buyer_phone: buyerPhone || null,
      gateway: "centurionpay",
      shipping_cost_cents: metadata?.shippingCostCents || 0,
    }).select("id").single();

    if (orderError) {
      console.error("Order save error:", orderError);
    }

    // Fire webhooks server-side
    try {
      const { data: webhooks } = await supabase
        .from("webhook_endpoints")
        .select("url, events")
        .eq("active", true);
      if (webhooks && webhooks.length > 0) {
        const targets = webhooks.filter((w: any) => w.url?.trim() && w.events?.includes("venda_pendente"));
        await Promise.allSettled(targets.map(async (webhook: any) => {
          try {
            await fetch(webhook.url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event: "venda_pendente",
                timestamp: new Date().toISOString(),
                source: "checkout",
                orderId: orderData?.id,
                buyerName,
                buyerEmail,
                buyerPhone,
                amount,
                gateway: "centurionpay",
              }),
            });
          } catch {}
        }));
      }
    } catch {}

    return new Response(JSON.stringify({
      pix_code: pixCode,
      pix_qr_code: pixQrCode,
      order_id: orderData?.id || "",
      gateway_response: data,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("criar-pix-centurionpay error:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
