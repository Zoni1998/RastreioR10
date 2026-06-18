import { Check, Star, Zap, CheckCircle } from 'lucide-react';
import { createClient } from '../../utils/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AssinaturaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let store = null;
  if (user) {
    const { data } = await supabase.from('stores').select('current_plan').eq('user_id', user.id).single();
    store = data;
  }

  const currentPlan = store?.current_plan || 'start';

  const plans = [
    {
      id: 'start',
      name: 'Start',
      price: '47',
      description: 'Ideal para lojas validando produtos e ganhando tração.',
      icon: <Zap size={24} color="#3b82f6" />,
      color: '#3b82f6',
      features: [
        'Até 100 pedidos monitorados/mês',
        'Dashboard de Risco Financeiro',
        'Sincronização com Nuvemshop',
        'Botão Rápido de WhatsApp (Mensagem Padrão)',
        'Suporte por E-mail'
      ],
      notIncluded: [
        'Mensagens Inteligentes (Multi-causa)',
        'Alertas Semanais Automáticos',
        'Alerta de Risco de Extravio',
        'Múltiplas Lojas'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '79,90',
      description: 'O parceiro ideal para lojas que já operam com previsibilidade.',
      icon: <CheckCircle size={24} color="#8b5cf6" />,
      color: '#8b5cf6',
      highlight: true,
      features: [
        'Limite de 1.000 pedidos monitorados/mês',
        'Mensagens de WhatsApp Personalizáveis',
        'Alertas Semanais Automáticos (E-mail)',
        'Alerta de Risco de Extravio (5 dias parado)',
        'Dashboard Avançado de Métricas',
        'Suporte Prioritário'
      ],
      notIncluded: [
        'Disparo Automático de WhatsApp',
        'Página de Rastreio White-Label',
        'Múltiplas Lojas conectadas',
        'Acessos para Equipe'
      ]
    },
    {
      id: 'max',
      name: 'Max',
      price: '119,90',
      description: 'Para agências, dropshippers maduros e grandes volumes.',
      icon: <Zap size={24} color="#10b981" />,
      color: '#10b981',
      features: [
        'Pedidos Ilimitados',
        'Disparo 100% Automático no WhatsApp',
        'Página de Rastreio White-Label (Seu Domínio)',
        'Múltiplas Lojas Nuvemshop',
        'Acesso Restrito para Equipe de SAC',
        'Gerente de Contas Dedicado',
        'TrackIA (Em breve) ✨'
      ],
      notIncluded: []
    }
  ];

  return (
    <div style={{ paddingBottom: '64px' }}>
      <div className="page-header" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', paddingBottom: '32px' }}>
        <h1 className="page-title" style={{ justifyContent: 'center', fontSize: '2.5rem', marginBottom: '16px' }}>Faça o Upgrade da sua Operação</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Escolha o plano ideal para blindar sua logística, reter mais clientes e profissionalizar sua marca. Comece pequeno, escale rápido.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        alignItems: 'start'
      }}>
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          
          return (
            <div 
              key={plan.id} 
              className="card" 
              style={{ 
                position: 'relative',
                display: 'flex', 
                flexDirection: 'column',
                height: '100%',
                border: plan.highlight ? `2px solid ${plan.color}` : '1px solid var(--border)',
                transform: plan.highlight ? 'scale(1.02)' : 'none',
                boxShadow: plan.highlight ? `0 20px 40px -10px rgba(139, 92, 246, 0.15)` : 'var(--shadow-sm)'
              }}
            >
              {plan.highlight && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-14px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  backgroundColor: plan.color,
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  Mais Popular
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: `${plan.color}15` }}>
                  {plan.icon}
                </div>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{plan.name}</h2>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', minHeight: '44px' }}>
                {plan.description}
              </p>

              <div style={{ marginBottom: '32px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  R$ {plan.price}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>/mês</span>
              </div>

              {isCurrent ? (
                <button 
                  className="btn" 
                  disabled
                  style={{ 
                    width: '100%', 
                    marginBottom: '32px', 
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Seu Plano Atual
                </button>
              ) : (
                <form action="/api/stripe/checkout" method="POST" style={{ marginBottom: '32px' }}>
                  <input type="hidden" name="planId" value={plan.id} />
                  <button 
                    type="submit"
                    className="btn" 
                    style={{ 
                      width: '100%', 
                      backgroundColor: plan.highlight ? plan.color : 'var(--surface)',
                      color: plan.highlight ? 'white' : 'var(--text-primary)',
                      border: plan.highlight ? 'none' : '1px solid var(--border)',
                      padding: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    Assinar {plan.name}
                  </button>
                </form>
              )}

              <div style={{ flexGrow: 1 }}>
                <p style={{ fontWeight: '600', marginBottom: '16px', fontSize: '0.95rem' }}>O que está incluído:</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      <Check size={18} color={plan.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                  
                  {plan.notIncluded.map((feature, i) => (
                    <li key={`not-${i}`} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '0.9rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                      <div style={{ width: '18px', height: '1px', backgroundColor: 'var(--text-secondary)', marginTop: '10px', flexShrink: 0 }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
