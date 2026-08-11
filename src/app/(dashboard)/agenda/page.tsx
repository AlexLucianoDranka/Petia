'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  User,
  Dog,
  MessageSquare,
} from 'lucide-react';
import { INITIAL_APPOINTMENTS, INITIAL_STAFF } from '@/lib/mockData';
import { AppointmentStatus } from '@/types/database';
import { whatsappService } from '@/services/notifications/whatsapp';

export default function AgendaPage() {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
    if (staffFilter !== 'all' && apt.staff_id !== staffFilter) return false;
    return true;
  });

  const handleSendWhatsApp = (apt: any) => {
    const text = `Olá ${apt.customer_name}! Confirmamos o agendamento de ${apt.pet_name} para ${apt.service_type} no Petia. Te esperamos!`;
    const url = whatsappService.generateWhatsAppClickUrl(apt.customer_phone || '11999999999', text);
    window.open(url, '_blank');
  };

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
    if (selectedAppointment?.id === id) {
      setSelectedAppointment({ ...selectedAppointment, status });
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-st-electric" />
              <span>Agenda Visual</span>
            </h1>
            <span className="bg-st-electric/20 text-st-electric border border-st-electric/30 font-bold text-xs px-2.5 py-1 rounded-full">
              4 Agendamentos
            </span>
          </div>
          <p className="text-xs text-st-muted mt-0.5">Visão de horários, bloqueios e controle de banho, tosa e consultas</p>
        </div>

        {/* View Mode Toggle & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-st-navy p-1 rounded-xl flex items-center gap-1 border border-st-border">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'day' ? 'bg-st-electric text-white shadow-glow-sm' : 'text-st-muted hover:text-st-arctic'
              }`}
            >
              Dia (Hoje)
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'week' ? 'bg-st-electric text-white shadow-glow-sm' : 'text-st-muted hover:text-st-arctic'
              }`}
            >
              Semana
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-st-surface border border-st-border rounded-xl px-3 py-2 text-xs font-semibold text-st-arctic outline-none focus:border-st-electric"
          >
            <option value="all">Todos os Status</option>
            <option value="scheduled">Agendado</option>
            <option value="confirmed">Confirmado</option>
            <option value="done">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>

          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="bg-st-surface border border-st-border rounded-xl px-3 py-2 text-xs font-semibold text-st-arctic outline-none focus:border-st-electric"
          >
            <option value="all">Todos os Profissionais</option>
            {INITIAL_STAFF.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule List Timeline */}
        <div className="lg:col-span-2 space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="card p-12 rounded-2xl text-center space-y-3">
              <CalendarIcon className="w-10 h-10 text-st-electric mx-auto" />
              <h3 className="font-bold text-st-arctic">Nenhum agendamento encontrado</h3>
              <p className="text-xs text-st-muted">Ajuste os filtros acima para visualizar outros horários.</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const isSelected = selectedAppointment?.id === apt.id;
              const formattedTime = new Date(apt.scheduled_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className={`cursor-pointer card p-5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-st-electric ring-2 ring-st-electric/30 bg-st-surface-2'
                      : 'hover:border-st-electric/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-center bg-st-electric/15 p-3 rounded-xl border border-st-electric/30 min-w-[70px]">
                        <span className="block text-xs text-st-electric font-extrabold uppercase">Horário</span>
                        <span className="text-lg font-black text-st-arctic font-mono">{formattedTime}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-st-arctic text-base">{apt.pet_name}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              apt.status === 'confirmed'
                                ? 'bg-st-success/20 text-st-success border-st-success/30'
                                : apt.status === 'done'
                                ? 'bg-st-surface-2 text-st-muted border-st-border'
                                : 'bg-st-warning/20 text-st-warning border-st-warning/30'
                            }`}
                          >
                            {apt.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-st-muted font-medium">
                          Serviço: <span className="font-semibold text-st-arctic">{apt.service_type}</span>
                        </p>
                        <div className="flex items-center gap-4 text-xs text-st-muted pt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-st-muted" />
                            {apt.customer_name}
                          </span>
                          <span className="font-bold text-st-arctic">
                            R$ {apt.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendWhatsApp(apt);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-st-success/20 hover:bg-st-success/30 text-st-success border border-st-success/40 text-xs font-semibold transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Appointment Details */}
        <div className="card rounded-2xl p-6 h-fit space-y-5">
          {selectedAppointment ? (
            <div className="space-y-4">
              <div className="border-b border-st-border/40 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-st-arctic text-base">Detalhes do Agendamento</h3>
                  <p className="text-xs text-st-muted">ID: #{selectedAppointment.id}</p>
                </div>
                <Dog className="w-6 h-6 text-st-electric" />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-st-muted uppercase font-bold text-[10px]">Pet / Paciente</span>
                  <p className="font-extrabold text-st-arctic text-sm">{selectedAppointment.pet_name}</p>
                </div>

                <div>
                  <span className="text-st-muted uppercase font-bold text-[10px]">Tutor Responsável</span>
                  <p className="font-semibold text-st-arctic">{selectedAppointment.customer_name}</p>
                  <p className="text-st-muted font-mono">{selectedAppointment.customer_phone}</p>
                </div>

                <div>
                  <span className="text-st-muted uppercase font-bold text-[10px]">Serviço Solicitado</span>
                  <p className="font-semibold text-st-arctic">{selectedAppointment.service_type}</p>
                  <p className="text-st-electric font-bold">R$ {selectedAppointment.price.toFixed(2)}</p>
                </div>

                {selectedAppointment.notes && (
                  <div className="p-3 bg-st-navy rounded-xl border border-st-border">
                    <span className="text-st-muted font-bold text-[10px] uppercase">Observações</span>
                    <p className="text-st-arctic mt-0.5">{selectedAppointment.notes}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-st-border/40 space-y-2">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Alterar Status Rápido</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                      className="px-3 py-2 rounded-xl bg-st-electric/20 hover:bg-st-electric/30 text-st-electric font-semibold text-xs border border-st-electric/40"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'done')}
                      className="px-3 py-2 rounded-xl bg-st-success/20 hover:bg-st-success/30 text-st-success font-semibold text-xs border border-st-success/40"
                    >
                      Concluir
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                      className="col-span-2 px-3 py-2 rounded-xl bg-st-danger/20 hover:bg-st-danger/30 text-st-danger font-semibold text-xs border border-st-danger/40"
                    >
                      Cancelar Agendamento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-st-muted space-y-2">
              <CalendarIcon className="w-8 h-8 text-st-muted mx-auto" />
              <p className="text-xs font-medium">Clique em um agendamento à esquerda para visualizar detalhes e enviar WhatsApp.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
