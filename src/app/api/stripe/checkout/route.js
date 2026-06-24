import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Versão atualizada
});

const PLAN_PRICES = {
  pro: {
    name: 'AuraTrack Pro',
    amount: 7990, // R$ 79,90 em centavos
  },
  max: {
    name: 'AuraTrack Max',
    amount: 11990, // R$ 119,90 em centavos
  }
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const planId = formData.get('planId');

    if (!PLAN_PRICES[planId]) {
      return NextResponse.redirect(new URL('/assinatura?error=Plano inválido', request.url));
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Buscar a loja do usuário
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, stripe_customer_id, current_plan')
      .eq('user_id', user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.redirect(new URL('/assinatura?error=Loja não encontrada', request.url));
    }

    if (store.current_plan === planId) {
      return NextResponse.redirect(new URL('/assinatura?error=Você já possui este plano', request.url));
    }

    let customerId = store.stripe_customer_id;

    // Se não tiver Customer na Stripe, criar um
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          storeId: store.id,
          userId: user.id
        }
      });
      customerId = customer.id;

      // Salvar no Supabase
      await supabase
        .from('stores')
        .update({ stripe_customer_id: customerId })
        .eq('id', store.id);
    }

    // Configuração base da sessão de Checkout
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: PLAN_PRICES[planId].name,
              description: `Assinatura Mensal - ${PLAN_PRICES[planId].name}`,
            },
            unit_amount: PLAN_PRICES[planId].amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/assinatura?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/assinatura?canceled=true`,
      metadata: {
        storeId: store.id,
        planId: planId
      }
    };

    // Criar a sessão de Checkout da Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        ...sessionConfig,
        customer: customerId,
      });
    } catch (checkoutErr) {
      // Se o erro for de cliente não encontrado (provavelmente migração Test -> Live)
      if (checkoutErr.code === 'resource_missing' && checkoutErr.param === 'customer') {
        console.log('Cliente não encontrado na Stripe. Criando um novo...');
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            storeId: store.id,
            userId: user.id
          }
        });
        customerId = newCustomer.id;

        // Atualiza o banco com o ID válido de produção
        await supabase
          .from('stores')
          .update({ stripe_customer_id: customerId })
          .eq('id', store.id);

        // Tenta criar a sessão novamente com o novo cliente
        session = await stripe.checkout.sessions.create({
          ...sessionConfig,
          customer: customerId,
        });
      } else {
        throw checkoutErr; // Se for outro erro, joga pro catch principal
      }
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('Erro no Checkout da Stripe:', err);
    return NextResponse.redirect(new URL('/assinatura?error=Erro ao gerar pagamento', request.url));
  }
}
