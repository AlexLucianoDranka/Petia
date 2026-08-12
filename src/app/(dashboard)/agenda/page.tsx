'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  User,
  Dog,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';
import { INITIAL_APPOINTMENTS, INITIAL_STAFF } from '@/lib/mockData';
import { AppointmentStatus } from '@/types/database';
import { whatsappService } from '@/services/notifications/whatsapp';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

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
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-st-electric" />
              <span>Agenda Visual</span>
            </h1>
            <span className="bg-st-electric/20 text-st-electric border border-st-electric/30 font-bold text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
              {filteredAppointments.length} Agendamentos
            </span>
          </div>
          <p className="text-xs text-st-muted mt-0.5">Visão de horários, bloqueios e controle de banho, tosa e consultas</p>
        </div>

        {/* View Mode Toggle & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-st-navy p-1 rounded-xl flex items-center gap-1 border border-st-border">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                viewMode === 'day' ? 'bg-st-electric text-white shadow-glow-sm' : 'text-st-muted hover:text-st-arctic'
              }`}
            >
              Dia (Hoje)
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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
        </div>
      </div>

      {/* 1 Coluna por Agendamento na Horizontal (100% Tela) */}
      <div className="grid grid-cols-1 w-full space-y-3">
        {filteredAppointments.map((apt) => (
          <div
            key={apt.id}
            onClick={() => setSelectedAppointment(apt)}
            className="card p-4 sm:p-5 rounded-2xl w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-st-border hover:border-st-electric/40 transition-all cursor-pointer"
          >
            {/* Time & Service */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-st-electric/20 text-st-electric border border-st-electric/40 flex flex-col items-center justify-center shrink-0 shadow-glow">
                <span className="text-xs font-extrabold font-mono">{apt.scheduled_at ? apt.scheduled_at.split('T')[1]?.slice(0, 5) : '09:00'}</span>
                <span className="text-[9px] text-st-muted uppercase">Horário</span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-st-arctic text-base truncate">{apt.service_type}</h3>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                      apt.status === 'confirmed'
                        ? 'bg-st-success/20 text-st-success border-st-success/30'
                        : apt.status === 'done'
                        ? 'bg-st-electric/20 text-st-electric border-st-electric/30'
                        : 'bg-st-warning/20 text-st-warning border-st-warning/30'
                    }`}
                  >
                    {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'done' ? 'Concluído' : 'Agendado'}
                  </span>
                </div>
                <p className="text-xs text-st-muted mt-0.5">
                  Pet: <strong className="text-st-arctic">{apt.pet_name}</strong> • Tutor: {apt.customer_name}
                </p>
              </div>
            </div>

            {/* Professional & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-st-border/40 pt-3 lg:pt-0 lg:pl-4">
              <div>
                <span className="text-[10px] font-bold text-st-muted uppercase block">Profissional Escala</span>
                <span className="font-semibold text-st-arctic block">{apt.staff_name || 'Dr. Lucas Mendes'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-st-muted uppercase block">Contato Tutor</span>
                <span className="font-mono text-st-electric font-semibold block">{apt.customer_phone || '(11) 99123-4567'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-st-border/20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendWhatsApp(apt);
                }}
                className="px-3.5 py-2 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic font-semibold text-xs border border-st-border flex items-center gap-1.5 whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5 text-st-electric" /> Lembrete WhatsApp
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(apt.id, 'done');
                }}
                className="px-4 py-2 bg-st-electric hover:bg-st-steel text-white font-bold rounded-xl text-xs shadow-glow transition-all whitespace-nowrap border-none"
              >
                Concluir Atendimento
              </button>
            </div>
          </div>
        ))}
      </div>

      <SolidaTechBadge variant="auth" />
    </div>
  );
}
