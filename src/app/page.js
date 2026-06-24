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

  if (!user) return <div className="p-8 text-text-secondary">Redirecionando...</div>;

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6">
          <Package size={32} className="text-text-secondary" />
        </div>
        <h1 className="text-3xl font-medium text-text-primary tracking-tight mb-4">Bem-vindo ao AuraTrack!</h1>
        <p className="text-text-secondary mb-8 leading-relaxed">Você ainda não conectou nenhuma loja. Para começarmos a monitorar seus atrasos, conecte sua conta da Nuvemshop.</p>
        
        <a 
          href={`https://www.nuvemshop.com.br/apps/${clientId}/authorize`}
          className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium py-3 px-6 rounded-md text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm"
        >
          <PlusCircle size={18} />
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
  
  // Faturamento Monitorado
  const revenueAfter = safeOrders
    .filter(o => new Date(o.purchase_date) >= storeCreatedAt)
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  // Receita Salva
  const revenueSaved = safeOrders
    .filter(o => o.shipping_status === 'delivered' && o.was_delayed_once === true)
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  // Gerar dados para o gráfico
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    
    chartData.push({
      name: dateStr,
      entregues: safeOrders.filter(o => o.shipping_status === 'delivered' && new Date(o.purchase_date).getDate() === d.getDate()).length,
      atrasados: safeOrders.filter(o => o.shipping_status?.includes('delayed') && new Date(o.purchase_date).getDate() === d.getDate()).length,
    });
  }

  const recentOrders = safeOrders.slice(0, 5);

  // Performance de Transportadoras
  const shippingStats = {};
  safeOrders.forEach(o => {
    if (o.shipping_company && o.shipping_company !== 'Desconhecido') {
      if (!shippingStats[o.shipping_company]) {
        shippingStats[o.shipping_company] = { total: 0, delayed: 0 };
      }
      shippingStats[o.shipping_company].total++;
      if (o.shipping_status === 'delayed_posting' || o.shipping_status === 'delayed_delivery' || (o.shipping_status === 'delivered' && o.was_delayed_once)) {
        shippingStats[o.shipping_company].delayed++;
      }
    }
  });

  const carriersArray = Object.keys(shippingStats).map(name => {
    const total = shippingStats[name].total;
    const delayed = shippingStats[name].delayed;
    const percentDelayed = total > 0 ? (delayed / total) * 100 : 0;
    return { name, total, delayed, percentDelayed };
  }).sort((a, b) => b.percentDelayed - a.percentDelayed).slice(0, 5);

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-medium text-text-primary tracking-tight">Visão Geral</h1>
          <p className="text-text-secondary mt-2 text-sm">
            Bem-vindo de volta! Aqui está o resumo da sua operação hoje.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <form action={syncOrdersAction}>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-text-secondary rounded-md text-sm font-medium transition-colors">
              <RefreshCw size={16} /> Últimos 30 dias
            </button>
          </form>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-md text-sm font-medium transition-colors">
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
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 mb-8 rounded-[2rem] border ${isNearLimit ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/40 liquid-glass shadow-lg'} relative overflow-hidden`}>
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
                <p className="mt-2 text-amber-500 text-xs font-medium uppercase tracking-wide">⚠️ Você está próximo do limite</p>
              )}
            </div>
            
            {currentPlan !== 'max' && (
              <Link href="/assinatura" className="whitespace-nowrap flex items-center gap-2 px-5 py-2.5 bg-[linear-gradient(135deg,#3b82f6,#8b5cf6)] hover:opacity-90 text-white rounded-md text-sm font-medium shadow-lg transition-all active:scale-95">
                Fazer Upgrade
              </Link>
            )}
          </div>
        );
      })()}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        
        {/* Receita em Risco Card */}
        <div className={`p-8 rounded-[2rem] shadow-xl flex flex-col justify-between transition-all ${valueAtRisk > 0 ? 'bg-amber-500 text-amber-950 border border-amber-400' : 'bg-text-primary text-background border border-text-primary'}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className={`text-xs font-medium uppercase tracking-widest mb-2 ${valueAtRisk > 0 ? 'text-amber-900/70' : 'text-background/70'}`}>Receita em Risco</p>
              <h2 className={`text-3xl font-medium tracking-tight ${valueAtRisk > 0 ? 'text-amber-950' : 'text-background'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valueAtRisk)}
              </h2>
            </div>
            <div className={`p-2 rounded-lg ${valueAtRisk > 0 ? 'bg-amber-950/10 text-amber-950' : 'bg-background/20 text-background'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className={`font-medium flex items-center gap-1.5 ${valueAtRisk > 0 ? 'text-amber-950' : 'text-background'}`}>
              <Truck size={14} /> {(valueAtRisk > 0) ? 'Atenção Necessária' : '0% de risco'}
            </span>
            <span className={`ml-2 ${valueAtRisk > 0 ? 'text-amber-900/80' : 'text-background/80'}`}>
              {valueAtRisk > 0 ? `${totalDelayed} vendas afetadas` : 'Nenhum atraso'}
            </span>
          </div>
        </div>

        {/* Prejuízo Evitado Card */}
        <div className="p-8 rounded-[2rem] border border-border/40 liquid-glass shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 right-0 p-8 -mr-6 -mt-6 bg-emerald-500/20 blur-3xl rounded-full" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-2">Prejuízo Evitado</p>
              <h2 className="text-3xl font-medium text-emerald-400 tracking-tight">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenueSaved)}
              </h2>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm relative z-10">
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Receita Salva
            </span>
            <span className="text-text-secondary ml-2">Pelo AuraTrack</span>
          </div>
        </div>

        {/* Faturamento Monitorado Card */}
        <div className="p-8 rounded-[2rem] border border-border/40 liquid-glass shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-2">Monitoramento</p>
              <h2 className="text-3xl font-medium text-text-primary tracking-tight">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(revenueAfter)}
              </h2>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-text-secondary">Volume rastreado via plataforma</span>
          </div>
        </div>

        {/* Logistics Health Score Card */}
        <div className="p-8 rounded-[2rem] border border-border/40 liquid-glass shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center z-10">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-2">Health Score</p>
              <h2 className="text-3xl font-medium text-text-primary tracking-tight mb-3">
                {healthScore} <span className="text-lg text-zinc-600 font-normal">/100</span>
              </h2>
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${healthScore >= 90 ? 'bg-emerald-500/10 text-emerald-400' : healthScore >= 70 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-400'}`}>
                {healthScore >= 90 ? 'Saudável' : healthScore >= 70 ? 'Atenção' : 'Crítico'}
              </span>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-zinc-800" strokeWidth="3"></circle>
                <circle cx="18" cy="18" r="15.9155" fill="none" className={healthScore >= 90 ? 'stroke-emerald-500' : healthScore >= 70 ? 'stroke-amber-500' : 'stroke-red-500'} strokeWidth="3" strokeDasharray={`${healthScore}, 100`} strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-medium ${healthScore >= 90 ? 'text-emerald-400' : healthScore >= 70 ? 'text-amber-500' : 'text-red-400'}`}>{healthScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Pendentes Pagamento */}
        <div className="p-6 rounded-[2rem] border border-border bg-surface hover:bg-surface-hover shadow-sm transition-colors group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock size={22} />
            </div>
            <span className="text-2xl font-medium text-text-primary">{pendingPayment}</span>
          </div>
          <h3 className="text-sm font-medium text-text-primary mb-1">Aguardando Pagamento</h3>
          <p className="text-xs text-text-secondary">Pedidos gerados não confirmados</p>
        </div>

        {/* Pronto para Envio */}
        <div className="p-6 rounded-[2rem] border border-border bg-surface hover:bg-surface-hover shadow-sm transition-colors group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <PackageX size={22} />
            </div>
            <span className="text-2xl font-medium text-text-primary">{readyToShip}</span>
          </div>
          <h3 className="text-sm font-medium text-text-primary mb-1">Pronto para Envio</h3>
          <p className="text-xs text-text-secondary">Pagos, aguardando postagem</p>
        </div>

        {/* Atraso na Postagem */}
        <div className="p-6 rounded-[2rem] border border-border bg-surface hover:bg-surface-hover shadow-sm transition-colors group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle size={22} />
            </div>
            <span className="text-2xl font-medium text-text-primary">{delayedPosting.length}</span>
          </div>
          <h3 className="text-sm font-medium text-text-primary mb-1">Atraso na Postagem</h3>
          <p className="text-xs text-text-secondary">Prazo de fulfillment estourado</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-8 rounded-[2rem] border border-border/40 liquid-glass shadow-xl">
          <h2 className="text-lg font-medium text-text-primary mb-6">Volume Diário</h2>
          <div className="w-full h-[300px]">
            <DashboardChart data={chartData} />
          </div>
        </div>

        {/* Analytics de Transportadoras */}
        <div className="p-8 rounded-[2rem] border border-border/40 liquid-glass shadow-xl relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-medium text-text-primary flex items-center gap-2">
              <Truck size={18} className="text-text-secondary" /> Performance Logística
            </h2>
            {store.current_plan !== 'max' && (
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm bg-surface-hover text-text-secondary border border-border">
                PRO/MAX
              </span>
            )}
          </div>

          {store.current_plan !== 'max' && (
             <div className="absolute inset-0 bg-background/60 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center p-8 text-center border border-border/50">
              <p className="text-text-primary mb-6 text-sm font-medium max-w-[260px]">
                Descubra qual transportadora gera mais devoluções e prejuízo.
              </p>
              <Link href="/assinatura" className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-medium rounded-md transition-all active:scale-95 shadow-sm">
                Desbloquear Logística
              </Link>
            </div>
          )}

          <div className={`flex-1 flex flex-col gap-5 ${store.current_plan !== 'max' ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
            {carriersArray.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
                Aguardando dados de transportadoras...
              </div>
            ) : (
              carriersArray.map(carrier => (
                <div key={carrier.name} className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-text-secondary">{carrier.name}</span>
                    <span className={`font-semibold ${carrier.percentDelayed > 15 ? 'text-red-400' : carrier.percentDelayed > 5 ? 'text-amber-500' : 'text-emerald-400'}`}>
                      {carrier.percentDelayed.toFixed(1)}% atraso
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${carrier.percentDelayed > 15 ? 'bg-red-500' : carrier.percentDelayed > 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${carrier.percentDelayed}%` }} 
                    />
                  </div>
                  <p className="text-xs text-text-secondary">
                    {carrier.delayed} de {carrier.total} pacotes fora do SLA.
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tabela Resumo */}
      <div className="p-8 rounded-[2rem] border border-border/40 liquid-glass shadow-xl">
        <h2 className="text-lg font-medium text-text-primary mb-6">Monitoramento Ativo</h2>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-text-secondary uppercase tracking-widest">
                <th className="pb-4 pl-2 font-medium">Pedido</th>
                <th className="pb-4 font-medium">Cliente</th>
                <th className="pb-4 font-medium">Data</th>
                <th className="pb-4 font-medium text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-text-secondary">
                    Nenhum pedido detectado.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  let badgeColors = 'bg-surface-hover text-text-secondary';
                  let statusText = 'Pendente / Trânsito';
                  
                  if (order.payment_status === 'pending') { badgeColors = 'bg-amber-500/10 text-amber-500 border border-amber-500/20'; statusText = 'Aguardando Pag.'; }
                  else if (order.payment_status === 'paid' && order.shipping_status === 'unfulfilled') { badgeColors = 'bg-blue-500/10 text-blue-400 border border-blue-500/20'; statusText = 'Pronto p/ Envio'; }
                  else if (order.shipping_status === 'shipped') { badgeColors = 'bg-surface-hover text-text-secondary border border-border'; statusText = 'Em Trânsito'; }
                  else if (order.shipping_status === 'delivered') { badgeColors = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'; statusText = 'Entregue'; }
                  else if (order.shipping_status === 'delayed_posting') { badgeColors = 'bg-amber-500/10 text-amber-500 border border-amber-500/20'; statusText = 'Postagem Atrasada'; }
                  else if (order.shipping_status === 'delayed_delivery') { badgeColors = 'bg-red-500/10 text-red-400 border border-red-500/20'; statusText = 'Entrega Atrasada'; }

                  return (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-surface-hover/20 transition-colors group">
                      <td className="py-4 pl-2 font-medium text-text-secondary group-hover:text-text-primary">#{order.order_number}</td>
                      <td className="py-4 text-text-secondary">{order.customer_name}</td>
                      <td className="py-4 text-text-secondary">{new Date(order.purchase_date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-4 text-right pr-2">
                        <span className={`px-2.5 py-1 text-[11px] font-medium rounded-sm whitespace-nowrap ${badgeColors}`}>
                          {statusText}
                        </span>
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
