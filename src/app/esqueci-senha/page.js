'use client';

import { useActionState, useState, useEffect } from 'react';
import { requestPasswordReset } from '../auth/actions';
import Link from 'next/link';
import { Package, ArrowLeft, MailCheck, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null);
  const [emailSent, setEmailSent] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (state?.success && !emailSent) {
      setEmailSent(true);
    }
  }, [state, emailSent]);

  return (
    <div className="flex min-h-[100dvh] w-full bg-background text-text-primary font-sans selection:bg-surface-hover selection:text-white items-center justify-center relative overflow-hidden">
      {/* Background Grids / Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <div className="w-full max-w-md p-10 relative z-10 rounded-3xl liquid-glass shadow-2xl">
        <motion.div 
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-3 mb-10"
        >
          <img src="/logo.png" alt="AuraTrack" className="w-8 h-8 rounded-sm object-contain" />
          <span className="font-semibold tracking-tight text-lg">AuraTrack</span>
        </motion.div>

        <Link 
          href="/login" 
          className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-secondary transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Voltar para o login
        </Link>

        {!emailSent ? (
          <>
            <motion.div 
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="mb-8"
            >
              <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-3">
                Recuperar senha
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                Digite o e-mail cadastrado na sua operação. Enviaremos um link mágico para redefinição.
              </p>
            </motion.div>

            <motion.form 
              action={formAction} 
              className="flex flex-col gap-5"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            >
              {state?.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-md text-sm font-medium">
                  {state.error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                  E-mail profissional
                </label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="nome@empresa.com.br"
                  className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm text-text-primary placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all"
                />
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="mt-2 w-full bg-text-primary hover:bg-text-primary/90 text-background font-medium py-3 px-4 rounded-md text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isPending ? (
                  <span className="animate-pulse">Enviando link...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">Enviar link <ArrowRight size={16} strokeWidth={2} /></span>
                )}
              </button>
            </motion.form>
          </>
        ) : (
          <motion.div 
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-6">
              <MailCheck size={28} className="text-text-secondary" />
            </div>
            <h1 className="text-2xl font-medium tracking-tight mb-3 text-text-primary">
              Verifique seu e-mail
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed">
              Se o e-mail informado estiver em nossa base, você receberá um link seguro para redefinir sua senha.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
