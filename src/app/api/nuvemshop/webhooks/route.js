import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Endpoint para a Nuvemshop disparar Webhooks de pedidos (criado/atualizado)
export async function POST(request) {
  try {
    // A Nuvemshop envia o store_id no header `x-tiendanube-store-id`
    const storeIdStr = request.headers.get('x-tiendanube-store-id');
    const event = request.headers.get('x-tiendanube-event'); // order/created, order/updated
    
    if (!storeIdStr) {
      return NextResponse.json({ error: 'Store ID missing' }, { status: 400 });
    }

    const payload = await request.json();
    
    // Buscar o UUID da loja no nosso banco correspondente ao nuvemshop_store_id
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('nuvemshop_store_id', storeIdStr)
      .single();

    if (!store) {
      console.warn(`Loja ${storeIdStr} não encontrada no banco.`);
      return NextResponse.json({ error: 'Store not registered' }, { status: 404 });
    }

    const { id: orderId, number: orderNumber, status, shipping_status, created_at, customer } = payload;
    
    // Mapear os status da Nuvemshop para o nosso
    // Exemplo: 'unfulfilled', 'shipped' (enviado)
    let localShippingStatus = 'unfulfilled';
    if (shipping_status === 'shipped') {
      localShippingStatus = 'shipped';
    } else if (shipping_status === 'delivered') {
      localShippingStatus = 'delivered';
    }

    const orderData = {
      store_id: store.id,
      nuvemshop_order_id: orderId.toString(),
      order_number: orderNumber.toString(),
      customer_name: customer?.name || 'Cliente',
      total_amount: payload.total,
      purchase_date: new Date(created_at).toISOString(),
      shipping_status: localShippingStatus,
      payment_status: payload.payment_status || 'pending',
    };

    if (event === 'order/created' || event === 'order/updated') {
      // Upsert (Insere ou Atualiza) o pedido no banco
      const { error } = await supabase
        .from('orders')
        .upsert(orderData, { onConflict: 'nuvemshop_order_id' });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
