import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Precisa usar a chave Service Role para dar bypass na segurança
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Bypass no RLS do Supabase para atualizar o banco via Webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature');

  let event;

  try {
    // Se o webhook secret não estiver definido (desenvolvimento), a gente burla a assinatura para facilitar testes locais.
    // Em produção, você precisa pegar a STRIPE_WEBHOOK_SECRET no painel da Stripe.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      event = JSON.parse(body); // Apenas para debug local rápido
    }
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Lidar com o evento de pagamento concluído
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Pegar as informações que passamos na criação do checkout
    const storeId = session.metadata.storeId;
    const planId = session.metadata.planId;
    const subscriptionId = session.subscription;

    if (storeId && planId) {
      console.log(`✅ Pagamento confirmado para a loja ${storeId}. Plano: ${planId}`);
      
      await supabaseAdmin
        .from('stores')
        .update({
          current_plan: planId,
          plan_status: 'active',
          stripe_subscription_id: subscriptionId,
        })
        .eq('id', storeId);
    }
  }

  // Lidar com cancelamentos
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    
    await supabaseAdmin
      .from('stores')
      .update({
        current_plan: 'start', // Volta pro plano grátis/básico
        plan_status: 'canceled',
      })
      .eq('stripe_subscription_id', subscription.id);
      
    console.log(`❌ Assinatura cancelada: ${subscription.id}`);
  }

  return new NextResponse('Webhook recebido com sucesso', { status: 200 });
}
