import { supabase } from '../utils/supabase';

/**
 * Função para verificar atrasos com base nas novas regras:
 * 1. Não postado (Enviado) em até 7 dias após a compra -> Atraso na Postagem
 * 2. Não entregue em até 25 dias após a compra -> Atraso no Recebimento
 */
export async function checkOrderDelays(storeId) {
  try {
    const now = new Date();

    // Buscar configurações da loja
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('posting_delay_days, delivery_delay_days')
      .eq('id', storeId)
      .single();

    if (storeError) throw storeError;
    const postingLimit = store.posting_delay_days || 7;
    const deliveryLimit = store.delivery_delay_days || 25;

    // Buscar pedidos da loja que não estão entregues
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)
      .neq('shipping_status', 'delivered');

    if (error) throw error;
    if (!orders || orders.length === 0) return { message: 'Nenhum pedido pendente.' };

    for (const order of orders) {
      const purchaseDate = new Date(order.purchase_date);
      const daysSincePurchase = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);

      let newStatus = order.shipping_status;
      let notificationType = null;
      let notificationMessage = '';

      // Regra 1: Atraso na Postagem
      if (order.shipping_status === 'unfulfilled' && daysSincePurchase > postingLimit) {
        newStatus = 'delayed_posting';
        notificationType = 'delayed_posting';
        notificationMessage = `O pedido ${order.order_number} está atrasado para postagem (mais de ${postingLimit} dias desde a compra).`;
      }
      
      // Regra 2: Atraso no Recebimento
      // Se o pedido já foi postado (enviado), mas já passaram X dias e não foi entregue
      else if ((order.shipping_status === 'shipped' || order.shipping_status === 'delayed_posting') && daysSincePurchase > deliveryLimit) {
        newStatus = 'delayed_delivery';
        notificationType = 'delayed_delivery';
        notificationMessage = `O pedido ${order.order_number} está com atraso no recebimento (mais de ${deliveryLimit} dias em trânsito).`;
      }

      // Se o status mudou para um estado de atraso, atualizar o banco e notificar
      if (newStatus !== order.shipping_status) {
        // Atualizar status do pedido e marcar que sofreu atraso
        await supabase
          .from('orders')
          .update({ shipping_status: newStatus, was_delayed_once: true })
          .eq('id', order.id);

        // Criar notificação para o gestor da loja
        // Verifica se já não existe uma notificação igual não lida
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('order_id', order.id)
          .eq('type', notificationType)
          .single();

        if (!existingNotif) {
          await supabase
            .from('notifications')
            .insert({
              store_id: storeId,
              order_id: order.id,
              type: notificationType,
              message: notificationMessage
            });
        }
      }
    }

    return { success: true, message: 'Verificação de atrasos concluída com sucesso.' };
  } catch (error) {
    console.error('Erro ao checar atrasos:', error);
    return { success: false, error: error.message };
  }
}
