/**
 * WhatsApp Notification Service Abstraction
 * Supports swappable providers: Meta Cloud API (Official) or Z-API / Evolution API
 */

export interface SendWhatsAppPayload {
  toPhone: string;
  message: string;
  templateName?: 'vaccine_reminder' | 'appointment_confirmation' | 'pet_birthday' | 'invoice_receipt';
  templateVariables?: Record<string, string>;
}

export type WhatsAppProvider = 'meta_official' | 'zapi' | 'evolution' | 'mock';

export class WhatsAppService {
  private provider: WhatsAppProvider;
  private apiKey: string;
  private instanceId?: string;

  constructor(provider: WhatsAppProvider = 'mock') {
    this.provider = (process.env.WHATSAPP_PROVIDER as WhatsAppProvider) || provider;
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.instanceId = process.env.WHATSAPP_INSTANCE_ID || '';
  }

  async sendWhatsAppNotification(payload: SendWhatsAppPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const formattedPhone = payload.toPhone.replace(/\D/g, '');

    console.log(`[WhatsAppService] Sending via ${this.provider} to +55${formattedPhone}:`, payload.message);

    if (this.provider === 'meta_official') {
      // Meta Cloud API Implementation
      try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${this.instanceId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: `55${formattedPhone}`,
            type: 'text',
            text: { body: payload.message },
          }),
        });
        const data = await response.json();
        return { success: response.ok, messageId: data?.messages?.[0]?.id };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    if (this.provider === 'zapi') {
      // Z-API Provider Implementation
      try {
        const response = await fetch(`https://api.z-api.io/instances/${this.instanceId}/token/${this.apiKey}/send-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: `55${formattedPhone}`,
            message: payload.message,
          }),
        });
        const data = await response.json();
        return { success: response.ok, messageId: data?.messageId };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Mock Provider (Default for testing & dev)
    return {
      success: true,
      messageId: `wpp_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  }

  generateWhatsAppClickUrl(phone: string, text: string): string {
    const cleanNumber = phone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/55${cleanNumber}?text=${encodedText}`;
  }
}

export const whatsappService = new WhatsAppService();
