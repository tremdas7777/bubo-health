const { createClient } = require('@supabase/supabase-js');

const url = 'https://skdwgsrckqiqeydlmndj.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZHdnc3Jja3FpcWV5ZGxtbmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NjAyNjAsImV4cCI6MjA5MjEzNjI2MH0.vOkCyp-5t1JsxJALLpbaKhlQmfjWdPXfT7eS1QXbuM4';

const supabase = createClient(url, key);

async function checkProduct() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('slug', '%esn%');

  if (error) {
    console.error('Erro ao buscar produto:', error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

checkProduct();
