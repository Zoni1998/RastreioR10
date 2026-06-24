import { createClient } from '../../utils/supabase/server';
import { Settings, Save, Store, Info, ShieldCheck, Mail } from 'lucide-react';
import Link from 'next/link';
import { updateStoreConfig } from './actions';

export const dynamic = 'force-dynamic';

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Pegar a loja do usuário
  const { data: store } = await supabase.from('stores').select('id, nuvemshop_store_id, posting_delay_days, delivery_delay_days, store_domain, created_at, whatsapp_message, email_alerts, current_plan, template_delayed, template_shipped, template_pending').eq('user_id', user.id).single();

  if (!store) {
    return (
      <div className="p-8 text-text-secondary">
        <h1 className="text-2xl font-medium text-text-primary mb-2">Configurações</h1>
        <p>Nenhuma loja vinculada. Vá ao Dashboard e conecte-se à Nuvemshop.</p>
      </div>
    );
  }

  const postingDays = store.posting_delay_days || 7;
  const deliveryDays = store.delivery_delay_days || 25;
  const planName = store.current_plan === 'max' ? 'Plano Max' : store.current_plan === 'pro' ? 'Plano Pro' : 'Plano Start';
  
  const templateDelayed = store.template_delayed || 'Olá [NomeCliente], vi que o seu pedido [NumeroPedido] está demorando um pouco mais do que o esperado na transportadora. Já estou acompanhando de perto para você, ok?';
  const templateShipped = store.template_shipped || 'Olá [NomeCliente], boa notícia! Seu pedido [NumeroPedido] já foi enviado e está a caminho. Você pode acompanhar por este código: [CodigoRastreio].';
  const templatePending = store.template_pending || 'Olá [NomeCliente], tudo bem? Notei que você iniciou um pedido ([NumeroPedido]) mas o pagamento ainda está pendente. Ficou com alguma dúvida ou teve algum problema na hora de pagar?';

  return (
    <div className="flex flex-col pb-16">
      <div className="mb-10">
        <h1 className="text-3xl font-medium text-text-primary tracking-tight flex items-center gap-3">
          <Settings size={28} className="text-text-secondary" strokeWidth={2} />
          Configurações
        </h1>
        <p className="text-text-secondary mt-2 text-sm max-w-2xl">
          Personalize as regras de negócio, limites de atraso e mensagens enviadas aos seus clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-[800px]">
        
        {/* Card de Assinatura */}
        <div className="p-8 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 -mr-8 -mt-8 bg-indigo-500/5 blur-3xl rounded-full" />
          
          <h2 className="text-xl font-medium text-text-primary mb-6 flex items-center gap-2 relative z-10">
            <ShieldCheck size={20} className="text-indigo-400" /> Meu Plano
          </h2>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative z-10">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-1">Plano Atual</p>
              <h3 className="text-2xl font-medium text-indigo-400 capitalize">{planName}</h3>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider rounded-sm">
                Ativo
              </span>
              {store.current_plan !== 'max' && (
                <Link href="/assinatura" className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm rounded-md transition-colors shadow-sm">
                  Fazer Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Card de Integração */}
        <div className="p-8 rounded-xl border border-border bg-surface/50">
          <h2 className="text-xl font-medium text-text-primary mb-6 flex items-center gap-2">
            <Store size={20} className="text-text-secondary" /> Integração Nuvemshop
          </h2>
          <div className="p-6 bg-background border border-border/80 rounded-lg flex flex-col sm:flex-row gap-8">
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-1">ID da Loja</p>
              <p className="text-xl font-medium text-text-primary font-mono tracking-tight">{store.nuvemshop_store_id}</p>
            </div>
            
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-1">Data da Conexão</p>
              <p className="text-text-secondary font-medium">
                {new Date(store.created_at).toLocaleDateString('pt-BR')} <span className="text-text-secondary ml-1">às {new Date(store.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Card de Regras de Negócio */}
        <div className="p-8 rounded-xl border border-border bg-surface/50">
          <h2 className="text-xl font-medium text-text-primary mb-8 flex items-center gap-2">
            <Info size={20} className="text-text-secondary" /> Preferências e Operação
          </h2>
          
          <form action={updateStoreConfig} className="flex flex-col gap-8">
            <input type="hidden" name="storeId" value={store.id} />
            
            <div className="flex flex-col gap-2">
              <label htmlFor="store_domain" className="text-sm font-medium text-text-primary">
                Domínio da Nuvemshop (Nome da loja)
              </label>
              <p className="text-xs text-text-secondary mb-1">
                Apenas o prefixo antes de .lojavirtualnuvem.com.br (Ex: <b className="text-text-secondary">vzsports2</b>)
              </p>
              <input 
                id="store_domain" 
                name="store_domain" 
                type="text" 
                defaultValue={store.store_domain || ''}
                placeholder="vzsports2"
                className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm text-text-primary placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all font-mono"
              />
            </div>

            <div className="flex flex-col gap-6 p-6 bg-background border border-border/80 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-medium text-text-primary flex items-center gap-2">
                    <Mail size={16} className="text-text-secondary" /> Templates do WhatsApp
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Variáveis: <b className="text-text-secondary">[NomeCliente]</b>, <b className="text-text-secondary">[NumeroPedido]</b>, <b className="text-text-secondary">[CodigoRastreio]</b>.
                  </p>
                </div>
                {store.current_plan === 'start' && (
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1 shrink-0">
                    <Lock size={10} /> PRO/MAX
                  </span>
                )}
              </div>
              
              {store.current_plan === 'start' ? (
                <div className="p-8 bg-surface border border-dashed border-border rounded-lg text-center flex flex-col items-center justify-center">
                  <p className="text-text-secondary text-sm mb-4 max-w-sm">
                    A edição de mensagens automáticas está disponível apenas nos planos superiores.
                  </p>
                  <Link href="/assinatura" className="px-4 py-2 bg-surface-hover hover:bg-zinc-700 text-text-primary text-sm font-medium rounded-md transition-colors border border-border">
                    Desbloquear Templates
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="template_pending" className="text-xs font-medium text-amber-500 uppercase tracking-widest">
                      Carrinho / Aguardando Pagamento
                    </label>
                    <textarea 
                      id="template_pending" 
                      name="template_pending" 
                      defaultValue={templatePending}
                      rows={2}
                      className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm text-text-secondary placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all resize-y"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="template_shipped" className="text-xs font-medium text-blue-400 uppercase tracking-widest">
                      Pedido Enviado
                    </label>
                    <textarea 
                      id="template_shipped" 
                      name="template_shipped" 
                      defaultValue={templateShipped}
                      rows={2}
                      className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm text-text-secondary placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all resize-y"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="template_delayed" className="text-xs font-medium text-red-400 uppercase tracking-widest">
                      Pedido Atrasado
                    </label>
                    <textarea 
                      id="template_delayed" 
                      name="template_delayed" 
                      defaultValue={templateDelayed}
                      rows={2}
                      className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm text-text-secondary placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all resize-y"
                    />
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  id="email_alerts" 
                  name="email_alerts" 
                  defaultChecked={store.email_alerts}
                  className="peer sr-only"
                />
                <div className="w-10 h-5 bg-surface-hover rounded-full peer-checked:bg-emerald-500 transition-colors" />
                <div className="absolute left-1 w-3 h-3 bg-zinc-400 rounded-full transition-transform peer-checked:translate-x-5 peer-checked:bg-white" />
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                Receber Alertas por E-mail <span className="text-zinc-600 ml-1">(Em breve)</span>
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border/50">
              <div className="flex flex-col gap-2">
                <label htmlFor="postingDays" className="text-sm font-medium text-text-primary">
                  Atraso para Postagem (dias)
                </label>
                <input 
                  type="number" 
                  id="postingDays" 
                  name="postingDays" 
                  defaultValue={postingDays} 
                  min="1" max="60"
                  className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="deliveryDays" className="text-sm font-medium text-text-primary">
                  Atraso para Entrega (dias)
                </label>
                <input 
                  type="number" 
                  id="deliveryDays" 
                  name="deliveryDays" 
                  defaultValue={deliveryDays} 
                  min="1" max="90"
                  className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all font-mono"
                />
              </div>
            </div>

            <button type="submit" className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm rounded-md transition-all active:scale-95 shadow-sm w-fit">
              <Save size={18} />
              Salvar Configurações
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
