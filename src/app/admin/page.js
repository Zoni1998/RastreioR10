import { createClient } from '../../utils/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { Settings, Users, DollarSign, Store, Package } from 'lucide-react';
import { updateStorePlan } from './actions';

export const dynamic = 'force-dynamic';

const PLAN_PRICES = {
  start: 0,
  pro: 79.90,
  max: 119.90
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/pedidos');
  }

  // Usar Service Role para buscar todos os dados
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Buscar todos os usuários
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  
  // Buscar todas as lojas
  const { data: stores, error: storesError } = await supabaseAdmin
    .from('stores')
    .select('id, user_id, store_domain, current_plan, created_at, orders_this_month, access_token')
    .order('created_at', { ascending: false });

  // Buscar todos os pedidos (para Admin MVP)
  const { data: allOrders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('store_id, total_amount, purchase_date, shipping_status');

  if (usersError || storesError || ordersError) {
    return <div>Erro ao carregar dados administrativos.</div>;
  }

  // Mesclar dados e calcular finanças
  let globalTotalOrders = 0;
  let globalTotalRevenue = 0;
  let globalDelayedOrders = 0;

  const storesWithStats = stores.map(store => {
    const storeUser = users.find(u => u.id === store.user_id);
    const storeOrders = allOrders.filter(o => o.store_id === store.id);
    
    let totalRevenue = 0;
    let revenueBefore = 0;
    let revenueAfter = 0;
    const storeCreatedAt = new Date(store.created_at);

    storeOrders.forEach(order => {
      const amount = parseFloat(order.total_amount || 0);
      totalRevenue += amount;
      
      if (new Date(order.purchase_date) < storeCreatedAt) {
        revenueBefore += amount;
      } else {
        revenueAfter += amount;
      }
    });

    globalTotalOrders += storeOrders.length;
    globalTotalRevenue += totalRevenue;
    globalDelayedOrders += storeOrders.filter(o => o.shipping_status?.includes('delayed')).length;

    return {
      ...store,
      email: storeUser ? storeUser.email : 'Sem e-mail',
      totalOrders: storeOrders.length,
      totalRevenue,
      revenueBefore,
      revenueAfter,
      isConnected: !!store.access_token
    };
  });

  // Calcular MRR e Lojas Ativas
  const totalStores = storesWithStats.length;
  const mrr = storesWithStats.reduce((acc, store) => {
    const plan = store.current_plan || 'start';
    return acc + (PLAN_PRICES[plan] || 0);
  }, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={28} color="var(--primary)" /> Comando Central (Admin)
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Bem-vindo, Fundador. Aqui está o panorama do seu império.</p>
      </header>

      {/* Cards de Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, var(--surface) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px' }}>
              <DollarSign size={24} color="var(--primary)" />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>MRR Total</p>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr)}
              </h2>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              <Store size={24} color="#10b981" />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lojas Conectadas</p>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)' }}>{totalStores}</h2>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
              <Package size={24} color="var(--info)" />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pedidos Sincronizados</p>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)' }}>{globalTotalOrders}</h2>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
              <DollarSign size={24} color="var(--warning)" />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Volume Transacionado</p>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(globalTotalRevenue)}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Lojas/Usuários */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--primary)" /> Base de Clientes
          </h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-secondary)' }}>Cliente</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-secondary)' }}>Saúde</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-secondary)' }}>Métricas do Cliente</th>
                <th style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-secondary)' }}>Ações / Plano</th>
              </tr>
            </thead>
            <tbody>
              {storesWithStats.map((store) => (
                <tr key={store.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500' }}>{store.store_domain || 'N/A'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{store.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Criado em: {new Date(store.created_at).toLocaleDateString('pt-BR')}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {store.isConnected ? (
                      <span className="badge success">App Instalado</span>
                    ) : (
                      <span className="badge danger">Falta Instalar</span>
                    )}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      Uso Mês: {store.orders_this_month || 0}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pedidos Totais: <strong style={{color:'var(--text-primary)'}}>{store.totalOrders}</strong></div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Faturamento (Depois): <strong style={{color:'var(--success)'}}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(store.revenueAfter)}</strong></div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Faturamento (Antes): {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(store.revenueBefore)}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span className={`badge ${store.current_plan === 'max' ? 'success' : store.current_plan === 'pro' ? 'warning' : ''}`} style={{ textTransform: 'capitalize', alignSelf: 'flex-start' }}>
                        {store.current_plan || 'start'}
                      </span>
                      <form action={updateStorePlan} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="hidden" name="storeId" value={store.id} />
                        <select 
                          name="plan" 
                          defaultValue={store.current_plan || 'start'}
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                        >
                          <option value="start">Start (Grátis)</option>
                          <option value="pro">Pro</option>
                          <option value="max">Max</option>
                        </select>
                        <button type="submit" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                          Salvar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {storesWithStats.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nenhuma loja encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
