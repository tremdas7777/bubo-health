import { supabase } from '@/integrations/supabase/client';

export type FunnelEvent = 'visitor' | 'product_view' | 'add_to_cart' | 'checkout' | 'purchase';

const SESSION_KEY = 'funnel_session_id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function trackEvent(event: FunnelEvent, productSlug?: string) {
  try {
    await supabase.from('funnel_events').insert({
      event,
      session_id: getSessionId(),
      product_slug: productSlug ?? null,
    } as any);
  } catch (err) {
    console.warn('Failed to track funnel event:', err);
  }
}

export interface FunnelStats {
  visitors: number;
  productViews: number;
  addToCart: number;
  checkout: number;
  purchase: number;
  activeNow: number;
}

function aggregate(events: { event: string; created_at: string }[], activeNowCutoff: string): FunnelStats {
  return {
    visitors: events.filter(e => e.event === 'visitor').length,
    productViews: events.filter(e => e.event === 'product_view').length,
    addToCart: events.filter(e => e.event === 'add_to_cart').length,
    checkout: events.filter(e => e.event === 'checkout').length,
    purchase: events.filter(e => e.event === 'purchase').length,
    activeNow: events.filter(e => e.created_at >= activeNowCutoff).length,
  };
}

export async function getFunnelStats(periodMinutes: number): Promise<FunnelStats> {
  const cutoff = new Date(Date.now() - periodMinutes * 60 * 1000).toISOString();
  const activeNowCutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('funnel_events')
    .select('event, created_at')
    .gte('created_at', cutoff);

  return aggregate(data || [], activeNowCutoff);
}

/**
 * Estatísticas do funil filtradas por produto (via product_slug).
 * Para o evento "visitor" (que é da loja inteira) usamos todos os visitantes
 * da janela como referência de tráfego, já que não amarramos visitas a produto.
 */
export async function getFunnelStatsForProduct(productSlug: string, periodMinutes: number): Promise<FunnelStats> {
  const cutoff = new Date(Date.now() - periodMinutes * 60 * 1000).toISOString();
  const activeNowCutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const [{ data: productEvents }, { data: visitorEvents }] = await Promise.all([
    supabase
      .from('funnel_events')
      .select('event, created_at, product_slug')
      .gte('created_at', cutoff)
      .eq('product_slug', productSlug),
    supabase
      .from('funnel_events')
      .select('event, created_at')
      .gte('created_at', cutoff)
      .eq('event', 'visitor'),
  ]);

  const events = (productEvents || []) as { event: string; created_at: string }[];
  const visitors = (visitorEvents || []) as { event: string; created_at: string }[];

  const stats = aggregate(events, activeNowCutoff);
  // Sobrescreve visitantes com o total da loja (referência de tráfego global)
  stats.visitors = visitors.length;
  // Active now = quem teve qualquer evento desse produto nos últimos 2 min
  stats.activeNow = events.filter(e => e.created_at >= activeNowCutoff).length;
  return stats;
}

export async function clearFunnelEvents() {
  console.log('Clear funnel events - data persists in database');
}
