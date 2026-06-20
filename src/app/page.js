import { createClient } from '../utils/supabase/server';
import DashboardChart from '../components/DashboardChart';
import { Package, Truck, AlertTriangle, RefreshCw, PlusCircle, PackageX, Clock, CheckCircle2, DollarSign, ShieldCheck } from 'lucide-react';
import { syncOrdersAction } from './actions';
import Link from 'next/link';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function Dashboard({ searchParams }) {
  const params = await searchParams;
  const viewAsStore = params?.view_as_store;

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

  // Pegar a loja (suporta Impersonation pelo Admin)
  let storeQuery = activeClient.from('stores').select('*');
  if (viewAsStore && user.email === process.env.ADMIN_EMAIL) {
    storeQuery = storeQuery.eq('id', viewAsStore);
  } else {
    storeQuery = storeQuery.eq('user_id', user.id);
  }

  const { data: store } = await storeQuery.single();

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

  // Buscar pedidos reais no banco (usando o client apropriado)
  const { data: orders } = await activeClient
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

  // Cálculos Financeiros Adicionais
  const storeCreatedAt = new Date(store.created_at);
  
  // Faturamento Monitorado (Pedidos feitos APÓS a instalação do TrackFlow)
  const revenueAfter = safeOrders
    .filter(o => new Date(o.purchase_date) >= storeCreatedAt)
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  // Receita Salva (Pedidos Entregues que antes estavam Atrasados)
  const revenueSaved = safeOrders
    .filter(o => o.shipping_status === 'delivered' && o.was_delayed_once === true)
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Visão Geral</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Bem-vindo de volta! Aqui está o resumo da sua operação hoje.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <form action={syncOrdersAction}>
            <button type="submit" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.875rem' }}>
              <RefreshCw size={16} /> Últimos 30 dias
            </button>
          </form>
          <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.875rem' }}>
            <Package size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* Banner de Consumo e Upgrade */}
      {(() => {
        const currentPlan = store.current_plan || 'start';
        const planLimits = { start: 100, pro: 1000, max: 'Ilimitado' };
        const currentLimit = planLimits[currentPlan];
        const ordersUsed = store.orders_this_month || 0;
        const percent = currentLimit === 'Ilimitado' ? (ordersUsed > 0 ? 100 : 0) : Math.min((ordersUsed / currentLimit) * 100, 100);
        const isNearLimit = currentLimit !== 'Ilimitado' && percent >= 80;

        return (
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
        );
      })()}

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Receita em Risco Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receita em Risco (Atrasos)</p>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '8px', marginBottom: 0 }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valueAtRisk)}
              </h2>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', borderRadius: '12px' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: valueAtRisk > 0 ? '#dc2626' : '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Truck size={14} /> {(valueAtRisk > 0) ? 'Atenção Necessária' : '0% de risco'}
            </span>
            <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
              {valueAtRisk > 0 ? `${totalDelayed} vendas comprometidas` : 'Nenhuma venda comprometida'}
            </span>
          </div>
        </div>

        {/* Prejuízo Evitado Card */}
        <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--surface) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prejuízo Evitado</p>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--success)', marginTop: '8px', marginBottom: 0 }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenueSaved)}
              </h2>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: '12px' }}>
              <ShieldCheck size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--success)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Receita Salva
            </span>
            <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
              Graças ao TrackFlow
            </span>
          </div>
        </div>

        {/* Faturamento Monitorado Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendas Monitoradas</p>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '8px', marginBottom: 0 }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(revenueAfter)}
              </h2>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '12px' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Faturamento passando pelo TrackFlow
            </span>
          </div>
        </div>

        {/* Logistics Health Score Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logistics Health Score</p>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '8px', marginBottom: 0 }}>
                {healthScore} <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ 100</span>
              </h2>
              <div style={{ marginTop: '16px' }}>
                <span style={{ padding: '4px 12px', backgroundColor: healthScore >= 90 ? 'rgba(20, 184, 166, 0.1)' : healthScore >= 70 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: healthScore >= 90 ? '#0d9488' : healthScore >= 70 ? '#d97706' : '#dc2626', fontSize: '0.75rem', fontWeight: '600', borderRadius: '9999px' }}>
                  {healthScore >= 90 ? 'Excelente' : healthScore >= 70 ? 'Atenção' : 'Crítico'}
                </span>
              </div>
            </div>
            {/* Donut Chart SVG */}
            <div style={{ position: 'relative', width: '96px', height: '96px' }}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--border)" strokeWidth="3"></circle>
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke={healthScore >= 90 ? '#14b8a6' : healthScore >= 70 ? '#f59e0b' : '#ef4444'} strokeWidth="3" strokeDasharray={`${healthScore}, 100`} strokeLinecap="round"></circle>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: healthScore >= 90 ? '#0d9488' : healthScore >= 70 ? '#d97706' : '#dc2626' }}>{healthScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Status Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Pendentes Pagamento */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', borderRadius: '12px' }}>
              <Clock size={24} />
            </div>
            <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{pendingPayment}</span>
          </div>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '1rem', margin: 0 }}>Pendentes (Pagamento)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px', marginBottom: 0 }}>Aguardando confirmação</p>
        </div>

        {/* Pronto para Envio */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', borderRadius: '12px' }}>
              <PackageX size={24} />
            </div>
            <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{readyToShip}</span>
          </div>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '1rem', margin: 0 }}>Pronto para Envio</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px', marginBottom: 0 }}>Imprima etiquetas e despache</p>
        </div>

        {/* Atraso na Postagem */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', borderRadius: '12px' }}>
              <AlertTriangle size={24} />
            </div>
            <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{delayedPosting.length}</span>
          </div>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '1rem', margin: 0 }}>Atraso na Postagem</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px', marginBottom: 0 }}>Pedidos fora do prazo</p>
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
