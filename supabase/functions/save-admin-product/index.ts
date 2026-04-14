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
    const { password, product } = await req.json();

    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminPassword || password !== adminPassword) {
      return new Response(JSON.stringify({ error: "Senha inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!product || typeof product !== "object" || !product.name || !product.slug) {
      return new Response(JSON.stringify({ error: "Produto inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload = {
      name: String(product.name).trim(),
      slug: String(product.slug).trim(),
      price_cents: Number(product.price_cents) || 0,
      original_price_cents: product.original_price_cents ? Number(product.original_price_cents) : null,
      image_url: product.image_url ? String(product.image_url) : null,
      images: Array.isArray(product.images) ? product.images.filter(Boolean).map(String) : [],
      category: product.category ? String(product.category) : "Geral",
      description: product.description ? String(product.description) : "",
      description_html: product.description_html ? String(product.description_html) : "",
      variants: Array.isArray(product.variants) ? product.variants : [],
      featured: Boolean(product.featured),
      active: product.active !== false,
      sort_order: Number(product.sort_order) || 0,
      gtin: product.gtin ? String(product.gtin) : null,
      updated_at: new Date().toISOString(),
    };

    const productId = typeof product.id === "string" && product.id ? product.id : null;

    const query = productId
      ? supabase.from("products").update(payload).eq("id", productId).select("id").single()
      : supabase.from("products").insert(payload).select("id").single();

    const { data, error } = await query;

    if (error) {
      console.error("save-admin-product error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data?.id ?? productId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("save-admin-product fatal:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});