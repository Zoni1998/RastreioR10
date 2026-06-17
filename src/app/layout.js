import './globals.css';
import { Outfit } from 'next/font/google';
import { LayoutDashboard, Package, Settings, Bell } from 'lucide-react';
import Link from 'next/link';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
  title: 'TrackFlow - Gestão Logística Premium',
  description: 'O melhor SaaS de gestão logística e retenção de receita para E-commerces.',
};

import { createClient } from '../utils/supabase/server';
import { logout } from './auth/actions';
import { LogOut } from 'lucide-react';

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <html lang="pt-BR">
        <body className={outfit.className} suppressHydrationWarning>
          <main style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--background)' }}>
            {children}
          </main>
        </body>
      </html>
    );
  }

  // Buscar nome da loja para a saudação
  const { data: store } = await supabase.from('stores').select('store_domain').eq('user_id', user.id).single();
  const storeName = store?.store_domain || 'Lojista';

  return (
    <html lang="pt-BR">
      <body className={outfit.className} suppressHydrationWarning>
        <div className="layout-container">
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
              <Link href="/" className="nav-link active">
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link href="/pedidos" className="nav-link">
                <Package size={20} />
                Pedidos
              </Link>
              <Link href="/alertas" className="nav-link">
                <Bell size={20} />
                Alertas
              </Link>
              <Link href="/configuracoes" className="nav-link" style={{ marginTop: 'auto' }}>
                <Settings size={20} />
                Configurações
              </Link>
              
              <form action={logout}>
                <button type="submit" className="nav-link" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)', marginTop: '8px' }}>
                  <LogOut size={20} />
                  Sair
                </button>
              </form>
            </nav>
          </aside>
          
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
