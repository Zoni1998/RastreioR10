'use server';

import { createClient } from '../../utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

// Cliente Admin (bypassa RLS)
const getAdminClient = () => {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

export async function updateStorePlan(formData) {
  const storeId = formData.get('storeId');
  const newPlan = formData.get('plan');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Não autorizado');
  }

  const supabaseAdmin = getAdminClient();

  const { error } = await supabaseAdmin
    .from('stores')
    .update({ 
      current_plan: newPlan,
      plan_status: 'active'
    })
    .eq('id', storeId);

  if (error) {
    console.error('Erro ao atualizar plano:', error);
    throw new Error('Falha ao atualizar plano');
  }

  revalidatePath('/admin');
  return { success: true };
}
