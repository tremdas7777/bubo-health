DO $$
DECLARE
  keep_id uuid;
BEGIN
  SELECT id INTO keep_id 
  FROM public.gateway_config 
  WHERE COALESCE(utmify_api_token, '') <> ''
  ORDER BY updated_at DESC LIMIT 1;

  IF keep_id IS NULL THEN
    SELECT id INTO keep_id FROM public.gateway_config ORDER BY updated_at DESC LIMIT 1;
  END IF;

  DELETE FROM public.gateway_config WHERE id <> keep_id;
END $$;