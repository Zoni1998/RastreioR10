-- Esquema de Banco de Dados para Supabase

-- Tabela de Lojas (Configurações da Nuvemshop)
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nuvemshop_store_id VARCHAR(255) UNIQUE NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    posting_delay_days INTEGER DEFAULT 7,
    delivery_delay_days INTEGER DEFAULT 25,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    nuvemshop_order_id VARCHAR(255) UNIQUE NOT NULL,
    order_number VARCHAR(50),
    customer_name VARCHAR(255),
    total_amount DECIMAL(10, 2),
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
    shipping_status VARCHAR(50) DEFAULT 'unfulfilled', -- unfulfilled, shipped, delivered, delayed_posting, delayed_delivery, customs_hold
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, abandoned
    tracking_code VARCHAR(255),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- delayed_posting, delayed_delivery, customs_hold
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para otimizar as buscas por store_id
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_notifications_store_id ON notifications(store_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Atualiza a função updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de Segurança (Row-Level Security)
-- Isso garante que cada Lojista só veja e edite os seus próprios dados!

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas da tabela STORES
CREATE POLICY "Lojistas podem ver suas próprias lojas" ON stores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Lojistas podem inserir suas próprias lojas" ON stores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lojistas podem atualizar suas próprias lojas" ON stores
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lojistas podem deletar suas próprias lojas" ON stores
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas da tabela ORDERS
CREATE POLICY "Lojistas podem ver seus pedidos" ON orders
    FOR SELECT USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Lojistas podem inserir seus pedidos" ON orders
    FOR INSERT WITH CHECK (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Lojistas podem atualizar seus pedidos" ON orders
    FOR UPDATE USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())) WITH CHECK (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Políticas da tabela NOTIFICATIONS
CREATE POLICY "Lojistas podem ver suas notificações" ON notifications
    FOR SELECT USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

CREATE POLICY "Lojistas podem atualizar suas notificações" ON notifications
    FOR UPDATE USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())) WITH CHECK (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

