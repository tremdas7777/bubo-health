
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBeehive() {
  const config = {
    activeGateway: 'beehive',
    paymentMethods: { default: 'pix_card', beehive: 'pix_card' },
    beehive: { 
      publicKey: 'pk_live_v2MnlocrfybY04hoSBlPmQVzHgMnXqUHJv', 
      secretKey: 'sk_live_v2NF5vso2s5dRF63SL8Wjqtc8kJpA5fAseBtNVIJ2X', 
      enabled: true 
    },
    stripe: { enabled: false },
    pagouai: { enabled: false },
    vennox: { enabled: false },
    centurionpay: { enabled: false },
    ironpay: { enabled: false },
    simpayout: { enabled: false },
    pagamentosmp: { enabled: false }
  };

  console.log('Calling save-gateway-config edge function...');
  const { data, error } = await supabase.functions.invoke('save-gateway-config', {
    body: { password: 'Pala10@.', config }
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

updateBeehive();
