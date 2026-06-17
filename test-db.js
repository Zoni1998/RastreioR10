require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testando query do Dashboard...');
  const res1 = await supabase.from('stores').select('*');
  console.log('Todas as lojas:', res1.data, res1.error);

  console.log('Testando query de Configuracoes...');
  const res2 = await supabase.from('stores').select('id, nuvemshop_store_id, posting_delay_days, delivery_delay_days, store_domain');
  console.log('Lojas com colunas especificas:', res2.data, res2.error);
}

test();
