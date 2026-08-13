import { NextResponse } from 'next/server';
import { buildKmZeroEmailTemplate } from '@/services/email/templates';

export async function POST(request: Request) {
  try {
    const { customerName, customerEmail, petName, vaccineName, dueDate, clinicName } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_...') {
      console.log(`[Email:Vaccine] Resend not configured. Would send vaccine reminder to ${customerEmail}`);
      return NextResponse.json({ sent: false, reason: 'Resend not configured' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petia.com.br';

    const html = buildKmZeroEmailTemplate({
      title: `Alerta de Vacina — ${petName}`,
      badge: 'SAÚDE & PREVENÇÃO PET',
      name: customerName,
      bodyHtml: `
        <p style="margin:0 0 16px;">Passando para lembrar que a vacina <strong style="color:#ffffff;">${vaccineName}</strong> do seu pet <strong style="color:#3b82f6;">${petName}</strong> vence no dia <strong style="color:#ffffff;">${dueDate}</strong>.</p>
        <div style="padding:16px;background:rgba(59,130,246,0.1);border-radius:12px;border:1px solid rgba(59,130,246,0.2);margin-bottom:16px;">
          <span style="color:#ffffff;font-weight:700;display:block;">Manter a vacinação em dia previne doenças graves!</span>
          <span style="color:#8ba8c8;font-size:13px;">Agende o reforço na ${clinicName || 'nossa clínica'}.</span>
        </div>
      `,
      ctaText: 'Agendar Vacina no Portal',
      ctaUrl: `${appUrl}/tutor`,
      footerNotice: 'Lembrete automático enviado pela clínica veterinária cadastrada no Petia.',
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
        subject: `💉 Lembrete de Vacina do ${petName} — ${clinicName || 'Petia'}`,
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
