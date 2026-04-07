-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  description_html TEXT,
  price_cents INTEGER NOT NULL,
  original_price_cents INTEGER,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'Geral',
  variants JSONB DEFAULT '[]',
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products can be inserted by anyone" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products can be updated by anyone" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Products can be deleted by anyone" ON public.products FOR DELETE USING (true);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  buyer_document TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  shipping_cost_cents INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  gateway TEXT DEFAULT 'centurionpay',
  pix_code TEXT,
  pix_qr_code TEXT,
  qr_code_copied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders viewable by everyone" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders can be created by anyone" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders can be updated by anyone" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Orders can be deleted by anyone" ON public.orders FOR DELETE USING (true);

-- Collections table
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collections viewable by everyone" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Collections can be inserted by anyone" ON public.collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Collections can be updated by anyone" ON public.collections FOR UPDATE USING (true);
CREATE POLICY "Collections can be deleted by anyone" ON public.collections FOR DELETE USING (true);

-- Funnel events table
CREATE TABLE public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Funnel events viewable by everyone" ON public.funnel_events FOR SELECT USING (true);
CREATE POLICY "Funnel events can be created by anyone" ON public.funnel_events FOR INSERT WITH CHECK (true);

-- Gateway config table
CREATE TABLE public.gateway_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  active_gateway TEXT NOT NULL DEFAULT 'centurionpay',
  pagouai_public_key TEXT DEFAULT '',
  pagouai_secret_key TEXT DEFAULT '',
  vennox_secret_key TEXT DEFAULT '',
  vennox_company_id TEXT DEFAULT '',
  centurionpay_secret_key TEXT DEFAULT '',
  centurionpay_company_id TEXT DEFAULT '',
  ironpay_api_token TEXT DEFAULT '',
  simpayout_client_id TEXT DEFAULT '',
  simpayout_client_secret TEXT DEFAULT '',
  beehive_public_key TEXT DEFAULT '',
  beehive_secret_key TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gateway_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gateway config viewable by everyone" ON public.gateway_config FOR SELECT USING (true);
CREATE POLICY "Gateway config can be created by anyone" ON public.gateway_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Gateway config can be updated by anyone" ON public.gateway_config FOR UPDATE USING (true);

-- Cloaker config table
CREATE TABLE public.cloaker_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cloaker_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cloaker config viewable by everyone" ON public.cloaker_config FOR SELECT USING (true);
CREATE POLICY "Cloaker config can be updated by anyone" ON public.cloaker_config FOR UPDATE USING (true);
CREATE POLICY "Cloaker config can be created by anyone" ON public.cloaker_config FOR INSERT WITH CHECK (true);

-- Webhook endpoints table
CREATE TABLE public.webhook_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{venda_pendente,venda_aprovada}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Webhook endpoints viewable by everyone" ON public.webhook_endpoints FOR SELECT USING (true);
CREATE POLICY "Webhook endpoints can be created by anyone" ON public.webhook_endpoints FOR INSERT WITH CHECK (true);
CREATE POLICY "Webhook endpoints can be updated by anyone" ON public.webhook_endpoints FOR UPDATE USING (true);
CREATE POLICY "Webhook endpoints can be deleted by anyone" ON public.webhook_endpoints FOR DELETE USING (true);

-- Pixel config table
CREATE TABLE public.pixel_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pixel_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read pixel_config" ON public.pixel_config FOR SELECT USING (true);
CREATE POLICY "Allow public update pixel_config" ON public.pixel_config FOR UPDATE USING (true);
CREATE POLICY "Allow public insert pixel_config" ON public.pixel_config FOR INSERT WITH CHECK (true);

-- Shipping config table
CREATE TABLE public.shipping_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  free_shipping_enabled BOOLEAN NOT NULL DEFAULT true,
  free_shipping_min_cents INTEGER NOT NULL DEFAULT 0,
  flat_rate_enabled BOOLEAN NOT NULL DEFAULT false,
  flat_rate_cents INTEGER NOT NULL DEFAULT 0,
  shipping_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shipping config viewable by everyone" ON public.shipping_config FOR SELECT USING (true);
CREATE POLICY "Shipping config can be inserted by anyone" ON public.shipping_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Shipping config can be updated by anyone" ON public.shipping_config FOR UPDATE USING (true);

-- Product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  review_text TEXT,
  review_image_url TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable by everyone" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Reviews can be created by anyone" ON public.product_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Reviews can be updated by anyone" ON public.product_reviews FOR UPDATE USING (true);
CREATE POLICY "Reviews can be deleted by anyone" ON public.product_reviews FOR DELETE USING (true);

-- Insert default configs
INSERT INTO public.cloaker_config (enabled) VALUES (true);
INSERT INTO public.gateway_config (active_gateway) VALUES ('centurionpay');
INSERT INTO public.pixel_config (config) VALUES ('{}'::jsonb);
INSERT INTO public.shipping_config (free_shipping_enabled, free_shipping_min_cents, flat_rate_enabled, flat_rate_cents, shipping_options)
VALUES (true, 0, false, 1500, '[]'::jsonb);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gateway_config_updated_at BEFORE UPDATE ON public.gateway_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloaker_config_updated_at BEFORE UPDATE ON public.cloaker_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_webhook_endpoints_updated_at BEFORE UPDATE ON public.webhook_endpoints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipping_config_updated_at BEFORE UPDATE ON public.shipping_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_funnel_events_created_at ON public.funnel_events(created_at DESC);
CREATE INDEX idx_funnel_events_event ON public.funnel_events(event);
CREATE INDEX idx_collections_slug ON public.collections(slug);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');