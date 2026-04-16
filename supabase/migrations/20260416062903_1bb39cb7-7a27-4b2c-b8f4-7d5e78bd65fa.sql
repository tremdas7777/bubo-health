-- Add shipping method name to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_method text DEFAULT null;

-- Allow authenticated users (admin) to read all order items
CREATE POLICY "Authenticated can view all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (true);