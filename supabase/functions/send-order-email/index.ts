import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOGO_URL = "https://mnquagsywdzjudsfurle.supabase.co/storage/v1/object/public/product-images/brand%2Flogo-icon.png";
const STORE_NAME = "Kazoom";
const STORE_URL = "https://snuggle-stuff-source.lovable.app";
const FROM_EMAIL = "Kazoom <noreply@kazoombrasil.com.br>";
const SUPPORT_EMAIL = "suporte@kazoombrasil.com.br";
const WHATSAPP = "(77) 99138-1192";

// Brand colors
const PURPLE = "#A855F7";
const PURPLE_DARK = "#7c3aed";
const LIME = "#C8F507";
const BG_LIGHT = "#f8f5ff";

const BodySchema = z.object({
  orderId: z.string().min(1),
  buyerEmail: z.string().email(),
  buyerName: z.string().min(1),
  status: z.string().min(1),
  trackingCode: z.string().nullable().optional(),
  amountCents: z.number(),
  type: z.enum(["status", "tracking", "recovery"]),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    priceCents: z.number(),
  })).optional(),
});

function header() {
  return `
    <tr><td style="background:linear-gradient(135deg,${PURPLE_DARK},${PURPLE});padding:25px 40px;text-align:center;">
      <img src="${LOGO_URL}" alt="${STORE_NAME}" width="48" height="48" style="display:inline-block;margin-bottom:8px;" />
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;font-family:'Helvetica Neue',Arial,sans-serif;">${STORE_NAME}</h1>
    </td></tr>`;
}

function footer() {
  return `
    <tr><td style="background:#1a1a2e;padding:25px 40px;text-align:center;">
      <img src="${LOGO_URL}" alt="${STORE_NAME}" width="28" height="28" style="display:inline-block;margin-bottom:6px;" />
      <p style="font-size:13px;color:${LIME};font-weight:700;margin:0 0 6px;">${STORE_NAME}</p>
      <p style="font-size:11px;color:#aaa;margin:0 0 4px;">📧 ${SUPPORT_EMAIL} • 📱 ${WHATSAPP}</p>
      <p style="font-size:11px;color:#666;margin:0;">De utensílios a eletrônicos, tudo que você precisa. É Kazoom!</p>
    </td></tr>`;
}

function wrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f0f0f5;font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f5;padding:30px 15px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:100%;">
        ${header()}
        ${content}
        ${footer()}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function itemsTable(items: { name: string; quantity: number; priceCents: number }[]) {
  if (!items || items.length === 0) return "";
  const rows = items.map(i => `
    <tr>
      <td style="padding:10px 15px;border-bottom:1px solid #f0f0f5;font-size:13px;color:#333;">${i.name}</td>
      <td style="padding:10px 15px;border-bottom:1px solid #f0f0f5;font-size:13px;color:#666;text-align:center;">${i.quantity}</td>
      <td style="padding:10px 15px;border-bottom:1px solid #f0f0f5;font-size:13px;color:${PURPLE_DARK};font-weight:700;text-align:right;">
        ${(i.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </td>
    </tr>`).join("");
  
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin:0 0 20px;">
      <tr style="background:${BG_LIGHT};">
        <td style="padding:10px 15px;font-size:11px;color:${PURPLE_DARK};font-weight:700;text-transform:uppercase;">Produto</td>
        <td style="padding:10px 15px;font-size:11px;color:${PURPLE_DARK};font-weight:700;text-transform:uppercase;text-align:center;">Qtd</td>
        <td style="padding:10px 15px;font-size:11px;color:${PURPLE_DARK};font-weight:700;text-transform:uppercase;text-align:right;">Preço</td>
      </tr>
      ${rows}
    </table>`;
}

function buildEmailHtml(data: z.infer<typeof BodySchema>): { subject: string; html: string } {
  const amount = (data.amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const orderCode = data.orderId.slice(0, 8).toUpperCase();

  const statusConfig: Record<string, { emoji: string; label: string; color: string; message: string }> = {
    pending: { emoji: "⏳", label: "Aguardando pagamento", color: "#f59e0b", message: "Recebemos seu pedido! Assim que o pagamento for confirmado, você receberá um email de confirmação." },
    paid: { emoji: "✅", label: "Pagamento confirmado", color: "#22c55e", message: "Ótima notícia! Seu pagamento foi confirmado e seu pedido já está sendo preparado." },
    shipped: { emoji: "📦", label: "Pedido enviado", color: "#3b82f6", message: "Seu pedido está a caminho! Acompanhe a entrega pelo código de rastreio abaixo." },
    delivered: { emoji: "🎉", label: "Pedido entregue", color: "#22c55e", message: "Seu pedido foi entregue! Esperamos que você aproveite suas compras." },
    cancelled: { emoji: "❌", label: "Pedido cancelado", color: "#ef4444", message: "Seu pedido foi cancelado. Se precisar de ajuda, entre em contato conosco." },
  };

  const cfg = statusConfig[data.status] || { emoji: "📋", label: data.status, color: PURPLE, message: "O status do seu pedido foi atualizado." };

  // Recovery email for unpaid orders
  if (data.type === "recovery") {
    const subject = `⏰ Seu pedido #${orderCode} está esperando por você! | ${STORE_NAME}`;
    const html = wrapper(`
      <tr><td style="padding:35px 40px;">
        <p style="font-size:16px;color:#333;margin:0 0 15px;">Olá <strong>${data.buyerName}</strong>,</p>
        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;">
          Notamos que você iniciou um pedido mas ainda não finalizou o pagamento. Seu carrinho com os produtos selecionados está guardado e esperando por você! 🛒
        </p>
        ${itemsTable(data.items || [])}
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_LIGHT};border-radius:10px;margin:0 0 25px;">
          <tr><td style="padding:20px;text-align:center;">
            <p style="font-size:12px;color:${PURPLE_DARK};font-weight:700;text-transform:uppercase;margin:0 0 5px;">Valor total</p>
            <p style="font-size:28px;font-weight:800;color:${PURPLE_DARK};margin:0;">${amount}</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
          <a href="${STORE_URL}" 
             style="display:inline-block;background:linear-gradient(135deg,${PURPLE_DARK},${PURPLE});color:#ffffff;text-decoration:none;padding:14px 35px;border-radius:10px;font-size:15px;font-weight:700;box-shadow:0 4px 15px rgba(124,58,237,0.3);">
            Finalizar meu pedido →
          </a>
        </td></tr></table>
        <p style="font-size:12px;color:#999;margin:20px 0 0;text-align:center;">
          Caso já tenha realizado o pagamento, desconsidere este email.
        </p>
      </td></tr>`);
    return { subject, html };
  }

  // Tracking/shipped email
  if (data.type === "tracking" && data.trackingCode) {
    const subject = `📦 Seu pedido #${orderCode} foi enviado! | ${STORE_NAME}`;
    const html = wrapper(`
      <tr><td style="padding:35px 40px;">
        <p style="font-size:16px;color:#333;margin:0 0 15px;">Olá <strong>${data.buyerName}</strong>,</p>
        <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 25px;">
          Temos uma ótima notícia! Seu pedido <strong>#${orderCode}</strong> foi enviado e está a caminho! 🚚
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_LIGHT};border-radius:10px;margin:0 0 25px;">
          <tr><td style="padding:22px;text-align:center;">
            <p style="font-size:11px;color:${PURPLE_DARK};font-weight:700;text-transform:uppercase;margin:0 0 8px;">Código de Rastreio</p>
            <p style="font-size:22px;font-weight:800;color:#333;margin:0 0 15px;font-family:'Courier New',monospace;letter-spacing:3px;">${data.trackingCode}</p>
            <a href="https://rastreamento.correios.com.br/app/index.php?objeto=${data.trackingCode}" 
               style="display:inline-block;background:linear-gradient(135deg,${PURPLE_DARK},${PURPLE});color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;box-shadow:0 4px 15px rgba(124,58,237,0.3);">
              Rastrear meu pedido →
            </a>
          </td></tr>
        </table>
        ${itemsTable(data.items || [])}
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;">
          <tr><td style="padding:12px 15px;border-bottom:1px solid #e5e7eb;">
            <span style="font-size:12px;color:#999;">Pedido</span>
            <span style="font-size:14px;font-weight:700;color:#333;float:right;">#${orderCode}</span>
          </td></tr>
          <tr><td style="padding:12px 15px;">
            <span style="font-size:12px;color:#999;">Valor total</span>
            <span style="font-size:14px;font-weight:700;color:${PURPLE_DARK};float:right;">${amount}</span>
          </td></tr>
        </table>
      </td></tr>`);
    return { subject, html };
  }

  // Status update (pending, paid, delivered, cancelled)
  const subject = `${cfg.emoji} ${cfg.label} • Pedido #${orderCode} | ${STORE_NAME}`;
  const html = wrapper(`
    <tr><td style="padding:35px 40px;">
      <p style="font-size:16px;color:#333;margin:0 0 15px;">Olá <strong>${data.buyerName}</strong>,</p>
      <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 25px;">${cfg.message}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_LIGHT};border-radius:10px;margin:0 0 25px;">
        <tr><td style="padding:22px;text-align:center;">
          <span style="font-size:36px;display:block;margin:0 0 8px;">${cfg.emoji}</span>
          <p style="font-size:18px;font-weight:800;color:${cfg.color};margin:0;">${cfg.label}</p>
        </td></tr>
      </table>
      ${itemsTable(data.items || [])}
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;">
        <tr><td style="padding:12px 15px;border-bottom:1px solid #e5e7eb;">
          <span style="font-size:12px;color:#999;">Pedido</span>
          <span style="font-size:14px;font-weight:700;color:#333;float:right;">#${orderCode}</span>
        </td></tr>
        <tr><td style="padding:12px 15px;">
          <span style="font-size:12px;color:#999;">Valor total</span>
          <span style="font-size:14px;font-weight:700;color:${PURPLE_DARK};float:right;">${amount}</span>
        </td></tr>
      </table>
      ${data.status === "paid" ? `
        <p style="font-size:13px;color:#555;margin:20px 0 0;text-align:center;line-height:1.6;">
          Você receberá um novo email quando seu pedido for enviado com o código de rastreio. 📬
        </p>` : ""}
      ${data.status === "delivered" ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;"><tr><td align="center">
          <a href="${STORE_URL}" 
             style="display:inline-block;background:linear-gradient(135deg,${PURPLE_DARK},${PURPLE});color:#ffffff;text-decoration:none;padding:14px 35px;border-radius:10px;font-size:15px;font-weight:700;box-shadow:0 4px 15px rgba(124,58,237,0.3);">
            Comprar novamente 🛒
          </a>
        </td></tr></table>` : ""}
    </td></tr>`);

  return { subject, html };
}

async function sendViaResend(to: string, subject: string, html: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("[send-order-email] Resend error:", JSON.stringify(data));
    throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(data)}`);
  }

  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html } = buildEmailHtml(parsed.data);

    const result = await sendViaResend(parsed.data.buyerEmail, subject, html);
    console.log(`[send-order-email] Sent to ${parsed.data.buyerEmail}: ${subject}`, result);

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-order-email error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
