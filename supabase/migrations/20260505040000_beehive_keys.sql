
-- Insert or update beehive keys
INSERT INTO public.gateway_config (active_gateway, beehive_public_key, beehive_secret_key)
VALUES ('beehive', 'pk_live_v2MnlocrfybY04hoSBlPmQVzHgMnXqUHJv', 'sk_live_v2NF5vso2s5dRF63SL8Wjqtc8kJpA5fAseBtNVIJ2X')
ON CONFLICT (id) DO UPDATE SET
  active_gateway = 'beehive',
  beehive_public_key = 'pk_live_v2MnlocrfybY04hoSBlPmQVzHgMnXqUHJv',
  beehive_secret_key = 'sk_live_v2NF5vso2s5dRF63SL8Wjqtc8kJpA5fAseBtNVIJ2X',
  updated_at = now();
