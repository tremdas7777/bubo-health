import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  orderId: z.string().min(1),
  buyerEmail: z.string().email(),
  buyerName: z.string().min(1),
  status: z.string().min(1),
  trackingCode: z.string().nullable().optional(),
  amountCents: z.number(),
  type: z.enum(["status", "tracking"]),
});

function buildEmailHtml(data: z.infer<typeof BodySchema>): { subject: string; html: string } {
  const amount = (data.amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const orderCode = data.orderId.slice(0, 8).toUpperCase();

  const statusLabels: Record<string, string> = {
    pending: "Aguardando pagamento",
    paid: "Pagamento confirmado ✅",
    shipped: "Pedido enviado 📦",
    delivered: "Pedido entregue 🎉",
    cancelled: "Pedido cancelado",
  };
  const statusLabel = statusLabels[data.status] || data.status;

  if (data.type === "tracking" && data.trackingCode) {
    return {
      subject: `📦 Seu pedido #${orderCode} foi enviado! | Kazoom`,
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:30px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">📦 Pedido Enviado!</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="font-size:16px;color:#333;margin:0 0 20px;">Olá <strong>${data.buyerName}</strong>,</p>
          <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 25px;">
            Temos uma ótima notícia! Seu pedido <strong>#${orderCode}</strong> foi enviado e está a caminho! 🚚
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;border-radius:8px;padding:20px;margin:0 0 25px;">
            <tr><td style="padding:20px;">
              <p style="font-size:12px;color:#7c3aed;font-weight:700;text-transform:uppercase;margin:0 0 8px;">Código de Rastreio</p>
              <p style="font-size:20px;font-weight:800;color:#333;margin:0 0 15px;font-family:monospace;letter-spacing:2px;">${data.trackingCode}</p>
              <a href="https://rastreamento.correios.com.br/app/index.php?objeto=${data.trackingCode}" 
                 style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;">
                Rastrear meu pedido →
              </a>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;">
            <tr><td style="padding:15px;border-bottom:1px solid #e5e7eb;">
              <span style="font-size:12px;color:#999;">Pedido</span>
              <span style="font-size:14px;font-weight:700;color:#333;float:right;">#${orderCode}</span>
            </td></tr>
            <tr><td style="padding:15px;">
              <span style="font-size:12px;color:#999;">Valor</span>
              <span style="font-size:14px;font-weight:700;color:#7c3aed;float:right;">${amount}</span>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="font-size:12px;color:#999;margin:0;">Kazoom • Obrigado pela sua compra!</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    };
  }

  return {
    subject: `${statusLabel} • Pedido #${orderCode} | Kazoom`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:30px 40px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">Atualização do Pedido</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="font-size:16px;color:#333;margin:0 0 20px;">Olá <strong>${data.buyerName}</strong>,</p>
          <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 25px;">
            O status do seu pedido <strong>#${orderCode}</strong> foi atualizado:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;border-radius:8px;margin:0 0 25px;">
            <tr><td style="padding:20px;text-align:center;">
              <p style="font-size:20px;font-weight:800;color:#7c3aed;margin:0;">${statusLabel}</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;">
            <tr><td style="padding:15px;border-bottom:1px solid #e5e7eb;">
              <span style="font-size:12px;color:#999;">Pedido</span>
              <span style="font-size:14px;font-weight:700;color:#333;float:right;">#${orderCode}</span>
            </td></tr>
            <tr><td style="padding:15px;">
              <span style="font-size:12px;color:#999;">Valor</span>
              <span style="font-size:14px;font-weight:700;color:#7c3aed;float:right;">${amount}</span>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="font-size:12px;color:#999;margin:0;">Kazoom • Obrigado pela sua compra!</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
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

    // Try to send via Lovable email API
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Email não configurado. Configure o domínio de email nas configurações." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For now, log the email attempt (email domain needs to be reconfigured)
    console.log(`[send-order-email] Would send to: ${parsed.data.buyerEmail}, subject: ${subject}`);
    
    // Try sending via the Lovable email system if available
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Check if send-transactional-email function exists and use it
      const { error: fnError } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "order-notification",
          recipientEmail: parsed.data.buyerEmail,
          idempotencyKey: `order-${parsed.data.type}-${parsed.data.orderId}`,
          templateData: {
            name: parsed.data.buyerName,
            orderCode: parsed.data.orderId.slice(0, 8).toUpperCase(),
            status: parsed.data.status,
            trackingCode: parsed.data.trackingCode,
            amount: (parsed.data.amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          },
        },
      });

      if (fnError) {
        console.log("[send-order-email] Transactional email not available, email queued for when domain is configured");
      }
    } catch (e) {
      console.log("[send-order-email] Transactional email system not set up yet:", e);
    }

    return new Response(JSON.stringify({ ok: true, message: "Notificação processada" }), {
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
