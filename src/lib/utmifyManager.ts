import { supabase } from "@/integrations/supabase/client";

export interface UtmifyConfig {
  apiToken: string;
  apiToken2: string;
}

const STORAGE_KEY = 'utmify_config';
const API_URL = 'https://api.utmify.com.br/api-credentials/orders';

export function getUtmifyConfig(): UtmifyConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { apiToken: '', apiToken2: '', ...JSON.parse(saved) } : { apiToken: '', apiToken2: '' };
  } catch {
    return { apiToken: '', apiToken2: '' };
  }
}

export function saveUtmifyConfig(config: UtmifyConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Sincroniza tokens com o backend para disparo server-side
  void syncUtmifyConfigToDb(config);
}

export async function syncUtmifyConfigToDb(config: UtmifyConfig): Promise<void> {
  try {
    const { adminWrite } = await import("@/lib/adminApi");
    const { data: existing } = await supabase
      .from("gateway_config")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const payload = {
      utmify_api_token: config.apiToken || "",
      utmify_api_token_2: config.apiToken2 || "",
      updated_at: new Date().toISOString(),
    };
    if (existing?.id) {
      await adminWrite({ table: "gateway_config", op: "update", payload, match: { id: (existing as any).id } });
    } else {
      await adminWrite({ table: "gateway_config", op: "insert", payload });
    }
  } catch (e) {
    console.error("Falha ao sincronizar tokens Utmify com o backend", e);
  }
}

export async function testUtmifyToken(token: string): Promise<{ success: boolean; message: string }> {
  if (!token.trim()) return { success: false, message: 'Token não pode estar vazio!' };
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-token': token },
      body: JSON.stringify({
        orderId: `test_${Date.now()}`, platform: 'kazoom-store', paymentMethod: 'pix', status: 'paid',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        approvedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        refundedAt: null,
        customer: { name: 'Teste Integração', email: 'teste@teste.com', phone: null, document: null },
        products: [{ id: 'test-product', name: 'Teste Kazoom', planId: null, planName: null, quantity: 1, priceInCents: 100 }],
        trackingParameters: { src: null, sck: null, utm_source: null, utm_campaign: null, utm_medium: null, utm_content: null, utm_term: null },
        commission: { totalPriceInCents: 100, gatewayFeeInCents: 0, userCommissionInCents: 100, currency: 'BRL' },
        isTest: true,
      }),
    });
    if (response.ok) return { success: true, message: 'Token válido! Integração funcionando ✓' };
    if (response.status === 401 || response.status === 403) return { success: false, message: 'Token inválido ou sem permissão!' };
    return { success: false, message: `Erro ${response.status}` };
  } catch {
    return { success: false, message: 'Erro de conexão. Token salvo para uso server-side.' };
  }
}

export async function notifyUtmifyServerSide(data: {
  orderId: string;
  status: "waiting_payment" | "paid" | "refused";
  paymentMethod: "pix" | "credit_card";
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerDocument?: string | null;
  productName?: string;
  priceInCents: number;
  trackingParameters?: Record<string, string | null>;
}): Promise<void> {
  try {
    await supabase.functions.invoke("notify-utmify", { body: data });
  } catch (e) {
    console.error("notify-utmify invoke error", e);
  }
}

// Mantido por compatibilidade (não usado — preferir notifyUtmifyServerSide)
export async function sendUtmifySale(_data: { orderId: string; customerName: string; customerEmail: string; productName: string; priceInCents: number; }): Promise<boolean> {
  return false;
}
