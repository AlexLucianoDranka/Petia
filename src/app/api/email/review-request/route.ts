import { NextResponse } from 'next/server';
import { buildKmZeroEmailTemplate } from '@/services/email/templates';

export async function POST(request: Request) {
  try {
    const { customerName, customerEmail, petName, appointmentId, clinicName } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_...') {
      return NextResponse.json({ sent: false, reason: 'Resend not configured' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petia.com.br';
    const reviewUrl = `${appUrl}/avaliacao/${appointmentId}`;

    const html = buildKmZeroEmailTemplate({
      title: `Como foi o atendimento do ${petName}? ⭐`,
      badge: 'AVALIAÇÃO & REPUTAÇÃO',
      name: customerName,
      bodyHtml: `
        <p style="margin:0 0 16px;">O atendimento do seu pet <strong style="color:#ffffff;">${petName}</strong> na <strong style="color:#3b82f6;">${clinicName || 'Petia'}</strong> foi concluído!</p>
        <p style="margin:0 0 16px;">Sua opinião é fundamental para que possamos oferecer sempre o melhor cuidado. Leva menos de 30 segundos:</p>
      `,
      ctaText: 'Deixar Minha Avaliação ⭐',
      ctaUrl: reviewUrl,
      footerNotice: 'Sua avaliação é anônima ou pública conforme sua escolha na página.',
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
        subject: `⭐ Avalie a consulta do ${petName} — ${clinicName || 'Petia'}`,
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
