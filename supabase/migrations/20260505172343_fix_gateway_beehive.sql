-- Adiciona colunas da Beehive caso não existam
ALTER TABLE public.gateway_config 
ADD COLUMN IF NOT EXISTS beehive_public_key TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS beehive_secret_key TEXT DEFAULT '';

-- Adiciona coluna de payment_methods caso não exista
ALTER TABLE public.gateway_config 
ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{}'::jsonb;

-- Garante que exista pelo menos um registro com a Beehive ativada
INSERT INTO public.gateway_config (active_gateway, beehive_public_key, beehive_secret_key, payment_methods)
SELECT 'beehive', 'pk_live_v2MnlocrfybY04hoSBlPmQVzHgMnXqUHJv', 'sk_live_v2NF5vso2s5dRF63SL8Wjqtc8kJpA5fAseBtNVIJ2X', '{"beehive": "pix_card", "default": "pix_card"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.gateway_config);

-- Recria a view para evitar problemas de esquema e garante a exposição segura da chave pública
DROP VIEW IF EXISTS public.gateway_config_public;

CREATE VIEW public.gateway_config_public AS
SELECT 
  id,
  active_gateway,
  payment_methods,
  beehive_public_key
FROM public.gateway_config;

-- Garante permissões de leitura na view para clientes
GRANT SELECT ON public.gateway_config_public TO anon, authenticated;
