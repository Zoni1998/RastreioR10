'use client'

import { useActionState } from 'react'
import { login } from '../auth/actions'
import Link from 'next/link'
import { Package, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      
      {/* Lado Esquerdo - Formulário */}
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px 24px',
        position: 'relative'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ padding: '10px', background: 'var(--primary)', borderRadius: '12px', boxShadow: 'var(--shadow-primary)' }}>
              <Package size={28} color="#fff" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>TrackFlow</span>
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '700' }}>Bem-vindo de volta</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1rem' }}>
            Acesse o seu painel e pare de perder dinheiro com atrasos.
          </p>

          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {state?.error && (
              <div style={{ 
                padding: '16px', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                borderRadius: '8px', 
                color: 'var(--danger)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {state.error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>E-mail profissional</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                placeholder="voce@sualoja.com.br"
                style={{ 
                  padding: '14px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)', 
                  backgroundColor: 'var(--surface)', 
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>Senha</label>
                <a href="/esqueci-senha" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', cursor: 'pointer', zIndex: 10 }}>
                  Esqueci minha senha
                </a>
              </div>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••"
                style={{ 
                  padding: '14px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)', 
                  backgroundColor: 'var(--surface)', 
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              style={{
                marginTop: '8px',
                padding: '14px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
                boxShadow: 'var(--shadow-primary)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {isPending ? 'Entrando...' : (
                <>Entrar no Painel <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Ainda não tem uma conta? <Link href="/cadastro" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Crie agora</Link>
          </p>
        </div>
      </div>

      {/* Lado Direito - Hero visual */}
      <div style={{ 
        flex: '1.2', 
        display: 'none', 
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        '@media (min-width: 900px)': { display: 'flex' },
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background blur */}
        <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '400px', height: '400px', background: 'var(--primary)', borderRadius: '50%', filter: 'blur(150px)', opacity: '0.15' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', left: '10%', width: '300px', height: '300px', background: 'var(--info)', borderRadius: '50%', filter: 'blur(120px)', opacity: '0.1' }}></div>
        
        <div style={{ zIndex: 1, maxWidth: '500px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#fff' }}>Gestão de Risco Ativa</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>Evite chargebacks e estornos antes mesmo do seu cliente reclamar no ReclameAqui.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={24} color="var(--success)" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#fff' }}>100% Automático</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>Integração invisível com a Nuvemshop usando Webhooks em tempo real.</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex' }}>
              {/* Avatares mockados */}
              {[1,2,3,4].map((i) => (
                <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #0f172a', background: '#334155', marginLeft: i === 1 ? '0' : '-12px' }}></div>
              ))}
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Junte-se a <strong style={{ color: '#fff' }}>+500 lojistas</strong> faturando mais.
            </p>
          </div>
        </div>
      </div>

      {/* Basic responsive style injection for the hidden panel on mobile */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          div[style*="flex: 1.2"] { display: none !important; }
        }
      `}} />
    </div>
  )
}
