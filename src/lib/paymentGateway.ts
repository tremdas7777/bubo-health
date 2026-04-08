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

function normalizeGatewaySaveError(message?: string) {
  const lower = (message || '').toLowerCase();

  if (lower.includes('row-level security') || lower.includes('permission denied') || lower.includes('42501')) {
    return 'O painel admin não está autenticado no backend, então o gateway não pôde ser salvo.';
  }

  return message || 'Erro desconhecido ao salvar gateway.';
}

export async function savePaymentGatewayConfig(config: PaymentGatewayConfig): Promise<SaveGatewayConfigResult> {
  try {
    const { data: existing, error: existingError } = await supabase.from('gateway_config').select('id').limit(1).single();

    if (existingError && existingError.code !== 'PGRST116') {
      return { ok: false, error: normalizeGatewaySaveError(existingError.message) };
    }

    const updateData: Record<string, unknown> = {
      active_gateway: config.activeGateway,
      payment_methods: config.paymentMethods,
      pagouai_public_key: config.pagouai.publicKey, pagouai_secret_key: config.pagouai.secretKey,
      vennox_secret_key: config.vennox.secretKey, vennox_company_id: config.vennox.companyId,
      centurionpay_secret_key: config.centurionpay.secretKey, centurionpay_company_id: config.centurionpay.companyId,
      ironpay_api_token: config.ironpay.apiToken,
      simpayout_client_id: config.simpayout.clientId, simpayout_client_secret: config.simpayout.clientSecret,
      beehive_public_key: config.beehive.publicKey, beehive_secret_key: config.beehive.secretKey,
      pagamentosmp_public_key: config.pagamentosmp.publicKey, pagamentosmp_secret_key: config.pagamentosmp.secretKey,
      updated_at: new Date().toISOString(),
    };

    const response = existing?.id
      ? await supabase.from('gateway_config').update(updateData as any).eq('id', existing.id)
      : await supabase.from('gateway_config').insert([updateData as any]);

    if (response.error) {
      return { ok: false, error: normalizeGatewaySaveError(response.error.message) };
    }

    cachedConfig = config;
    return { ok: true };
  } catch (error) {
    return { ok: false, error: normalizeGatewaySaveError(error instanceof Error ? error.message : undefined) };
  }
}
