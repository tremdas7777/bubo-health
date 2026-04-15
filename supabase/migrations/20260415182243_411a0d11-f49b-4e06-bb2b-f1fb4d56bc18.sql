
-- Recreate view to include public keys (safe to expose)
DROP VIEW IF EXISTS public.gateway_config_public;

CREATE OR REPLACE VIEW public.gateway_config_public 
WITH (security_invoker = false)
AS
SELECT id, active_gateway, payment_methods, 
       beehive_public_key, pagamentosmp_public_key, pagouai_public_key,
       created_at, updated_at
FROM gateway_config;

GRANT SELECT ON public.gateway_config_public TO anon, authenticated;
