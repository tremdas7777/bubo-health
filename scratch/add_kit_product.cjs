const { createClient } = require('@supabase/supabase-js');

const url = 'https://skdwgsrckqiqeydlmndj.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZHdnc3Jja3FpcWV5ZGxtbmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NjAyNjAsImV4cCI6MjA5MjEzNjI2MH0.vOkCyp-5t1JsxJALLpbaKhlQmfjWdPXfT7eS1QXbuM4';

const supabase = createClient(url, key);

async function addKitProduct() {
  const kitProduct = {
    name: 'Combo Kazoom Suplementos Completo',
    slug: 'kit-suplementos-completo',
    price_cents: 59700,
    original_price_cents: 129700,
    category: 'suplementos',
    description: 'O kit definitivo para performance máxima. Inclui todos os suplementos da coleção: Designer Whey Protein, Isoclear Whey Protein Isolate, Crank Pre-Workout, Ultrapure Kreatin Pulver, Daily, Designer Bar Proteinriegel, Magnesium Complex, Zink Kapseln, Vitamin D3 + K2 Depot, Ashwagandha Kapseln: Ashwa+, Athlete Stack: Men, Athlete Stack: Women e Magnesiumbisglycinat Kapseln. Personalize os sabores de cada item e tenha o melhor suporte nutricional para seus treinos.',
    image_url: 'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/61c5f034-ba9c-4f63-92e8-331dd365c01b/kit-suplementos-hipertrofia.png',
    active: true,
    featured: true,
    sort_order: -1
  };

  const { data, error } = await supabase
    .from('products')
    .upsert([kitProduct], { onConflict: 'slug' })
    .select();

  if (error) {
    console.error('Error inserting product:', error);
    process.exit(1);
  }

  console.log('Product inserted/updated successfully:');
  console.log(JSON.stringify(data, null, 2));
}

addKitProduct();
