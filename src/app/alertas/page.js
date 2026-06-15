import { supabase } from '../../utils/supabase';
import { Bell, Check, PackageX, AlertTriangle, Inbox } from 'lucide-react';
import { resolveAlertAction } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AlertasPage() {
  // Buscar notificações ativas (não lidas)
  const { data: notifications } = await supabase
    .from('notifications')
    .select(`
      *,
      order:orders (
        order_number,
        customer_name,
        nuvemshop_order_id
      )
    `)
    .eq('is_read', false)
    .order('created_at', { ascending: false });

  const safeNotifs = notifications || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title">
          <Bell size={28} color="var(--primary)" style={{ marginRight: '12px', verticalAlign: 'middle' }} />
          Caixa de Alertas
        </h1>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {safeNotifs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              <Inbox size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h2>Tudo Limpo!</h2>
              <p>Você não tem nenhum alerta pendente no momento.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {safeNotifs.map((notif) => {
                const isPostingDelay = notif.type === 'delayed_posting';
                const Icon = isPostingDelay ? PackageX : AlertTriangle;
                const color = isPostingDelay ? 'var(--warning)' : 'var(--danger)';
                const title = isPostingDelay ? 'Atraso na Postagem' : 'Atraso no Recebimento';

                return (
                  <div key={notif.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '20px', 
                    backgroundColor: 'var(--background)', 
                    borderRadius: '8px', 
                    borderLeft: `4px solid ${color}`,
                    borderTop: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '50%' }}>
                        <Icon size={24} color={color} />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{title} - Pedido #{notif.order?.order_number}</h3>
                        <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>{notif.message}</p>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Cliente: </span>
                          <strong>{notif.order?.customer_name}</strong>
                          <span style={{ margin: '0 8px', color: 'var(--border)' }}>|</span>
                          <span style={{ color: 'var(--text-secondary)' }}>Gerado em: </span>
                          {new Date(notif.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      <a 
                        href={`https://vzsports2.lojavirtualnuvem.com.br/admin/orders/${notif.order?.nuvemshop_order_id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-outline"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        Ver na Nuvemshop
                      </a>
                      
                      <form action={resolveAlertAction}>
                        <input type="hidden" name="notificationId" value={notif.id} />
                        <button type="submit" className="btn" style={{ fontSize: '0.85rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> Resolver
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
