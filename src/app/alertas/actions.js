'use server';

import { supabase } from '../../utils/supabase';
import { revalidatePath } from 'next/cache';

export async function resolveAlertAction(formData) {
  const notificationId = formData.get('notificationId');

  if (!notificationId) {
    return { success: false, error: 'ID da notificação inválido' };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Erro ao resolver alerta:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/alertas');
  return { success: true };
}
