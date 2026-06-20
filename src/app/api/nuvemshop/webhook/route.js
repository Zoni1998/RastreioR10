import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkOrderDelays } from '../../../../services/trackingService';

// Como este endpoint é chamado pela Nuvemshop e não tem sessão de usuário, 
// precisamos usar a SERVICE_ROLE_KEY para ter permissão de acessar/escrever no banco.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // 1. Receber o corpo do webhook (Nuvemshop envia JSON)
    const payload = await request.json();
    
    // O payload padrão de webhook da Nuvemshop tem esse formato:
    // { store_id: 123, event: "order/updated", id: 987654 }
    const nuvemshopStoreId = payload.store_id?.toString();
    const nuvemshopOrderId = payload.id?.toString();
    const eventType = payload.event;

    if (!nuvemshopStoreId || !nuvemshopOrderId) {
      return NextResponse.json({ error: 'Payload incompleto' }, { status: 400 });
    }

    // 2. Buscar a loja no nosso banco para pegar o Access Token
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('nuvemshop_store_id', nuvemshopStoreId)
      .single();

    if (storeError || !store) {
      console.error(`Webhook recebido para loja ${nuvemshopStoreId}, mas ela não foi encontrada no TrackFlow.`);
      // Retornamos 200 para a Nuvemshop não ficar tentando reenviar o webhook
      return NextResponse.json({ message: 'Loja não encontrada' }, { status: 200 });
    }

    // 2.5 Verificar Limites (Feature Gating)
    const currentPlan = store.current_plan || 'start';
    const planLimits = { start: 100, pro: 1000, max: 'Ilimitado' };
    const limit = planLimits[currentPlan];
    const ordersUsed = store.orders_this_month || 0;

    if (limit !== 'Ilimitado' && ordersUsed >= limit) {
      console.log(`[Cota Excedida] Loja ${nuvemshopStoreId} ignorada no Webhook. Limite do plano ${currentPlan} atingido.`);
      return NextResponse.json({ message: 'Cota do plano excedida. Faça upgrade para receber atualizações.' }, { status: 200 });
    }

    // 3. Buscar os dados completos do pedido na API da Nuvemshop
    const response = await fetch(`https://api.tiendanube.com/v1/${nuvemshopStoreId}/orders/${nuvemshopOrderId}`, {
      headers: {
        'Authorization': `Bearer ${store.access_token}`,
        'User-Agent': 'TrackFlow App (suporte@trackflow.com)'
      }
    });

    if (!response.ok) {
      console.error(`Falha ao buscar pedido ${nuvemshopOrderId} na Nuvemshop`);
      // Se não conseguimos ler na Nuvemshop (ex: erro temporário), retornamos 500 para eles tentarem de novo
      return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 });
    }

    const apiOrder = await response.json();

    // 4. Mapear os dados para o nosso formato e fazer o UPSERT
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

    // Tenta não sobrescrever um status de atraso se a Nuvemshop não mudou
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('shipping_status')
      .eq('nuvemshop_order_id', orderData.nuvemshop_order_id)
      .single();

    if (existingOrder) {
      if (existingOrder.shipping_status.includes('delayed') && localShippingStatus === 'unfulfilled') {
        delete orderData.shipping_status; // Mantém o atraso
      }
    }

    const { error: upsertError } = await supabase
      .from('orders')
      .upsert(orderData, { onConflict: 'nuvemshop_order_id' });

    if (upsertError) {
      console.error('Erro ao salvar pedido no Webhook:', upsertError);
      return NextResponse.json({ error: 'Falha ao salvar no banco' }, { status: 500 });
    }

    // 5. Rodar o motor de verificação de atrasos para a loja toda
    // Isso garante que se o novo pedido já entrou atrasado, ele ganhe a tag certa!
    await checkOrderDelays(store.id);

    console.log(`[Webhook] Pedido ${nuvemshopOrderId} (Evento: ${eventType}) processado com sucesso para a loja ${nuvemshopStoreId}.`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro fatal no Webhook:', error);
    return NextResponse.json({ error: 'Erro interno no Webhook' }, { status: 500 });
  }
}
