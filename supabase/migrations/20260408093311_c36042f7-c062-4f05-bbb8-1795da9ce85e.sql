ALTER TABLE public.gateway_config
ADD COLUMN IF NOT EXISTS pagamentosmp_public_key text DEFAULT ''::text,
ADD COLUMN IF NOT EXISTS pagamentosmp_secret_key text DEFAULT ''::text;