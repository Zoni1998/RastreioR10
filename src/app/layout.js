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
import { ThemeProvider } from '../components/ThemeProvider';
import ThemeSwitcher from '../components/ThemeSwitcher';

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

  // Buscar informações da loja incluindo as de tema
  const { data: store } = await supabase
    .from('stores')
    .select('id, store_domain, current_plan, ui_theme, ui_custom_colors')
    .eq('user_id', user.id)
    .single();
    
  const storeName = store?.store_domain || 'Lojista';
  const initialTheme = store?.ui_theme || 'dark';
  const initialCustomColors = store?.ui_custom_colors || {};
  const storeId = store?.id;

  return (
    <html lang="pt-BR">
      <body className={outfit.className} suppressHydrationWarning>
        <ThemeProvider initialTheme={initialTheme} initialCustomColors={initialCustomColors} storeId={storeId}>
          <div className="layout-container">
            <NavigationSidebar storeName={storeName} isAdmin={user?.email === process.env.ADMIN_EMAIL} />
            
            <main className="main-content">
              {children}
            </main>
          </div>
          <ThemeSwitcher currentPlan={store?.current_plan} />
        </ThemeProvider>
      </body>
    </html>
  );
}
