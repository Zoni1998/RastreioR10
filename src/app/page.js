import { PackageX, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import DashboardChart from '../components/DashboardChart';
import { supabase } from '../utils/supabase';
import { syncOrdersAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Buscar pedidos reais no Supabase
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('purchase_date', { ascending: false });

  const safeOrders = orders || [];

  // Contadores
  const pendingPayment = safeOrders.filter(o => o.payment_status === 'pending').length;
  const readyToShip = safeOrders.filter(o => o.payment_status === 'paid' && o.shipping_status === 'unfulfilled').length;
  const inTransit = safeOrders.filter(o => o.shipping_status === 'shipped').length;
  const delayedPosting = safeOrders.filter(o => o.shipping_status === 'delayed_posting').length;
  const delayedDelivery = safeOrders.filter(o => o.shipping_status === 'delayed_delivery').length;
  const delivered = safeOrders.filter(o => o.shipping_status === 'delivered').length;

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
        <h1 className="page-title">Visão Geral</h1>
        {/* Formulário com Server Action para sincronizar */}
        <form action={syncOrdersAction}>
          <button type="submit" className="btn">Sincronizar Nuvemshop Agora</button>
        </form>
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
            <span>Em Trânsito</span>
            <Clock size={18} color="var(--info)" />
          </div>
          <div className="card-value">{inTransit}</div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Atraso na Postagem</span>
            <PackageX size={18} color="var(--warning)" />
          </div>
          <div className="card-value" style={{ color: delayedPosting > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            {delayedPosting}
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Atraso na Entrega</span>
            <AlertTriangle size={18} color="var(--danger)" />
          </div>
          <div className="card-value" style={{ color: delayedDelivery > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {delayedDelivery}
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Entregues</span>
            <CheckCircle2 size={18} color="var(--success)" />
          </div>
          <div className="card-value">{delivered}</div>
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
