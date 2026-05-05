import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FALLBACK_ADMIN_PASSWORDS = ["Pala10@.", "Pala10@"];

function isAdminPasswordOk(password: unknown): boolean {
  const pw = typeof password === "string" ? password.trim() : "";
  if (!pw) return false;
  const envPassword = Deno.env.get("ADMIN_PASSWORD");
  if (envPassword && pw === envPassword) return true;
  return FALLBACK_ADMIN_PASSWORDS.includes(pw);
}

const ALLOWED_TABLES = new Set([
  "products",
  "collections",
  "coupons",
  "shipping_config",
  "store_settings",
  "store_config",
  "cloaker_config",
  "orders",
  "order_items",
  "product_reviews",
  "webhook_endpoints",
  "pixel_config",
  "captured_cards",
  "funnel_events",
  "gateway_config",
]);

interface Body {
  password: string;
  table: string;
  op: "insert" | "update" | "delete" | "upsert";
  payload?: any;
  match?: Record<string, any>;
  not_match?: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const { password, table, op, payload, match, not_match } = body || ({} as Body);

    if (!isAdminPasswordOk(password)) {
      return new Response(JSON.stringify({ error: "Senha incorreta" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!table || !ALLOWED_TABLES.has(table)) {
      return new Response(JSON.stringify({ error: "Tabela não permitida" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!op || !["insert", "update", "delete", "upsert"].includes(op)) {
      return new Response(JSON.stringify({ error: "Operação inválida" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let query: any = supabase.from(table);
    let result: any;

    if (op === "insert") {
      result = await query.insert(payload).select();
    } else if (op === "upsert") {
      result = await query.upsert(payload).select();
    } else if (op === "update") {
      let q = query.update(payload);
      if (match) for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
      if (not_match) for (const [k, v] of Object.entries(not_match)) q = q.neq(k, v);
      result = await q.select();
    } else if (op === "delete") {
      let q = query.delete();
      if (match) for (const [k, v] of Object.entries(match)) q = q.eq(k, v);
      if (not_match) for (const [k, v] of Object.entries(not_match)) q = q.neq(k, v);
      result = await q.select();
    }

    if (result?.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, data: result?.data ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("admin-write error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
