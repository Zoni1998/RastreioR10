'use client';

import { useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import SupportModal from './SupportModal';

export default function SupportButton({ adminEmail }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '9999px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.2s ease',
          zIndex: 998
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.color = 'var(--primary)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        title="Falar com o Suporte"
      >
        <LifeBuoy size={18} />
        Precisa de ajuda?
      </button>

      <SupportModal 
        adminEmail={adminEmail} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
