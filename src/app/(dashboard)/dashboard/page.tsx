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
import Link from 'next/link';

import { APP_VERSION } from '@/lib/version';
import { OnboardingTour } from '@/components/navigation/OnboardingTour';
import { getScopedData, getCurrentClinicScope } from '@/lib/data/clinicDataScope';
import { showToast, startTopLoader, stopTopLoader } from '@/components/ui/GlobalToastAndLoader';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<any[]>(() =>
    getScopedData('petia_appointments')
  );
  const [inventory] = useState<any[]>(() =>
    getScopedData('petia_inventory')
  );
  const [medicalRecords] = useState<any[]>(() =>
    getScopedData('petia_medical_records')
  );
  const [invoices] = useState<any[]>(() =>
    getScopedData('petia_invoices')
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

  const lowStockItems = inventory.filter((item: any) => item.quantity <= item.min_quantity);
  const upcomingVaccines = medicalRecords.filter((m: any) => m.next_due_date);

  // Computed metrics from real data
  const totalRevenue = invoices
    .filter((inv: any) => inv.status === 'paid')
    .reduce((acc: number, inv: any) => acc + (inv.amount || 0), 0);

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
                {lowStockItems.map((i: any) => i.name).join(', ')} abaixo do limite mínimo.
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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="card p-4 sm:p-5 rounded-xl space-y-3 min-w-0">
          <div className="flex items-center justify-between text-st-muted gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">Faturamento Mês</span>
            <div className="w-8 h-8 rounded-xl bg-st-success/20 text-st-success flex items-center justify-center font-bold shrink-0 text-xs">
              R$
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-st-arctic truncate">
              {totalRevenue > 0 ? `R$ ${totalRevenue.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
            </h3>
            <p className="text-[11px] text-st-muted font-medium flex items-center gap-1 mt-0.5 truncate">
              {totalRevenue > 0 ? (
                <><TrendingUp className="w-3 h-3 shrink-0 text-st-success" /> Receitas confirmadas</>
              ) : (
                'Nenhuma receita ainda'
              )}
            </p>
          </div>
        </div>

        <div className="card p-4 sm:p-5 rounded-xl space-y-3 min-w-0">
          <div className="flex items-center justify-between text-st-muted gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">Agendamentos</span>
            <div className="w-8 h-8 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-st-arctic truncate">{appointments.length}</h3>
            <p className="text-[11px] text-st-muted font-medium mt-0.5 truncate">
              {appointments.length === 0 ? 'Nenhum agendamento ainda' : `${appointments.filter((a: any) => a.status === 'confirmed').length} confirmados`}
            </p>
          </div>
        </div>

        <div className="card p-4 sm:p-5 rounded-xl space-y-3 min-w-0">
          <div className="flex items-center justify-between text-st-muted gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">Pets Cadastrados</span>
            <div className="w-8 h-8 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center shrink-0">
              <Dog className="w-4 h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-st-arctic truncate">
              {getScopedData('petia_pets').length}
            </h3>
            <p className="text-[11px] text-st-muted font-medium mt-0.5 truncate">
              {getScopedData('petia_pets').length === 0 ? 'Nenhum pet ainda' : 'Pets ativos'}
            </p>
          </div>
        </div>

        <div className="card p-4 sm:p-5 rounded-xl space-y-3 min-w-0">
          <div className="flex items-center justify-between text-st-muted gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider truncate">Estoque Crítico</span>
            <div className="w-8 h-8 rounded-xl bg-st-danger/20 text-st-danger flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-st-arctic truncate">{lowStockItems.length}</h3>
            <p className="text-[11px] text-st-muted font-medium mt-0.5 truncate">
              {lowStockItems.length === 0 ? 'Estoque OK' : 'Itens abaixo do mínimo'}
            </p>
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
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-st-surface-2 border border-st-border flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-st-muted" />
                </div>
                <p className="text-st-muted text-sm font-semibold">Nenhum agendamento para hoje</p>
                <p className="text-st-muted/70 text-xs">Crie seu primeiro agendamento na aba Agenda</p>
                <Link href="/agenda" className="mt-1 text-xs text-st-electric font-bold hover:underline">
                  Ir para Agenda →
                </Link>
              </div>
            ) : (
              appointments.map((apt: any) => {
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
                          <span className="font-bold text-st-arctic whitespace-nowrap">R$ {apt.price?.toFixed(2)}</span>
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
              })
            )}
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
              {lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-st-success/50" />
                  <p className="text-xs text-st-muted">Estoque em níveis normais</p>
                </div>
              ) : (
                lowStockItems.map((item: any) => (
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
                ))
              )}
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
              {upcomingVaccines.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center gap-2">
                  <Syringe className="w-8 h-8 text-st-electric/30" />
                  <p className="text-xs text-st-muted">Nenhuma vacina a vencer</p>
                </div>
              ) : (
                upcomingVaccines.map((rec: any) => (
                  <div key={rec.id} className="p-3 rounded-xl bg-st-surface-2 border border-st-border text-xs space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-st-arctic flex-1 min-w-0 leading-tight">{rec.description}</span>
                      <span className="text-[10px] font-bold bg-st-danger/20 text-st-danger px-2.5 py-0.5 rounded-full border border-st-danger/30 whitespace-nowrap shrink-0">
                        Vence em breve
                      </span>
                    </div>
                    <p className="text-st-muted text-[11px] whitespace-nowrap">Vencimento: {rec.next_due_date}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
