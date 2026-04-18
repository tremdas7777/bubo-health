import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIKTOK_EVENT_MAP: Record<string, string> = {
  Purchase: "CompletePayment",
  InitiateCheckout: "InitiateCheckout",
  AddToCart: "AddToCart",
  ViewContent: "ViewContent",
  Lead: "SubmitForm",
  PageView: "Pageview",
};

interface Body {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  userAgent?: string;
  ip?: string;
  data?: Record<string, unknown>;
  userData?: {
    email?: string;
    phone?: string;
    external_id?: string;
    ttclid?: string;
    ttp?: string;
  };
}

async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function postWithRetry(url: string, body: any, headers: Record<string, string>, maxRetries = 3): Promise<{ ok: boolean; status: number; body: string }> {
  let lastErr: { ok: boolean; status: number; body: string } = { ok: false, status: 0, body: "" };
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      if (res.ok) {
        try {
          const j = JSON.parse(text);
          if (j?.code !== undefined && j.code !== 0) {
            lastErr = { ok: false, status: res.status, body: text };
            // TikTok-level error — only retry on 5xx-equivalent
            if (j.code >= 50000) {
              await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
              continue;
            }
            return lastErr;
          }
        } catch {}
        return { ok: true, status: res.status, body: text };
      }
      lastErr = { ok: false, status: res.status, body: text };
      if (res.status < 500 && res.status !== 429) return lastErr;
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    } catch (err) {
      lastErr = { ok: false, status: 0, body: String(err) };
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    }
  }
  return lastErr;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body?.eventName || !body?.eventId) {
      return new Response(JSON.stringify({ error: "eventName e eventId obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: pixelRow } = await supabase
      .from("pixel_config")
      .select("config")
      .limit(1)
      .single();

    const cfg: any = (pixelRow as any)?.config || {};
    const tiktokPixels: Array<{ pixelId: string; accessToken: string }> = (cfg.tiktokPixels || []).filter(
      (t: any) => t?.pixelId && t?.accessToken
    );

    if (tiktokPixels.length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: "no_pixel_or_token" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ttEventName = TIKTOK_EVENT_MAP[body.eventName] || body.eventName;
    const ip =
      body.ip ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "";
    const userAgent = body.userAgent || req.headers.get("user-agent") || "";

    // Build hashed user_data
    const user: Record<string, string> = {};
    if (body.userData?.email) user.email = await sha256(body.userData.email);
    if (body.userData?.phone) {
      const phone = body.userData.phone.replace(/\D/g, "");
      user.phone = await sha256(phone.startsWith("55") ? phone : `55${phone}`);
    }
    if (body.userData?.external_id) user.external_id = await sha256(body.userData.external_id);
    if (body.userData?.ttclid) user.ttclid = body.userData.ttclid;
    if (body.userData?.ttp) user.ttp = body.userData.ttp;
    if (ip) user.ip = ip;
    if (userAgent) user.user_agent = userAgent;

    const results = await Promise.allSettled(
      tiktokPixels.map(async (tt) => {
        const payload = {
          event_source: "web",
          event_source_id: tt.pixelId,
          data: [
            {
              event: ttEventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: body.eventId,
              user,
              properties: body.data || {},
              page: { url: body.eventSourceUrl || "" },
            },
          ],
        };
        const result = await postWithRetry(
          "https://business-api.tiktok.com/open_api/v1.3/event/track/",
          payload,
          { "Access-Token": tt.accessToken }
        );
        console.log(
          `TikTok CAPI [${tt.pixelId}] event=${ttEventName} ok=${result.ok} status=${result.status} body=${result.body.slice(0, 250)}`
        );
        return result.ok;
      })
    );

    const success = results.some((r) => r.status === "fulfilled" && r.value === true);
    return new Response(JSON.stringify({ success, sent: tiktokPixels.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("tiktok-capi error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
