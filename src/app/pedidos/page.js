import { supabase } from '../../utils/supabase';
import { Package, ExternalLink, Filter } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PedidosPage({ searchParams }) {
  const params = await searchParams;
  const filter = params?.filter || 'todos';
  
  // Buscar pedidos
  let query = supabase.from('orders').select('*').order('purchase_date', { ascending: false });
  
  if (filter === 'pendentes') {
    query = query.eq('payment_status', 'pending');
  } else if (filter === 'pronto') {
    query = query.eq('payment_status', 'paid').eq('shipping_status', 'unfulfilled');
  } else if (filter === 'transito') {
    query = query.eq('shipping_status', 'shipped');
  } else if (filter === 'atrasados') {
    query = query.in('shipping_status', ['delayed_posting', 'delayed_delivery']);
  } else if (filter === 'entregues') {
    query = query.eq('shipping_status', 'delivered');
  }

  const { data: orders } = await query;
  const safeOrders = orders || [];
  const now = new Date();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title">
          <Package size={28} color="var(--primary)" style={{ marginRight: '12px', verticalAlign: 'middle' }} />
          Gestão de Pedidos
        </h1>
      </div>

      <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={20} color="var(--text-secondary)" style={{ marginRight: '8px' }} />
        <Link href="/pedidos?filter=todos" className={`btn ${filter === 'todos' ? '' : 'btn-outline'}`}>Todos</Link>
        <Link href="/pedidos?filter=pendentes" className={`btn ${filter === 'pendentes' ? '' : 'btn-outline'}`}>Pendentes</Link>
        <Link href="/pedidos?filter=pronto" className={`btn ${filter === 'pronto' ? '' : 'btn-outline'}`}>Pronto p/ Envio</Link>
        <Link href="/pedidos?filter=transito" className={`btn ${filter === 'transito' ? '' : 'btn-outline'}`}>Em Trânsito</Link>
        <Link href="/pedidos?filter=atrasados" className={`btn ${filter === 'atrasados' ? '' : 'btn-outline'}`}>Atrasados</Link>
        <Link href="/pedidos?filter=entregues" className={`btn ${filter === 'entregues' ? '' : 'btn-outline'}`}>Entregues</Link>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div className="table-container" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ paddingBottom: '16px' }}>Nº</th>
                <th style={{ paddingBottom: '16px' }}>Cliente</th>
                <th style={{ paddingBottom: '16px' }}>Data</th>
                <th style={{ paddingBottom: '16px' }}>Tempo</th>
                <th style={{ paddingBottom: '16px' }}>Pagamento</th>
                <th style={{ paddingBottom: '16px' }}>Logística</th>
                <th style={{ paddingBottom: '16px' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {safeOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Nenhum pedido encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                safeOrders.map((order) => {
                  const purchaseDate = new Date(order.purchase_date);
                  const daysSince = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
                  
                  let shippingBadge = 'info';
                  let shippingText = 'Pendente';
                  if (order.shipping_status === 'shipped') { shippingBadge = 'info'; shippingText = 'Em Trânsito'; }
                  else if (order.shipping_status === 'delivered') { shippingBadge = 'success'; shippingText = 'Entregue'; }
                  else if (order.shipping_status === 'delayed_posting') { shippingBadge = 'warning'; shippingText = 'Atraso na Postagem'; }
                  else if (order.shipping_status === 'delayed_delivery') { shippingBadge = 'danger'; shippingText = 'Atraso na Entrega'; }

                  let payBadge = 'warning';
                  let payText = 'Pendente';
                  if (order.payment_status === 'paid') { payBadge = 'success'; payText = 'Pago'; }
                  else if (order.payment_status === 'abandoned') { payBadge = 'danger'; payText = 'Abandonado'; }

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 0', fontWeight: 'bold' }}>#{order.order_number}</td>
                      <td style={{ padding: '16px 0' }}>{order.customer_name}</td>
                      <td style={{ padding: '16px 0' }}>{purchaseDate.toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '16px 0', color: daysSince > 7 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                        {daysSince} dias
                      </td>
                      <td style={{ padding: '16px 0' }}><span className={`badge ${payBadge}`}>{payText}</span></td>
                      <td style={{ padding: '16px 0' }}><span className={`badge ${shippingBadge}`}>{shippingText}</span></td>
                      <td style={{ padding: '16px 0' }}>
                        <a 
                          href={`https://vzsports2.lojavirtualnuvem.com.br/admin/orders/${order.nuvemshop_order_id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '500' }}
                        >
                          Ver <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
