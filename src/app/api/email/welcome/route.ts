import { NextResponse } from 'next/server';
import { buildKmZeroEmailTemplate } from '@/services/email/templates';

export async function POST(request: Request) {
  try {
    const { name, email, clinicName } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_...') {
      console.log(`[Email:Welcome] Resend not configured. Would send welcome email to ${email}`);
      return NextResponse.json({ sent: false, reason: 'Resend not configured' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petia.com.br';

    const html = buildKmZeroEmailTemplate({
      title: `Bem-vindo ao Petia, ${name.split(' ')[0]}!`,
      badge: 'BOAS-VINDAS & CADASTRO',
      name,
      bodyHtml: `
        <p style="margin:0 0 16px;">Sua clínica <strong style="color:#ffffff;">${clinicName}</strong> foi cadastrada com sucesso na nossa plataforma de gestão inteligente.</p>
        <p style="margin:0 0 16px;">Você possui <strong style="color:#3b82f6;">7 dias grátis de acesso total</strong> para experimentar a agenda visual, prontuário digital, controle de estoque e automações via WhatsApp.</p>
        <div style="padding:16px;background:rgba(59,130,246,0.1);border-radius:12px;border:1px solid rgba(59,130,246,0.2);margin-bottom:16px;">
          <strong style="color:#ffffff;display:block;margin-bottom:6px;">Próximo Passo Recomendado:</strong>
          Configure as preferências da sua clínica e escolha o plano ideal para manter o acesso contínuo.
        </div>
      `,
      ctaText: 'Acessar Meu Painel',
      ctaUrl: `${appUrl}/dashboard`,
      footerNotice: 'Agradecemos por escolher o Petia para transformar a gestão da sua clínica!',
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
        subject: `Bem-vindo ao Petia, ${name.split(' ')[0]}!`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Email:Welcome] Resend error:', err);
      return NextResponse.json({ sent: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    console.error('[Email:Welcome] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
