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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    const { amount, buyerName, buyerEmail, buyerDocument, buyerPhone, metadata, secretKey: payloadSecretKey } = payload as {
      amount?: number;
      buyerName?: string;
      buyerEmail?: string;
      buyerDocument?: string;
      buyerPhone?: string;
      metadata?: Record<string, unknown> & {
        shippingCostCents?: number;
        shippingMethod?: string;
        couponCode?: string;
        couponDiscountCents?: number;
        couponFreeShipping?: boolean;
      };
      secretKey?: string;
    };

    if (!amount) {
      return new Response(JSON.stringify({ error: "amount é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let secretKey = payloadSecretKey;

    if (!secretKey) {
      // Read secret key from gateway_config (server-side, bypasses RLS with service role)
      const { data: gwConfig } = await supabase
        .from("gateway_config")
        .select("beehive_secret_key")
        .limit(1)
        .single();

      secretKey = gwConfig?.beehive_secret_key;
    }

    if (!secretKey) {
      console.error("Erro: beehive_secret_key não encontrada na tabela gateway_config");
      return new Response(JSON.stringify({ error: "Chave Beehive não configurada no painel Admin" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const authHeader = "Basic " + btoa(`${secretKey}:x`);
    const amountCents = Math.round(amount * 100);

    const clientIp = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "";

    const body: Record<string, unknown> = {
      paymentMethod: "pix",
      amount: amountCents,
      postbackUrl: `${supabaseUrl}/functions/v1/beehive-webhook`,
      pix: {
        expiresInSeconds: 1800,
      },
      items: [
        {
          title: "Pedido Bubo Health",
          unitPrice: amountCents,
          quantity: 1,
          tangible: false,
        },
      ],
      metadata: {
        provider: "Bubo Health",
        order_id: `KZ-${Date.now()}`,
      },
    };

    if (clientIp) {
      body.ip = clientIp;
    }

    if (buyerName || buyerEmail || buyerDocument || buyerPhone) {
      body.customer = {
        ...(buyerName && { name: buyerName }),
        ...(buyerEmail && { email: buyerEmail }),
        ...(buyerPhone && { phone: `+55${buyerPhone.replace(/\D/g, "")}` }),
        ...(buyerDocument && {
          document: { type: "cpf", number: buyerDocument.replace(/\D/g, "") },
        }),
        ...(metadata?.address && {
          address: {
            street: metadata.address,
            streetNumber: metadata.addressNumber || "S/N",
            complement: metadata.complement || "",
            neighborhood: metadata.neighborhood || "",
            city: metadata.city || "",
            state: metadata.state || "",
            zipCode: metadata.cep?.replace(/\D/g, "") || "",
            country: "BR",
          }
        })
      };
    }

    console.log("Beehive PIX request:", JSON.stringify(body));

    const response = await fetch("https://api.conta.paybeehive.com.br/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Beehive PIX error:", JSON.stringify(data));
      return new Response(JSON.stringify({
        error: data?.refusedReason?.description || data?.message || data?.error || "Erro na API Beehive",
        details: data,
      }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Beehive PIX success:", JSON.stringify(data));

    const pixCode = data.pix?.qrcode || data.pix?.qr_code || data.pix?.emv || data.pix?.code || "";
    const pixQrCode = data.pix?.qrcodeBase64 || data.pix?.qr_code_base64 || "";

    if (!pixCode) {
      return new Response(JSON.stringify({
        error: data?.message || "Resposta inválida da adquirente: código PIX não retornado.",
        details: data,
      }), {
        status: 424,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const couponCode = (metadata?.couponCode || "").toString().trim().toUpperCase() || null;
    const couponDiscountCents = Math.max(0, Math.floor(Number(metadata?.couponDiscountCents) || 0));
    const couponFreeShipping = !!metadata?.couponFreeShipping;

    const { data: orderData, error: orderError } = await supabase.from("orders").insert({
      amount_cents: amountCents,
      status: data.status || "pending",
      pix_code: pixCode,
      pix_qr_code: pixQrCode,
      buyer_name: buyerName || null,
      buyer_email: buyerEmail || null,
      buyer_document: buyerDocument ? buyerDocument.replace(/\D/g, "") : null,
      buyer_phone: buyerPhone || null,
      gateway: "beehive",
      shipping_cost_cents: metadata?.shippingCostCents || 0,
      shipping_method: metadata?.shippingMethod || null,
      coupon_code: couponCode,
      coupon_discount_cents: couponDiscountCents,
      coupon_free_shipping: couponFreeShipping,
    }).select("id").single();

    if (orderError) {
      console.error("Order save error:", orderError);
    }

    // Fire webhooks
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
                gateway: "beehive",
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
    console.error("criar-pix-beehive error:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
