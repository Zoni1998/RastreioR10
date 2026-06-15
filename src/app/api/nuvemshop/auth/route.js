import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase';

// GET /api/nuvemshop/auth
// Este endpoint recebe o "code" da Nuvemshop após o lojista aceitar instalar o App.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const storeId = searchParams.get('store'); // A Nuvemshop também manda a id da loja no retorno (opcional)
    
    if (!code) {
      return NextResponse.json({ error: 'Nenhum código de autorização fornecido.' }, { status: 400 });
    }

    const clientId = process.env.NUVEMSHOP_CLIENT_ID;
    const clientSecret = process.env.NUVEMSHOP_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Credenciais do App Nuvemshop não configuradas no servidor.' }, { status: 500 });
    }

    // Fazer o POST para trocar o Code pelo Access Token
    const tokenResponse = await fetch('https://www.tiendanube.com/apps/authorize/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Erro ao buscar token:', tokenData);
      return NextResponse.json({ error: 'Falha ao autenticar com a Nuvemshop', details: tokenData }, { status: tokenResponse.status });
    }

    const { access_token, user_id } = tokenData;

    // Salvar o token no Supabase (na tabela stores)
    const { error: dbError } = await supabase
      .from('stores')
      .upsert(
        { 
          nuvemshop_store_id: user_id.toString(), 
          access_token: access_token 
        },
        { onConflict: 'nuvemshop_store_id' }
      );

    if (dbError) {
      console.error('Erro ao salvar no Supabase:', dbError);
      return NextResponse.json({ error: 'Erro ao salvar loja no banco de dados.' }, { status: 500 });
    }

    // Redirecionar de volta para o Dashboard com sucesso
    return NextResponse.redirect(new URL('/?install=success', request.url));
  } catch (error) {
    console.error('Erro inesperado no OAuth Nuvemshop:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
