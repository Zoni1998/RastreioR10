import { createClient } from '../utils/supabase/server';
import DashboardChart from '../components/DashboardChart';
import { Package, Truck, AlertTriangle, RefreshCw, PlusCircle, PackageX, Clock, CheckCircle2 } from 'lucide-react';
import { syncOrdersAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Pegar a loja do usuário atual
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!store) {
    const clientId = process.env.NUVEMSHOP_CLIENT_ID || '';
    return (
      <div className="page-header">
        <h1 className="page-title">Bem-vindo ao TrackFlow!</h1>
        <p style={{color: 'var(--text-secondary)', marginBottom: '24px'}}>Você ainda não conectou nenhuma loja. Para começarmos a monitorar seus atrasos, conecte sua conta da Nuvemshop.</p>
        
        <a 
          href={`https://www.nuvemshop.com.br/apps/${clientId}/authorize`}
          className="btn" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          <PlusCircle size={20} />
          Conectar Minha Loja Nuvemshop
        </a>
      </div>
    );
  }

  // Buscar pedidos reais no Supabase
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .order('purchase_date', { ascending: false });

  const safeOrders = orders || [];

  // Contadores
  const pendingPayment = safeOrders.filter(o => o.payment_status === 'pending').length;
  const readyToShip = safeOrders.filter(o => o.payment_status === 'paid' && o.shipping_status === 'unfulfilled').length;
  const inTransit = safeOrders.filter(o => o.shipping_status === 'shipped').length;
  
  const delayedPosting = safeOrders.filter(o => o.shipping_status === 'delayed_posting');
  const delayedDelivery = safeOrders.filter(o => o.shipping_status === 'delayed_delivery');
  const delivered = safeOrders.filter(o => o.shipping_status === 'delivered').length;

  const totalDelayed = delayedPosting.length + delayedDelivery.length;
  const valueAtRisk = [...delayedPosting, ...delayedDelivery].reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  
  const totalOrdersCount = safeOrders.length;
  const healthScore = totalOrdersCount > 0 
    ? Math.round(((totalOrdersCount - totalDelayed) / totalOrdersCount) * 100) 
    : 100;

  // Gerar dados para o gráfico baseado nos últimos 6 dias reais
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Contagem simplificada para demonstração (pedidos que sofreram ação naquele dia)
    chartData.push({
      name: dateStr,
      entregues: safeOrders.filter(o => o.shipping_status === 'delivered' && new Date(o.purchase_date).getDate() === d.getDate()).length,
      atrasados: safeOrders.filter(o => o.shipping_status?.includes('delayed') && new Date(o.purchase_date).getDate() === d.getDate()).length,
    });
  }

  // Pegar os 5 mais recentes
  const recentOrders = safeOrders.slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Visão Geral</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0', fontSize: '1.1rem' }}>
            Protegendo a lucratividade do seu e-commerce em tempo real.
          </p>
        </div>
        {/* Formulário com Server Action para sincronizar */}
        <form action={syncOrdersAction}>
          <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={18} />
            Sincronizar Manual
          </button>
        </form>
      </div>

      {/* Cards Premium Principais (Financeiro e Health) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, var(--surface) 100%)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="card-header" style={{ color: 'var(--danger)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Receita em Risco (Atrasos)</span>
            <AlertTriangle size={20} />
          </div>
          <div className="card-value" style={{ color: 'var(--text-primary)', fontSize: '2.5rem' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valueAtRisk)}
          </div>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Baseado em {totalDelayed} pedidos com problema logístico.
          </p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--surface) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div className="card-header" style={{ color: 'var(--success)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Logistics Health Score</span>
            <CheckCircle2 size={20} />
          </div>
          <div className="card-value" style={{ color: 'var(--text-primary)', fontSize: '2.5rem', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            {healthScore} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ 100</span>
          </div>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {healthScore >= 90 ? 'Sua operação está excelente!' : healthScore >= 70 ? 'Atenção necessária em alguns envios.' : 'Risco crítico de avaliações negativas.'}
          </p>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid-cards">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pendentes (Pagamento)</span>
            <Clock size={18} color="var(--text-secondary)" />
          </div>
          <div className="card-value">{pendingPayment}</div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pronto para Envio</span>
            <PackageX size={18} color="var(--info)" />
          </div>
          <div className="card-value">{readyToShip}</div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Atraso na Postagem</span>
            <PackageX size={18} color="var(--warning)" />
          </div>
          <div className="card-value" style={{ color: delayedPosting.length > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            {delayedPosting.length}
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Atraso na Entrega</span>
            <AlertTriangle size={18} color="var(--danger)" />
          </div>
          <div className="card-value" style={{ color: delayedDelivery.length > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {delayedDelivery.length}
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '24px' }}>Desempenho Diário</h2>
        <div style={{ width: '100%', height: '300px' }}>
          <DashboardChart data={chartData} />
        </div>
      </div>

      {/* Tabela Resumo */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '24px' }}>Pedidos Recentes</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Data da Compra</th>
                <th>Status Logístico</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                    Nenhum pedido encontrado. Clique em Sincronizar.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  let badgeClass = 'info';
                  let statusText = 'Pendente / Trânsito';
                  
                  if (order.payment_status === 'pending') { badgeClass = 'warning'; statusText = 'Aguardando Pagamento'; }
                  else if (order.payment_status === 'paid' && order.shipping_status === 'unfulfilled') { badgeClass = 'info'; statusText = 'Pronto para Envio'; }
                  else if (order.shipping_status === 'shipped') { badgeClass = 'info'; statusText = 'Em Trânsito'; }
                  else if (order.shipping_status === 'delivered') { badgeClass = 'success'; statusText = 'Entregue'; }
                  else if (order.shipping_status === 'delayed_posting') { badgeClass = 'warning'; statusText = 'Atraso na Postagem'; }
                  else if (order.shipping_status === 'delayed_delivery') { badgeClass = 'danger'; statusText = 'Atraso na Entrega'; }

                  return (
                    <tr key={order.id}>
                      <td>#{order.order_number}</td>
                      <td>{order.customer_name}</td>
                      <td>{new Date(order.purchase_date).toLocaleDateString('pt-BR')}</td>
                      <td><span className={`badge ${badgeClass}`}>{statusText}</span></td>
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
