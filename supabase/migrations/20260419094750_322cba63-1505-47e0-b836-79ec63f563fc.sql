ALTER TABLE public.gateway_config
  ADD COLUMN IF NOT EXISTS stripe_mode text NOT NULL DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS stripe_test_secret_key text DEFAULT '',
  ADD COLUMN IF NOT EXISTS stripe_test_publishable_key text DEFAULT '',
  ADD COLUMN IF NOT EXISTS stripe_test_webhook_secret text DEFAULT '';