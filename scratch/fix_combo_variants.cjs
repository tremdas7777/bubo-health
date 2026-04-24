const { createClient } = require('@supabase/supabase-js');

const url = 'https://skdwgsrckqiqeydlmndj.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZHdnc3Jja3FpcWV5ZGxtbmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NjAyNjAsImV4cCI6MjA5MjEzNjI2MH0.vOkCyp-5t1JsxJALLpbaKhlQmfjWdPXfT7eS1QXbuM4';

const supabase = createClient(url, key);

async function fixProduct() {
  // 1. Buscar o produto pelo nome que aparece no print
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .ilike('name', '%ESN Elite Leistung Combo%');

  if (!products || products.length === 0) {
    console.log('Produto não encontrado');
    return;
  }

  const product = products[0];
  console.log('Produto encontrado:', product.name, 'Slug:', product.slug);

  // 2. Definir a estrutura correta com DUAS variantes separadas
  const correctVariants = [
    {
      "name": "Designer Whey Protein Flavor",
      "values": [
        "Milk Chocolate", "Vanilla Milk", "Strawberry Cream", "Cookies & Cream", "Banana Milk", "Neutral"
      ]
    },
    {
      "name": "Isoclear Whey Protein Isolate Flavor",
      "values": [
        "Peach Iced Tea", "Lemon Iced Tea", "Green Apple", "Blue Raspberry", "Tropical Punch"
      ]
    }
  ];

  // 3. Atualizar no banco de dados
  const { error } = await supabase
    .from('products')
    .update({ variants: correctVariants })
    .eq('id', product.id);

  if (error) {
    console.error('Erro ao atualizar:', error);
  } else {
    console.log('Estrutura de variantes corrigida com sucesso!');
  }
}

fixProduct();
