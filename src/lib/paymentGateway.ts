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

export function getCachedGatewayConfig(): PaymentGatewayConfig {
  return cachedConfig || defaultConfig;
}

export async function fetchPaymentGatewayConfig(): Promise<PaymentGatewayConfig> {
  try {
    const { data, error } = await supabase.from('gateway_config').select('*').limit(1).single();
    if (error || !data) return defaultConfig;
    const pm = (data as any).payment_methods || {};
    const config: PaymentGatewayConfig = {
      activeGateway: (['pagouai', 'vennox', 'centurionpay', 'ironpay', 'simpayout', 'beehive', 'pagamentosmp'].includes(data.active_gateway) ? data.active_gateway : 'centurionpay') as PaymentGatewayConfig['activeGateway'],
      paymentMethods: typeof pm === 'object' && pm !== null ? pm : {},
      pagouai: { publicKey: data.pagouai_public_key || '', secretKey: data.pagouai_secret_key || '', enabled: !!(data.pagouai_secret_key) },
      vennox: { secretKey: data.vennox_secret_key || '', companyId: data.vennox_company_id || '', enabled: !!(data.vennox_secret_key && data.vennox_company_id) },
      centurionpay: { secretKey: data.centurionpay_secret_key || '', companyId: data.centurionpay_company_id || '', enabled: !!(data.centurionpay_secret_key && data.centurionpay_company_id) },
      ironpay: { apiToken: (data as any).ironpay_api_token || '', enabled: !!((data as any).ironpay_api_token) },
      simpayout: { clientId: (data as any).simpayout_client_id || '', clientSecret: (data as any).simpayout_client_secret || '', enabled: !!((data as any).simpayout_client_id && (data as any).simpayout_client_secret) },
      beehive: { publicKey: (data as any).beehive_public_key || '', secretKey: (data as any).beehive_secret_key || '', enabled: !!((data as any).beehive_public_key && (data as any).beehive_secret_key) },
      pagamentosmp: { publicKey: (data as any).pagamentosmp_public_key || '', secretKey: (data as any).pagamentosmp_secret_key || '', enabled: !!((data as any).pagamentosmp_public_key && (data as any).pagamentosmp_secret_key) },
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
