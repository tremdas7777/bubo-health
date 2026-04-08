import { supabase } from '@/integrations/supabase/client';

export interface PaymentGatewayConfig {
  activeGateway: 'pagouai' | 'vennox' | 'centurionpay' | 'ironpay' | 'simpayout' | 'beehive' | 'pagamentosmp';
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
    const config: PaymentGatewayConfig = {
      activeGateway: (['pagouai', 'vennox', 'centurionpay', 'ironpay', 'simpayout', 'beehive', 'pagamentosmp'].includes(data.active_gateway) ? data.active_gateway : 'centurionpay') as PaymentGatewayConfig['activeGateway'],
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

export async function savePaymentGatewayConfig(config: PaymentGatewayConfig): Promise<boolean> {
  try {
    const { data: existing } = await supabase.from('gateway_config').select('id').limit(1).single();
    const updateData = {
      active_gateway: config.activeGateway,
      pagouai_public_key: config.pagouai.publicKey, pagouai_secret_key: config.pagouai.secretKey,
      vennox_secret_key: config.vennox.secretKey, vennox_company_id: config.vennox.companyId,
      centurionpay_secret_key: config.centurionpay.secretKey, centurionpay_company_id: config.centurionpay.companyId,
      ironpay_api_token: config.ironpay.apiToken,
      simpayout_client_id: config.simpayout.clientId, simpayout_client_secret: config.simpayout.clientSecret,
      beehive_public_key: config.beehive.publicKey, beehive_secret_key: config.beehive.secretKey,
      pagamentosmp_public_key: config.pagamentosmp.publicKey, pagamentosmp_secret_key: config.pagamentosmp.secretKey,
      updated_at: new Date().toISOString(),
    };
    if (existing?.id) {
      await supabase.from('gateway_config').update(updateData).eq('id', existing.id);
    } else {
      await supabase.from('gateway_config').insert([updateData]);
    }
    cachedConfig = config;
    return true;
  } catch {
    return false;
  }
}
