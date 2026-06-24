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
        className="!fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 liquid-glass rounded-full text-text-secondary hover:text-text-primary border border-border/40 shadow-lg hover:shadow-xl transition-all z-[998] hover:-translate-y-1 group"
        title="Falar com o Suporte"
      >
        <LifeBuoy size={18} className="group-hover:text-primary transition-colors" />
        <span className="text-sm font-medium">Suporte</span>
      </button>

      <SupportModal 
        adminEmail={adminEmail} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
