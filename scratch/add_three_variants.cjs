const { createClient } = require('@supabase/supabase-js');

const url = 'https://skdwgsrckqiqeydlmndj.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZHdnc3Jja3FpcWV5ZGxtbmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NjAyNjAsImV4cCI6MjA5MjEzNjI2MH0.vOkCyp-5t1JsxJALLpbaKhlQmfjWdPXfT7eS1QXbuM4';

const supabase = createClient(url, key);

async function addThreeVariants() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .ilike('name', '%ESN Elite Leistung Combo%');

  if (!products || products.length === 0) {
    console.log('Produto não encontrado');
    return;
  }

  const product = products[0];
  console.log('Atualizando produto:', product.name);

  // Designer Whey flavors from DB
  const designerWheyFlavors = [
    "Honey Cereal", "Apple Strudel", "Germknödel", "Peanutbutter Cup", 
    "Birthday Cake", "Almond Coconut", "Vanilla Speculoos", "Banana Milk", 
    "Cherry Yogurt", "Chicken Waffle", "Cinnamon Cereal", "Dark Cookies & Cream", 
    "KiBa", "Leons Cereal", "Milk Chocolate", "Milky Hazelnut", "Neutral", 
    "Peach Yogurt", "Salted Dark Chocolate", "Stracciatella", "Strawberry Cream", 
    "Stroopwafel", "Vanilla Ice Cream", "Vanilla Milk", "Vanilla Speculoos V2", 
    "White Chocolate Pistachio", "Blueberry Cheesecake"
  ];

  // Isoclear flavors from DB
  const isoclearFlavors = [
    "Royal Candy", "Pina Colada", "Tropical Punch", "Mojito", "Cactus Ice", 
    "Icy Pear", "Peach Rings", "Blackberry", "Bloody Orange", "Spiced Orange", 
    "Fresh Orange", "Fresh Lemon", "Cactus Fruit", "Cherry Lemonade", "Cola Orange", 
    "Green Apple", "Green Tea Honey", "Lemon Iced Tea", "Mango Peach Iced Tea", 
    "Peach Iced Tea", "Pink Grapefruit", "Red Apple Lime", "Sour Power", 
    "Strawberry Lime", "Gummy Bear (limited)"
  ];

  // Crank Pre-Workout flavors from KIT_CONFIG
  const crankFlavors = [
    "Fresh Berry Juice", "Tropical Punch", "Cola", "Cherry Cola", "Blackberry", "Sour Power"
  ];

  const correctVariants = [
    {
      "name": "Designer Whey Protein Flavor",
      "values": designerWheyFlavors
    },
    {
      "name": "Isoclear Whey Protein Isolate Flavor",
      "values": isoclearFlavors
    },
    {
      "name": "Crank Pre-Workout Flavor",
      "values": crankFlavors
    }
  ];

  const { error } = await supabase
    .from('products')
    .update({ variants: correctVariants })
    .eq('id', product.id);

  if (error) {
    console.error('Erro ao atualizar:', error);
  } else {
    console.log('3 variantes adicionadas com sucesso!');
  }
}

addThreeVariants();
