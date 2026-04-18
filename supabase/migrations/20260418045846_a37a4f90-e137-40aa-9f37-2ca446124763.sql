UPDATE public.pixel_config 
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{tiktokPixels}',
  '[{"id":"tiktok-d7hguf3c","pixelId":"D7HGUF3C77U9I9C34VVG","accessToken":""}]'::jsonb
),
updated_at = now();