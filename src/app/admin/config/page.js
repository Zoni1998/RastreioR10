import { Settings, Shield, Server, Key } from 'lucide-react';
import { createClient } from '../../../utils/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminConfigPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/pedidos');
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', animation: 'fadeIn 0.5s ease-out' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={28} color="#8b5cf6" /> Configurações Globais do SaaS
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Status das integrações, variáveis de ambiente e segurança.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Server color="#10b981" />
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Integração Nuvemshop</h2>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Status da API</span>
              <span style={{ color: '#10b981', fontWeight: '500', fontSize: '0.9rem' }}>Operacional</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Client ID</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{process.env.NUVEMSHOP_CLIENT_ID ? 'Configurado ✓' : 'Faltando ⚠️'}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Shield color="#3b82f6" />
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Autenticação (Supabase)</h2>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Service Role Key</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Presente ✓' : 'Faltando ⚠️'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Admin Principal</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#8b5cf6' }}>{process.env.ADMIN_EMAIL}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Key color="#f59e0b" />
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Pagamentos (Stripe)</h2>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Secret Key</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{process.env.STRIPE_SECRET_KEY ? 'Configurada ✓' : 'Faltando ⚠️'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Webhook Secret</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{process.env.STRIPE_WEBHOOK_SECRET ? 'Configurado ✓' : 'Faltando ⚠️'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
