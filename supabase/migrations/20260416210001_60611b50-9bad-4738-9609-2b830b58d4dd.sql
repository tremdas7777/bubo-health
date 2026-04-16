ALTER TABLE public.gateway_config 
ADD COLUMN IF NOT EXISTS utmify_api_token text DEFAULT '',
ADD COLUMN IF NOT EXISTS utmify_api_token_2 text DEFAULT '';