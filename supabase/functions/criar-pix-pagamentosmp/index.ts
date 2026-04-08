import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const API_BASE = "https://app.pagamentosmp.com/api/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { amount, buyerName, buyerEmail, buyerDocument, buyerPhone, metadata } = body;

    const publicKey = Deno.env.get("PAGAMENTOSMP_PUBLIC_KEY");
    const secretKey = Deno.env.get("PAGAMENTOSMP_SECRET_KEY");

    if (!publicKey || !secretKey) {
      return new Response(
        JSON.stringify({ error: "Chaves MP Pagamentos não configuradas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique identifier for this transaction
    const identifier = crypto.randomUUID().replace(/-/g, "").slice(0, 20);

    // Amount is in BRL (reais), not cents
    const amountBRL = typeof amount === "number" && amount > 100 ? amount : amount;
    const shippingFeeBRL = metadata?.shippingCostCents ? metadata.shippingCostCents / 100 : 0;

    // Format document - keep as-is with dots/dashes if present
    const document = buyerDocument || "";
    const formattedDoc = document.replace(/\D/g, "").length === 11
      ? document.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      : document;

    // Format phone
    const phoneClean = (buyerPhone || "").replace(/\D/g, "");
    const formattedPhone = phoneClean.length === 11
      ? `(${phoneClean.slice(0, 2)}) ${phoneClean.slice(2, 7)}-${phoneClean.slice(7)}`
      : phoneClean.length === 10
      ? `(${phoneClean.slice(0, 2)}) ${phoneClean.slice(2, 6)}-${phoneClean.slice(6)}`
      : buyerPhone || "";

    const requestBody: Record<string, unknown> = {
      identifier,
      amount: amountBRL,
      shippingFee: shippingFeeBRL,
      client: {
        name: buyerName || "Cliente",
        email: buyerEmail || "",
        phone: formattedPhone,
        document: formattedDoc,
      },
      metadata: metadata || {},
    };

    console.log("MP Pagamentos request body:", JSON.stringify(requestBody));

    // Create PIX payment via MP Pagamentos API
    const pixResponse = await fetch(`${API_BASE}/gateway/pix/receive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": publicKey,
        "x-secret-key": secretKey,
      },
      body: JSON.stringify(requestBody),
    });

    const pixData = await pixResponse.json();

    if (!pixResponse.ok) {
      console.error("MP Pagamentos PIX error:", JSON.stringify(pixData));
      return new Response(
        JSON.stringify({ error: pixData.message || "Erro ao gerar PIX no MP Pagamentos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("MP Pagamentos PIX success:", JSON.stringify(pixData));

    // Extract PIX code and QR code from response (pix.code, pix.base64, pix.image)
    const pixCode = pixData.pix?.code || pixData.pix_code || pixData.brcode || pixData.emv || "";
    const pixQrCode = pixData.pix?.base64 || pixData.pix?.image || pixData.qr_code_base64 || "";
    const amountCents = Math.round(amountBRL * 100);

    if (!pixCode) {
      console.error("MP Pagamentos: no pix_code in response", JSON.stringify(pixData));
      return new Response(
        JSON.stringify({ error: "PIX gerado mas sem código retornado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save order to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        amount_cents: amountCents,
        status: "pending",
        pix_code: pixCode,
        pix_qr_code: pixQrCode,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_document: buyerDocument,
        buyer_phone: buyerPhone,
        gateway: "pagamentosmp",
        shipping_cost_cents: metadata?.shippingCostCents || 0,
      })
      .select("id")
      .single();

    if (orderError) {
      console.error("Order insert error:", orderError);
    }

    return new Response(
      JSON.stringify({
        pix_code: pixCode,
        pix_qr_code: pixQrCode,
        order_id: order?.id || "",
        gateway_response: pixData,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("criar-pix-pagamentosmp error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
