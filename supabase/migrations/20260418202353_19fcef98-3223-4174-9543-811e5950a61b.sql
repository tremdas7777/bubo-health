UPDATE products
SET variants = jsonb_set(
  variants::jsonb,
  '{0,colors,0,image}',
  '"https://mnquagsywdzjudsfurle.supabase.co/storage/v1/object/public/product-images/products/polo-ducatti-preta.jpg"'::jsonb
)
WHERE id = 'f0d136a6-460b-496b-9172-bfe58528fde0';