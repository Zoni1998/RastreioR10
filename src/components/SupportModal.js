'use client';

import { useState } from 'react';
import { X, Mail, Copy, CheckCircle2 } from 'lucide-react';

export default function SupportModal({ adminEmail, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(adminEmail || 'suporte@trackflow.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md rounded-[2rem] liquid-glass border border-border/40 shadow-2xl overflow-hidden"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      >
        <div className="px-6 py-5 border-b border-border/40 flex justify-between items-center bg-surface/20">
          <h2 className="text-xl font-medium flex items-center gap-3 text-text-primary tracking-tight">
            <Mail size={22} className="text-indigo-400" />
            Central de Suporte
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 md:p-8">
          <p className="mb-6 text-text-secondary text-sm md:text-base leading-relaxed">
            Para tirar dúvidas, relatar problemas ou solicitar ajuda, envie um e-mail para nossa equipe de especialistas.
          </p>

          <div className="flex items-center justify-between bg-surface/40 p-4 rounded-2xl border border-border/40 mb-8">
            <span className="font-medium text-text-primary tracking-wide text-sm md:text-base truncate mr-2">
              {adminEmail || 'suporte@trackflow.com'}
            </span>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 text-sm font-bold shrink-0 transition-colors ${copied ? 'text-emerald-400' : 'text-indigo-400 hover:brightness-125'}`}
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3.5 px-4 bg-surface/50 hover:bg-surface border border-border/40 text-text-primary rounded-xl font-medium transition-colors"
            >
              Fechar
            </button>
            <a 
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${adminEmail || 'suporte@trackflow.com'}&su=Suporte AuraTrack`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3.5 px-4 bg-text-primary hover:bg-text-primary/90 text-background rounded-xl font-medium text-center transition-colors"
            >
              Abrir no Gmail
            </a>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
}
