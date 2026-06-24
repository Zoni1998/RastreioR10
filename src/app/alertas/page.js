import { createClient } from '../../utils/supabase/server';
import { Bell, Check, PackageX, AlertTriangle, Inbox } from 'lucide-react';
import { resolveAlertAction } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AlertasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: store } = await supabase.from('stores').select('id, nuvemshop_store_id').eq('user_id', user.id).single();

  if (!store) return <div className="p-8 text-text-secondary">Nenhuma loja conectada.</div>;

  // Buscar notificações ativas (não lidas)
  const { data: notifications } = await supabase
    .from('notifications')
    .select(`
      *,
      order:orders (
        order_number,
        customer_name,
        nuvemshop_order_id
      )
    `)
    .eq('store_id', store.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false });

  const safeNotifs = notifications || [];

  return (
    <div className="flex flex-col h-full pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-text-primary tracking-tight flex items-center gap-3">
          <Bell size={28} className="text-text-secondary" strokeWidth={2} />
          Caixa de Alertas
        </h1>
      </div>

      <div className="flex-1 rounded-xl border border-border bg-surface/50 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {safeNotifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary py-20">
              <div className="w-20 h-20 bg-surface border border-border rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Inbox size={32} className="text-zinc-600" />
              </div>
              <h2 className="text-xl font-medium text-text-secondary mb-2">Tudo Limpo!</h2>
              <p className="text-text-secondary text-sm">Você não tem nenhum alerta pendente no momento.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {safeNotifs.map((notif) => {
                const isPostingDelay = notif.type === 'delayed_posting';
                const Icon = isPostingDelay ? PackageX : AlertTriangle;
                const colors = isPostingDelay 
                  ? { border: 'border-amber-500/50', iconBg: 'bg-amber-500/10', iconText: 'text-amber-500' } 
                  : { border: 'border-red-500/50', iconBg: 'bg-red-500/10', iconText: 'text-red-400' };
                const title = isPostingDelay ? 'Atraso na Postagem' : 'Atraso no Recebimento';

                return (
                  <div key={notif.id} className={`flex flex-col md:flex-row md:items-center justify-between p-6 bg-background border border-border rounded-lg shadow-sm relative overflow-hidden group hover:border-border transition-colors`}>
                    {/* Linha Lateral de Cor */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPostingDelay ? 'bg-amber-500' : 'bg-red-500'}`} />
                    
                    <div className="flex gap-5 items-start md:items-center mb-6 md:mb-0 ml-2">
                      <div className={`p-3 rounded-full ${colors.iconBg} ${colors.iconText} shrink-0`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-text-primary mb-1 flex items-center gap-2">
                          {title} 
                          <span className="text-text-secondary text-sm font-normal"># {notif.order?.order_number}</span>
                        </h3>
                        <p className="text-text-secondary text-sm mb-3 leading-relaxed max-w-2xl">{notif.message}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium">
                          <span className="text-text-secondary uppercase tracking-widest">Cliente:</span>
                          <span className="text-text-secondary">{notif.order?.customer_name}</span>
                          <span className="text-zinc-700 hidden sm:inline">|</span>
                          <span className="text-text-secondary uppercase tracking-widest">Gerado em:</span>
                          <span className="text-text-secondary">{new Date(notif.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:flex-col md:items-end self-end md:self-center ml-2">
                      <a 
                        href={`https://${store.nuvemshop_store_id}.lojavirtualnuvem.com.br/admin/orders/${notif.order?.nuvemshop_order_id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-text-secondary rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        Ver Loja
                      </a>
                      
                      <form action={resolveAlertAction}>
                        <input type="hidden" name="notificationId" value={notif.id} />
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-md text-sm font-medium transition-colors shadow-sm active:scale-95 whitespace-nowrap">
                          <Check size={16} /> Resolver
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
