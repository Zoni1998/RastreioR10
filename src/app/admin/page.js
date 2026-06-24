import { createClient } from '../../utils/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { Activity, DollarSign, Store, Package, AlertTriangle, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';

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
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#8b5cf6' }}>
          <Activity size={28} /> Comando Central
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Bem-vindo, Fundador. Visão global de receita e retenção do seu SaaS.</p>
      </header>

      {/* Cards de Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <div className="p-6 rounded-[2rem] liquid-glass shadow-lg border border-border/40" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, var(--surface) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
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

        <div className="p-6 rounded-[2rem] liquid-glass shadow-lg border border-border/40">
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

        <div className="p-6 rounded-[2rem] liquid-glass shadow-lg border border-border/40">
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

        <div className="p-6 rounded-[2rem] liquid-glass shadow-lg border border-border/40">
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

      {/* Churn Prevention Board */}
      <div className="p-8 rounded-[2rem] liquid-glass shadow-2xl border border-red-500/30" style={{ background: 'color-mix(in srgb, var(--surface) 40%, rgba(239, 68, 68, 0.1))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
            <AlertTriangle size={20} /> Prevenção de Churn (Risco de Cancelamento)
          </h2>
          <Link href="/admin/clientes" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.85rem' }}>
            Ver todos clientes <ArrowRight size={14} />
          </Link>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
          Lojas que possuem o App instalado mas não sincronizaram pedidos nos últimos 3 dias. Elas podem ter parado de vender ou o token expirou. Entre em contato!
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          {storesWithStats
            .map(store => {
              const storeOrders = allOrders.filter(o => o.store_id === store.id);
              const recentOrders = storeOrders.filter(o => {
                const diff = new Date() - new Date(o.purchase_date);
                return diff < 3 * 24 * 60 * 60 * 1000;
              });
              const churnRisk = store.isConnected && recentOrders.length === 0;
              return { ...store, churnRisk };
            })
            .filter(s => s.churnRisk)
            .map(store => (
              <div key={store.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>{store.store_domain || 'Loja Desconhecida'}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{store.email}</p>
                </div>
                <Link href={`/?view_as_store=${store.id}`} target="_blank" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <Eye size={14} /> Investigar Conta
                </Link>
              </div>
          ))}
          {storesWithStats.filter(s => s.isConnected && allOrders.filter(o => o.store_id === s.id && (new Date() - new Date(o.purchase_date)) < 3*24*60*60*1000).length === 0).length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
              Nenhuma loja em risco imediato. Bom trabalho!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
