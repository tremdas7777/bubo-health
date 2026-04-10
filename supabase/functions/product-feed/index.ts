import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STORE_URL = "https://snuggle-stuff-source.lovable.app";
const STORE_NAME = "Kazoom";

// Map product categories to Google product categories
const GOOGLE_CATEGORIES: Record<string, string> = {
  "casa-e-cozinha": "Home & Garden > Kitchen & Dining",
  "eletronicos": "Electronics",
  "esportes": "Sporting Goods",
  "ferramentas": "Hardware > Tools",
  "fitness": "Sporting Goods > Exercise & Fitness",
  "pesca": "Sporting Goods > Outdoor Recreation > Fishing",
  "saude-e-beleza": "Health & Beauty",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const items = (products || []).map((p: any) => {
    const price = (p.price_cents / 100).toFixed(2);
    const imageUrl = p.image_url?.startsWith("http") ? p.image_url : `${STORE_URL}${p.image_url || ""}`;
    const link = `${STORE_URL}/produto/${p.slug}`;
    const availability = "in_stock";
    const condition = "new";
    const googleCategory = GOOGLE_CATEGORIES[p.category] || "General";

    let additionalImages = "";
    if (p.images && Array.isArray(p.images)) {
      additionalImages = p.images
        .slice(1)
        .map((img: string) => {
          const url = img.startsWith("http") ? img : `${STORE_URL}${img}`;
          return `<g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`;
        })
        .join("\n      ");
    }

    // Sale price handling
    let salePriceBlock = "";
    if (p.original_price_cents && p.original_price_cents > p.price_cents) {
      const originalPrice = (p.original_price_cents / 100).toFixed(2);
      const now = new Date();
      const future = new Date(Date.now() + 30 * 86400000);
      const startDate = now.toISOString();
      const endDate = future.toISOString();
      salePriceBlock = `
      <g:price>${originalPrice} BRL</g:price>
      <g:sale_price>${price} BRL</g:sale_price>
      <g:sale_price_effective_date>${startDate}/${endDate}</g:sale_price_effective_date>`;
    }

    return `
    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(p.description || p.name)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      ${additionalImages}
      ${salePriceBlock || `<g:price>${price} BRL</g:price>`}
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      <g:brand>${STORE_NAME}</g:brand>
      ${p.gtin ? `<g:gtin>${escapeXml(p.gtin)}</g:gtin>` : "<g:identifier_exists>false</g:identifier_exists>"}
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(p.category || "Geral")}</g:product_type>
      <g:shipping>
        <g:country>BR</g:country>
        <g:price>0.00 BRL</g:price>
      </g:shipping>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${STORE_NAME}</title>
    <link>${STORE_URL}</link>
    <description>Produtos ${STORE_NAME}</description>
    ${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}