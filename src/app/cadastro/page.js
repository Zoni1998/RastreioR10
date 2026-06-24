'use client';

import { useActionState } from 'react';
import { signup } from '../auth/actions';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export default function CadastroPage() {
  const [state, formAction, isPending] = useActionState(signup, null);
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-[100dvh] w-full bg-background text-text-primary font-sans selection:bg-surface-hover selection:text-white">
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="w-full max-w-md mx-auto p-10 rounded-[2rem] liquid-glass border border-border/40 shadow-2xl z-10">
          <motion.div 
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-3 mb-16"
          >
            <img src="/logo.png" alt="AuraTrack" className="w-8 h-8 rounded-sm object-contain" />
            <span className="font-semibold tracking-tight text-lg">AuraTrack</span>
          </motion.div>

          <motion.div 
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-3">
              Nova operação
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed max-w-[40ch]">
              Comece a proteger sua receita em menos de 2 minutos. Insira seus dados abaixo.
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

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                Senha
              </label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                placeholder="Mínimo de 6 caracteres"
                className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm text-text-primary placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="mt-4 w-full bg-text-primary hover:bg-text-primary/90 text-background font-medium py-3 px-4 rounded-md text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isPending ? (
                <span className="animate-pulse">Criando conta...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">Continuar <ArrowRight size={16} strokeWidth={2} /></span>
              )}
            </button>
          </motion.form>

        </div>

        <motion.div 
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 z-10 text-center"
        >
          <p className="text-sm text-text-secondary">
            Já possui uma conta?{' '}
            <Link href="/login" className="text-primary hover:brightness-125 transition-colors font-medium">
              Faça login
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 bg-surface relative border-l border-border items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 w-full max-w-lg p-12 text-center">
            <h2 className="text-2xl font-medium text-text-primary mb-4">Arquitetura de retenção.</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Dezenas de lojistas confiam no AuraTrack como a última linha de defesa antes de um chargeback irreversível.
            </p>
        </div>
      </div>
    </div>
  );
}
