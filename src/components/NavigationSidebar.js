'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Package, Settings, Bell, 
  LogOut, Shield, Users, Activity, Target, ShoppingCart
} from 'lucide-react';
import { logout } from '../app/auth/actions';

export default function NavigationSidebar({ storeName, isAdmin }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute && isAdmin) {
    // SIDEBAR DO ADMIN
    return (
      <aside className="sidebar" style={{ background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="sidebar-logo">
          <Shield className="logo-icon" size={28} color="#8b5cf6" />
          <span style={{ color: '#fff' }}>TrackFlow HQ</span>
        </div>

        <div style={{ marginBottom: '24px', padding: '0 16px' }}>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>Nível de Acesso</p>
          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.1rem', color: '#8b5cf6' }}>
            Fundador / CEO
          </p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <Link href="/admin" className={`nav-link ${pathname === '/admin' ? 'active' : ''}`} style={{ color: '#e5e7eb' }}>
            <Activity size={20} />
            Comando Central
          </Link>
          <Link href="/admin/clientes" className={`nav-link ${pathname?.startsWith('/admin/clientes') ? 'active' : ''}`} style={{ color: '#e5e7eb' }}>
            <Users size={20} />
            Lojas & Clientes
          </Link>
          <Link href="/admin/config" className={`nav-link ${pathname?.startsWith('/admin/config') ? 'active' : ''}`} style={{ color: '#e5e7eb' }}>
            <Settings size={20} />
            Configurações SaaS
          </Link>

          <Link href="/" className="nav-link" style={{ marginTop: 'auto', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <LayoutDashboard size={20} />
            Sair do Modo HQ
          </Link>
          
          <form action={logout}>
            <button type="submit" className="nav-link" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#ef4444', marginTop: '8px' }}>
              <LogOut size={20} />
              Fazer Logout
            </button>
          </form>
        </nav>
      </aside>
    );
  }

  // SIDEBAR DO LOJISTA
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Package className="logo-icon" size={28} color="var(--primary)" />
        <span>TrackFlow</span>
      </div>

      <div style={{ marginBottom: '24px', padding: '0 16px' }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Olá,</p>
        <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {storeName}!
        </p>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link href="/pedidos" className={`nav-link ${pathname?.startsWith('/pedidos') ? 'active' : ''}`}>
          <Package size={20} />
          Pedidos
        </Link>
        <Link href="/alertas" className={`nav-link ${pathname?.startsWith('/alertas') ? 'active' : ''}`}>
          <Bell size={20} />
          Alertas
        </Link>
        <Link href="/recuperacao" className={`nav-link ${pathname?.startsWith('/recuperacao') ? 'active' : ''}`} style={{ color: '#10b981' }}>
          <ShoppingCart size={20} />
          Recuperação
        </Link>
        <Link href="/configuracoes" className={`nav-link ${pathname?.startsWith('/configuracoes') ? 'active' : ''}`} style={{ marginTop: 'auto' }}>
          <Settings size={20} />
          Configurações
        </Link>
        
        {isAdmin && (
          <Link href="/admin" className="nav-link" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', fontWeight: 'bold' }}>
            <Target size={20} />
            Modo Fundador (HQ)
          </Link>
        )}
        
        <form action={logout}>
          <button type="submit" className="nav-link" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)', marginTop: '8px' }}>
            <LogOut size={20} />
            Sair
          </button>
        </form>
      </nav>
    </aside>
  );
}
