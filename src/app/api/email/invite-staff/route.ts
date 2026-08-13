import { NextResponse } from 'next/server';
import { buildKmZeroEmailTemplate } from '@/services/email/templates';

export async function POST(request: Request) {
  try {
    const { name, email, role, clinicName } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_...') {
      console.log(`[Email:InviteStaff] Resend not configured. Would send invite to ${email}`);
      return NextResponse.json({ sent: false, reason: 'Resend not configured' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petia.com.br';

    const roleName = role === 'vet' ? 'Veterinário' : role === 'attendant' ? 'Atendente' : 'Membro da Equipe';

    const html = buildKmZeroEmailTemplate({
      title: `Convite de Equipe — ${clinicName}`,
      badge: 'CONVITE DE ACESSO',
      name,
      bodyHtml: `
        <p style="margin:0 0 16px;">Você foi convidado(a) para fazer parte da equipe da clínica <strong style="color:#ffffff;">${clinicName}</strong> como <strong style="color:#3b82f6;">${roleName}</strong> no Petia.</p>
        <p style="margin:0 0 16px;">Clique no botão abaixo para concluir seu cadastro e definir sua senha de acesso inicial.</p>
      `,
      ctaText: 'Aceitar Convite & Entrar',
      ctaUrl: `${appUrl}/login?email=${encodeURIComponent(email)}`,
      footerNotice: 'Se você não reconhece este convite, por favor desconsidere esta mensagem.',
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
        subject: `🐶 Convite de Acesso no Petia — ${clinicName}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Email:InviteStaff] Resend error:', err);
      return NextResponse.json({ sent: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    console.error('[Email:InviteStaff] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
