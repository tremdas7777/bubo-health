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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    const valid = isAdminPasswordOk(password);

    return new Response(JSON.stringify({ valid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ valid: false, error: "Erro interno" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
