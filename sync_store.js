require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltam as chaves do Supabase no .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStore() {
  console.log("Conectando ao banco de dados Supabase...");
  
  // Inserir a loja e o token no banco
  const { data, error } = await supabase
    .from('stores')
    .upsert(
      { 
        nuvemshop_store_id: '5876083', 
        access_token: 'e129a4a1f93082dda2cbde0d94de2993774b95eb' 
      },
      { onConflict: 'nuvemshop_store_id' }
    )
    .select();

  if (error) {
    console.error("Erro ao inserir loja no banco (verifique se rodou o schema.sql!):", error.message);
  } else {
    console.log("Sucesso! Loja configurada no banco:", data);
  }
}

setupStore();
