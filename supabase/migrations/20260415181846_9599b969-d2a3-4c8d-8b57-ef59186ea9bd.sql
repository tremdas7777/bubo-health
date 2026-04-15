
-- Drop existing view
DROP VIEW IF EXISTS public.gateway_config_public;

-- Recreate as security definer view (bypasses RLS)
CREATE OR REPLACE VIEW public.gateway_config_public 
WITH (security_invoker = false)
AS
SELECT id, active_gateway, payment_methods, created_at, updated_at
FROM gateway_config;

-- Grant select to anon and authenticated
GRANT SELECT ON public.gateway_config_public TO anon, authenticated;
