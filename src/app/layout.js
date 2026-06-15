import './globals.css';
import { Inter } from 'next/font/google';
import { LayoutDashboard, Package, Settings, Bell } from 'lucide-react';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rastreio Nuvemshop - Gestão',
  description: 'App de gestão e monitoramento logístico para Nuvemshop',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className} suppressHydrationWarning>
        <div className="layout-container">
          <aside className="sidebar">
            <div className="sidebar-logo">
              <Package className="logo-icon" size={28} color="var(--primary)" />
              <span>TrackFlow</span>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
