'use client';

import React, { useState } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  MessageSquare,
  Mail,
  Clock,
  Syringe,
  Calendar,
  Heart,
  Cake,
  UserX,
  HelpCircle,
  Sparkles,
  Send,
} from 'lucide-react';
import { automationEngine, AutomationResult } from '@/services/automations';
import { getScopedData } from '@/lib/data/clinicDataScope';
import { PlanGate } from '@/components/ui/PlanGate';
import { whatsappService } from '@/services/notifications/whatsapp';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

export default function AutomationsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastResults, setLastResults] = useState<AutomationResult[] | null>(null);

  // Load scoped data
  const medicalRecords = getScopedData<any>('petia_medical_records');
  const pets = getScopedData<any>('petia_pets');
  const customers = getScopedData<any>('petia_customers');

  // Relationship Automations State
  const birthdayPets = pets.slice(0, 2);
  const inactiveCustomers = customers.slice(0, 2);

  const handleRunAllAutomations = async () => {
    setIsRunning(true);
    setLastResults(null);

    const vacResult = await automationEngine.checkVaccineReminders(medicalRecords as any, pets as any, customers as any);
    const birthResult = await automationEngine.checkPetBirthdays(pets as any, customers as any);

    setLastResults([vacResult, birthResult]);
    setIsRunning(false);

    const newLog = {
      id: `log-${Date.now()}`,
      clinic_id: 'real-clinic',
      customer_id: '',
      customer_name: 'Sistema',
      channel: 'whatsapp' as const,
      type: 'Automação disparada manualmente',
      sent_at: new Date().toISOString(),
      status: 'delivered' as const,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleSendBirthdayWhatsApp = (pet: any) => {
    const text = `🎉 Parabéns pro ${pet.name}! A equipe da Petia deseja um aniversário cheio de petiscos e brincadeiras! Ganhe 15% de desc. na próxima visita com o cupom NIVERPET. 🐾🎈`;
    const url = whatsappService.generateWhatsAppClickUrl(pet.customer_phone || '11999999999', text);
    window.open(url, '_blank');
  };

  const handleSendReactivationWhatsApp = (cust: any) => {
    const text = `Olá ${cust.name}! Sentimos sua falta aqui no Petia! Faz um tempo que não vemos você por aqui. Agende um check-up com 10% de desconto essa semana! 🐶❤️`;
    const url = whatsappService.generateWhatsAppClickUrl(cust.phone || '11999999999', text);
    window.open(url, '_blank');
  };

  return (
    <PlanGate
      requiredPlan="essencial"
      featureName="Central de Automações & Lembretes"
      featureDescription="Envie lembretes automáticos de vacinas, aniversários do pet e reativação de clientes inativos via WhatsApp e e-mail. Disponível no plano Essencial Bronze ou superior."
    >
      <div className="space-y-6 animate-fade-up pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl">
          <div>
            <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
              <Zap className="w-6 h-6 text-st-electric" />
              <span>Central de Automações & Cron Engine</span>
            </h1>
            <p className="text-xs text-st-muted mt-0.5">Disparos automáticos de WhatsApp e E-mail para vacinas, confirmações e aniversários no Petia</p>
          </div>

          <button
            onClick={handleRunAllAutomations}
            disabled={isRunning}
            className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-glow transition-all active:scale-95 disabled:opacity-50 border-none shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isRunning ? 'Executando Automações...' : 'Executar Cron de Automações Agora'}</span>
          </button>
        </div>

        {/* Results Banner */}
        {lastResults && (
          <div className="p-5 rounded-2xl bg-st-success/15 border border-st-success/30 space-y-2 animate-fade-in">
            <h4 className="font-extrabold text-st-success text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Execução do Cron Concluída com Sucesso</span>
            </h4>
            <ul className="space-y-1 text-xs text-st-arctic font-medium">
              {lastResults.map((r, idx) => (
                <li key={idx}>
                  • <strong className="text-st-electric">{r.rule}:</strong> {r.triggeredCount} notificações geradas.
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Automation Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center border border-st-electric/30">
                <Syringe className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-st-success/20 text-st-success border border-st-success/30 px-2 py-0.5 rounded-full">ATIVO</span>
            </div>
            <h3 className="font-extrabold text-st-arctic text-base">Lembrete de Vacina & Vermífugo</h3>
            <p className="text-xs text-st-muted">
              Dispara mensagem 7 dias antes do vencimento cadastrado no prontuário.
            </p>
          </div>

          <div className="card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center border border-st-electric/30">
                <Cake className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-st-success/20 text-st-success border border-st-success/30 px-2 py-0.5 rounded-full">ATIVO</span>
            </div>
            <h3 className="font-extrabold text-st-arctic text-base">Parabéns de Aniversário do Pet</h3>
            <p className="text-xs text-st-muted">
              Envia felicitação carinhosa com cupom de desconto no dia do aniversário do pet.
            </p>
          </div>

          <div className="card p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center border border-st-electric/30">
                <UserX className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-st-success/20 text-st-success border border-st-success/30 px-2 py-0.5 rounded-full">ATIVO</span>
            </div>
            <h3 className="font-extrabold text-st-arctic text-base">Reativação de Tutores Inativos</h3>
            <p className="text-xs text-st-muted">
              Identifica tutores sem consulta há 90+ dias e envia convite de retorno com oferta.
            </p>
          </div>
        </div>

        {/* Relationship Automations Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aniversários dos Pets */}
          <div className="card p-6 rounded-2xl space-y-4 border border-st-border">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
              <h3 className="font-bold text-st-arctic text-base flex items-center gap-2">
                <Cake className="w-5 h-5 text-amber-400" />
                <span>Aniversariantes da Semana</span>
              </h3>
              <span className="text-xs text-st-electric font-mono font-bold">{birthdayPets.length} pets</span>
            </div>

            <div className="space-y-3 text-xs">
              {birthdayPets.map((pet) => (
                <div key={pet.id} className="p-3.5 rounded-xl bg-st-surface border border-st-border/60 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-st-arctic text-sm">{pet.name} 🎂</h4>
                    <p className="text-st-muted">Tutor: {pet.customer_name} • {pet.breed}</p>
                  </div>
                  <button
                    onClick={() => handleSendBirthdayWhatsApp(pet)}
                    className="px-3 py-1.5 rounded-lg bg-st-electric text-white text-xs font-bold shadow-glow flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar WhatsApp</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reativação de Clientes Inativos */}
          <div className="card p-6 rounded-2xl space-y-4 border border-st-border">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
              <h3 className="font-bold text-st-arctic text-base flex items-center gap-2">
                <UserX className="w-5 h-5 text-red-400" />
                <span>Clientes Inativos (+90 Dias)</span>
              </h3>
              <span className="text-xs text-st-electric font-mono font-bold">{inactiveCustomers.length} tutores</span>
            </div>

            <div className="space-y-3 text-xs">
              {inactiveCustomers.map((cust) => (
                <div key={cust.id} className="p-3.5 rounded-xl bg-st-surface border border-st-border/60 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-st-arctic text-sm">{cust.name}</h4>
                    <p className="text-st-muted">Última consulta: 110 dias atrás</p>
                  </div>
                  <button
                    onClick={() => handleSendReactivationWhatsApp(cust)}
                    className="px-3 py-1.5 rounded-lg bg-st-electric text-white text-xs font-bold shadow-glow flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reativar no WhatsApp</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Free WhatsApp API Setup Guide Box */}
        <div className="card p-6 rounded-2xl space-y-3 border border-st-electric/30 bg-st-electric/10">
          <h3 className="font-bold text-st-arctic text-sm flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-st-electric" />
            <span>Guia de Integração Gratuita com WhatsApp (Evolution API)</span>
          </h3>
          <div className="text-xs text-st-muted space-y-2 leading-relaxed">
            <p>
              O Petia possui suporte nativo para disparo automático sem custo de mensalidade usando a <strong className="text-st-arctic">Evolution API</strong> (gratuita e open-source).
            </p>
            <p>
              1. Instale a Evolution API gratuitamente no seu servidor ou computador local via Docker.
            </p>
            <p>
              2. Adicione a variável no seu arquivo <code className="text-st-electric font-mono">.env.local</code>:
            </p>
            <pre className="bg-st-navy p-3 rounded-xl text-st-arctic font-mono text-[11px] border border-st-border overflow-x-auto">
{`WHATSAPP_PROVIDER=evolution
WHATSAPP_API_KEY=sua_chave_evolution_aqui
WHATSAPP_INSTANCE_ID=petia-instancia-01`}
            </pre>
          </div>
        </div>
      </div>
    </PlanGate>
  );
}
