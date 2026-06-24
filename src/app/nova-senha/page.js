'use client';

import { useActionState } from 'react';
import { updatePassword } from '../auth/actions';
import { Package, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export default function NewPasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePassword, null);
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-[100dvh] w-full bg-background text-text-primary font-sans selection:bg-surface-hover selection:text-white items-center justify-center relative overflow-hidden">
      {/* Background Grids / Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <div className="w-full max-w-md px-8 py-12 relative z-10 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl liquid-glass">
        <motion.div 
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-3 mb-10"
        >
          <img src="/logo.png" alt="AuraTrack" className="w-8 h-8 rounded-sm object-contain" />
          <span className="font-semibold tracking-tight text-lg">AuraTrack</span>
        </motion.div>

        <motion.div 
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-10 h-10 mb-6 rounded-full bg-surface border border-border flex items-center justify-center">
            <ShieldCheck size={20} className="text-text-secondary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-3">
            Nova senha
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            Sua nova senha deve ser diferente das senhas anteriores e ter no mínimo 6 caracteres.
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
            <label htmlFor="password" className="text-xs font-medium text-text-secondary uppercase tracking-widest">
              Senha
            </label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm text-text-primary placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-xs font-medium text-text-secondary uppercase tracking-widest">
              Confirmar Senha
            </label>
            <input 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full bg-surface border border-border rounded-md px-4 py-3 text-sm text-text-primary placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="mt-2 w-full bg-text-primary hover:bg-text-primary/90 text-background font-medium py-3 px-4 rounded-md text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isPending ? (
              <span className="animate-pulse">Salvando...</span>
            ) : (
              <span className="flex items-center justify-center gap-2">Redefinir e Entrar <ArrowRight size={16} strokeWidth={2} /></span>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
