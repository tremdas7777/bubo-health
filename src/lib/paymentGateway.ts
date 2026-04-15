import { supabase } from '@/integrations/supabase/client';

export type GatewayPaymentMethods = 'pix' | 'card' | 'pix_card';

export interface PaymentGatewayConfig {
  activeGateway: 'pagouai' | 'vennox' | 'centurionpay' | 'ironpay' | 'simpayout' | 'beehive' | 'pagamentosmp';
  paymentMethods: Record<string, GatewayPaymentMethods>;
  pagouai: { publicKey: string; secretKey: string; enabled: boolean };
  vennox: { secretKey: string; companyId: string; enabled: boolean };
  centurionpay: { secretKey: string; companyId: string; enabled: boolean };
  ironpay: { apiToken: string; enabled: boolean };
  simpayout: { clientId: string; clientSecret: string; enabled: boolean };
  beehive: { publicKey: string; secretKey: string; enabled: boolean };
  pagamentosmp: { publicKey: string; secretKey: string; enabled: boolean };
}

const defaultConfig: PaymentGatewayConfig = {
  activeGateway: 'centurionpay',
  paymentMethods: {},
  pagouai: { publicKey: '', secretKey: '', enabled: false },
  vennox: { secretKey: '', companyId: '', enabled: false },
  centurionpay: { secretKey: '', companyId: '', enabled: false },
  ironpay: { apiToken: '', enabled: false },
  simpayout: { clientId: '', clientSecret: '', enabled: false },
  beehive: { publicKey: '', secretKey: '', enabled: false },
  pagamentosmp: { publicKey: '', secretKey: '', enabled: false },
};

let cachedConfig: PaymentGatewayConfig | null = null;
let adminPassword: string | null = null;

export function setAdminPassword(password: string) {
  adminPassword = password;
}

export function getAdminPassword() {
  return adminPassword;
}

export function getCachedGatewayConfig(): PaymentGatewayConfig {
  return cachedConfig || defaultConfig;
}

// Public: reads only safe fields from the view (no secrets exposed)
export async function fetchPaymentGatewayConfig(): Promise<PaymentGatewayConfig> {
  try {
    const { data, error } = await supabase.from('gateway_config_public' as any).select('*').limit(1).single();
    if (error || !data) return defaultConfig;
    const pm = (data as any).payment_methods || {};
    const d = data as any;
    const config: PaymentGatewayConfig = {
      activeGateway: (['pagouai', 'vennox', 'centurionpay', 'ironpay', 'simpayout', 'beehive', 'pagamentosmp'].includes(d.active_gateway) ? d.active_gateway : 'centurionpay') as PaymentGatewayConfig['activeGateway'],
      paymentMethods: typeof pm === 'object' && pm !== null ? pm : {},
      pagouai: { publicKey: d.pagouai_public_key || '', secretKey: '', enabled: false },
      vennox: { secretKey: '', companyId: '', enabled: false },
      centurionpay: { secretKey: '', companyId: '', enabled: false },
      ironpay: { apiToken: '', enabled: false },
      simpayout: { clientId: '', clientSecret: '', enabled: false },
      beehive: { publicKey: d.beehive_public_key || '', secretKey: '', enabled: !!(d.beehive_public_key) },
      pagamentosmp: { publicKey: d.pagamentosmp_public_key || '', secretKey: '', enabled: false },
    };
    cachedConfig = config;
    return config;
  } catch {
    return defaultConfig;
  }
}

// Admin: reads full config via edge function (requires admin password)
export async function fetchFullGatewayConfig(password: string): Promise<PaymentGatewayConfig> {
  try {
    const { data: resp, error } = await supabase.functions.invoke('read-gateway-config', {
      body: { password },
    });
    if (error || resp?.error || !resp?.data) return defaultConfig;
    const d = resp.data;
    const pm = d.payment_methods || {};
    const config: PaymentGatewayConfig = {
      activeGateway: (['pagouai', 'vennox', 'centurionpay', 'ironpay', 'simpayout', 'beehive', 'pagamentosmp'].includes(d.active_gateway) ? d.active_gateway : 'centurionpay') as PaymentGatewayConfig['activeGateway'],
      paymentMethods: typeof pm === 'object' && pm !== null ? pm : {},
      pagouai: { publicKey: d.pagouai_public_key || '', secretKey: d.pagouai_secret_key || '', enabled: !!(d.pagouai_secret_key) },
      vennox: { secretKey: d.vennox_secret_key || '', companyId: d.vennox_company_id || '', enabled: !!(d.vennox_secret_key && d.vennox_company_id) },
      centurionpay: { secretKey: d.centurionpay_secret_key || '', companyId: d.centurionpay_company_id || '', enabled: !!(d.centurionpay_secret_key && d.centurionpay_company_id) },
      ironpay: { apiToken: d.ironpay_api_token || '', enabled: !!(d.ironpay_api_token) },
      simpayout: { clientId: d.simpayout_client_id || '', clientSecret: d.simpayout_client_secret || '', enabled: !!(d.simpayout_client_id && d.simpayout_client_secret) },
      beehive: { publicKey: d.beehive_public_key || '', secretKey: d.beehive_secret_key || '', enabled: !!(d.beehive_public_key && d.beehive_secret_key) },
      pagamentosmp: { publicKey: d.pagamentosmp_public_key || '', secretKey: d.pagamentosmp_secret_key || '', enabled: !!(d.pagamentosmp_public_key && d.pagamentosmp_secret_key) },
    };
    cachedConfig = config;
    return config;
  } catch {
    return defaultConfig;
  }
}

export interface SaveGatewayConfigResult {
  ok: boolean;
  error?: string;
}

export async function savePaymentGatewayConfig(config: PaymentGatewayConfig): Promise<SaveGatewayConfigResult> {
  if (!adminPassword) {
    return { ok: false, error: 'Senha admin não definida. Faça login novamente.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('save-gateway-config', {
      body: { password: adminPassword, config },
    });

    if (error) {
      return { ok: false, error: error.message || 'Erro ao salvar gateway' };
    }

    if (data?.error) {
      return { ok: false, error: data.error };
    }

    cachedConfig = config;
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido ao salvar gateway' };
  }
}
