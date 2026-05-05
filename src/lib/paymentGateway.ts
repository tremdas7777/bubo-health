import { supabase } from '@/integrations/supabase/client';

export type GatewayPaymentMethods = 'pix' | 'card' | 'pix_card';

export interface PaymentGatewayConfig {
  activeGateway: 'pagouai' | 'vennox' | 'centurionpay' | 'ironpay' | 'simpayout' | 'beehive' | 'pagamentosmp' | 'stripe';
  paymentMethods: Record<string, GatewayPaymentMethods>;
  pagouai: { publicKey: string; secretKey: string; enabled: boolean };
  vennox: { secretKey: string; companyId: string; enabled: boolean };
  centurionpay: { secretKey: string; companyId: string; enabled: boolean };
  ironpay: { apiToken: string; enabled: boolean };
  simpayout: { clientId: string; clientSecret: string; enabled: boolean };
  beehive: { publicKey: string; secretKey: string; enabled: boolean };
  pagamentosmp: { publicKey: string; secretKey: string; enabled: boolean };
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    testPublishableKey: string;
    testSecretKey: string;
    testWebhookSecret: string;
    mode: 'live' | 'test';
    enabled: boolean;
  };
}

const DEFAULT_GATEWAY: PaymentGatewayConfig['activeGateway'] = 'beehive';

const defaultConfig: PaymentGatewayConfig = {
  activeGateway: DEFAULT_GATEWAY,
  paymentMethods: {
    beehive: 'pix_card',
    default: 'pix_card'
  },
  pagouai: { publicKey: '', secretKey: '', enabled: false },
  vennox: { secretKey: '', companyId: '', enabled: false },
  centurionpay: { secretKey: '', companyId: '', enabled: false },
  ironpay: { apiToken: '', enabled: false },
  simpayout: { clientId: '', clientSecret: '', enabled: false },
  beehive: { 
    publicKey: 'pk_live_v2MnlocrfybY04hoSBlPmQVzHgMnXqUHJv', 
    secretKey: 'sk_live_v2NF5vso2s5dRF63SL8Wjqtc8kJpA5fAseBtNVIJ2X', 
    enabled: true 
  },
  pagamentosmp: { publicKey: '', secretKey: '', enabled: false },
  stripe: {
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    testPublishableKey: '',
    testSecretKey: '',
    testWebhookSecret: '',
    mode: 'live',
    enabled: false,
  },
};

const VALID_GATEWAYS: PaymentGatewayConfig['activeGateway'][] = [
  'pagouai',
  'vennox',
  'centurionpay',
  'ironpay',
  'simpayout',
  'beehive',
  'pagamentosmp',
  'stripe',
];

function normalizeActiveGateway(value: unknown): PaymentGatewayConfig['activeGateway'] {
  if (typeof value === 'string' && (VALID_GATEWAYS as string[]).includes(value)) {
    return value as PaymentGatewayConfig['activeGateway'];
  }
  return DEFAULT_GATEWAY;
}

function normalizePaymentMethods(
  raw: unknown,
  activeGateway: PaymentGatewayConfig['activeGateway'],
): Record<string, GatewayPaymentMethods> {
  const input = raw && typeof raw === 'object' ? { ...(raw as Record<string, unknown>) } : {};
  const defaultMethod = input.default;
  const fallbackMethod: GatewayPaymentMethods =
    defaultMethod === 'card' || defaultMethod === 'pix_card' || defaultMethod === 'pix'
      ? (defaultMethod as GatewayPaymentMethods)
      : 'card';

  const normalized: Record<string, GatewayPaymentMethods> = {};

  for (const gateway of VALID_GATEWAYS) {
    const value = input[gateway];
    normalized[gateway] = value === 'card' || value === 'pix_card' || value === 'pix' ? value : fallbackMethod;
  }

  // Stripe in this project is card-only by default
  normalized.stripe = 'card';
  normalized.default = fallbackMethod;
  normalized[activeGateway] = normalized[activeGateway] || fallbackMethod;

  return normalized;
}

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
    const d = data as any;
    const activeGateway = normalizeActiveGateway(d.active_gateway);
    const config: PaymentGatewayConfig = {
      activeGateway,
      paymentMethods: normalizePaymentMethods(d.payment_methods, activeGateway),
      pagouai: { publicKey: d.pagouai_public_key || '', secretKey: '', enabled: false },
      vennox: { secretKey: '', companyId: '', enabled: false },
      centurionpay: { secretKey: '', companyId: '', enabled: false },
      ironpay: { apiToken: '', enabled: false },
      simpayout: { clientId: '', clientSecret: '', enabled: false },
      beehive: { publicKey: d.beehive_public_key || '', secretKey: '', enabled: !!(d.beehive_public_key) },
      pagamentosmp: { publicKey: d.pagamentosmp_public_key || '', secretKey: '', enabled: false },
      stripe: {
        publishableKey: d.stripe_publishable_key || '',
        secretKey: '',
        webhookSecret: '',
        testPublishableKey: d.stripe_test_publishable_key || '',
        testSecretKey: '',
        testWebhookSecret: '',
        mode: (d.stripe_mode === 'test' ? 'test' : 'live'),
        enabled: !!(d.stripe_publishable_key || d.stripe_test_publishable_key),
      },
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
    const activeGateway = normalizeActiveGateway(d.active_gateway);
    const config: PaymentGatewayConfig = {
      activeGateway,
      paymentMethods: normalizePaymentMethods(d.payment_methods, activeGateway),
      pagouai: { publicKey: d.pagouai_public_key || '', secretKey: d.pagouai_secret_key || '', enabled: !!(d.pagouai_secret_key) },
      vennox: { secretKey: d.vennox_secret_key || '', companyId: d.vennox_company_id || '', enabled: !!(d.vennox_secret_key && d.vennox_company_id) },
      centurionpay: { secretKey: d.centurionpay_secret_key || '', companyId: d.centurionpay_company_id || '', enabled: !!(d.centurionpay_secret_key && d.centurionpay_company_id) },
      ironpay: { apiToken: d.ironpay_api_token || '', enabled: !!(d.ironpay_api_token) },
      simpayout: { clientId: d.simpayout_client_id || '', clientSecret: d.simpayout_client_secret || '', enabled: !!(d.simpayout_client_id && d.simpayout_client_secret) },
      beehive: { publicKey: d.beehive_public_key || '', secretKey: d.beehive_secret_key || '', enabled: !!(d.beehive_public_key && d.beehive_secret_key) },
      pagamentosmp: { publicKey: d.pagamentosmp_public_key || '', secretKey: d.pagamentosmp_secret_key || '', enabled: !!(d.pagamentosmp_public_key && d.pagamentosmp_secret_key) },
      stripe: {
        publishableKey: d.stripe_publishable_key || '',
        secretKey: d.stripe_secret_key || '',
        webhookSecret: d.stripe_webhook_secret || '',
        testPublishableKey: d.stripe_test_publishable_key || '',
        testSecretKey: d.stripe_test_secret_key || '',
        testWebhookSecret: d.stripe_test_webhook_secret || '',
        mode: (d.stripe_mode === 'test' ? 'test' : 'live'),
        enabled: !!((d.stripe_mode === 'test' ? d.stripe_test_secret_key : d.stripe_secret_key)),
      },
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
    const activeGateway = normalizeActiveGateway(config.activeGateway);
    const normalizedConfig: PaymentGatewayConfig = {
      ...config,
      activeGateway,
      paymentMethods: normalizePaymentMethods(config.paymentMethods, activeGateway),
    };

    const { data, error } = await supabase.functions.invoke('save-gateway-config', {
      body: { password: adminPassword, config: normalizedConfig },
    });

    if (error) {
      const msg = await extractFunctionErrorMessage(error);
      return { ok: false, error: msg };
    }

    if (data?.error) {
      return { ok: false, error: data.error };
    }

    cachedConfig = normalizedConfig;
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido ao salvar gateway' };
  }
}

async function extractFunctionErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "context" in error) {
    const response = (error as { context?: Response }).context;
    if (response instanceof Response) {
      try {
        const payload = await response.clone().json();
        return payload.error || payload.message || "Erro retornado pela função";
      } catch {
        try {
          const text = await response.clone().text();
          return text || "Erro na resposta da função";
        } catch { /* ignore */ }
      }
    }
  }
  return error instanceof Error ? error.message : String(error);
}
