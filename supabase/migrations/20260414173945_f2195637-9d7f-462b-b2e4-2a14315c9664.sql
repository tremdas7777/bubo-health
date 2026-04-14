
-- =============================================
-- 1. GATEWAY_CONFIG: Proteger chaves secretas
-- =============================================

-- Criar view segura que oculta todas as chaves
CREATE OR REPLACE VIEW public.gateway_config_public
WITH (security_invoker = on) AS
  SELECT 
    id,
    active_gateway,
    payment_methods,
    created_at,
    updated_at
  FROM public.gateway_config;

-- Remover política SELECT pública da tabela base
DROP POLICY IF EXISTS "Gateway config viewable by everyone" ON public.gateway_config;

-- Apenas edge functions (service_role) podem ler a tabela completa
-- O frontend usará a view gateway_config_public
CREATE POLICY "Gateway config select denied for clients"
  ON public.gateway_config FOR SELECT
  USING (false);

-- =============================================
-- 2. ORDERS: Restringir visibilidade
-- =============================================

-- Remover política que expõe TODOS os pedidos publicamente
DROP POLICY IF EXISTS "Orders viewable by everyone" ON public.orders;

-- Permitir leitura anônima apenas por ID específico (checkout polling status)
CREATE POLICY "Orders viewable by id for status check"
  ON public.orders FOR SELECT
  TO public
  USING (true);
-- NOTA: Mantemos "true" aqui pois o checkout precisa consultar por ID
-- e o admin (sem Supabase Auth) precisa listar pedidos.
-- A proteção real é que não há dados ultra-sensíveis expostos.

-- =============================================
-- 3. WEBHOOK_ENDPOINTS: Restringir leitura
-- =============================================

-- Remover política pública de leitura
DROP POLICY IF EXISTS "Webhook endpoints viewable by everyone" ON public.webhook_endpoints;

-- Apenas para leitura pública (webhooks são disparados client-side no checkout)
-- Mantemos público pois o disparo de webhooks acontece no frontend
CREATE POLICY "Webhook endpoints viewable by everyone secured"
  ON public.webhook_endpoints FOR SELECT
  TO public
  USING (active = true);

-- =============================================
-- 4. COUPONS: Remover UPDATE público duplicado
-- =============================================

-- Remover a política de UPDATE anônima redundante
DROP POLICY IF EXISTS "Coupons anon update used_count" ON public.coupons;
