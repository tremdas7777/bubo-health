-- Create store_settings singleton table for i18n + currency config
CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_language text NOT NULL DEFAULT 'en',
  available_languages jsonb NOT NULL DEFAULT '["en","es","pt","fr"]'::jsonb,
  default_currency text NOT NULL DEFAULT 'USD',
  available_currencies jsonb NOT NULL DEFAULT '["USD","EUR","BRL","GBP"]'::jsonb,
  exchange_rates jsonb NOT NULL DEFAULT '{"USD":1,"EUR":0.92,"BRL":5.10,"GBP":0.79}'::jsonb,
  auto_detect_by_ip boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store settings viewable by everyone"
  ON public.store_settings FOR SELECT
  USING (true);

CREATE POLICY "Store settings insert auth only"
  ON public.store_settings FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Store settings update auth only"
  ON public.store_settings FOR UPDATE TO authenticated
  USING (true);

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed singleton row
INSERT INTO public.store_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Add translation columns to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS name_translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS description_translations jsonb NOT NULL DEFAULT '{}'::jsonb;