'use client';

import React, { useState } from 'react';
import { Zap, Play, CheckCircle2, MessageSquare, Mail, Clock, Syringe, Calendar, Heart } from 'lucide-react';
import { INITIAL_NOTIFICATION_LOGS, INITIAL_MEDICAL_RECORDS, INITIAL_PETS, INITIAL_CUSTOMERS } from '@/lib/mockData';
import { automationEngine, AutomationResult } from '@/services/automations';

export default function AutomationsPage() {
  const [logs, setLogs] = useState(INITIAL_NOTIFICATION_LOGS);
  const [isRunning, setIsRunning] = useState(false);
  const [lastResults, setLastResults] = useState<AutomationResult[] | null>(null);

  const handleRunAllAutomations = async () => {
    setIsRunning(true);
    setLastResults(null);

    const vacResult = await automationEngine.checkVaccineReminders(INITIAL_MEDICAL_RECORDS, INITIAL_PETS, INITIAL_CUSTOMERS);
    const birthResult = await automationEngine.checkPetBirthdays(INITIAL_PETS, INITIAL_CUSTOMERS);

    setLastResults([vacResult, birthResult]);
    setIsRunning(false);

    const newLog = {
      id: `log-${Date.now()}`,
      clinic_id: 'c101',
      customer_id: 'cust-1',
      customer_name: 'Mariana Silva Santos',
      channel: 'whatsapp' as const,
      type: 'Lembrete de Vacina V4 Felina (Luna)',
      sent_at: new Date().toISOString(),
      status: 'delivered' as const,
    };
    setLogs([newLog, ...logs]);
  };

  return (
    <div className="space-y-6 animate-fade-up">
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
          className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-glow transition-all active:scale-95 disabled:opacity-50"
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
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-st-success/20 text-st-success border border-st-success/30 px-2 py-0.5 rounded-full">ATIVO</span>
          </div>
          <h3 className="font-extrabold text-st-arctic text-base">Confirmação de Agenda (24h)</h3>
          <p className="text-xs text-st-muted">
            Solicita confirmação automática do tutor 24h antes do horário marcado.
          </p>
        </div>

        <div className="card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center border border-st-electric/30">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-st-success/20 text-st-success border border-st-success/30 px-2 py-0.5 rounded-full">ATIVO</span>
          </div>
          <h3 className="font-extrabold text-st-arctic text-base">Aniversário do Pet</h3>
          <p className="text-xs text-st-muted">
            Envia mensagem carinhosa de parabéns no dia do aniversário do pet.
          </p>
        </div>
      </div>

      {/* Notification Log Table */}
      <div className="card rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-st-arctic text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-st-electric" />
          <span>Histórico de Disparos (Logs)</span>
        </h3>

        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-st-navy border border-st-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    log.channel === 'whatsapp' ? 'bg-st-success/20 text-st-success border border-st-success/30' : 'bg-st-electric/20 text-st-electric border border-st-electric/30'
                  }`}
                >
                  {log.channel === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-st-arctic">{log.type}</h4>
                  <p className="text-st-muted text-[11px]">Destinatário: {log.customer_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-st-muted font-mono text-[11px]">
                  {new Date(log.sent_at).toLocaleTimeString('pt-BR')}
                </span>
                <span className="bg-st-success/20 text-st-success border border-st-success/30 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  ENTREGUE
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
