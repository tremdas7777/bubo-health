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

export async function trackEvent(event: FunnelEvent) {
  try {
    await supabase.from('funnel_events').insert({ event, session_id: getSessionId() });
  } catch (err) {
    console.warn('Failed to track funnel event:', err);
  }
}

export async function getFunnelStats(periodMinutes: number) {
  const cutoff = new Date(Date.now() - periodMinutes * 60 * 1000).toISOString();
  const activeNowCutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('funnel_events')
    .select('event, created_at')
    .gte('created_at', cutoff);

  const events = data || [];
  return {
    visitors: events.filter(e => e.event === 'visitor').length,
    productViews: events.filter(e => e.event === 'product_view').length,
    addToCart: events.filter(e => e.event === 'add_to_cart').length,
    checkout: events.filter(e => e.event === 'checkout').length,
    purchase: events.filter(e => e.event === 'purchase').length,
    activeNow: events.filter(e => e.created_at >= activeNowCutoff).length,
  };
}

export async function clearFunnelEvents() {
  console.log('Clear funnel events - data persists in database');
}
