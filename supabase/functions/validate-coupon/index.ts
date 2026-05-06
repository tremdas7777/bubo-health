import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CouponRow = {
  code: string;
  discount_type: "percent" | "fixed" | string;
  discount_value: number;
  min_order_cents: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  free_shipping: boolean;
};

function nowIso() {
  return new Date().toISOString();
}

function computeDiscountCents(c: CouponRow, subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  if (c.discount_type === "percent") {
    const pct = Math.max(0, Math.min(100, Number(c.discount_value) || 0));
    return Math.floor((subtotalCents * pct) / 100);
  }
  if (c.discount_type === "fixed") {
    return Math.max(0, Math.floor(Number(c.discount_value) || 0));
  }
  return 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json() as {
      code?: string;
      subtotalCents?: number;
    };

    const code = (payload.code || "").trim().toUpperCase();
    const subtotalCents = Math.max(0, Math.floor(Number(payload.subtotalCents) || 0));

    if (!code) {
      return new Response(JSON.stringify({ ok: false, error: "Cupom inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: coupon } = await supabase
      .from("coupons")
      .select("code, discount_type, discount_value, min_order_cents, max_uses, used_count, active, expires_at, free_shipping")
      .eq("code", code)
      .maybeSingle();

    const c = coupon as CouponRow | null;
    if (!c) {
      return new Response(JSON.stringify({ ok: false, error: "Cupom não encontrado" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!c.active) {
      return new Response(JSON.stringify({ ok: false, error: "Cupom inativo" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (c.expires_at && new Date(c.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ ok: false, error: "Cupom expirado" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (subtotalCents < (c.min_order_cents || 0)) {
      return new Response(JSON.stringify({ ok: false, error: "Pedido abaixo do mínimo do cupom" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (c.max_uses != null && c.used_count >= c.max_uses) {
      return new Response(JSON.stringify({ ok: false, error: "Cupom esgotado" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const discountCents = Math.min(subtotalCents, computeDiscountCents(c, subtotalCents));

    return new Response(JSON.stringify({
      ok: true,
      code: c.code,
      discountCents,
      freeShipping: !!c.free_shipping,
      checkedAt: nowIso(),
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("validate-coupon error:", e);
    return new Response(JSON.stringify({ ok: false, error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

