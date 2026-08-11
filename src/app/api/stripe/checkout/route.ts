import { NextResponse } from 'next/server';
import { PLANS, PlanType } from '@/lib/plans';
import { stripe } from '@/services/stripe';

export async function POST(request: Request) {
  try {
    const { planId, billingCycle } = (await request.json()) as {
      planId: PlanType;
      billingCycle: 'monthly' | 'yearly';
    };

    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      return NextResponse.json({
        demo: true,
        error: 'STRIPE_SECRET_KEY não configurada no .env.local',
        plan,
      });
    }

    const priceAmount = Math.round(
      (billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly) * 100
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Petia ${plan.name}`,
              description: plan.description,
            },
            unit_amount: priceAmount,
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/planos?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/planos?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro no Stripe Checkout' }, { status: 500 });
  }
}
