-- A view foi criada com security_invoker=ON enquanto gateway_config tem SELECT bloqueado (USING false).
-- Isso faz anon/authenticated verem 0 linhas na view e quebra checkout + fallback admin-write.
-- security_invoker=OFF: a view roda com permissões do dono e só expõe as colunas listadas (sem secrets).

DROP VIEW IF EXISTS public.gateway_config_public;

CREATE VIEW public.gateway_config_public
WITH (security_invoker = false)
AS
SELECT
  id,
  active_gateway,
  payment_methods,
  beehive_public_key
FROM public.gateway_config;

GRANT SELECT ON public.gateway_config_public TO anon, authenticated;
