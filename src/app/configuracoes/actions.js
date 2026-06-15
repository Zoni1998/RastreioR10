'use server';

import { supabase } from '../../utils/supabase';
import { revalidatePath } from 'next/cache';

export async function updateStoreConfig(formData) {
  const storeId = formData.get('storeId');
  const postingDays = parseInt(formData.get('postingDays'), 10);
  const deliveryDays = parseInt(formData.get('deliveryDays'), 10);

  if (!storeId || isNaN(postingDays) || isNaN(deliveryDays)) {
    return { success: false, error: 'Dados inválidos' };
  }

  const { error } = await supabase
    .from('stores')
    .update({ 
      posting_delay_days: postingDays, 
      delivery_delay_days: deliveryDays 
    })
    .eq('id', storeId);

  if (error) {
    console.error('Erro ao salvar configuração:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/configuracoes');
  return { success: true };
}
