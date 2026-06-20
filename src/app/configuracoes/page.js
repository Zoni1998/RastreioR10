import { createClient } from '../../utils/supabase/server';
import { Settings, Save, Store, Info } from 'lucide-react';
import Link from 'next/link';
import { updateStoreConfig } from './actions';

export const dynamic = 'force-dynamic';

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

    // Pegar a loja do usuário e contagem de pedidos
  const { data: store } = await supabase.from('stores').select('id, nuvemshop_store_id, posting_delay_days, delivery_delay_days, store_domain, created_at, whatsapp_message, email_alerts, current_plan, template_delayed, template_shipped, template_pending').eq('user_id', user.id).single();

  if (!store) {
    return (
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
        <p style={{color: 'var(--text-secondary)'}}>Nenhuma loja vinculada. Vá ao Dashboard e conecte-se à Nuvemshop.</p>
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
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Settings size={28} color="var(--primary)" style={{ marginRight: '12px', verticalAlign: 'middle' }} />
          Configurações
        </h1>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: '1fr', maxWidth: '800px' }}>
        
        {/* Card de Assinatura */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, var(--surface) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={20} color="var(--primary)" /> Meu Plano
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)' }}>Plano Atual</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{planName}</h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="badge success">Ativo</span>
              {store.current_plan !== 'max' && (
                <Link href="/assinatura" className="btn" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.9rem' }}>
                  Fazer Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Card de Integração */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={20} color="var(--text-secondary)" /> Integração Nuvemshop
          </h2>
          <div style={{ padding: '16px', backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>ID da Loja (User ID):</p>
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{store.nuvemshop_store_id}</p>
            
            <p style={{ margin: '16px 0 8px 0', color: 'var(--text-secondary)' }}>Data da Conexão:</p>
            <p style={{ margin: 0 }}>{new Date(store.created_at).toLocaleDateString('pt-BR')} às {new Date(store.created_at).toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>

        {/* Card de Regras de Negócio */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={20} color="var(--text-secondary)" /> Preferências e Atrasos
          </h2>
          
          <form action={updateStoreConfig} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <input type="hidden" name="storeId" value={store.id} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="store_domain" style={{ fontWeight: '500', fontSize: '1rem' }}>Domínio da Nuvemshop (Nome da sua loja)</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                Apenas o nome que vem antes de .lojavirtualnuvem.com.br (Exemplo: <b>vzsports2</b>)
              </p>
              <input 
                id="store_domain" 
                name="store_domain" 
                type="text" 
                defaultValue={store.store_domain || ''}
                placeholder="vzsports2"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text-primary)', fontSize: '1rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: 'var(--background)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', fontSize: '1.1rem', color: '#10b981' }}>Templates do WhatsApp</label>
                {store.current_plan === 'start' && (
                  <span className="badge warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🔒 Exclusivo PRO & MAX
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 -8px 0' }}>
                Variáveis disponíveis: <b>[NomeCliente]</b>, <b>[NumeroPedido]</b>, <b>[CodigoRastreio]</b>.
              </p>
              
              {store.current_plan === 'start' ? (
                <div style={{ padding: '24px', backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    A criação de mensagens automáticas para recuperação e envios está disponível apenas nos planos pagos.
                  </p>
                  <Link href="/assinatura" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    Desbloquear Templates
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label htmlFor="template_pending" style={{ fontSize: '0.95rem', color: 'var(--warning)' }}>Template: Carrinho / Aguardando Pagamento</label>
                    <textarea 
                      id="template_pending" 
                      name="template_pending" 
                      defaultValue={templatePending}
                      rows={2}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label htmlFor="template_shipped" style={{ fontSize: '0.95rem', color: 'var(--info)' }}>Template: Pedido Enviado</label>
                    <textarea 
                      id="template_shipped" 
                      name="template_shipped" 
                      defaultValue={templateShipped}
                      rows={2}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label htmlFor="template_delayed" style={{ fontSize: '0.95rem', color: 'var(--danger)' }}>Template: Pedido Atrasado</label>
                    <textarea 
                      id="template_delayed" 
                      name="template_delayed" 
                      defaultValue={templateDelayed}
                      rows={2}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="checkbox" 
                id="email_alerts" 
                name="email_alerts" 
                defaultChecked={store.email_alerts}
                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="email_alerts" style={{ fontWeight: '500', fontSize: '1rem', cursor: 'pointer' }}>
                Receber Alertas por E-mail (Em breve)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <label htmlFor="postingDays" style={{ fontWeight: '500', fontSize: '1rem' }}>Dias de Atraso para Postagem</label>
                <input 
                  type="number" 
                  id="postingDays" 
                  name="postingDays" 
                  defaultValue={postingDays} 
                  min="1" max="60"
                  style={{
                    padding: '12px', borderRadius: '8px', border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)', color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <label htmlFor="deliveryDays" style={{ fontWeight: '500', fontSize: '1rem' }}>Dias de Atraso para Entrega</label>
                <input 
                  type="number" 
                  id="deliveryDays" 
                  name="deliveryDays" 
                  defaultValue={deliveryDays} 
                  min="1" max="90"
                  style={{
                    padding: '12px', borderRadius: '8px', border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)', color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <button type="submit" className="btn" style={{ alignSelf: 'flex-start', padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} />
              Salvar Configurações
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
