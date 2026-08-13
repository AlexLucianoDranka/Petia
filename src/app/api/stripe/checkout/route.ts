import { NextResponse } from 'next/server';
import { PLANS, PlanType } from '@/lib/plans';
import { stripe } from '@/services/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { planId, billingCycle, clinicId, userEmail } = (await request.json()) as {
      planId: PlanType;
      billingCycle: 'monthly' | 'yearly';
      clinicId?: string;
      userEmail?: string;
    };

    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // If Stripe keys not configured, return demo response
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_...') {
      return NextResponse.json({
        demo: true,
        message: 'Configure STRIPE_SECRET_KEY no .env.local para cobranças reais',
        plan: plan.name,
      });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string | undefined;

    if (clinicId) {
      const { data: clinic } = await supabaseAdmin
        .from('clinics')
        .select('stripe_customer_id')
        .eq('id', clinicId)
        .maybeSingle();

      stripeCustomerId = clinic?.stripe_customer_id || undefined;
    }

    if (!stripeCustomerId && userEmail) {
      // Search existing customers first
      const existing = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (existing.data.length > 0) {
        stripeCustomerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: userEmail });
        stripeCustomerId = customer.id;
      }

      // Save stripe_customer_id to clinic
      if (clinicId && stripeCustomerId) {
        await supabaseAdmin
          .from('clinics')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', clinicId);
      }
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';

    // Check if Catalog Price ID is configured in env
    const catalogPriceId = billingCycle === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;

    let lineItems: any[];

    if (catalogPriceId) {
      // Use Catalog Price ID from Stripe Dashboard
      lineItems = [
        {
          price: catalogPriceId,
          quantity: 1,
        },
      ];
    } else {
      // Fallback: Dynamic Price Data
      const priceAmount = Math.round(
        (billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly) * 100
      );
      lineItems = [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Petia ${plan.name}`,
              description: plan.description,
              images: [`${origin}/icons/petshop-icon.svg`],
            },
            unit_amount: priceAmount,
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : userEmail,
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        metadata: {
          clinic_id: clinicId || '',
          plan_id: planId,
          billing_cycle: billingCycle,
        },
      },
      line_items: lineItems,
      metadata: {
        clinic_id: clinicId || '',
        plan_id: planId,
        billing_cycle: billingCycle,
      },
      allow_promotion_codes: true,
      success_url: `${origin}/planos?success=true&session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${origin}/planos?canceled=true`,
      locale: 'pt-BR',
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[StripeCheckout] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno no Stripe Checkout' },
      { status: 500 }
    );
  }
}
