import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Hard-coded fallback passwords (kept in sync with admin-write, read-gateway-config, save-gateway-config)
const FALLBACK_PASSWORDS = ["Pala10@.", "Pala10@"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    const pw = password?.trim();

    // Check against ADMIN_PASSWORD env var first (if set)
    const envPassword = Deno.env.get("ADMIN_PASSWORD");
    const valid =
      (envPassword && pw === envPassword) ||
      FALLBACK_PASSWORDS.includes(pw);

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
