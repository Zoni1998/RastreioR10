import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default async function ErrorPage({ searchParams }) {
  const params = await searchParams;
  const type = params?.type;
  
  let title = 'Erro na Integração';
  let message = 'Ocorreu um erro inesperado ao tentar conectar com a Nuvemshop. Por favor, tente novamente mais tarde.';
  
  if (type === 'loja_ja_vinculada') {
    title = 'Loja Já Vinculada';
    message = 'Essa loja da Nuvemshop já está vinculada a outra conta aqui no TrackFlow. Se você está tentando testar com uma conta nova, por favor, certifique-se de sair da sua conta na Nuvemshop primeiro ou use uma Guia Anônima para vincular uma loja diferente!';
  } else if (type === 'auth_falhou') {
    title = 'Falha na Autorização';
    message = 'Não foi possível autorizar o aplicativo. Verifique se você aceitou todas as permissões necessárias.';
  } else if (type === 'nao_logado') {
    title = 'Sessão Expirada';
    message = 'Você precisa estar logado no TrackFlow para conectar uma loja. Faça login e tente novamente.';
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: 'var(--background)'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '40px 32px' }}>
        <AlertCircle size={64} color="var(--danger)" style={{ marginBottom: '24px' }} />
        
        <h1 style={{ fontSize: '1.75rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
          {title}
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
          {message}
        </p>

        <Link href="/" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <ArrowLeft size={18} />
          Voltar para o Painel
        </Link>
      </div>
    </div>
  );
}
