UPDATE public.store_settings
SET available_languages = (
  SELECT to_jsonb(array(SELECT DISTINCT jsonb_array_elements_text(available_languages || '["de"]'::jsonb)))
)
WHERE NOT (available_languages ? 'de');