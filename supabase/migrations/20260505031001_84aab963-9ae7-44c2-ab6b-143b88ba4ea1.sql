
INSERT INTO public.store_settings (default_language, default_currency, available_languages, available_currencies, exchange_rates, auto_detect_by_ip)
SELECT 'pt', 'BRL', '["pt","en","es","fr","de"]'::jsonb, '["BRL","USD","EUR","GBP"]'::jsonb, '{"BRL":5.10,"EUR":0.92,"GBP":0.79,"USD":1}'::jsonb, false
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);

UPDATE public.store_settings SET
  default_language = 'pt',
  default_currency = 'BRL',
  available_languages = '["pt","en","es","fr","de"]'::jsonb,
  available_currencies = '["BRL","USD","EUR","GBP"]'::jsonb,
  auto_detect_by_ip = false;
