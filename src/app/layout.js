import './globals.css';
import { Geist } from 'next/font/google';
import { LayoutDashboard, Package, Settings, Bell } from 'lucide-react';
import Link from 'next/link';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'AuraTrack - Gestão Logística Premium',
  description: 'O melhor SaaS de gestão logística e retenção de receita para E-commerces.',
};

import { createClient } from '../utils/supabase/server';
import NavigationSidebar from '../components/NavigationSidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import ThemeSwitcher from '../components/ThemeSwitcher';
import SupportButton from '../components/SupportButton';

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <html lang="pt-BR">
        <body className={geist.className} suppressHydrationWarning>
          <main style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--background)' }}>
            {children}
            <SupportButton adminEmail={process.env.ADMIN_EMAIL} />
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
    
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get('trackflow_theme')?.value;
  const cookieColors = cookieStore.get('trackflow_custom_colors')?.value;

  const storeName = store?.store_domain || 'Lojista';
  const initialTheme = store?.ui_theme || cookieTheme || 'dark';
  const initialCustomColors = store?.ui_custom_colors || (cookieColors ? JSON.parse(cookieColors) : {});
  const storeId = store?.id;

  return (
    <html lang="pt-BR">
      <body className={geist.className} suppressHydrationWarning>
        <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
          <defs>
            <filter id="liquid-glass" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
              <feImage
                x="0" y="0" width="100%" height="100%"
                preserveAspectRatio="none"
                result="map"
                href="data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.015' numOctaves='3' seed='5'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23r)'/%3E%3C/svg%3E"
              />
              <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" scale="-50" result="dispRed"/>
              <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
              <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" scale="-47" result="dispGreen"/>
              <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green"/>
              <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" scale="-44" result="dispBlue"/>
              <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue"/>
              <feBlend in="red" in2="green" mode="screen" result="rg"/>
              <feBlend in="rg" in2="blue" mode="screen"/>
            </filter>
          </defs>
        </svg>
        <ThemeProvider initialTheme={initialTheme} initialCustomColors={initialCustomColors} storeId={storeId}>
          <div className="flex flex-col md:flex-row min-h-[100dvh] bg-background text-text-primary w-full overflow-hidden relative">
            {/* Global Cyber Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
            
            <NavigationSidebar storeName={storeName} isAdmin={user?.email === process.env.ADMIN_EMAIL} adminEmail={process.env.ADMIN_EMAIL} />
            
            <main className="flex-1 w-full relative overflow-y-auto z-10">
              <div className="max-w-[1400px] mx-auto w-full p-4 md:p-8">
                {children}
              </div>
            </main>
          </div>
          <ThemeSwitcher currentPlan={store?.current_plan} isAdmin={user?.email === process.env.ADMIN_EMAIL} />
        </ThemeProvider>
      </body>
    </html>
  );
}
