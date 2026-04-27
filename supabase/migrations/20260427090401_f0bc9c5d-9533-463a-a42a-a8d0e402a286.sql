UPDATE public.products
SET 
  price_cents = 4999,
  original_price_cents = 9999,
  variants = '[{
    "name": "Stil",
    "values": ["10KG (5KG*2)", "20KG (10KG*2)", "30KG (15KG*2)", "40KG (20KG*2)"],
    "prices": {
      "10KG (5KG*2)": {"priceCents": 4999, "originalPriceCents": 9999},
      "20KG (10KG*2)": {"priceCents": 8999, "originalPriceCents": 13999},
      "30KG (15KG*2)": {"priceCents": 14999, "originalPriceCents": 19999},
      "40KG (20KG*2)": {"priceCents": 25999, "originalPriceCents": 30999}
    }
  }]'::jsonb
WHERE slug = 'verstellbare-kurzhanteln-20kg';