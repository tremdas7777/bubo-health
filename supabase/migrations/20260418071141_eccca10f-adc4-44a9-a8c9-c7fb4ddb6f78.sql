-- Remover linha duplicada vazia (centurionpay sem chaves)
DELETE FROM public.gateway_config 
WHERE beehive_secret_key IS NULL OR beehive_secret_key = '';

-- Garantir que a linha restante esteja ativa como Beehive
UPDATE public.gateway_config 
SET active_gateway = 'beehive', updated_at = now()
WHERE beehive_secret_key IS NOT NULL AND beehive_secret_key <> '';