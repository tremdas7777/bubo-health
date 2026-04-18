ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS checkout_step text DEFAULT 'identification';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS checkout_step_updated_at timestamptz DEFAULT now();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS abandoned_recovered boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_checkout_step ON public.orders(checkout_step, checkout_step_updated_at DESC);