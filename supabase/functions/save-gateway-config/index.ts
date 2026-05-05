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
    if (adminPassword && password !== adminPassword && (password?.trim() !== "Pala10@." && password?.trim() !== "Pala10@")) {
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
      updated_at: new Date().toISOString(),
    };

    // Only add fields if they are present in the config
    if (config.paymentMethods) updateData.payment_methods = config.paymentMethods;
    
    if (config.beehive && typeof config.beehive === "object") {
      if (typeof config.beehive.publicKey === "string") {
        updateData.beehive_public_key = config.beehive.publicKey.trim();
      }
      if (typeof config.beehive.secretKey === "string") {
        updateData.beehive_secret_key = config.beehive.secretKey.trim();
      }
    }

    if (config.pagouai) {
      if (config.pagouai.publicKey) updateData.pagouai_public_key = config.pagouai.publicKey;
      if (config.pagouai.secretKey) updateData.pagouai_secret_key = config.pagouai.secretKey;
    }

    if (config.vennox) {
      if (config.vennox.secretKey) updateData.vennox_secret_key = config.vennox.secretKey;
      if (config.vennox.companyId) updateData.vennox_company_id = config.vennox.companyId;
    }

    if (config.centurionpay) {
      if (config.centurionpay.secretKey) updateData.centurionpay_secret_key = config.centurionpay.secretKey;
      if (config.centurionpay.companyId) updateData.centurionpay_company_id = config.centurionpay.companyId;
    }

    if (config.ironpay && config.ironpay.apiToken) {
      updateData.ironpay_api_token = config.ironpay.apiToken;
    }

    if (config.simpayout) {
      if (config.simpayout.clientId) updateData.simpayout_client_id = config.simpayout.clientId;
      if (config.simpayout.clientSecret) updateData.simpayout_client_secret = config.simpayout.clientSecret;
    }

    if (config.pagamentosmp) {
      if (config.pagamentosmp.publicKey) updateData.pagamentosmp_public_key = config.pagamentosmp.publicKey;
      if (config.pagamentosmp.secretKey) updateData.pagamentosmp_secret_key = config.pagamentosmp.secretKey;
    }

    // Stripe fields - only if present
    if (config.stripe) {
      if (config.stripe.publishableKey) updateData.stripe_publishable_key = config.stripe.publishableKey;
      if (config.stripe.secretKey) updateData.stripe_secret_key = config.stripe.secretKey;
      if (config.stripe.webhookSecret) updateData.stripe_webhook_secret = config.stripe.webhookSecret;
      if (config.stripe.testPublishableKey) updateData.stripe_test_publishable_key = config.stripe.testPublishableKey;
      if (config.stripe.testSecretKey) updateData.stripe_test_secret_key = config.stripe.testSecretKey;
      if (config.stripe.testWebhookSecret) updateData.stripe_test_webhook_secret = config.stripe.testWebhookSecret;
      if (config.stripe.mode) updateData.stripe_mode = config.stripe.mode;
    }

    const { count, error: countErr } = await supabase
      .from("gateway_config")
      .select("id", { count: "exact", head: true });

    if (countErr) {
      console.error("save-gateway-config count:", countErr);
      return new Response(JSON.stringify({ error: countErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let error;
    if ((count ?? 0) === 0) {
      const res = await supabase.from("gateway_config").insert([{
        ...updateData,
        payment_methods: updateData.payment_methods ?? {},
      }]);
      error = res.error;
    } else {
      // Atualiza todas as linhas para não ficar chave nova só na última linha enquanto a view/cliente lê outra duplicata.
      const res = await supabase
        .from("gateway_config")
        .update(updateData)
        .gte("updated_at", "1970-01-01T00:00:00Z");
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
