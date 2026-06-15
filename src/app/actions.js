'use server';

import { supabase } from '../utils/supabase';
import { checkOrderDelays } from '../services/trackingService';
import { revalidatePath } from 'next/cache';

export async function syncOrdersAction() {
  try {
    // Pegar a primeira loja (como o app é para uma loja só)
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .limit(1)
      .single();

    if (storeError || !store) throw new Error('Loja não encontrada no banco.');

    // Buscar pedidos na API da Nuvemshop
    const response = await fetch(`https://api.tiendanube.com/v1/${store.nuvemshop_store_id}/orders`, {
      headers: {
        'Authorization': `Bearer ${store.access_token}`,
        'User-Agent': 'TrackFlow App (admin@trackflow.com)'
      }
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Nuvemshop API Error:', err);
      throw new Error('Falha ao buscar pedidos na Nuvemshop');
    }

    const ordersData = await response.json();

    // Mapear e inserir/atualizar no Supabase
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
      };

      // Tenta não sobrescrever um status de atraso se a Nuvemshop não mudou
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('shipping_status')
        .eq('nuvemshop_order_id', orderData.nuvemshop_order_id)
        .single();

      if (existingOrder) {
        // Se já está atrasado no nosso banco, e a Nuvemshop diz "unfulfilled", mantemos nosso atraso
        if (existingOrder.shipping_status.includes('delayed') && localShippingStatus === 'unfulfilled') {
          delete orderData.shipping_status;
        }
      }

      await supabase
        .from('orders')
        .upsert(orderData, { onConflict: 'nuvemshop_order_id' });
    }

    // Rodar o motor de atrasos
    await checkOrderDelays(store.id);

    revalidatePath('/'); // Forçar atualização da página
    return { success: true };
  } catch (error) {
    console.error('Sync action error:', error);
    return { success: false, error: error.message };
  }
}
