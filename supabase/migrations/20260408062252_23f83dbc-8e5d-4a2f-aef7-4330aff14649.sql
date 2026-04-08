
-- gateway_config: restrict write to authenticated
DROP POLICY IF EXISTS "Gateway config can be created by anyone" ON public.gateway_config;
DROP POLICY IF EXISTS "Gateway config can be updated by anyone" ON public.gateway_config;
CREATE POLICY "Gateway config insert auth only" ON public.gateway_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Gateway config update auth only" ON public.gateway_config FOR UPDATE TO authenticated USING (true);

-- orders: restrict update/delete to authenticated (insert stays public for checkout)
DROP POLICY IF EXISTS "Orders can be updated by anyone" ON public.orders;
DROP POLICY IF EXISTS "Orders can be deleted by anyone" ON public.orders;
CREATE POLICY "Orders update auth only" ON public.orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Orders delete auth only" ON public.orders FOR DELETE TO authenticated USING (true);

-- coupons: restrict write to authenticated, keep select public
DROP POLICY IF EXISTS "Coupons can be inserted by anyone" ON public.coupons;
DROP POLICY IF EXISTS "Coupons can be updated by anyone" ON public.coupons;
DROP POLICY IF EXISTS "Coupons can be deleted by anyone" ON public.coupons;
CREATE POLICY "Coupons insert auth only" ON public.coupons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Coupons update auth only" ON public.coupons FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Coupons delete auth only" ON public.coupons FOR DELETE TO authenticated USING (true);
-- Allow anon to update used_count (for checkout coupon application)
CREATE POLICY "Coupons anon update used_count" ON public.coupons FOR UPDATE USING (true) WITH CHECK (true);

-- pixel_config: restrict write to authenticated
DROP POLICY IF EXISTS "Allow public insert pixel_config" ON public.pixel_config;
DROP POLICY IF EXISTS "Allow public update pixel_config" ON public.pixel_config;
CREATE POLICY "Pixel config insert auth only" ON public.pixel_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Pixel config update auth only" ON public.pixel_config FOR UPDATE TO authenticated USING (true);

-- store_config: restrict write to authenticated
DROP POLICY IF EXISTS "Store config can be inserted by anyone" ON public.store_config;
DROP POLICY IF EXISTS "Store config can be updated by anyone" ON public.store_config;
CREATE POLICY "Store config insert auth only" ON public.store_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Store config update auth only" ON public.store_config FOR UPDATE TO authenticated USING (true);

-- shipping_config: restrict write to authenticated
DROP POLICY IF EXISTS "Shipping config can be inserted by anyone" ON public.shipping_config;
DROP POLICY IF EXISTS "Shipping config can be updated by anyone" ON public.shipping_config;
CREATE POLICY "Shipping config insert auth only" ON public.shipping_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Shipping config update auth only" ON public.shipping_config FOR UPDATE TO authenticated USING (true);

-- cloaker_config: restrict write to authenticated
DROP POLICY IF EXISTS "Cloaker config can be created by anyone" ON public.cloaker_config;
DROP POLICY IF EXISTS "Cloaker config can be updated by anyone" ON public.cloaker_config;
CREATE POLICY "Cloaker config insert auth only" ON public.cloaker_config FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Cloaker config update auth only" ON public.cloaker_config FOR UPDATE TO authenticated USING (true);

-- webhook_endpoints: restrict all writes to authenticated
DROP POLICY IF EXISTS "Webhook endpoints can be created by anyone" ON public.webhook_endpoints;
DROP POLICY IF EXISTS "Webhook endpoints can be updated by anyone" ON public.webhook_endpoints;
DROP POLICY IF EXISTS "Webhook endpoints can be deleted by anyone" ON public.webhook_endpoints;
CREATE POLICY "Webhook insert auth only" ON public.webhook_endpoints FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Webhook update auth only" ON public.webhook_endpoints FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Webhook delete auth only" ON public.webhook_endpoints FOR DELETE TO authenticated USING (true);

-- products: restrict writes to authenticated
DROP POLICY IF EXISTS "Products can be inserted by anyone" ON public.products;
DROP POLICY IF EXISTS "Products can be updated by anyone" ON public.products;
DROP POLICY IF EXISTS "Products can be deleted by anyone" ON public.products;
CREATE POLICY "Products insert auth only" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Products update auth only" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Products delete auth only" ON public.products FOR DELETE TO authenticated USING (true);

-- collections: restrict writes to authenticated
DROP POLICY IF EXISTS "Collections can be inserted by anyone" ON public.collections;
DROP POLICY IF EXISTS "Collections can be updated by anyone" ON public.collections;
DROP POLICY IF EXISTS "Collections can be deleted by anyone" ON public.collections;
CREATE POLICY "Collections insert auth only" ON public.collections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Collections update auth only" ON public.collections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Collections delete auth only" ON public.collections FOR DELETE TO authenticated USING (true);

-- product_reviews: restrict edit/delete to authenticated (keep insert public for customers)
DROP POLICY IF EXISTS "Reviews can be updated by anyone" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews can be deleted by anyone" ON public.product_reviews;
CREATE POLICY "Reviews update auth only" ON public.product_reviews FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Reviews delete auth only" ON public.product_reviews FOR DELETE TO authenticated USING (true);
