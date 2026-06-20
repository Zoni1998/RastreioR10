-- Migração para Planos PRO e MAX (Templates e Transportadoras)

-- Adiciona colunas para Templates de WhatsApp na tabela stores
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS template_delayed TEXT DEFAULT 'Olá [NomeCliente], vi que o seu pedido [NumeroPedido] está demorando um pouco mais do que o esperado na transportadora. Já estou acompanhando de perto para você, ok?';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS template_shipped TEXT DEFAULT 'Olá [NomeCliente], boa notícia! Seu pedido [NumeroPedido] já foi enviado e está a caminho. Você pode acompanhar por este código: [CodigoRastreio].';
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS template_pending TEXT DEFAULT 'Olá [NomeCliente], tudo bem? Notei que você iniciou um pedido ([NumeroPedido]) mas o pagamento ainda está pendente. Ficou com alguma dúvida ou teve algum problema na hora de pagar?';

-- Adiciona coluna para Transportadora na tabela orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_company VARCHAR(255);
