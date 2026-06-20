import { createClient } from '../../utils/supabase/server';
import { Package, ExternalLink, Filter, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function PedidosPage({ searchParams }) {
  const params = await searchParams;
  const filter = params?.filter || 'todos';
  const viewAsStore = params?.view_as_store;
  const viewParam = viewAsStore ? `&view_as_store=${viewAsStore}` : '';
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Redirecionando...</div>;

  // Configurar cliente Supabase apropriado (Admin bypassa RLS)
  let activeClient = supabase;
  if (viewAsStore && user.email === process.env.ADMIN_EMAIL) {
    activeClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  let storeQuery = activeClient.from('stores').select('id, nuvemshop_store_id, store_domain, whatsapp_message, current_plan, orders_this_month, template_delayed, template_shipped, template_pending');
  if (viewAsStore && user.email === process.env.ADMIN_EMAIL) {
    storeQuery = storeQuery.eq('id', viewAsStore);
  } else {
    storeQuery = storeQuery.eq('user_id', user.id);
  }

  const { data: store } = await storeQuery.single();

  if (!store) return <div style={{padding: '32px'}}>Nenhuma loja conectada.</div>;

  const currentPlan = store.current_plan || 'start';
  const planLimits = { start: 100, pro: 1000, max: 'Ilimitado' };
  const currentLimit = planLimits[currentPlan];
  const ordersUsed = store.orders_this_month || 0;
  const percent = currentLimit === 'Ilimitado' ? (ordersUsed > 0 ? 100 : 0) : Math.min((ordersUsed / currentLimit) * 100, 100);
  const isNearLimit = currentLimit !== 'Ilimitado' && percent >= 80;

  // Buscar pedidos
  let query = activeClient.from('orders').select('*').eq('store_id', store.id).order('purchase_date', { ascending: false });
  
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

      {/* Banner de Consumo e Upgrade */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', borderLeft: isNearLimit ? '4px solid var(--warning)' : '4px solid var(--primary)' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
              Cota Mensal de Pedidos ({currentPlan.toUpperCase()})
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {ordersUsed} / {currentLimit}
            </span>
          </div>
          {currentLimit !== 'Ilimitado' ? (
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${percent}%`, 
                backgroundColor: isNearLimit ? 'var(--warning)' : 'var(--primary)',
                transition: 'width 0.5s ease-out'
              }} />
            </div>
          ) : (
             <div style={{ width: '100%', height: '8px', background: 'linear-gradient(90deg, #10b981, #3b82f6)', borderRadius: '4px' }} />
          )}
          {isNearLimit && currentLimit !== 'Ilimitado' && (
             <p style={{ margin: '8px 0 0 0', color: 'var(--warning)', fontSize: '0.85rem' }}>Você está próximo de atingir o limite do plano.</p>
          )}
        </div>
        
        {currentPlan !== 'max' && (
          <Link href="/assinatura" className="btn" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', boxShadow: 'var(--shadow-primary)', border: 'none' }}>
            ⭐ Fazer Upgrade de Plano
          </Link>
        )}
      </div>

      <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={20} color="var(--text-secondary)" style={{ marginRight: '8px' }} />
        <Link href={`/pedidos?filter=todos${viewParam}`} className={`btn ${filter === 'todos' ? '' : 'btn-outline'}`}>Todos</Link>
        <Link href={`/pedidos?filter=pendentes${viewParam}`} className={`btn ${filter === 'pendentes' ? '' : 'btn-outline'}`}>Pendentes</Link>
        <Link href={`/pedidos?filter=pronto${viewParam}`} className={`btn ${filter === 'pronto' ? '' : 'btn-outline'}`}>Pronto p/ Envio</Link>
        <Link href={`/pedidos?filter=transito${viewParam}`} className={`btn ${filter === 'transito' ? '' : 'btn-outline'}`}>Em Trânsito</Link>
        <Link href={`/pedidos?filter=atrasados${viewParam}`} className={`btn ${filter === 'atrasados' ? '' : 'btn-outline'}`}>Atrasados</Link>
        <Link href={`/pedidos?filter=entregues${viewParam}`} className={`btn ${filter === 'entregues' ? '' : 'btn-outline'}`}>Entregues</Link>
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
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 0', fontWeight: 'bold' }}>#{order.order_number}</td>
                      <td style={{ padding: '16px 0' }}>{order.customer_name}</td>
                      <td style={{ padding: '16px 0' }}>{purchaseDate.toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '16px 0', color: daysSince > 7 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                        {daysSince} dias
                      </td>
                      <td style={{ padding: '16px 0' }}><span className={`badge ${payBadge}`}>{payText}</span></td>
                      <td style={{ padding: '16px 0' }}><span className={`badge ${shippingBadge}`}>{shippingText}</span></td>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            {(() => {
                              let template = '';
                              if (order.payment_status === 'pending') {
                                template = store.template_pending || 'Olá [NomeCliente], tudo bem? Notei que você iniciou um pedido ([NumeroPedido]) mas o pagamento ainda está pendente. Ficou com alguma dúvida ou teve algum problema na hora de pagar?';
                              } else if (order.shipping_status === 'delayed_posting' || order.shipping_status === 'delayed_delivery') {
                                template = store.template_delayed || 'Olá [NomeCliente], vi que o seu pedido [NumeroPedido] está demorando um pouco mais do que o esperado na transportadora. Já estou acompanhando de perto para você, ok?';
                              } else if (order.shipping_status === 'shipped') {
                                template = store.template_shipped || 'Olá [NomeCliente], boa notícia! Seu pedido [NumeroPedido] já foi enviado e está a caminho. Você pode acompanhar por este código: [CodigoRastreio].';
                              } else {
                                // Default fallback for other states (e.g. Delivered)
                                template = 'Olá [NomeCliente], aqui é da loja sobre o seu pedido [NumeroPedido].';
                              }

                              const rawMsg = template
                                .replace(/\[NomeCliente\]/g, order.customer_name)
                                .replace(/\[NumeroPedido\]/g, order.order_number)
                                .replace(/\[CodigoRastreio\]/g, order.tracking_code || 'ainda não gerado');
                              
                              return (
                                <a 
                                  href={`https://wa.me/?text=${encodeURIComponent(rawMsg)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '500', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}
                                  title="Enviar mensagem no WhatsApp"
                                >
                                  <MessageCircle size={16} /> Zap
                                </a>
                              );
                            })()}
                            
                            {store.store_domain ? (
                              <a 
                                href={`https://${store.store_domain}.lojavirtualnuvem.com.br/admin/orders/${order.nuvemshop_order_id}`} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '500' }}
                              >
                                Ver Loja <ExternalLink size={14} />
                              </a>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }} title="Configure o domínio da loja na aba Configurações">
                                Link indisponível
                              </span>
                            )}
                          </div>
                          
                          {/* Código de Rastreio */}
                          {order.tracking_code ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', backgroundColor: 'var(--surface-hover)', padding: '2px 8px', borderRadius: '4px' }}>
                                {order.tracking_code}
                              </span>
                              <a 
                                href={`https://parcelsapp.com/pt/tracking/${order.tracking_code}`} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '0.85rem' }}
                                title="Rastrear Rota (Global)"
                              >
                                Rastrear <ExternalLink size={12} />
                              </a>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sem rastreio</span>
                          )}
                        </div>
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
