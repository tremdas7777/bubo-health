// Translates an array of texts to a target language using Lovable AI Gateway.
// Public function (no auth) - safe because it only translates short user-facing strings.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LANG_NAMES: Record<string, string> = {
  en: "English", es: "Spanish", pt: "Portuguese (Brazil)", fr: "French",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { texts, targetLang } = await req.json();
    if (!Array.isArray(texts) || !targetLang) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!LANG_NAMES[targetLang]) {
      return new Response(JSON.stringify({ translations: texts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const numbered = texts.map((t, i) => `${i + 1}. ${t}`).join("\n\n");
    const prompt = `Translate each numbered text below to ${LANG_NAMES[targetLang]}. Keep the same numbering. Preserve tone (casual product review). Return ONLY the translations, one per number, no extra commentary.\n\n${numbered}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a professional translator. Output only the translated lines with their original numbering. No explanations." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${err}`);
    }
    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content || "";

    // Parse "1. text\n\n2. text..."
    const translations: string[] = [];
    const lines = content.split(/\n+/).filter((l) => l.trim());
    for (const line of lines) {
      const m = line.match(/^\s*(\d+)[.)]\s*(.+)$/);
      if (m) translations[parseInt(m[1]) - 1] = m[2].trim();
    }
    // Fallback: keep original if parsing failed for some
    for (let i = 0; i < texts.length; i++) {
      if (!translations[i]) translations[i] = texts[i];
    }

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
