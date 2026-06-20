-- Adicionar colunas de tema na tabela stores
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS ui_theme VARCHAR(50) DEFAULT 'dark',
ADD COLUMN IF NOT EXISTS ui_custom_colors JSONB DEFAULT '{}'::jsonb;
