import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const amountCents = Math.round(amount * 100);

    // Create PIX payment via MP Pagamentos API
    const pixResponse = await fetch(`${API_BASE}/gateway/pix/receive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": publicKey,
        "x-secret-key": secretKey,
      },
      body: JSON.stringify({
        amount: amountCents,
        customer: {
          name: buyerName,
          email: buyerEmail,
          document: buyerDocument,
          phone: buyerPhone,
        },
        metadata: metadata || {},
      }),
    });

    const pixData = await pixResponse.json();

    if (!pixResponse.ok) {
      console.error("MP Pagamentos PIX error:", JSON.stringify(pixData));
      return new Response(
        JSON.stringify({ error: pixData.message || "Erro ao gerar PIX no MP Pagamentos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract PIX code and QR code from response
    const pixCode = pixData.pix_code || pixData.qr_code || pixData.brcode || pixData.emv || "";
    const pixQrCode = pixData.qr_code_base64 || pixData.qr_code_image || pixData.qr_code_url || "";

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
