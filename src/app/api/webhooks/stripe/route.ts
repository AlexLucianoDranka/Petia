import { NextResponse } from 'next/server';
import { stripe } from '@/services/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Admin client bypasses RLS for webhook processing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Disable body parsing — Stripe requires raw body for signature verification
export const dynamic = 'force-dynamic';

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_...') return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'Petia <noreply@petia.com.br>',
      to,
      subject,
      html,
    }),
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;

  try {
    if (webhookSecret && webhookSecret !== 'whsec_...') {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`[StripeWebhook] Signature error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[StripeWebhook] Event: ${event.type}`);

  try {
    switch (event.type) {
      // ─────────────────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clinicId = session.metadata?.clinic_id;
        const planId = session.metadata?.plan_id;

        if (!clinicId || !planId) {
          console.warn('[StripeWebhook] Missing clinic_id or plan_id in session metadata');
          break;
        }

        await supabaseAdmin
          .from('clinics')
          .update({
            plan: planId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
            current_period_end: null,
          })
          .eq('id', clinicId);

        // Send welcome/confirmation email
        if (session.customer_details?.email) {
          await sendEmail(
            session.customer_details.email,
            '🎉 Sua assinatura Petia está ativa!',
            `
            <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
              <h2 style="color: #1e3a5f;">Bem-vindo ao Petia!</h2>
              <p>Sua assinatura do plano <strong>${planId}</strong> está ativa.</p>
              <p>Acesse agora seu painel:</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                 style="display:inline-block;background:#3B82F6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                Acessar Petia
              </a>
              <p style="color:#888;font-size:12px;margin-top:24px;">Petia — Gestão Veterinária Inteligente</p>
            </div>
            `
          );
        }
        break;
      }

      // ─────────────────────────────────────────────────────────
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (!customerId) break;

        const { data: clinic } = await supabaseAdmin
          .from('clinics')
          .select('id, plan')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (clinic) {
          const periodEnd =
            (invoice as any).lines?.data?.[0]?.period?.end;

          await supabaseAdmin
            .from('clinics')
            .update({
              subscription_status: 'active',
              current_period_end: periodEnd
                ? new Date(periodEnd * 1000).toISOString()
                : null,
            })
            .eq('id', clinic.id);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (!customerId) break;

        const { data: clinic } = await supabaseAdmin
          .from('clinics')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (clinic) {
          await supabaseAdmin
            .from('clinics')
            .update({ subscription_status: 'past_due' })
            .eq('id', clinic.id);

          // Notify customer of failed payment
          if ((invoice as any).customer_email) {
            await sendEmail(
              (invoice as any).customer_email,
              '⚠️ Falha no pagamento da sua assinatura Petia',
              `
              <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
                <h2 style="color: #d32f2f;">Pagamento não processado</h2>
                <p>Houve uma falha no pagamento da sua assinatura Petia.</p>
                <p>Por favor, atualize seus dados de pagamento para evitar a suspensão do serviço:</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/planos"
                   style="display:inline-block;background:#d32f2f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                  Atualizar Pagamento
                </a>
              </div>
              `
            );
          }
        }
        break;
      }

      // ─────────────────────────────────────────────────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: clinic } = await supabaseAdmin
          .from('clinics')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (clinic) {
          const planId = subscription.metadata?.plan_id;
          await supabaseAdmin
            .from('clinics')
            .update({
              subscription_status: subscription.status,
              ...(planId ? { plan: planId } : {}),
              current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            })
            .eq('id', clinic.id);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: clinic } = await supabaseAdmin
          .from('clinics')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (clinic) {
          await supabaseAdmin
            .from('clinics')
            .update({
              subscription_status: 'canceled',
              plan: 'basico', // Downgrade to free/basico on cancelation
              stripe_subscription_id: null,
            })
            .eq('id', clinic.id);
        }
        break;
      }

      default:
        console.log(`[StripeWebhook] Unhandled event: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`[StripeWebhook] Handler error for ${event.type}:`, err);
    return NextResponse.json({ error: 'Internal handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
