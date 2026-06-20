'use server';

import { createClient } from '../../utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateStoreConfig(formData) {
  const storeId = formData.get('storeId');
  const postingDays = parseInt(formData.get('postingDays'), 10);
  const deliveryDays = parseInt(formData.get('deliveryDays'), 10);
  const storeDomain = formData.get('store_domain') || null;
  const whatsappMessage = formData.get('whatsapp_message') || '';
  const emailAlerts = formData.get('email_alerts') === 'on';
  const templatePending = formData.get('template_pending');
  const templateShipped = formData.get('template_shipped');
  const templateDelayed = formData.get('template_delayed');

  if (isNaN(postingDays) || isNaN(deliveryDays)) {
    return { success: false, error: 'Dados inválidos' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado' };

    const updateData = { 
      posting_delay_days: postingDays,
      delivery_delay_days: deliveryDays,
      store_domain: storeDomain,
      email_alerts: emailAlerts
    };

    if (templatePending !== null) updateData.template_pending = templatePending;
    if (templateShipped !== null) updateData.template_shipped = templateShipped;
    if (templateDelayed !== null) updateData.template_delayed = templateDelayed;

  const { error } = await supabase
    .from('stores')
    .update(updateData)
    .eq('id', storeId)
    .eq('user_id', user.id); // Segurança extra

  if (error) {
    console.error('Erro ao salvar configuração:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/configuracoes');
  return { success: true };
}
