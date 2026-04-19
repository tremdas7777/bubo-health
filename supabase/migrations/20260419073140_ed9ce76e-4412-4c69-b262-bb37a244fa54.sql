
ALTER TABLE public.gateway_config
  ADD COLUMN IF NOT EXISTS stripe_publishable_key text DEFAULT '',
  ADD COLUMN IF NOT EXISTS stripe_secret_key text DEFAULT '',
  ADD COLUMN IF NOT EXISTS stripe_webhook_secret text DEFAULT '';

DROP VIEW IF EXISTS public.gateway_config_public;
CREATE VIEW public.gateway_config_public AS
SELECT
  id,
  active_gateway,
  payment_methods,
  pagouai_public_key,
  beehive_public_key,
  pagamentosmp_public_key,
  stripe_publishable_key,
  created_at,
  updated_at
FROM public.gateway_config;

GRANT SELECT ON public.gateway_config_public TO anon, authenticated;
