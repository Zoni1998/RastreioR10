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
import NavigationSidebar from '../components/NavigationSidebar';

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
          <NavigationSidebar storeName={storeName} isAdmin={user?.email === process.env.ADMIN_EMAIL} />
          
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
