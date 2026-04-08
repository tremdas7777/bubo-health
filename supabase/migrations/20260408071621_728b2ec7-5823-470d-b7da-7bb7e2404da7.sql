-- Revert gateway_config to public read (admin is password-gated in frontend)
DROP POLICY IF EXISTS "Gateway config viewable by authenticated only" ON public.gateway_config;
CREATE POLICY "Gateway config viewable by everyone"
ON public.gateway_config
FOR SELECT
TO public
USING (true);

-- Revert orders to public read
DROP POLICY IF EXISTS "Orders viewable by authenticated" ON public.orders;
CREATE POLICY "Orders viewable by everyone"
ON public.orders
FOR SELECT
TO public
USING (true);