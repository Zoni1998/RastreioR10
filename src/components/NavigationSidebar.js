'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Package, Settings, Bell, 
  LogOut, Shield, Users, Activity, Target, ShoppingCart
} from 'lucide-react';
import { logout } from '../app/auth/actions';
import SupportModal from './SupportModal';

export default function NavigationSidebar({ storeName, isAdmin, adminEmail }) {
  const pathname = usePathname();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const isAdminRoute = pathname?.startsWith('/admin');

  // Classes padrão do botão (estilo B2B premium)
  const baseLinkClass = "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group";
  const activeLinkClass = "bg-surface-hover/50 text-text-primary shadow-[inset_2px_0_0_0_#fff]";
  const inactiveLinkClass = "text-text-secondary hover:text-text-primary hover:bg-surface-hover/30";

  if (isAdminRoute && isAdmin) {
    return (
      <aside className="w-full md:w-64 liquid-glass border border-border/40 p-5 flex flex-col gap-4 z-20 m-4 rounded-[2rem] shadow-xl shrink-0 h-[calc(100vh-32px)]">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-indigo-500/10 p-1.5 rounded-sm border border-indigo-500/20">
            <Shield size={20} className="text-indigo-400" />
          </div>
          <span className="font-semibold text-text-primary tracking-tight">AuraTrack HQ</span>
        </div>

        <div className="px-1 mb-4">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-1">Acesso</p>
          <p className="font-medium text-sm text-indigo-400">Fundador / CEO</p>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          <Link href="/admin" className={`${baseLinkClass} ${pathname === '/admin' ? activeLinkClass : inactiveLinkClass}`}>
            <Activity size={18} className={pathname === '/admin' ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-secondary'} />
            Comando Central
          </Link>
          <Link href="/admin/clientes" className={`${baseLinkClass} ${pathname?.startsWith('/admin/clientes') ? activeLinkClass : inactiveLinkClass}`}>
            <Users size={18} className={pathname?.startsWith('/admin/clientes') ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-secondary'} />
            Lojas & Clientes
          </Link>
          <Link href="/admin/config" className={`${baseLinkClass} ${pathname?.startsWith('/admin/config') ? activeLinkClass : inactiveLinkClass}`}>
            <Settings size={18} className={pathname?.startsWith('/admin/config') ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-secondary'} />
            Configurações SaaS
          </Link>

          <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-border">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
              <LayoutDashboard size={18} />
              Sair do Modo HQ
            </Link>
            
            <form action={logout}>
              <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left">
                <LogOut size={18} />
                Fazer Logout
              </button>
            </form>
          </div>
        </nav>
      </aside>
    );
  }

  // SIDEBAR DO LOJISTA
  return (
    <>
      <aside className="w-full md:w-64 liquid-glass border border-border/40 p-5 flex flex-col gap-4 z-20 m-4 rounded-[2rem] shadow-xl shrink-0 h-[calc(100vh-32px)]">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="AuraTrack" className="w-8 h-8 rounded-sm object-contain" />
          <span className="font-semibold text-text-primary tracking-tight">AuraTrack</span>
        </div>

        <div className="px-1 mb-4">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-1">Operação</p>
          <p className="font-medium text-sm text-text-primary capitalize truncate" title={storeName}>
            {storeName || 'Sua Loja'}
          </p>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          <Link href="/" className={`${baseLinkClass} ${pathname === '/' ? activeLinkClass : inactiveLinkClass}`}>
            <LayoutDashboard size={18} className={pathname === '/' ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-secondary'} />
            Dashboard
          </Link>
          <Link href="/pedidos" className={`${baseLinkClass} ${pathname?.startsWith('/pedidos') ? activeLinkClass : inactiveLinkClass}`}>
            <Package size={18} className={pathname?.startsWith('/pedidos') ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-secondary'} />
            Pedidos
          </Link>
          <Link href="/alertas" className={`${baseLinkClass} ${pathname?.startsWith('/alertas') ? activeLinkClass : inactiveLinkClass}`}>
            <Bell size={18} className={pathname?.startsWith('/alertas') ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-secondary'} />
            Alertas
          </Link>
          <Link href="/recuperacao" className={`${baseLinkClass} ${pathname?.startsWith('/recuperacao') ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_2px_0_0_0_#34d399]' : 'text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/5'}`}>
            <ShoppingCart size={18} />
            Recuperação
          </Link>

          <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-border">
            <Link href="/configuracoes" className={`${baseLinkClass} ${pathname?.startsWith('/configuracoes') ? activeLinkClass : inactiveLinkClass}`}>
              <Settings size={18} className={pathname?.startsWith('/configuracoes') ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-secondary'} />
              Configurações
            </Link>
            
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all mt-2">
                <Target size={18} />
                Modo Fundador (HQ)
              </Link>
            )}
            
            <button 
              onClick={() => setIsSupportModalOpen(true)} 
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover/30 transition-all text-left"
            >
              <Shield size={18} className="text-text-secondary" />
              Falar com Suporte
            </button>

            <form action={logout}>
              <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-all text-left mt-2">
                <LogOut size={18} className="text-text-secondary group-hover:text-red-400" />
                Sair da conta
              </button>
            </form>
          </div>
        </nav>
      </aside>

      <SupportModal 
        adminEmail={adminEmail} 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
      />
    </>
  );
}
