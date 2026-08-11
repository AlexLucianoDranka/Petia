/**
 * Email Transactional Service using Resend
 */

export interface TransactionalEmailPayload {
  to: string;
  subject: string;
  type: 'welcome' | 'appointment_reminder' | 'vaccine_due' | 'payment_receipt' | 'pet_birthday' | 'monthly_report';
  data: Record<string, any>;
}

export class EmailService {
  private resendApiKey: string;

  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY || '';
  }

  async sendEmail(payload: TransactionalEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
    console.log(`[EmailService] Sending ${payload.type} email to ${payload.to}: ${payload.subject}`);

    if (this.resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Petia <notificacoes@petia.com.br>',
            to: [payload.to],
            subject: payload.subject,
            html: this.renderHtmlTemplate(payload.type, payload.data),
          }),
        });
        const resData = await response.json();
        return { success: response.ok, id: resData.id };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return {
      success: true,
      id: `resend_mock_${Date.now()}`,
    };
  }

  private renderHtmlTemplate(type: string, data: Record<string, any>): string {
    const brandBlue = '#3b82f6';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Roboto, sans-serif; background-color: #0f1f38; color: #f4f7ff; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #162d52; border-radius: 16px; border: 1px solid rgba(59,130,246,0.2); overflow: hidden; }
            .header { background: #0f1f38; color: #ffffff; padding: 28px 24px; text-align: center; border-b: 1px solid rgba(59,130,246,0.2); }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #3b82f6; }
            .content { padding: 28px 24px; }
            .badge { display: inline-block; background: rgba(59,130,246,0.15); color: #3b82f6; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 12px; margin-bottom: 16px; }
            .footer { background: #0f1f38; padding: 16px; text-align: center; font-size: 11px; color: #8ba8c8; border-t: 1px solid rgba(59,130,246,0.2); }
            .btn { display: inline-block; background: ${brandBlue}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Petia</h1>
              <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 12px;">Gestão Veterinária Inteligente</p>
            </div>
            <div class="content">
              <span class="badge">${type.toUpperCase().replace('_', ' ')}</span>
              <h2>Olá, ${data.tutorName || 'Tutor'}</h2>
              <p>${data.message || 'Temos novidades sobre o seu pet.'}</p>
              ${data.petName ? `<p><strong>Pet:</strong> ${data.petName}</p>` : ''}
              ${data.date ? `<p><strong>Data/Hora:</strong> ${data.date}</p>` : ''}
              ${data.service ? `<p><strong>Serviço:</strong> ${data.service}</p>` : ''}
              ${data.actionUrl ? `<a href="${data.actionUrl}" class="btn">Acessar Petia</a>` : ''}
            </div>
            <div class="footer">
              <p>Petia — Sistema de Gestão Veterinária e Pet Shop</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
