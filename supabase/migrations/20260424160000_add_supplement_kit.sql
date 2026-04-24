INSERT INTO public.products (
  id, 
  name, 
  slug, 
  price_cents, 
  original_price_cents, 
  category, 
  description, 
  image_url, 
  active, 
  featured, 
  sort_order
) VALUES (
  gen_random_uuid(),
  'Combo Suplementos Hipertrofia Completo',
  'kit-suplementos-completo',
  49700,
  89700,
  'suplementos',
  'O kit definitivo para quem busca performance máxima. Inclui: 1x Whey Protein 100% Pure, 1x Creatina Monohidratada, 1x Pré-Treino Explosive e 1x BCAA Amino. Escolha os sabores de cada item e turbine seus resultados.',
  'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/61c5f034-ba9c-4f63-92e8-331dd365c01b/kit-suplementos-hipertrofia.png', -- Placeholder or upload generated image
  true,
  true,
  0
);
