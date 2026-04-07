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
}

export async function testUtmifyToken(token: string): Promise<{ success: boolean; message: string }> {
  if (!token.trim()) return { success: false, message: 'Token não pode estar vazio!' };
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-token': token },
      body: JSON.stringify({
        orderId: `test_${Date.now()}`, platform: 'bazu-store', paymentMethod: 'pix', status: 'paid',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        approvedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        refundedAt: null,
        customer: { name: 'Teste Integração', email: 'teste@teste.com', phone: null, document: null },
        products: [{ id: 'test-product', name: 'Teste Bazu', planId: null, planName: null, quantity: 1, priceInCents: 100 }],
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

export async function sendUtmifySale(data: { orderId: string; customerName: string; customerEmail: string; productName: string; priceInCents: number; }): Promise<boolean> {
  const config = getUtmifyConfig();
  const tokens = [config.apiToken, config.apiToken2].filter(Boolean);
  if (tokens.length === 0) return false;
  const payload = {
    orderId: data.orderId, platform: 'bazu-store', paymentMethod: 'pix', status: 'paid',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    approvedDate: new Date().toISOString().replace('T', ' ').substring(0, 19), refundedAt: null,
    customer: { name: data.customerName, email: data.customerEmail, phone: null, document: null },
    products: [{ id: 'bazu-product', name: data.productName, planId: null, planName: null, quantity: 1, priceInCents: data.priceInCents }],
    trackingParameters: { src: null, sck: null, utm_source: null, utm_campaign: null, utm_medium: null, utm_content: null, utm_term: null },
    commission: { totalPriceInCents: data.priceInCents, gatewayFeeInCents: 0, userCommissionInCents: data.priceInCents, currency: 'BRL' },
  };
  const results = await Promise.all(tokens.map(async t => {
    try { await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-token': t }, body: JSON.stringify(payload) }); return true; } catch { return false; }
  }));
  return results.some(Boolean);
}
