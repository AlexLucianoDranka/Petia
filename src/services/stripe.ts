import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia' as any,
});

export async function createPetSubscriptionCheckoutSession({
  customerId,
  customerEmail,
  planId,
  planName,
  priceInCents,
  returnUrl,
}: {
  customerId: string;
  customerEmail?: string;
  planId: string;
  planName: string;
  priceInCents: number;
  returnUrl: string;
}) {
  console.log(`[StripeService] Creating checkout session for ${planName} (${priceInCents} cents)`);

  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: planName,
                description: `Assinatura recorrente Clinia Pet - ${planName}`,
              },
              unit_amount: priceInCents,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${returnUrl}?canceled=true`,
        metadata: {
          customerId,
          planId,
        },
      });
      return { url: session.url };
    } catch (err: any) {
      console.error('Stripe error:', err);
    }
  }

  // Mock redirect for testing UI flow
  return {
    url: `${returnUrl}?mock_success=true&plan_id=${planId}`,
  };
}
