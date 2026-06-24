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
  if (!user) return <div className="p-8 text-text-secondary">Redirecionando...</div>;

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

  if (!store) return <div className="p-8 text-text-secondary">Nenhuma loja conectada.</div>;

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
    <div className="flex flex-col h-full pb-12 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-text-primary tracking-tight flex items-center gap-3">
          <ShoppingCart size={28} className="text-emerald-500" strokeWidth={2} />
          Recuperação de Vendas
        </h1>
        <p className="text-text-secondary mt-2 text-sm max-w-2xl">
          Recupere boletos não pagos e carrinhos abandonados com um clique diretamente pelo WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-8 rounded-[2rem] border border-emerald-500/30 bg-emerald-500/5 liquid-glass flex items-center gap-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.15)]">
            <TrendingUp size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-500/70 uppercase tracking-widest mb-1">Valor Potencial (Risco)</p>
            <h2 className="text-3xl font-medium text-emerald-400 tracking-tight">
              R$ {recoverableAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className="p-8 rounded-[2rem] border border-border/40 liquid-glass flex items-center gap-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover/50 border border-border/50 flex items-center justify-center text-text-secondary shadow-sm">
            <ShoppingCart size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-1">Boletos / Abandonados</p>
            <h2 className="text-3xl font-medium text-text-primary tracking-tight">
              {safeOrders.length}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-[2rem] border border-border/40 liquid-glass overflow-hidden flex flex-col relative min-h-[450px] shadow-xl">
        
        {!isMaxPlan && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center p-8 text-center border-t border-border/50">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-lg">
              <Lock size={28} className="text-amber-500" />
            </div>
            <h2 className="text-2xl font-medium text-text-primary mb-3 tracking-tight">Funcionalidade Exclusiva MAX</h2>
            <p className="text-text-secondary max-w-lg mb-8 leading-relaxed text-sm">
              Você tem <b className="text-text-primary">R$ {recoverableAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b> parados em pedidos não pagos. 
              Assine o plano MAX e libere a ferramenta de recuperação ativa via WhatsApp. <b className="text-text-primary">Recupere 1 pedido e a ferramenta já se paga!</b>
            </p>
            <Link href="/assinatura" className="flex items-center gap-2 px-6 py-3 bg-[linear-gradient(135deg,#3b82f6,#8b5cf6)] hover:opacity-90 text-white rounded-md font-medium transition-all active:scale-95 shadow-xl">
              Desbloquear Recuperação <ArrowRight size={18} />
            </Link>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto p-0 ${!isMaxPlan ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-text-secondary uppercase tracking-widest bg-surface/80">
                <th className="p-4 font-medium pl-6">Nº</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium">Valor</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium pr-6">Ação</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {safeOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-text-secondary">
                    Nenhum carrinho abandonado ou boleto pendente no momento.
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
                    <tr key={order.id} className="border-b border-border/50 hover:bg-surface-hover/20 transition-colors group">
                      <td className="p-4 pl-6 font-medium text-text-secondary group-hover:text-text-primary">#{order.order_number}</td>
                      <td className="p-4 text-text-secondary">{order.customer_name}</td>
                      <td className="p-4 text-text-secondary">{purchaseDate.toLocaleDateString('pt-BR')}</td>
                      <td className="p-4 font-medium text-emerald-400">
                        R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[11px] font-medium rounded-sm whitespace-nowrap ${order.payment_status === 'abandoned' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                          {order.payment_status === 'abandoned' ? 'Abandonado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="p-4 pr-6">
                        <a 
                          href={isMaxPlan ? `https://wa.me/?text=${encodeURIComponent(rawMsg)}` : '#'}
                          target={isMaxPlan ? "_blank" : "_self"}
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium text-xs rounded-md transition-colors w-fit shadow-sm"
                        >
                          <MessageCircle size={16} /> Recuperar Venda
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
