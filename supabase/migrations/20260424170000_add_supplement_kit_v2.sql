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
  'Combo Kazoom Suplementos Completo',
  'kit-suplementos-completo',
  59700,
  129700,
  'suplementos',
  'O kit definitivo para performance máxima. Inclui todos os suplementos da coleção: Whey Protein, Isoclear, Crank Pre-Workout, Kreatin, Daily Drink, Designer Bar e complexos de vitaminas. Personalize os sabores de cada item e tenha o melhor suporte nutricional para seus treinos.',
  'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/61c5f034-ba9c-4f63-92e8-331dd365c01b/kit-suplementos-hipertrofia.png',
  true,
  true,
  -1
);
