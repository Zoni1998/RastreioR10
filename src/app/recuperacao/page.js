import { createClient } from '../../utils/supabase/server';
import { ShoppingCart, MessageCircle, ArrowRight, Lock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function RecuperacaoPage({ searchParams }) {
  const params = await searchParams;
  const viewAsStore = params?.view_as_store;
  const viewParam = viewAsStore ? `?view_as_store=${viewAsStore}` : '';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Redirecionando...</div>;

  let activeClient = supabase;
  if (viewAsStore && user.email === process.env.ADMIN_EMAIL) {
    activeClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  let storeQuery = activeClient.from('stores').select('id, store_domain, current_plan, template_pending');
  if (viewAsStore && user.email === process.env.ADMIN_EMAIL) {
    storeQuery = storeQuery.eq('id', viewAsStore);
  } else {
    storeQuery = storeQuery.eq('user_id', user.id);
  }

  const { data: store } = await storeQuery.single();

  if (!store) return <div style={{padding: '32px'}}>Nenhuma loja conectada.</div>;

  const currentPlan = store.current_plan || 'start';
  const isMaxPlan = currentPlan === 'max';

  // Buscar pedidos abandonados/pendentes
  const { data: pendingOrders } = await activeClient
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .in('payment_status', ['pending', 'abandoned'])
    .order('purchase_date', { ascending: false });

  const safeOrders = pendingOrders || [];
  
  // Calcular valor recuperável
  const recoverableAmount = safeOrders.reduce((acc, order) => acc + Number(order.total_amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">
          <ShoppingCart size={28} color="var(--primary)" style={{ marginRight: '12px', verticalAlign: 'middle' }} />
          Recuperação de Vendas
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Recupere boletos não pagos e carrinhos abandonados diretamente pelo WhatsApp.
        </p>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--surface) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Valor Potencial a Recuperar</p>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#10b981' }}>
              R$ {recoverableAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Carrinhos / Boletos Pendentes</p>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)' }}>
              {safeOrders.length}
            </h2>
          </div>
        </div>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, position: 'relative' }}>
        
        {!isMaxPlan && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backdropFilter: 'blur(4px)', backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center'
          }}>
            <Lock size={48} color="var(--warning)" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: 'white', marginBottom: '8px' }}>Funcionalidade Exclusiva MAX</h2>
            <p style={{ color: '#cbd5e1', maxWidth: '500px', marginBottom: '24px', lineHeight: 1.5 }}>
              Você tem <b>R$ {recoverableAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b> parados em pedidos não pagos. 
              Assine o plano MAX e libere a ferramenta de recuperação automática via WhatsApp. <b>Recupere 1 pedido e a ferramenta já se paga!</b>
            </p>
            <Link href="/assinatura" className="btn" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', border: 'none', padding: '12px 24px', fontSize: '1.1rem' }}>
              Desbloquear Recuperação <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </Link>
          </div>
        )}

        <div className="table-container" style={{ flex: 1, overflowY: 'auto', padding: '24px', filter: !isMaxPlan ? 'blur(2px)' : 'none' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ paddingBottom: '16px' }}>Nº</th>
                <th style={{ paddingBottom: '16px' }}>Cliente</th>
                <th style={{ paddingBottom: '16px' }}>Data</th>
                <th style={{ paddingBottom: '16px' }}>Valor</th>
                <th style={{ paddingBottom: '16px' }}>Status</th>
                <th style={{ paddingBottom: '16px' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {safeOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Nenhum carrinho abandonado no momento.
                  </td>
                </tr>
              ) : (
                safeOrders.map((order) => {
                  const purchaseDate = new Date(order.purchase_date);
                  const template = store.template_pending || 'Olá [NomeCliente], tudo bem? Notei que você iniciou um pedido ([NumeroPedido]) mas o pagamento ainda está pendente. Ficou com alguma dúvida ou teve algum problema na hora de pagar?';
                  const rawMsg = template
                    .replace(/\[NomeCliente\]/g, order.customer_name)
                    .replace(/\[NumeroPedido\]/g, order.order_number)
                    .replace(/\[CodigoRastreio\]/g, order.tracking_code || 'ainda não gerado');
                  
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 0', fontWeight: 'bold' }}>#{order.order_number}</td>
                      <td style={{ padding: '16px 0' }}>{order.customer_name}</td>
                      <td style={{ padding: '16px 0' }}>{purchaseDate.toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '16px 0', fontWeight: '500', color: '#10b981' }}>
                        R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <span className={`badge ${order.payment_status === 'abandoned' ? 'danger' : 'warning'}`}>
                          {order.payment_status === 'abandoned' ? 'Abandonado' : 'Pendente'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <a 
                          href={isMaxPlan ? `https://wa.me/?text=${encodeURIComponent(rawMsg)}` : '#'}
                          target={isMaxPlan ? "_blank" : "_self"}
                          rel="noreferrer"
                          style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '500', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', width: 'fit-content' }}
                        >
                          <MessageCircle size={18} /> Recuperar Venda
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
