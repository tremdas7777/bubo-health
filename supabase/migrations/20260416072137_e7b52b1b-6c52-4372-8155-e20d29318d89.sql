ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS recovery_email_sent boolean DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS recovery_email_sent_at timestamptz DEFAULT null;