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
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={24} color="var(--primary)" />
            Central de Suporte
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{ padding: '24px' }}>
          <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Para tirar dúvidas, relatar problemas ou solicitar ajuda, envie um e-mail para nossa equipe de especialistas.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--background)',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            marginBottom: '24px'
          }}>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
              {adminEmail || 'suporte@trackflow.com'}
            </span>
            <button 
              onClick={handleCopy}
              style={{
                background: 'transparent',
                border: 'none',
                color: copied ? 'var(--success)' : 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem',
                fontWeight: 'bold'
              }}
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={onClose}
              style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              Fechar
            </button>
            <a 
              href={`mailto:${adminEmail || 'suporte@trackflow.com'}?subject=Suporte TrackFlow`}
              style={{ flex: 1, padding: '12px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}
            >
              Abrir E-mail
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
