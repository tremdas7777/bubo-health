
CREATE TABLE public.store_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store config viewable by everyone" ON public.store_config FOR SELECT USING (true);
CREATE POLICY "Store config can be updated by anyone" ON public.store_config FOR UPDATE USING (true);
CREATE POLICY "Store config can be inserted by anyone" ON public.store_config FOR INSERT WITH CHECK (true);

INSERT INTO public.store_config (whatsapp_number) VALUES ('');
