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
    <div className="pb-16 px-4">
      <div className="text-center max-w-3xl mx-auto pb-12">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-text-primary">Faça o Upgrade da sua Operação</h1>
        <p className="text-text-secondary text-lg leading-relaxed">
          Escolha o plano ideal para blindar sua logística, reter mais clientes e profissionalizar sua marca. Comece pequeno, escale rápido.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start pt-10">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          
          return (
            <div 
              key={plan.id}
              className={`relative flex flex-col h-full transition-all duration-300 ${plan.highlight ? 'lg:scale-105 z-10' : 'hover:-translate-y-1'}`}
              style={{ '--color': plan.color }}
            >
              {plan.highlight && (
                <div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg z-20"
                  style={{ backgroundColor: plan.color }}
                >
                  Mais Popular
                </div>
              )}

              <div 
                className={`flex flex-col h-full rounded-[2rem] p-8 ${plan.highlight ? 'bg-surface/80 liquid-glass border-2 border-[var(--color)] shadow-2xl' : 'liquid-glass border border-border/40 shadow-xl'}`}
              >

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: `${plan.color}15` }}>
                  {plan.icon}
                </div>
                <h2 className="text-2xl font-medium text-text-primary m-0">{plan.name}</h2>
              </div>
              
              <p className="text-text-secondary text-sm mb-8 min-h-[48px] leading-relaxed">
                {plan.description}
              </p>

              <div className="mb-10">
                <span className="text-4xl font-semibold text-text-primary tracking-tight">
                  R$ {plan.price}
                </span>
                <span className="text-text-secondary ml-1">/mês</span>
              </div>

              {isCurrent ? (
                <button 
                  disabled
                  className="w-full mb-10 bg-transparent border border-border/60 text-text-secondary py-3.5 rounded-xl font-medium cursor-not-allowed"
                >
                  Seu Plano Atual
                </button>
              ) : (
                <form action="/api/stripe/checkout" method="POST" className="mb-10">
                  <input type="hidden" name="planId" value={plan.id} />
                  <button 
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-medium transition-all active:scale-95 shadow-md hover:shadow-lg"
                    style={{ 
                      backgroundColor: plan.highlight ? plan.color : 'var(--surface-hover)',
                      color: plan.highlight ? 'white' : 'var(--text-primary)',
                      border: plan.highlight ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    Assinar {plan.name}
                  </button>
                </form>
              )}

              <div className="flex-grow">
                <p className="font-semibold text-sm mb-5 text-text-primary">O que está incluído:</p>
                <ul className="flex flex-col gap-4 m-0 p-0 list-none">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-text-primary">
                      <Check size={18} color={plan.color} className="shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  
                  {plan.notIncluded.map((feature, i) => (
                    <li key={`not-${i}`} className="flex gap-3 items-start text-sm text-text-secondary/50">
                      <div className="w-[18px] h-[1px] bg-text-secondary/40 mt-2.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
