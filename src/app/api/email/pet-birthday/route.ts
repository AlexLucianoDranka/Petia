import { NextResponse } from 'next/server';
import { buildKmZeroEmailTemplate } from '@/services/email/templates';

export async function POST(request: Request) {
  try {
    const { customerName, customerEmail, petName, couponCode, clinicName } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_...') {
      return NextResponse.json({ sent: false, reason: 'Resend not configured' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petia.com.br';

    const html = buildKmZeroEmailTemplate({
      title: `Parabéns pro ${petName}! 🎈🎉`,
      badge: 'ANIVERSÁRIO DO PET',
      name: customerName,
      bodyHtml: `
        <p style="margin:0 0 16px;">Hoje é um dia muito especial! A equipe da <strong style="color:#ffffff;">${clinicName || 'Petia'}</strong> deseja um aniversário cheio de petiscos, carinho e saúde para o <strong style="color:#3b82f6;">${petName}</strong>!</p>
        
        <div style="padding:20px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);border-radius:16px;text-align:center;margin-bottom:20px;">
          <span style="color:#8ba8c8;font-size:12px;display:block;margin-bottom:4px;text-transform:uppercase;font-weight:700;">Presente Especial de Aniversário:</span>
          <span style="color:#ffffff;font-size:22px;font-weight:900;font-family:monospace;letter-spacing:2px;display:block;">${couponCode || 'NIVERPET15'}</span>
          <span style="color:#3b82f6;font-size:13px;font-weight:700;display:block;margin-top:6px;">15% de desconto no próximo banho ou consulta!</span>
        </div>
      `,
      ctaText: 'Agendar com Desconto',
      ctaUrl: `${appUrl}/tutor`,
      footerNotice: 'Cupom válido pelos próximos 30 dias na sua clínica de preferência.',
    });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Petia <noreply@petia.com.br>',
        to: customerEmail,
        subject: `🎉 Feliz Aniversário pro ${petName}! Ganhe um presente especial — ${clinicName || 'Petia'}`,
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
