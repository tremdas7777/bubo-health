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
    publicKey: '',
    secretKey: '',
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

/** Mesmo mapeamento que `save-gateway-config` (fallback via `admin-write`). */
function gatewayConfigToDbPatch(config: PaymentGatewayConfig): Record<string, unknown> {
  const allowedGateways = VALID_GATEWAYS;
  const activeGateway = allowedGateways.includes(config.activeGateway) ? config.activeGateway : 'stripe';

  const updateData: Record<string, unknown> = {
    active_gateway: activeGateway,
    updated_at: new Date().toISOString(),
  };

  if (config.paymentMethods && typeof config.paymentMethods === 'object') {
    updateData.payment_methods = config.paymentMethods;
  }

  if (config.beehive && typeof config.beehive === 'object') {
    // Nunca sobrescrever chaves Beehive com string vazia — só com novos valores.
    if (typeof config.beehive.publicKey === 'string' && config.beehive.publicKey.trim() !== '') {
      updateData.beehive_public_key = config.beehive.publicKey.trim();
    }
    if (typeof config.beehive.secretKey === 'string' && config.beehive.secretKey.trim() !== '') {
      updateData.beehive_secret_key = config.beehive.secretKey.trim();
    }
  }

  if (config.pagouai) {
    if (config.pagouai.publicKey) updateData.pagouai_public_key = config.pagouai.publicKey;
    if (config.pagouai.secretKey) updateData.pagouai_secret_key = config.pagouai.secretKey;
  }

  if (config.vennox) {
    if (config.vennox.secretKey) updateData.vennox_secret_key = config.vennox.secretKey;
    if (config.vennox.companyId) updateData.vennox_company_id = config.vennox.companyId;
  }

  if (config.centurionpay) {
    if (config.centurionpay.secretKey) updateData.centurionpay_secret_key = config.centurionpay.secretKey;
    if (config.centurionpay.companyId) updateData.centurionpay_company_id = config.centurionpay.companyId;
  }

  if (config.ironpay && config.ironpay.apiToken) {
    updateData.ironpay_api_token = config.ironpay.apiToken;
  }

  if (config.simpayout) {
    if (config.simpayout.clientId) updateData.simpayout_client_id = config.simpayout.clientId;
    if (config.simpayout.clientSecret) updateData.simpayout_client_secret = config.simpayout.clientSecret;
  }

  if (config.pagamentosmp) {
    if (config.pagamentosmp.publicKey) updateData.pagamentosmp_public_key = config.pagamentosmp.publicKey;
    if (config.pagamentosmp.secretKey) updateData.pagamentosmp_secret_key = config.pagamentosmp.secretKey;
  }

  if (config.stripe) {
    if (config.stripe.publishableKey) updateData.stripe_publishable_key = config.stripe.publishableKey;
    if (config.stripe.secretKey) updateData.stripe_secret_key = config.stripe.secretKey;
    if (config.stripe.webhookSecret) updateData.stripe_webhook_secret = config.stripe.webhookSecret;
    if (config.stripe.testPublishableKey) updateData.stripe_test_publishable_key = config.stripe.testPublishableKey;
    if (config.stripe.testSecretKey) updateData.stripe_test_secret_key = config.stripe.testSecretKey;
    if (config.stripe.testWebhookSecret) updateData.stripe_test_webhook_secret = config.stripe.testWebhookSecret;
    if (config.stripe.mode) updateData.stripe_mode = config.stripe.mode;
  }

  return updateData;
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
    const { data, error } = await supabase
      .from('gateway_config_public' as any)
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
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

async function saveGatewayConfigViaAdminWrite(normalizedConfig: PaymentGatewayConfig): Promise<SaveGatewayConfigResult> {
  const password = adminPassword;
  if (!password) {
    return { ok: false, error: 'Senha admin não definida. Faça login novamente.' };
  }

  const patch = gatewayConfigToDbPatch(normalizedConfig);

  const { data: rows, error: pubErr } = await supabase
    .from('gateway_config_public' as any)
    .select('id');

  if (pubErr) return { ok: false, error: pubErr.message };

  const ids = ((rows ?? []) as Array<{ id?: string }>)
    .map((r) => r.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const invokeAdminWrite = async (body: Record<string, unknown>): Promise<SaveGatewayConfigResult> => {
    const { data, error } = await supabase.functions.invoke('admin-write', { body });
    if (error) return { ok: false, error: await extractFunctionErrorMessage(error) };
    const msg =
      data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error
        ? String((data as { error: string }).error)
        : '';
    if (msg) return { ok: false, error: msg };
    return { ok: true };
  };

  if (ids.length === 0) {
    const ins = await invokeAdminWrite({
      password,
      table: 'gateway_config',
      op: 'insert',
      payload: { ...patch, payment_methods: patch.payment_methods ?? {} },
    });
    if (!ins.ok) return ins;
  } else {
    for (const id of ids) {
      const res = await invokeAdminWrite({
        password,
        table: 'gateway_config',
        op: 'update',
        payload: patch,
        match: { id },
      });
      if (!res.ok) return res;
    }
  }

  cachedConfig = normalizedConfig;
  return { ok: true };
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

    const primaryErrMsg =
      error ? await extractFunctionErrorMessage(error) : (data as { error?: string })?.error || '';

    if (!error && !(data as { error?: string })?.error) {
      cachedConfig = normalizedConfig;
      return { ok: true };
    }

    const fallback = await saveGatewayConfigViaAdminWrite(normalizedConfig);
    if (fallback.ok) return fallback;

    return {
      ok: false,
      error: fallback.error || primaryErrMsg || 'Erro ao salvar gateway',
    };
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
