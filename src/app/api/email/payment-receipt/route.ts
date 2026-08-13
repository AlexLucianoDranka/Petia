import { NextResponse } from 'next/server';
import { buildKmZeroEmailTemplate } from '@/services/email/templates';

export async function POST(request: Request) {
  try {
    const { name, email, planName, amountPaid, receiptUrl, billingCycle } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_...') {
      return NextResponse.json({ sent: false, reason: 'Resend not configured' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petia.com.br';

    const html = buildKmZeroEmailTemplate({
      title: `Comprovante de Pagamento — Petia`,
      badge: 'COBRANÇA & STRIPE',
      name,
      bodyHtml: `
        <p style="margin:0 0 16px;">Confirmamos o recebimento do seu pagamento referente à assinatura do plano <strong style="color:#ffffff;">${planName}</strong> (${billingCycle === 'yearly' ? 'Anual' : 'Mensal'}).</p>
        
        <table role="presentation" width="100%" style="background:rgba(15,31,56,0.6);border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:16px;margin-bottom:20px;font-size:13px;">
          <tr>
            <td style="color:#8ba8c8;padding:4px 0;">Plano Contratado:</td>
            <td style="color:#ffffff;font-weight:700;padding:4px 0;text-align:right;">${planName}</td>
          </tr>
          <tr>
            <td style="color:#8ba8c8;padding:4px 0;">Valor Pago:</td>
            <td style="color:#10b981;font-weight:800;padding:4px 0;text-align:right;">R$ ${Number(amountPaid).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="color:#8ba8c8;padding:4px 0;">Forma de Pagamento:</td>
            <td style="color:#ffffff;font-weight:700;padding:4px 0;text-align:right;">Cartão de Crédito (Stripe)</td>
          </tr>
        </table>
      `,
      ctaText: 'Acessar Meu Painel',
      ctaUrl: receiptUrl || `${appUrl}/dashboard`,
      footerNotice: 'A sua fatura completa pode ser baixada diretamente no seu painel ou no comprovante Stripe enviado.',
    });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Petia <noreply@petia.com.br>',
        to: email,
        subject: `🧾 Comprovante de Pagamento — Plano ${planName} (${billingCycle === 'yearly' ? 'Anual' : 'Mensal'})`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ sent: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
