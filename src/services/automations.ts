import { whatsappService } from './notifications/whatsapp';
import { emailService } from './notifications/email';
import { PetMedicalRecord, Appointment, Pet, InventoryItem, Customer } from '@/types/database';

export interface AutomationResult {
  rule: string;
  triggeredCount: number;
  details: string[];
}

export class AutomationEngine {
  async checkVaccineReminders(medicalRecords: PetMedicalRecord[], pets: Pet[], customers: Customer[]): Promise<AutomationResult> {
    const details: string[] = [];
    let count = 0;
    const now = new Date();

    for (const record of medicalRecords) {
      if (!record.next_due_date) continue;
      const dueDate = new Date(record.next_due_date);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      if (diffDays <= 7) {
        const pet = pets.find((p) => p.id === record.pet_id);
        const customer = customers.find((c) => c.id === pet?.customer_id);

        if (pet && customer) {
          count++;
          const msg = `Olá ${customer.name}. O procedimento de ${record.type === 'vaccine' ? 'vacina' : 'vermifugação'} (${record.description}) de ${pet.name} vence em ${dueDate.toLocaleDateString('pt-BR')}. Agende seu horário no Petia.`;

          if (customer.whatsapp_opt_in) {
            await whatsappService.sendWhatsAppNotification({
              toPhone: customer.phone,
              message: msg,
              templateName: 'vaccine_reminder',
            });
          }

          if (customer.email) {
            await emailService.sendEmail({
              to: customer.email,
              subject: `Lembrete de Saúde: Vacina/Vermífugo para ${pet.name}`,
              type: 'vaccine_due',
              data: {
                tutorName: customer.name,
                petName: pet.name,
                message: msg,
                date: dueDate.toLocaleDateString('pt-BR'),
              },
            });
          }

          details.push(`Lembrete enviado para ${customer.name} - ${pet.name} (${record.description})`);
        }
      }
    }

    return { rule: 'Lembrete de Vacina/Vermífugo', triggeredCount: count, details };
  }

  async checkAppointmentConfirmations(appointments: Appointment[], customers: Customer[]): Promise<AutomationResult> {
    const details: string[] = [];
    let count = 0;

    for (const apt of appointments) {
      if (apt.status === 'scheduled') {
        const customer = customers.find((c) => c.id === apt.customer_id);
        if (customer) {
          count++;
          const msg = `Confirmação de Agendamento Petia: ${apt.pet_name} possui ${apt.service_type} agendado para ${new Date(apt.scheduled_at).toLocaleString('pt-BR')}.`;

          if (customer.whatsapp_opt_in) {
            await whatsappService.sendWhatsAppNotification({
              toPhone: customer.phone,
              message: msg,
              templateName: 'appointment_confirmation',
            });
          }
          details.push(`Confirmação 24h enviada para ${customer.name} (${apt.pet_name})`);
        }
      }
    }

    return { rule: 'Confirmação de Agendamento 24h', triggeredCount: count, details };
  }

  checkLowStockAlerts(inventory: InventoryItem[]): AutomationResult {
    const details: string[] = [];
    let count = 0;

    for (const item of inventory) {
      if (item.quantity <= item.min_quantity) {
        count++;
        details.push(`ALERTA DE ESTOQUE BAIXO: ${item.name} (${item.quantity} unidades restantes, mínimo ${item.min_quantity})`);
      }
    }

    return { rule: 'Alerta de Estoque Mínimo', triggeredCount: count, details };
  }

  async checkPetBirthdays(pets: Pet[], customers: Customer[]): Promise<AutomationResult> {
    const details: string[] = [];
    let count = 0;
    const today = new Date();
    const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`;

    for (const pet of pets) {
      if (pet.birth_date) {
        const birthDate = new Date(pet.birth_date);
        const petMonthDay = `${birthDate.getMonth() + 1}-${birthDate.getDate()}`;

        if (todayMonthDay === petMonthDay) {
          const customer = customers.find((c) => c.id === pet.customer_id);
          if (customer) {
            count++;
            const msg = `Parabéns! Hoje é aniversário de ${pet.name}. A equipe Petia deseja muita saúde!`;

            if (customer.whatsapp_opt_in) {
              await whatsappService.sendWhatsAppNotification({
                toPhone: customer.phone,
                message: msg,
                templateName: 'pet_birthday',
              });
            }
            details.push(`Mensagem de aniversário enviada para ${pet.name} (Tutor: ${customer.name})`);
          }
        }
      }
    }

    return { rule: 'Aniversário do Pet', triggeredCount: count, details };
  }
}

export const automationEngine = new AutomationEngine();
