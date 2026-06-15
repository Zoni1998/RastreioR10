import { supabase } from '../../utils/supabase';
import { Settings, Save, Store, Info } from 'lucide-react';
import { updateStoreConfig } from './actions';

export const dynamic = 'force-dynamic';

export default async function ConfiguracoesPage() {
  // Pegar a loja (assumindo single tenant por enquanto)
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .limit(1)
    .single();

  if (!store) {
    return (
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
        <p style={{color: 'var(--text-secondary)'}}>Nenhuma loja vinculada. Vá ao Dashboard e Sincronize.</p>
      </div>
    );
  }

  const postingDays = store.posting_delay_days || 7;
  const deliveryDays = store.delivery_delay_days || 25;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Settings size={28} color="var(--primary)" style={{ marginRight: '12px', verticalAlign: 'middle' }} />
          Configurações
        </h1>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: '1fr', maxWidth: '800px' }}>
        
        {/* Card de Integração */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={20} color="var(--text-secondary)" /> Integração Nuvemshop
          </h2>
          <div style={{ padding: '16px', backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>ID da Loja (User ID):</p>
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{store.nuvemshop_store_id}</p>
            
            <p style={{ margin: '16px 0 8px 0', color: 'var(--text-secondary)' }}>Data da Conexão:</p>
            <p style={{ margin: 0 }}>{new Date(store.created_at).toLocaleDateString('pt-BR')} às {new Date(store.created_at).toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>

        {/* Card de Regras de Negócio */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={20} color="var(--text-secondary)" /> Regras de Atraso
          </h2>
          
          <form action={updateStoreConfig} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <input type="hidden" name="storeId" value={store.id} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="postingDays" style={{ fontWeight: '500' }}>Tolerância para Postagem (dias)</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Quantos dias o lojista tem para embalar e enviar o produto (marcar como enviado) antes de gerar um Alerta Amarelo.
              </p>
              <input 
                type="number" 
                id="postingDays" 
                name="postingDays" 
                defaultValue={postingDays} 
                min="1" max="60"
                style={{
                  padding: '12px', borderRadius: '8px', border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)', color: 'var(--text-primary)',
                  fontSize: '1rem', width: '150px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="deliveryDays" style={{ fontWeight: '500' }}>Tolerância para Entrega (dias)</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Quantos dias a transportadora tem para entregar o pacote após a compra, antes de gerar um Alerta Vermelho.
              </p>
              <input 
                type="number" 
                id="deliveryDays" 
                name="deliveryDays" 
                defaultValue={deliveryDays} 
                min="1" max="90"
                style={{
                  padding: '12px', borderRadius: '8px', border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)', color: 'var(--text-primary)',
                  fontSize: '1rem', width: '150px'
                }}
              />
            </div>

            <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', alignSelf: 'flex-start' }}>
              <Save size={18} />
              Salvar Regras
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
