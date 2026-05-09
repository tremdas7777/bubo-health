import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const API_URL = "https://api.utmify.com.br/api-credentials/orders";

const fmtDate = (d = new Date()) => d.toISOString().replace("T", " ").substring(0, 19);

interface Body {
  orderId: string;
  status: "waiting_payment" | "paid" | "refused";
  paymentMethod?: "pix" | "credit_card";
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string | null;
  customerDocument?: string | null;
  productId?: string;
  productName?: string;
  priceInCents: number;
  trackingParameters?: Record<string, string | null>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body?.orderId || !body?.status || !body?.priceInCents) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios ausentes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Busca tokens em TODAS as linhas — pega o primeiro não vazio.
    // Evita falhas quando há múltiplas linhas em gateway_config e a mais
    // recente não contém os tokens Utmify.
    const { data: rows } = await supabase
      .from("gateway_config")
      .select("utmify_api_token, utmify_api_token_2, updated_at")
      .order("updated_at", { ascending: false });

    const allTokens: string[] = [];
    for (const r of (rows ?? []) as Array<{ utmify_api_token?: string | null; utmify_api_token_2?: string | null }>) {
      for (const t of [r.utmify_api_token, r.utmify_api_token_2]) {
        if (typeof t === "string" && t.trim().length > 0 && !allTokens.includes(t.trim())) {
          allTokens.push(t.trim());
        }
      }
    }
    const tokens = allTokens;

    if (tokens.length === 0) {
      console.warn("Utmify: nenhum token configurado");
      return new Response(JSON.stringify({ skipped: true, reason: "no_token" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = fmtDate();
    const payload = {
      orderId: body.orderId,
      platform: "Bubo Health-store",
      paymentMethod: body.paymentMethod || "pix",
      status: body.status,
      createdAt: now,
      approvedDate: body.status === "paid" ? now : null,
      refundedAt: null,
      customer: {
        name: body.customerName || "Cliente",
        email: body.customerEmail || "",
        phone: body.customerPhone || null,
        document: body.customerDocument || null,
      },
      products: [
        {
          id: body.productId || "Bubo Health-product",
          name: body.productName || "Pedido Bubo Health",
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: body.priceInCents,
        },
      ],
      trackingParameters: {
        src: body.trackingParameters?.src || null,
        sck: body.trackingParameters?.sck || null,
        utm_source: body.trackingParameters?.utm_source || null,
        utm_campaign: body.trackingParameters?.utm_campaign || null,
        utm_medium: body.trackingParameters?.utm_medium || null,
        utm_content: body.trackingParameters?.utm_content || null,
        utm_term: body.trackingParameters?.utm_term || null,
      },
      commission: {
        totalPriceInCents: body.priceInCents,
        gatewayFeeInCents: 0,
        userCommissionInCents: body.priceInCents,
        currency: "BRL",
      },
    };

    const results = await Promise.allSettled(
      tokens.map(async (token) => {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-token": token },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        console.log(`Utmify [${token.slice(0, 6)}...] status=${res.status} body=${text.slice(0, 200)}`);
        return res.ok;
      })
    );

    const success = results.some((r) => r.status === "fulfilled" && r.value === true);
    return new Response(JSON.stringify({ success, sent: tokens.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-utmify error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
