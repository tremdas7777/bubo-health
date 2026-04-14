UPDATE products 
SET 
  image_url = 'https://mnquagsywdzjudsfurle.supabase.co/storage/v1/object/public/product-images/kit-ferramentas-refrigeracao-principal.jpg',
  images = array_prepend(
    'https://mnquagsywdzjudsfurle.supabase.co/storage/v1/object/public/product-images/kit-ferramentas-refrigeracao-principal.jpg',
    images
  )
WHERE slug = 'kit-ferramentas-refrigeracao';