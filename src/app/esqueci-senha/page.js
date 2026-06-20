'use client'

import { useActionState, useState } from 'react'
import { requestPasswordReset } from '../auth/actions'
import Link from 'next/link'
import { Package, ArrowLeft, MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null)
  const [emailSent, setEmailSent] = useState(false)

  // O action requestPasswordReset vai retornar { success: true }
  // Quando voltar com sucesso, podemos atualizar a UI para mostrar a mensagem
  if (state?.success && !emailSent) {
    setEmailSent(true)
  }

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
            <div style={{ padding: '10px', background: 'var(--primary)', borderRadius: '12px', boxShadow: 'var(--shadow-primary)' }}>
              <Package size={28} color="#fff" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>TrackFlow</span>
          </div>

          <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '500' }}>
            <ArrowLeft size={16} /> Voltar para o login
          </Link>

          {!emailSent ? (
            <>
              <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '700' }}>Recuperar senha</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1rem', lineHeight: '1.5' }}>
                Digite o e-mail cadastrado na sua conta. Enviaremos um link mágico para você redefinir sua senha.
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
                  {isPending ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <MailCheck size={32} color="var(--success)" />
              </div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '700' }}>Verifique seu e-mail</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.5' }}>
                Se encontrarmos uma conta com esse e-mail, um link de redefinição de senha foi enviado para você.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
