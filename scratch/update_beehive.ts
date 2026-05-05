
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertBeehive() {
  const payload = {
    active_gateway: 'beehive',
    beehive_public_key: process.env.BEEHIVE_PUBLIC_KEY ?? '',
    beehive_secret_key: process.env.BEEHIVE_SECRET_KEY ?? '',
    updated_at: new Date().toISOString()
  };

  console.log('Calling admin-write edge function...');
  const { data, error } = await supabase.functions.invoke('admin-write', {
    body: { 
      password: 'Pala10@.', 
      table: 'gateway_config',
      op: 'insert',
      payload
    }
  });

  if (error) {
    console.error('Function error:', error);
    if (error instanceof Error && 'context' in error) {
       const resp = (error as any).context;
       if (resp instanceof Response) {
         try {
           const text = await resp.text();
           console.log('Response body:', text);
         } catch(e) {}
       }
    }
  } else {
    console.log('Function response:', data);
  }
}

insertBeehive();
