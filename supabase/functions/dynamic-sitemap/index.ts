import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STORE_URL = "https://snuggle-stuff-source.lovable.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const [productsRes, collectionsRes] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("active", true),
    supabase.from("collections").select("slug, updated_at").eq("active", true),
  ]);

  const today = new Date().toISOString().split("T")[0];

  const staticPages = [
    { loc: "/", changefreq: "daily", priority: "1.0" },
    { loc: "/produtos", changefreq: "daily", priority: "0.9" },
    { loc: "/sobre", changefreq: "monthly", priority: "0.5" },
    { loc: "/contato", changefreq: "monthly", priority: "0.5" },
    { loc: "/politica-de-privacidade", changefreq: "yearly", priority: "0.3" },
    { loc: "/termos-de-uso", changefreq: "yearly", priority: "0.3" },
    { loc: "/trocas-e-devolucoes", changefreq: "yearly", priority: "0.3" },
  ];

  let urls = staticPages.map(
    (p) => `  <url>
    <loc>${STORE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  );

  if (collectionsRes.data) {
    for (const c of collectionsRes.data) {
      const lastmod = c.updated_at ? c.updated_at.split("T")[0] : today;
      urls.push(`  <url>
    <loc>${STORE_URL}/colecao/${c.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
  }

  if (productsRes.data) {
    for (const p of productsRes.data) {
      const lastmod = p.updated_at ? p.updated_at.split("T")[0] : today;
      urls.push(`  <url>
    <loc>${STORE_URL}/produto/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});