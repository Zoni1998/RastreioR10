'use server';

import { createClient } from '../../utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { checkOrderDelays } from '../../services/trackingService';

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

export async function forceSyncStoreAction(formData) {
  const storeId = formData.get('storeId');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Não autorizado');
  }

  const supabaseAdmin = getAdminClient();

  // 1. Pegar a loja do banco (usando Admin Role)
  const { data: store, error: storeError } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();

  if (storeError || !store || !store.access_token) {
    throw new Error('Loja não encontrada ou sem token de acesso.');
  }

  // 2. Buscar pedidos na Nuvemshop
  let ordersData = [];
  let page = 1;

  while (true) {
    const response = await fetch(`https://api.tiendanube.com/v1/${store.nuvemshop_store_id}/orders?per_page=200&page=${page}`, {
      headers: {
        'Authorization': `Bearer ${store.access_token}`,
        'User-Agent': 'TrackFlow Admin Force Sync (admin@trackflow.com)'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar pedidos na Nuvemshop');
    }

    const pageData = await response.json();
    ordersData = ordersData.concat(pageData);

    if (pageData.length < 200) break;
    page++;
    if (page > 5) break; // limite de segurança
  }

  // 3. Upsert no Supabase
  for (const apiOrder of ordersData) {
    let localShippingStatus = 'unfulfilled';
    if (apiOrder.shipping_status === 'shipped') localShippingStatus = 'shipped';
    if (apiOrder.shipping_status === 'delivered') localShippingStatus = 'delivered';

    const orderData = {
      store_id: store.id,
      nuvemshop_order_id: apiOrder.id.toString(),
      order_number: apiOrder.number.toString(),
      customer_name: apiOrder.customer?.name || 'Cliente Oculto',
      total_amount: apiOrder.total,
      purchase_date: new Date(apiOrder.created_at).toISOString(),
      shipping_status: localShippingStatus, 
      payment_status: apiOrder.payment_status || 'pending',
      tracking_code: apiOrder.shipping_tracking_number || null,
      shipped_at: apiOrder.shipped_at ? new Date(apiOrder.shipped_at).toISOString() : null,
      shipping_company: apiOrder.shipping_option || 'Desconhecido',
    };

    // Tenta não sobrescrever atraso (usando Admin Role)
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('shipping_status')
      .eq('nuvemshop_order_id', orderData.nuvemshop_order_id)
      .single();

    if (existingOrder && existingOrder.shipping_status.includes('delayed') && localShippingStatus === 'unfulfilled') {
      delete orderData.shipping_status;
    }

    await supabaseAdmin
      .from('orders')
      .upsert(orderData, { onConflict: 'nuvemshop_order_id' });
  }

  // 4. Rodar o motor de atrasos
  await checkOrderDelays(store.id);

  revalidatePath('/admin');
  return { success: true };
}
