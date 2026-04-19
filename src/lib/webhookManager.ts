import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'webhook_config_v2';

export interface WebhookEntry {
  id: string;
  url: string;
  events: ('venda_pendente' | 'venda_aprovada')[];
}

export interface WebhookConfig {
  webhooks: WebhookEntry[];
}

export function getWebhookConfig(): WebhookConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { webhooks: [] };
}

export function saveWebhookConfig(config: WebhookConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function syncWebhooksToDb(config: WebhookConfig) {
  const { adminWrite } = await import('@/lib/adminApi');
  const validRows = config.webhooks.filter(w => w.url?.trim()).map(w => ({
    id: w.id, url: w.url, events: w.events, active: true,
  }));
  // Fetch existing rows then delete those not in current set
  const { data: existing } = await supabase.from('webhook_endpoints').select('id');
  const validIds = new Set(validRows.map(r => r.id));
  const toDelete = (existing || []).filter((r: any) => !validIds.has(r.id));
  for (const row of toDelete) {
    await adminWrite({ table: 'webhook_endpoints', op: 'delete', match: { id: (row as any).id } });
  }
  if (validRows.length > 0) {
    await adminWrite({ table: 'webhook_endpoints', op: 'upsert', payload: validRows });
  }
}

export async function loadWebhooksFromDb(): Promise<WebhookConfig> {
  const { data } = await supabase.from('webhook_endpoints').select('*').eq('active', true);
  if (data && data.length > 0) {
    const webhooks: WebhookEntry[] = data.map((row: any) => ({
      id: row.id, url: row.url, events: row.events || ['venda_pendente', 'venda_aprovada'],
    }));
    return { webhooks };
  }
  return getWebhookConfig();
}

export async function fireWebhookEvent(eventType: 'venda_pendente' | 'venda_aprovada', data: Record<string, unknown>) {
  let targets: { url: string }[] = [];
  try {
    const { data: dbWebhooks } = await supabase.from('webhook_endpoints').select('*').eq('active', true).contains('events', [eventType]);
    if (dbWebhooks && dbWebhooks.length > 0) targets = dbWebhooks.filter((w: any) => w.url?.trim());
  } catch {}

  if (targets.length === 0) {
    const config = getWebhookConfig();
    targets = config.webhooks.filter(w => w.url && w.events.includes(eventType));
  }

  await Promise.allSettled(targets.map(async (webhook) => {
    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventType, timestamp: new Date().toISOString(), ...data }),
        mode: 'no-cors',
      });
    } catch (err) {
      console.error(`Webhook error (${webhook.url}):`, err);
    }
  }));
}
