'use client'

import { useActionState } from 'react'
import { signup } from '../auth/actions'
import Link from 'next/link'
import { Package, ArrowRight, TrendingUp, BarChart3 } from 'lucide-react'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, null)

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

          <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '700' }}>Crie sua conta</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1rem' }}>
            Comece a monitorar a saúde logística do seu e-commerce gratuitamente.
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
              <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>Crie uma senha forte</label>
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
              {isPending ? 'Criando conta...' : (
                <>Criar Conta Grátis <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Já tem uma conta? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Fazer login</Link>
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
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '300px', height: '300px', background: 'var(--info)', borderRadius: '50%', filter: 'blur(150px)', opacity: '0.1' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '400px', height: '400px', background: 'var(--primary)', borderRadius: '50%', filter: 'blur(150px)', opacity: '0.15' }}></div>
        
        <div style={{ zIndex: 1, maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '24px', lineHeight: '1.2' }}>
            Retenha lucro que você nem sabia que estava perdendo.
          </h2>
          
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} color="var(--info)" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#fff' }}>Escala Sustentável</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>Conforme você escala, os erros logísticos não escalam junto.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={24} color="var(--warning)" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#fff' }}>Dashboard Executivo</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>Veja a saúde da sua operação em uma única tela orientada a dados reais.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          div[style*="flex: 1.2"] { display: none !important; }
        }
      `}} />
    </div>
  )
}
