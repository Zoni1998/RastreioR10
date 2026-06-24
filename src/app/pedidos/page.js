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
  if (!user) return <div className="p-8 text-text-secondary">Redirecionando...</div>;

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

  if (!store) return <div className="p-8 text-text-secondary">Nenhuma loja conectada.</div>;

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
    <div className="flex flex-col h-full pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-text-primary tracking-tight flex items-center gap-3">
          <Package size={28} className="text-text-secondary" strokeWidth={2} />
          Gestão de Pedidos
        </h1>
      </div>

      {/* Banner de Consumo e Upgrade */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 mb-8 rounded-xl border ${isNearLimit ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-surface/50'} backdrop-blur-sm relative overflow-hidden`}>
        {isNearLimit && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />}
        
        <div className="flex-1 w-full max-w-xl">
          <div className="flex justify-between mb-2">
            <span className="font-medium text-text-primary text-sm">
              Cota Mensal de Pedidos ({currentPlan.toUpperCase()})
            </span>
            <span className="text-text-secondary text-sm font-medium">
              {ordersUsed} / {currentLimit}
            </span>
          </div>
          {currentLimit !== 'Ilimitado' ? (
            <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border">
              <div className={`h-full ${isNearLimit ? 'bg-amber-500' : 'bg-zinc-100'} transition-all duration-500 ease-out`} style={{ width: `${percent}%` }} />
            </div>
          ) : (
            <div className="w-full h-2 rounded-full overflow-hidden border border-border bg-[linear-gradient(90deg,#3b82f6,#8b5cf6)]" />
          )}
          {isNearLimit && currentLimit !== 'Ilimitado' && (
            <p className="mt-2 text-amber-500 text-xs font-medium uppercase tracking-wide">⚠️ Você está próximo do limite do plano</p>
          )}
        </div>
        
        {currentPlan !== 'max' && (
          <Link href="/assinatura" className="whitespace-nowrap flex items-center gap-2 px-5 py-2.5 bg-[linear-gradient(135deg,#3b82f6,#8b5cf6)] hover:opacity-90 text-white rounded-md text-sm font-medium shadow-lg transition-all active:scale-95">
            Fazer Upgrade
          </Link>
        )}
      </div>

      <div className="p-4 mb-6 rounded-xl border border-border bg-surface/50 flex gap-2 flex-wrap items-center">
        <Filter size={18} className="text-text-secondary mx-2" />
        <Link href={`/pedidos?filter=todos${viewParam}`} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'todos' ? 'bg-zinc-100 text-zinc-950' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'}`}>Todos</Link>
        <Link href={`/pedidos?filter=pendentes${viewParam}`} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'pendentes' ? 'bg-zinc-100 text-zinc-950' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'}`}>Pendentes</Link>
        <Link href={`/pedidos?filter=pronto${viewParam}`} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'pronto' ? 'bg-zinc-100 text-zinc-950' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'}`}>Pronto p/ Envio</Link>
        <Link href={`/pedidos?filter=transito${viewParam}`} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'transito' ? 'bg-zinc-100 text-zinc-950' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'}`}>Em Trânsito</Link>
        <Link href={`/pedidos?filter=atrasados${viewParam}`} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'atrasados' ? 'bg-zinc-100 text-zinc-950' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'}`}>Atrasados</Link>
        <Link href={`/pedidos?filter=entregues${viewParam}`} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'entregues' ? 'bg-zinc-100 text-zinc-950' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'}`}>Entregues</Link>
      </div>

      <div className="flex-1 rounded-xl border border-border bg-surface/50 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-text-secondary uppercase tracking-widest bg-surface/80">
                <th className="p-4 font-medium pl-6">Nº</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium">Tempo</th>
                <th className="p-4 font-medium">Pagamento</th>
                <th className="p-4 font-medium">Logística</th>
                <th className="p-4 font-medium pr-6">Ação</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {safeOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-text-secondary">
                    Nenhum pedido encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                safeOrders.map((order) => {
                  const purchaseDate = new Date(order.purchase_date);
                  const daysSince = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
                  
                  let shippingBadge = 'bg-surface-hover text-text-secondary border border-border';
                  let shippingText = 'Pendente';
                  if (order.shipping_status === 'shipped') { shippingBadge = 'bg-surface-hover text-text-secondary border border-border'; shippingText = 'Em Trânsito'; }
                  else if (order.shipping_status === 'delivered') { shippingBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'; shippingText = 'Entregue'; }
                  else if (order.shipping_status === 'delayed_posting') { shippingBadge = 'bg-amber-500/10 text-amber-500 border border-amber-500/20'; shippingText = 'Atraso na Postagem'; }
                  else if (order.shipping_status === 'delayed_delivery') { shippingBadge = 'bg-red-500/10 text-red-400 border border-red-500/20'; shippingText = 'Atraso na Entrega'; }

                  let payBadge = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                  let payText = 'Pendente';
                  if (order.payment_status === 'paid') { payBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'; payText = 'Pago'; }
                  else if (order.payment_status === 'abandoned') { payBadge = 'bg-red-500/10 text-red-400 border border-red-500/20'; payText = 'Abandonado'; }

                  return (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-surface-hover/20 transition-colors group">
                      <td className="p-4 pl-6 font-medium text-text-secondary group-hover:text-text-primary">#{order.order_number}</td>
                      <td className="p-4 text-text-secondary">{order.customer_name}</td>
                      <td className="p-4 text-text-secondary">{purchaseDate.toLocaleDateString('pt-BR')}</td>
                      <td className={`p-4 font-medium ${daysSince > 7 ? 'text-amber-500' : 'text-text-secondary'}`}>
                        {daysSince} dias
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[11px] font-medium rounded-sm whitespace-nowrap ${payBadge}`}>
                          {payText}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[11px] font-medium rounded-sm whitespace-nowrap ${shippingBadge}`}>
                          {shippingText}
                        </span>
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-4 items-center">
                            {(() => {
                              let template = '';
                              if (order.payment_status === 'pending') {
                                template = store.template_pending || 'Olá [NomeCliente], tudo bem? Notei que você iniciou um pedido ([NumeroPedido]) mas o pagamento ainda está pendente. Ficou com alguma dúvida ou teve algum problema na hora de pagar?';
                              } else if (order.shipping_status === 'delayed_posting' || order.shipping_status === 'delayed_delivery') {
                                template = store.template_delayed || 'Olá [NomeCliente], vi que o seu pedido [NumeroPedido] está demorando um pouco mais do que o esperado na transportadora. Já estou acompanhando de perto para você, ok?';
                              } else if (order.shipping_status === 'shipped') {
                                template = store.template_shipped || 'Olá [NomeCliente], boa notícia! Seu pedido [NumeroPedido] já foi enviado e está a caminho. Você pode acompanhar por este código: [CodigoRastreio].';
                              } else {
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
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium text-xs rounded-md transition-colors"
                                  title="Enviar mensagem no WhatsApp"
                                >
                                  <MessageCircle size={14} /> Zap
                                </a>
                              );
                            })()}
                            
                            {store.store_domain ? (
                              <a 
                                href={`https://${store.store_domain}.lojavirtualnuvem.com.br/admin/orders/${order.nuvemshop_order_id}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary font-medium text-xs transition-colors"
                              >
                                Ver Loja <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span className="text-zinc-600 flex items-center gap-1 text-xs" title="Configure o domínio da loja">
                                Link Indisponível
                              </span>
                            )}
                          </div>
                          
                          {/* Código de Rastreio */}
                          {order.tracking_code ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono text-text-secondary bg-surface-hover/50 px-2 py-0.5 rounded">
                                {order.tracking_code}
                              </span>
                              <a 
                                href={`https://parcelsapp.com/pt/tracking/${order.tracking_code}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium text-xs transition-colors"
                              >
                                Rastrear <ExternalLink size={10} />
                              </a>
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-600 mt-1">Sem rastreio</span>
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
