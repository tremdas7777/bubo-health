ALTER TABLE public.funnel_events ADD COLUMN IF NOT EXISTS product_slug TEXT;
CREATE INDEX IF NOT EXISTS idx_funnel_events_product_slug ON public.funnel_events(product_slug);
CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at ON public.funnel_events(created_at);