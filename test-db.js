require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: stores } = await supabase.from('stores').select('*').limit(1);
  console.log('Stores schema:', Object.keys(stores[0] || {}));
  
  const { data: orders } = await supabase.from('orders').select('*').limit(1);
  console.log('Orders schema:', Object.keys(orders[0] || {}));
}
test();
