import { NextResponse } from 'next/server';
import { buildKmZeroEmailTemplate } from '@/services/email/templates';

export async function POST(request: Request) {
  try {
    const { name, email, items, clinicName } = await request.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_...') {
      return NextResponse.json({ sent: false, reason: 'Resend not configured' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petia.com.br';

    const itemsHtml = Array.isArray(items)
      ? items.map((i: any) => `<li style="margin-bottom:6px;"><strong style="color:#ffffff;">${i.name}:</strong> Restam apenas <span style="color:#ef4444;font-weight:800;">${i.quantity} ${i.unit || 'unidades'}</span> (Mínimo: ${i.min_quantity})</li>`).join('')
      : `<li>Itens com estoque abaixo do mínimo recomendado.</li>`;

    const html = buildKmZeroEmailTemplate({
      title: `Alerta de Estoque Crítico`,
      badge: 'ESTOQUE & INSUMOS',
      name,
      bodyHtml: `
        <p style="margin:0 0 16px;">Detectamos itens no estoque da clínica <strong style="color:#ffffff;">${clinicName || 'Petia'}</strong> que atingiram a quantidade mínima de segurança:</p>
        
        <ul style="padding-left:20px;color:#8ba8c8;margin-bottom:20px;">
          ${itemsHtml}
        </ul>
        
        <p style="margin:0 0 16px;">Recomendamos realizar o pedido de reposição junto aos fornecedores para evitar falta de insumos.</p>
      `,
      ctaText: 'Ver Painel de Estoque',
      ctaUrl: `${appUrl}/inventory`,
      footerNotice: 'Alerta disparado pelo sistema de inteligência de estoque do Petia.',
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
        subject: `Alerta de Estoque Crítico — ${clinicName || 'Petia'}`,
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
