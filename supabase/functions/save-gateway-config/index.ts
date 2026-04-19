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
    const { password, config } = await req.json();

    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminPassword || password !== adminPassword) {
      return new Response(JSON.stringify({ error: "Senha inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!config || typeof config !== "object") {
      return new Response(JSON.stringify({ error: "Config inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const allowedGateways = [
      "pagouai",
      "vennox",
      "centurionpay",
      "ironpay",
      "simpayout",
      "beehive",
      "pagamentosmp",
      "stripe",
    ];
    const activeGateway = allowedGateways.includes(config.activeGateway) ? config.activeGateway : "stripe";

    const updateData: Record<string, unknown> = {
      active_gateway: activeGateway,
      payment_methods: config.paymentMethods || {},
      pagouai_public_key: config.pagouai?.publicKey || "",
      pagouai_secret_key: config.pagouai?.secretKey || "",
      vennox_secret_key: config.vennox?.secretKey || "",
      vennox_company_id: config.vennox?.companyId || "",
      centurionpay_secret_key: config.centurionpay?.secretKey || "",
      centurionpay_company_id: config.centurionpay?.companyId || "",
      ironpay_api_token: config.ironpay?.apiToken || "",
      simpayout_client_id: config.simpayout?.clientId || "",
      simpayout_client_secret: config.simpayout?.clientSecret || "",
      beehive_public_key: config.beehive?.publicKey || "",
      beehive_secret_key: config.beehive?.secretKey || "",
      pagamentosmp_public_key: config.pagamentosmp?.publicKey || "",
      pagamentosmp_secret_key: config.pagamentosmp?.secretKey || "",
      stripe_publishable_key: config.stripe?.publishableKey || "",
      stripe_secret_key: config.stripe?.secretKey || "",
      stripe_webhook_secret: config.stripe?.webhookSecret || "",
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("gateway_config")
      .select("id")
      .limit(1)
      .single();

    let error;
    if (existing?.id) {
      const res = await supabase
        .from("gateway_config")
        .update(updateData)
        .eq("id", existing.id);
      error = res.error;
    } else {
      const res = await supabase
        .from("gateway_config")
        .insert([updateData]);
      error = res.error;
    }

    if (error) {
      console.error("Save gateway error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("save-gateway-config error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
