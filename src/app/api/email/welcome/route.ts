import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, clinicName } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_...') {
      console.log(`[Email:Welcome] Would send welcome email to ${email} (Resend not configured)`);
      return NextResponse.json({ sent: false, reason: 'Resend not configured' });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Petia <noreply@petia.com.br>',
        to: email,
        subject: `🐾 Bem-vindo ao Petia, ${name.split(' ')[0]}!`,
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#0f1f38;color:#e2e8f0;">
            <div style="max-width:560px;margin:32px auto;background:#1e3a5f;border-radius:16px;overflow:hidden;border:1px solid rgba(59,130,246,0.2);">
              <div style="background:linear-gradient(135deg,#1e3a5f,#2B5BAA);padding:40px 32px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;">🐾 Petia</h1>
                <p style="color:#93c5fd;margin:8px 0 0;font-size:13px;">Gestão Veterinária Inteligente</p>
              </div>

              <div style="padding:32px;">
                <h2 style="color:#ffffff;font-size:20px;margin:0 0 8px;">Olá, ${name.split(' ')[0]}! 👋</h2>
                <p style="color:#94a3b8;margin:0 0 16px;line-height:1.6;">
                  Sua clínica <strong style="color:#e2e8f0;">${clinicName}</strong> foi cadastrada com sucesso no Petia.
                </p>
                <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">
                  Você tem <strong style="color:#3B82F6;">7 dias grátis</strong> para explorar todas as funcionalidades.
                  Escolha o plano ideal para sua clínica antes do fim do período de trial.
                </p>

                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://petia.com.br'}/planos"
                   style="display:block;text-align:center;background:linear-gradient(135deg,#2B5BAA,#3B82F6);color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:24px;">
                  Escolher meu Plano →
                </a>

                <div style="border-top:1px solid rgba(59,130,246,0.15);padding-top:20px;">
                  <p style="color:#64748b;font-size:12px;margin:0;">
                    Qualquer dúvida, responda este e-mail ou acesse nosso suporte.
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
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
