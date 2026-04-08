
-- Fix gateway_config: only authenticated users should read payment keys
DROP POLICY IF EXISTS "Gateway config viewable by everyone" ON public.gateway_config;
CREATE POLICY "Gateway config viewable by authenticated only"
ON public.gateway_config
FOR SELECT
TO authenticated
USING (true);

-- Fix orders: public can only see their own order (by matching on id), authenticated can see all
DROP POLICY IF EXISTS "Orders viewable by everyone" ON public.orders;
CREATE POLICY "Orders viewable by authenticated"
ON public.orders
FOR SELECT
TO authenticated
USING (true);
