/**
 * SólidaTech / KmZero Premium HTML Email Templates for Petia SaaS
 */

export interface EmailLayoutOptions {
  title: string;
  badge?: string;
  name?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNotice?: string;
}

export function buildKmZeroEmailTemplate(options: EmailLayoutOptions): string {
  const { title, badge, name, bodyHtml, ctaText, ctaUrl, footerNotice } = options;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://petia.com.br';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,sans-serif;background-color:#0f1f38;color:#f4f7ff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0f1f38;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#162d52;border-radius:20px;overflow:hidden;border:1px solid rgba(59,130,246,0.25);box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Top Header com Gradient KmZero -->
          <tr>
            <td style="background:linear-gradient(135deg, #0f1f38 0%, #1e3a5f 50%, #2b5baa 100%);padding:36px 32px;text-align:center;border-bottom:1px solid rgba(59,130,246,0.2);">
              <div style="display:inline-block;padding:8px 16px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);border-radius:30px;margin-bottom:12px;">
                <span style="font-size:12px;font-weight:800;color:#3b82f6;letter-spacing:1px;text-transform:uppercase;">
                  🐾 PETIA • ${badge || 'VETERINÁRIA & PET SHOP'}
                </span>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;">
                ${title}
              </h1>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding:36px 32px;">
              ${name ? `<h2 style="color:#ffffff;font-size:19px;font-weight:700;margin:0 0 16px;">Olá, ${name.split(' ')[0]}! 👋</h2>` : ''}
              
              <div style="color:#8ba8c8;font-size:14px;line-height:1.7;margin-bottom:24px;">
                ${bodyHtml}
              </div>

              ${
                ctaText && ctaUrl
                  ? `
              <div style="margin:28px 0;text-align:center;">
                <a href="${ctaUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #2b5baa 0%, #3b82f6 100%);color:#ffffff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:800;font-size:14px;box-shadow:0 4px 15px rgba(59,130,246,0.4);">
                  ${ctaText} →
                </a>
              </div>
              `
                  : ''
              }

              <!-- Footer Notice Box -->
              <div style="margin-top:32px;padding:16px 20px;background:rgba(15,31,56,0.6);border:1px solid rgba(59,130,246,0.15);border-radius:12px;font-size:12px;color:#8ba8c8;line-height:1.5;">
                ${footerNotice || 'Esta é uma notificação oficial disparada pela sua plataforma Petia.'}
              </div>
            </td>
          </tr>

          <!-- Footer Legal & Preference Link -->
          <tr>
            <td style="background-color:#0f1f38;padding:24px 32px;text-align:center;border-top:1px solid rgba(59,130,246,0.15);font-size:11px;color:#64748b;line-height:1.6;">
              <p style="margin:0 0 8px;">
                Petia © 2026 • Tecnologia por <strong>Sólida Tech</strong>
              </p>
              <p style="margin:0;">
                Deseja alterar suas preferências de notificação? <a href="${appUrl}/perfil" style="color:#3b82f6;text-decoration:none;font-weight:600;">Gerenciar Notificações no Perfil</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
