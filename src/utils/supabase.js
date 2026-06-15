import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Variáveis de ambiente do Supabase não configuradas corretamente.');
}

// O client usa a service_role_key no backend para contornar RLS se necessário,
// ou a anon_key no frontend.
export const supabase = createClient(supabaseUrl, supabaseKey);
