'use client'

import { useActionState } from 'react'
import { updatePassword } from '../auth/actions'
import { ShieldCheck } from 'lucide-react'

export default function NewPasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePassword, null)

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px 24px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ padding: '10px', background: 'var(--success)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
              <ShieldCheck size={28} color="#fff" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Segurança</span>
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '700' }}>Crie uma nova senha</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1rem', lineHeight: '1.5' }}>
            Sua nova senha deve ser diferente das senhas anteriores e ter no mínimo 6 caracteres.
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
              <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>Nova Senha</label>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="confirmPassword" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>Confirme a Nova Senha</label>
              <input 
                id="confirmPassword" 
                name="confirmPassword" 
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
              {isPending ? 'Salvando...' : 'Redefinir Senha e Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
