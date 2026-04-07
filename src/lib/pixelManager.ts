import { supabase } from '@/integrations/supabase/client';
import { getCampaignParams } from '@/lib/campaignParams';

export interface FacebookPixelEntry { id: string; pixelId: string; accessToken: string; }
export interface TikTokPixelEntry { id: string; pixelId: string; accessToken: string; }
export interface GoogleAdsEntry { id: string; adsId: string; adsLabel: string; }

export interface PixelConfig {
  facebookPixels: FacebookPixelEntry[];
  tiktokPixels: TikTokPixelEntry[];
  googleAdsPixels: GoogleAdsEntry[];
  utmifyHtml?: string;
  onlyPaid?: boolean;
  ga4MeasurementId?: string;
  ga4ApiSecret?: string;
}

const STORAGE_KEY = 'pixel_config';

function migrateConfig(raw: any): PixelConfig {
  const cfg: PixelConfig = {
    facebookPixels: raw.facebookPixels || [],
    tiktokPixels: raw.tiktokPixels || [],
    googleAdsPixels: raw.googleAdsPixels || [],
    utmifyHtml: raw.utmifyHtml || '',
    onlyPaid: raw.onlyPaid ?? false,
    ga4MeasurementId: raw.ga4MeasurementId || '',
    ga4ApiSecret: raw.ga4ApiSecret || '',
  };
  if (cfg.facebookPixels.length === 0 && raw.facebookPixelId) {
    cfg.facebookPixels.push({ id: crypto.randomUUID(), pixelId: raw.facebookPixelId, accessToken: raw.facebookAccessToken || '' });
  }
  if (cfg.tiktokPixels.length === 0 && raw.tiktokPixelId) {
    cfg.tiktokPixels.push({ id: crypto.randomUUID(), pixelId: raw.tiktokPixelId, accessToken: raw.tiktokAccessToken || '' });
  }
  if (cfg.googleAdsPixels.length === 0 && raw.googleAdsId) {
    cfg.googleAdsPixels.push({ id: crypto.randomUUID(), adsId: raw.googleAdsId, adsLabel: raw.googleAdsLabel || '' });
  }
  return cfg;
}

const DEFAULT_CONFIG: PixelConfig = { facebookPixels: [], tiktokPixels: [], googleAdsPixels: [], utmifyHtml: '', onlyPaid: false };
let cachedConfig: PixelConfig = DEFAULT_CONFIG;
let configLoaded = false;

interface QueuedEvent { eventName: string; data?: Record<string, unknown>; userData?: { email?: string; phone?: string }; eventId?: string; }
let pixelsReady = false;
const eventQueue: QueuedEvent[] = [];
let pixelReadyResolve: (() => void) | null = null;
const pixelReadyPromise = new Promise<void>((resolve) => { pixelReadyResolve = resolve; });

function markPixelsReady() {
  pixelsReady = true;
  if (pixelReadyResolve) { pixelReadyResolve(); pixelReadyResolve = null; }
  while (eventQueue.length > 0) {
    const ev = eventQueue.shift()!;
    _fireClientPixelsOnly(ev.eventName, ev.data, ev.eventId);
  }
}

export function getPixelConfig(): PixelConfig {
  if (!configLoaded) {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return migrateConfig(JSON.parse(raw)); } catch {}
  }
  return cachedConfig;
}

export async function loadPixelConfigFromDb(): Promise<PixelConfig> {
  try {
    const { data, error } = await supabase.from('pixel_config').select('config').limit(1).single();
    if (error || !data) return getPixelConfig();
    const cfg = migrateConfig((data as any).config || {});
    cachedConfig = cfg; configLoaded = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    return cfg;
  } catch { return getPixelConfig(); }
}

export async function savePixelConfig(config: PixelConfig) {
  cachedConfig = config; configLoaded = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  try {
    const { data: existing } = await supabase.from('pixel_config').select('id').limit(1).single();
    if (existing) { await supabase.from('pixel_config').update({ config: config as any, updated_at: new Date().toISOString() }).eq('id', (existing as any).id); }
    else { await supabase.from('pixel_config').insert({ config: config as any }); }
  } catch (err) { console.error('[Pixels] Failed to save to DB:', err); }
  injectPixels(config);
}

function removeExistingPixels() { document.querySelectorAll('[data-pixel-injected]').forEach(el => el.remove()); }

export function injectPixels(config?: PixelConfig) {
  const cfg = config || getPixelConfig();
  removeExistingPixels();
  const hasAnyPixel = cfg.facebookPixels.some(fb => fb.pixelId) || cfg.tiktokPixels.some(tt => tt.pixelId) || cfg.googleAdsPixels.some(ga => ga.adsId);

  cfg.facebookPixels.forEach((fb, i) => {
    if (!fb.pixelId) return;
    const script = document.createElement('script');
    script.setAttribute('data-pixel-injected', `facebook-${i}`);
    script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fb.pixelId}');fbq('track','PageView');`;
    document.head.appendChild(script);
  });

  cfg.tiktokPixels.forEach((tt, i) => {
    if (!tt.pixelId) return;
    const script = document.createElement('script');
    script.setAttribute('data-pixel-injected', `tiktok-${i}`);
    script.innerHTML = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tt.pixelId}');ttq.page()}(window,document,'ttq');`;
    document.head.appendChild(script);
  });

  if (cfg.utmifyHtml) {
    const container = document.createElement('div');
    container.setAttribute('data-pixel-injected', 'utmify-html');
    container.innerHTML = cfg.utmifyHtml;
    container.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.innerHTML = oldScript.innerHTML;
      newScript.setAttribute('data-pixel-injected', 'utmify-html');
      document.head.appendChild(newScript);
    });
  }

  const gtagIds: string[] = [];
  cfg.googleAdsPixels.forEach(ga => { if (ga.adsId) gtagIds.push(ga.adsId); });
  if (cfg.ga4MeasurementId) gtagIds.push(cfg.ga4MeasurementId);
  if (gtagIds.length > 0) {
    const gtagScript = document.createElement('script');
    gtagScript.setAttribute('data-pixel-injected', 'google-gtag-lib');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}`;
    document.head.appendChild(gtagScript);
    const gtagInit = document.createElement('script');
    gtagInit.setAttribute('data-pixel-injected', 'google-gtag-init');
    gtagInit.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${gtagIds.map(id => `gtag('config','${id}',{cookie_domain:'none',cookie_flags:'SameSite=None;Secure',send_page_view:true});`).join('')}`;
    document.head.appendChild(gtagInit);
  }

  if (hasAnyPixel) { setTimeout(() => markPixelsReady(), 500); }
  else { markPixelsReady(); }
}

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function buildFacebookUserData(userData?: { email?: string; phone?: string }) {
  const fbp = getCookie('_fbp');
  const fbc = getCookie('_fbc');
  const result: Record<string, any> = { client_user_agent: navigator.userAgent };
  if (fbp) result.fbp = fbp;
  if (fbc) result.fbc = fbc;
  if (!fbc) {
    const params = getCampaignParams();
    const fbclid = params.fbclid || new URLSearchParams(window.location.search).get('fbclid');
    if (fbclid) result.fbc = `fb.1.${Date.now()}.${fbclid}`;
  }
  if (userData?.email) result.em = [await sha256(userData.email)];
  if (userData?.phone) {
    const phone = userData.phone.replace(/\D/g, '');
    result.ph = [await sha256(phone.startsWith('55') ? phone : `55${phone}`)];
  }
  return result;
}

export function fireConversionEvent(eventName: string, data?: Record<string, unknown>, userData?: { email?: string; phone?: string }, eventId?: string) {
  if (!pixelsReady) {
    eventQueue.push({ eventName, data, userData, eventId });
    _fireCAPIOnly(eventName, data, userData, eventId);
    return;
  }
  _fireConversionEventNow(eventName, data, userData, eventId);
}

function _fireCAPIOnly(eventName: string, data?: Record<string, unknown>, userData?: { email?: string; phone?: string }, eventId?: string) {
  const cfg = getPixelConfig();
  const dedupEventId = eventId || `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  cfg.facebookPixels.forEach(fb => {
    if (!fb.pixelId || !fb.accessToken) return;
    buildFacebookUserData(userData).then(user_data => {
      fetch(`https://graph.facebook.com/v19.0/${fb.pixelId}/events`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [{ event_name: eventName, event_time: Math.floor(Date.now() / 1000), event_id: dedupEventId, action_source: 'website', event_source_url: window.location.href, user_data, custom_data: data }], access_token: fb.accessToken }),
      }).catch(err => console.error('Facebook CAPI error:', err));
    });
  });
  const tiktokMap: Record<string, string> = { 'Purchase': 'CompletePayment', 'InitiateCheckout': 'InitiateCheckout', 'AddToCart': 'AddToCart', 'ViewContent': 'ViewContent', 'Lead': 'SubmitForm' };
  cfg.tiktokPixels.forEach(tt => {
    if (!tt.pixelId || !tt.accessToken) return;
    fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Access-Token': tt.accessToken },
      body: JSON.stringify({ pixel_code: tt.pixelId, event: tiktokMap[eventName] || eventName, event_id: dedupEventId, timestamp: new Date().toISOString(), context: { page: { url: window.location.href }, user_agent: navigator.userAgent }, properties: data }),
    }).catch(err => console.error('TikTok Events API error:', err));
  });
}

function _fireClientPixelsOnly(eventName: string, data?: Record<string, unknown>, eventId?: string) {
  const cfg = getPixelConfig();
  const dedupEventId = eventId || `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (cfg.facebookPixels.some(fb => fb.pixelId) && typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', eventName, data, { eventID: dedupEventId });
  }
  const tiktokMap: Record<string, string> = { 'Purchase': 'CompletePayment', 'InitiateCheckout': 'InitiateCheckout', 'AddToCart': 'AddToCart', 'ViewContent': 'ViewContent', 'Lead': 'SubmitForm' };
  if (cfg.tiktokPixels.some(tt => tt.pixelId) && typeof (window as any).ttq?.track === 'function') {
    (window as any).ttq.track(tiktokMap[eventName] || eventName, data);
  }
  const campaignParams = getCampaignParams();
  cfg.googleAdsPixels.forEach(ga => {
    if (!ga.adsId || typeof (window as any).gtag !== 'function') return;
    const conversionData: Record<string, any> = { transaction_id: dedupEventId, ...data };
    if (campaignParams.gclid) conversionData.gclid = campaignParams.gclid;
    if (ga.adsLabel) { (window as any).gtag('event', 'conversion', { send_to: `${ga.adsId}/${ga.adsLabel}`, ...conversionData }); }
    else { (window as any).gtag('event', eventName === 'Purchase' ? 'conversion' : eventName, conversionData); }
  });
}

function _fireConversionEventNow(eventName: string, data?: Record<string, unknown>, userData?: { email?: string; phone?: string }, eventId?: string) {
  _fireClientPixelsOnly(eventName, data, eventId);
  _fireCAPIOnly(eventName, data, userData, eventId);
}
