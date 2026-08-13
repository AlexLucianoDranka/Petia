'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Dog,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Zap,
  ShieldAlert,
  Sparkles,
  Syringe,
} from 'lucide-react';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_INVENTORY,
  INITIAL_MEDICAL_RECORDS,
} from '@/lib/mockData';
import Link from 'next/link';

import { APP_VERSION } from '@/lib/version';
import { OnboardingTour } from '@/components/navigation/OnboardingTour';
import { getScopedData, getCurrentClinicScope } from '@/lib/data/clinicDataScope';
import { showToast, startTopLoader, stopTopLoader } from '@/components/ui/GlobalToastAndLoader';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState(() =>
    getScopedData('petia_appointments', INITIAL_APPOINTMENTS)
  );
  const [inventory, setInventory] = useState(() =>
    getScopedData('petia_inventory', INITIAL_INVENTORY)
  );
  const [automationLog, setAutomationLog] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [scope, setScope] = useState(() => getCurrentClinicScope());

  React.useEffect(() => {
    const loadUserData = () => {
      const savedUser = localStorage.getItem('petia_user_profile');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.name) {
            setUserName(parsed.name);
          } else if (parsed.email) {
            setUserName(parsed.email.split('@')[0]);
          }
        } catch (e) {}
      }
      setScope(getCurrentClinicScope());
    };
    loadUserData();
    window.addEventListener('petia_user_profile_updated', loadUserData);
    return () => window.removeEventListener('petia_user_profile_updated', loadUserData);
  }, []);

  const lowStockItems = inventory.filter((item) => item.quantity <= item.min_quantity);

  const handleUpdateStatus = (id: string, newStatus: any) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  const handleRunAutomations = () => {
    setAutomationLog('Lembretes de vacina via WhatsApp disparados com sucesso');
    setTimeout(() => setAutomationLog(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-up w-full">
      {/* Interactive Welcome Tour for New Accounts */}
      <OnboardingTour />
      {/* Top Banner */}
      <div className="card p-6 lg:p-8 rounded-2xl relative overflow-hidden bg-gradient-to-r from-st-navy via-st-surface to-st-deep border border-st-border shadow-md w-full">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-st-electric/15 text-st-electric border border-st-electric/30 text-xs font-semibold whitespace-nowrap shrink-0">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Petia • Controle Veterinário {APP_VERSION}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            Bem-vindo, {userName || 'Usuário'}
          </h1>
          <p className="text-st-muted text-xs lg:text-sm max-w-xl">
            {appointments.length > 0 ? (
              <>
                Sua clínica possui <span className="text-st-electric font-bold">{appointments.length} agendamento{appointments.length > 1 ? 's' : ''} para hoje</span>.
              </>
            ) : (
              <>
                Sua clínica está configurada e pronta para uso. <span className="text-st-electric font-bold">Nenhum agendamento marcado para hoje</span>. Crie seu primeiro atendimento!
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 relative z-10">
          <button
            onClick={() => {
              startTopLoader();
              handleRunAutomations();
              showToast('Lembretes de vacina via WhatsApp disparados com sucesso!', 'success');
              setTimeout(() => stopTopLoader(), 500);
            }}
            className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white font-semibold text-xs lg:text-sm px-4 py-2.5 rounded-xl shadow-glow transition-all active:scale-95 whitespace-nowrap shrink-0 border-none"
          >
            <Zap className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="whitespace-nowrap">Disparar Automações</span>
          </button>
          <Link
            href="/checkin"
            className="flex items-center gap-2 bg-st-surface hover:bg-st-surface-2 text-st-arctic font-semibold text-xs lg:text-sm px-4 py-2.5 rounded-xl border border-st-border transition-all whitespace-nowrap shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-st-success shrink-0" />
            <span className="whitespace-nowrap">Painel Check-in</span>
          </Link>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="card p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-st-arctic text-sm block truncate">Alerta de Estoque Crítico ({lowStockItems.length} itens)</span>
              <p className="text-st-muted text-[11px] truncate">
                {lowStockItems.map((i) => i.name).join(', ')} abaixo do limite mínimo.
              </p>
            </div>
          </div>
          <Link
            href="/inventory"
            className="px-3.5 py-1.5 rounded-lg bg-red-500 text-white font-bold text-xs shadow-glow hover:bg-red-600 transition-colors whitespace-nowrap shrink-0"
          >
            Repor Estoque
          </Link>
        </div>
      )}

      {/* Metric Cards Grid - Fully Responsive Mobile Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="card p-4 sm:p-5 rounded-xl space-y-3 min-w-0">
          <div className="flex items-center justify-between text-st-muted gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">Faturamento Mês</span>
            <div className="w-8 h-8 rounded-xl bg-st-success/20 text-st-success flex items-center justify-center font-bold shrink-0">
              R$
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-st-arctic truncate">R$ 18.940,00</h3>
            <p className="text-[11px] text-st-success font-semibold flex items-center gap-1 mt-0.5 truncate">
              <TrendingUp className="w-3 h-3 shrink-0" /> +18.4% este mês
            </p>
          </div>
        </div>

        <div className="card p-4 sm:p-5 rounded-xl space-y-3 min-w-0">
          <div className="flex items-center justify-between text-st-muted gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">Atendimentos</span>
            <div className="w-8 h-8 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-st-arctic truncate">142</h3>
            <p className="text-[11px] text-st-muted font-medium mt-0.5 truncate">94% de presença confirmada</p>
          </div>
        </div>

        <div className="card p-4 sm:p-5 rounded-xl space-y-3 min-w-0">
          <div className="flex items-center justify-between text-st-muted gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">Taxa de Retorno</span>
            <div className="w-8 h-8 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center shrink-0">
              <Dog className="w-4 h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-st-arctic truncate">87.5%</h3>
            <p className="text-[11px] text-st-electric font-medium mt-0.5 truncate">Tutores recorrentes ativos</p>
          </div>
        </div>

        <div className="card p-4 sm:p-5 rounded-xl space-y-3 min-w-0">
          <div className="flex items-center justify-between text-st-muted gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">Inadimplência</span>
            <div className="w-8 h-8 rounded-xl bg-st-danger/20 text-st-danger flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-st-arctic truncate">2.1%</h3>
            <p className="text-[11px] text-st-muted font-medium mt-0.5 truncate">Cobranças Stripe automáticas</p>
          </div>
        </div>
      </div>

      {/* Health Insights & SVG Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Revenue Chart */}
        <div className="lg:col-span-2 card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-st-arctic text-sm uppercase tracking-wider">Desempenho Diário de Receita (Últimos 7 Dias)</h3>
            <span className="text-xs text-st-electric font-bold font-mono">Média R$ 630,00/dia</span>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 px-2">
            {[
              { day: 'Seg', val: 450, height: '45%' },
              { day: 'Ter', val: 580, height: '58%' },
              { day: 'Qua', val: 720, height: '72%' },
              { day: 'Qui', val: 610, height: '61%' },
              { day: 'Sex', val: 890, height: '89%' },
              { day: 'Sáb', val: 950, height: '95%' },
              { day: 'Dom', val: 210, height: '21%' },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-st-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  R${item.val}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-st-electric/30 to-st-electric rounded-t-lg transition-all duration-300 group-hover:brightness-125"
                  style={{ height: item.height }}
                />
                <span className="text-[11px] font-bold text-st-muted">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Card */}
        <div className="card p-6 rounded-2xl space-y-3">
          <h3 className="font-bold text-st-arctic text-sm uppercase tracking-wider border-b border-st-border/40 pb-2">
            💡 Indicadores Operacionais
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-st-surface border border-st-border/50">
              <span className="text-[10px] text-st-muted font-bold uppercase block">Serviço Mais Lucrativo</span>
              <span className="font-extrabold text-st-arctic text-sm block">Banho & Tosa Completo</span>
              <span className="text-[11px] text-st-electric font-semibold">R$ 6.840,00 gerados (36%)</span>
            </div>

            <div className="p-3 rounded-xl bg-st-surface border border-st-border/50">
              <span className="text-[10px] text-st-muted font-bold uppercase block">Horário de Pico da Clínica</span>
              <span className="font-extrabold text-st-arctic text-sm block">14:00 às 16:30</span>
              <span className="text-[11px] text-st-muted font-medium">62% dos agendamentos diários</span>
            </div>

            <div className="p-3 rounded-xl bg-st-surface border border-st-border/50">
              <span className="text-[10px] text-st-muted font-bold uppercase block">Profissional Destaque</span>
              <span className="font-extrabold text-st-arctic text-sm block">Dr. Lucas Mendes</span>
              <span className="text-[11px] text-st-success font-semibold">18 consultas concluídas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Appointments + Inventory & Vaccine Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 card rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-st-border/40 pb-4">
            <div>
              <h2 className="font-bold text-lg text-st-arctic flex items-center gap-2">
                <Calendar className="w-5 h-5 text-st-electric shrink-0" />
                <span className="whitespace-nowrap">Agendamentos de Hoje</span>
              </h2>
              <p className="text-xs text-st-muted">Status do balcão e esteira de atendimento</p>
            </div>
            <Link
              href="/agenda"
              className="text-xs font-semibold text-st-electric hover:text-st-ice flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>Ver Agenda Completa</span> <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => {
              const statusColors: Record<string, string> = {
                scheduled: 'bg-st-warning/20 text-st-warning border-st-warning/30',
                confirmed: 'bg-st-success/20 text-st-success border-st-success/30',
                done: 'bg-st-surface-2 text-st-muted border-st-border',
                cancelled: 'bg-st-danger/20 text-st-danger border-st-danger/30',
              };

              const statusLabels: Record<string, string> = {
                scheduled: 'Agendado',
                confirmed: 'Confirmado',
                done: 'Concluído',
                cancelled: 'Cancelado',
              };

              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl bg-st-surface-2/60 border border-st-border hover:border-st-electric transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric font-bold flex items-center justify-center border border-st-electric/30 shrink-0">
                      <Dog className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-st-arctic text-sm lg:text-base whitespace-nowrap">{apt.pet_name}</h4>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${statusColors[apt.status]}`}>
                          {statusLabels[apt.status]}
                        </span>
                      </div>
                      <p className="text-xs text-st-muted font-medium mt-0.5 truncate">
                        Tutor: <span className="text-st-arctic font-semibold">{apt.customer_name}</span> ({apt.customer_phone})
                      </p>
                      <div className="flex items-center gap-3 text-xs text-st-muted mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-mono font-medium text-st-arctic whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-st-electric shrink-0" />
                          {new Date(apt.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="whitespace-nowrap">• {apt.service_type}</span>
                        <span className="font-bold text-st-arctic whitespace-nowrap">R$ {apt.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {apt.status !== 'done' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'done')}
                        className="px-3 py-1.5 rounded-xl bg-st-success hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap shrink-0"
                      >
                        Concluir
                      </button>
                    )}
                    {apt.status === 'scheduled' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                        className="px-3 py-1.5 rounded-xl bg-st-electric hover:bg-st-steel text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap shrink-0"
                      >
                        Confirmar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Inventory & Vaccine Alerts */}
        <div className="space-y-6">
          {/* Low Stock Card */}
          <div className="card rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
              <h3 className="font-bold text-st-arctic text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-st-warning shrink-0" />
                <span className="whitespace-nowrap">Estoque Mínimo ({lowStockItems.length})</span>
              </h3>
              <Link href="/inventory" className="text-xs text-st-electric font-semibold hover:underline whitespace-nowrap shrink-0">
                Gerenciar
              </Link>
            </div>

            <div className="space-y-2.5">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-st-warning/10 border border-st-warning/30 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-st-arctic text-xs truncate">{item.name}</p>
                    <p className="text-[11px] text-st-warning font-medium whitespace-nowrap">
                      Restante: <span className="font-bold">{item.quantity} un</span> (Mín: {item.min_quantity})
                    </p>
                  </div>
                  <span className="text-xs bg-st-warning/20 text-st-warning px-2.5 py-1 rounded-lg font-bold border border-st-warning/40 whitespace-nowrap shrink-0">
                    Repor
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Vaccines Card */}
          <div className="card rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
              <h3 className="font-bold text-st-arctic text-sm flex items-center gap-2">
                <Syringe className="w-4 h-4 text-st-electric shrink-0" />
                <span className="whitespace-nowrap">Vacinas Vencendo</span>
              </h3>
              <Link href="/automations" className="text-xs text-st-electric font-semibold hover:underline whitespace-nowrap shrink-0">
                Ver Regras
              </Link>
            </div>

            <div className="space-y-3">
              {INITIAL_MEDICAL_RECORDS.filter((m) => m.next_due_date).map((rec) => (
                <div key={rec.id} className="p-3 rounded-xl bg-st-surface-2 border border-st-border text-xs space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-st-arctic flex-1 min-w-0 leading-tight">{rec.description}</span>
                    <span className="text-[10px] font-bold bg-st-danger/20 text-st-danger px-2.5 py-0.5 rounded-full border border-st-danger/30 whitespace-nowrap shrink-0">
                      Vence em breve
                    </span>
                  </div>
                  <p className="text-st-muted text-[11px] whitespace-nowrap">Vencimento: {rec.next_due_date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
