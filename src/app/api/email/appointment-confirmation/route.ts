import { NextResponse } from 'next/server';
import { buildKmZeroEmailTemplate } from '@/services/email/templates';

export async function POST(request: Request) {
  try {
    const { customerName, customerEmail, petName, serviceType, appointmentDate, appointmentTime, clinicName } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_...') {
      return NextResponse.json({ sent: false, reason: 'Resend not configured' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petia.com.br';

    const html = buildKmZeroEmailTemplate({
      title: `Agendamento Confirmado — ${petName}`,
      badge: 'AGENDA & ATENDIMENTO',
      name: customerName,
      bodyHtml: `
        <p style="margin:0 0 16px;">O agendamento do seu pet <strong style="color:#ffffff;">${petName}</strong> foi confirmado com sucesso na <strong style="color:#3b82f6;">${clinicName || 'Petia Vila Madalena'}</strong>.</p>
        
        <table role="presentation" width="100%" style="background:rgba(15,31,56,0.6);border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:16px;margin-bottom:20px;font-size:13px;">
          <tr>
            <td style="color:#8ba8c8;padding:4px 0;">Serviço:</td>
            <td style="color:#ffffff;font-weight:700;padding:4px 0;text-align:right;">${serviceType}</td>
          </tr>
          <tr>
            <td style="color:#8ba8c8;padding:4px 0;">Data:</td>
            <td style="color:#ffffff;font-weight:700;padding:4px 0;text-align:right;">${appointmentDate}</td>
          </tr>
          <tr>
            <td style="color:#8ba8c8;padding:4px 0;">Horário:</td>
            <td style="color:#3b82f6;font-weight:800;padding:4px 0;text-align:right;">${appointmentTime}</td>
          </tr>
        </table>
      `,
      ctaText: 'Ver na Minha Área do Tutor',
      ctaUrl: `${appUrl}/tutor`,
      footerNotice: 'Em caso de imprevistos ou necessidade de remarcação, por favor avise com antecedência.',
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
        subject: `📅 Confirmado: ${serviceType} de ${petName} — ${clinicName || 'Petia'}`,
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
