import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';

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

    const { access_token, user_id: nuvemshopUserId } = tokenData;

    // Obter usuário logado do Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/erro?type=nao_logado', request.url));
    }

    // 2. Buscar o nome do subdomínio da loja automaticamente
    let extractedDomain = '';
    try {
      const storeInfoRes = await fetch(`https://api.nuvemshop.com.br/v1/${nuvemshopUserId}/store`, {
        headers: {
          'Authentication': `bearer ${access_token}`,
          'User-Agent': 'TrackFlow App (suporte@trackflow.com)'
        }
      });
      const storeInfo = await storeInfoRes.json();
      
      const originalDomain = storeInfo?.original_domain || storeInfo?.domains?.[0]?.name || '';
      if (originalDomain) {
        // Ex: pega apenas o "vzsports2" de vzsports2.lojavirtualnuvem.com.br
        extractedDomain = originalDomain.split('.')[0];
      }
    } catch (e) {
      console.error('Falha ao buscar dados da loja na API da Nuvemshop', e);
    }

    // Salvar o token no Supabase (na tabela stores) vinculado ao usuário
    const { error: dbError } = await supabase
      .from('stores')
      .upsert(
        { 
          user_id: user.id,
          nuvemshop_store_id: nuvemshopUserId.toString(), 
          access_token: access_token,
          ...(extractedDomain ? { store_domain: extractedDomain } : {})
        },
        { onConflict: 'nuvemshop_store_id' }
      );

    if (dbError) {
      console.error('Erro ao salvar no Supabase:', dbError);
      if (dbError.code === '42501') {
        return NextResponse.redirect(new URL('/erro?type=loja_ja_vinculada', request.url));
      }
      return NextResponse.redirect(new URL('/erro?type=generico', request.url));
    }

    // 3. Registrar os Webhooks automaticamente na Nuvemshop
    // Só funciona se NEXT_PUBLIC_APP_URL for um domínio público (na Vercel) ou usando ngrok
    const appUrl = process.env.NEXT_PUBLIC_APP_URL; 
    
    if (appUrl) {
      try {
        const eventsToWatch = ['order/created', 'order/updated'];
        for (const evt of eventsToWatch) {
          const webhookBody = {
            event: evt,
            url: `${appUrl}/api/nuvemshop/webhook`
          };

          const whRes = await fetch(`https://api.tiendanube.com/v1/${nuvemshopUserId}/webhooks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication': `bearer ${access_token}`,
              'User-Agent': 'TrackFlow App (suporte@trackflow.com)'
            },
            body: JSON.stringify(webhookBody)
          });

          // Se o webhook já existe, a Nuvemshop retorna erro informando, o que é seguro ignorar
          if (!whRes.ok) {
            const err = await whRes.json();
            console.warn(`Aviso ao registrar Webhook ${evt}:`, err.message);
          } else {
            console.log(`Webhook ${evt} registrado com sucesso para a loja ${nuvemshopUserId}!`);
          }
        }
      } catch (webhookErr) {
        console.error('Erro de rede ao registrar Webhooks:', webhookErr);
      }
    } else {
      console.warn('Variável NEXT_PUBLIC_APP_URL não encontrada. Webhooks não foram registrados (ambiente de desenvolvimento sem ngrok).');
    }

    // Redirecionar de volta para o Dashboard com sucesso
    return NextResponse.redirect(new URL('/?install=success', request.url));
  } catch (error) {
    console.error('Erro inesperado no OAuth Nuvemshop:', error);
    return NextResponse.redirect(new URL('/erro?type=generico', request.url));
  }
}
