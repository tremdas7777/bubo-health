UPDATE public.shipping_config
SET free_shipping_enabled = true,
    free_shipping_min_cents = 0,
    flat_rate_enabled = false,
    flat_rate_cents = 0,
    shipping_options = '[]'::jsonb,
    updated_at = now();