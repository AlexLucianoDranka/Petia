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
  Flame,
  Star,
  Share2,
} from 'lucide-react';
import { AppointmentStatus } from '@/types/database';
import { whatsappService } from '@/services/notifications/whatsapp';

interface HeatmapRow {
  time: string;
  Seg: number;
  Ter: number;
  Qua: number;
  Qui: number;
  Sex: number;
  Sab: number;
  Dom: number;
}

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const DAY_KEYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'] as const;

function buildDynamicHeatmap(appointments: any[]): HeatmapRow[] {
  const grid: Record<string, Record<string, number>> = {};
  
  TIME_SLOTS.forEach((slot) => {
    grid[slot] = { Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sab: 0, Dom: 0 };
  });

  appointments.forEach((apt) => {
    if (!apt.scheduled_at) return;
    const date = new Date(apt.scheduled_at);
    if (isNaN(date.getTime())) return;

    const dayKey = DAY_KEYS[date.getDay()];
    const hour = date.getHours();
    const slot = `${hour.toString().padStart(2, '0')}:00`;

    if (grid[slot] && dayKey in grid[slot]) {
      grid[slot][dayKey] += 1;
    }
  });

  return TIME_SLOTS.map((slot) => ({
    time: slot,
    Seg: grid[slot].Seg,
    Ter: grid[slot].Ter,
    Qua: grid[slot].Qua,
    Qui: grid[slot].Qui,
    Sex: grid[slot].Sex,
    Sab: grid[slot].Sab,
    Dom: grid[slot].Dom,
  }));
}

import { getScopedData } from '@/lib/data/clinicDataScope';

export default function AgendaPage() {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'heatmap'>('day');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [appointments, setAppointments] = useState<any[]>(() =>
    getScopedData('petia_appointments')
  );
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

  const handleRequestReview = (apt: any) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const reviewUrl = `${origin}/avaliacao/${apt.id}`;
    const text = `Olá ${apt.customer_name}! O atendimento do ${apt.pet_name} foi concluído. Como foi sua experiência? Por favor, nos avalie em: ${reviewUrl}`;
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

  const getHeatmapBg = (count: number) => {
    if (count === 0) return 'bg-st-surface/40 text-st-muted/40';
    if (count <= 2) return 'bg-st-electric/20 text-st-arctic';
    if (count <= 5) return 'bg-st-electric/40 text-st-arctic font-bold';
    if (count <= 8) return 'bg-st-electric text-white font-extrabold shadow-glow-sm';
    return 'bg-amber-500 text-st-navy font-extrabold shadow-glow';
  };

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-st-electric" />
              <span>Agenda Visual & Mapa de Calor</span>
            </h1>
            <span className="bg-st-electric/20 text-st-electric border border-st-electric/30 font-bold text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
              {filteredAppointments.length} Agendamentos
            </span>
          </div>
          <p className="text-xs text-st-muted mt-0.5">Visão diária, semanal e análise de horários de pico</p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1.5 bg-st-surface p-1 rounded-xl border border-st-border">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              viewMode === 'day' ? 'bg-st-electric text-white shadow-glow-sm' : 'text-st-muted hover:text-st-arctic'
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              viewMode === 'week' ? 'bg-st-electric text-white shadow-glow-sm' : 'text-st-muted hover:text-st-arctic'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
              viewMode === 'heatmap' ? 'bg-st-electric text-white shadow-glow-sm' : 'text-st-muted hover:text-st-arctic'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Mapa de Calor</span>
          </button>
        </div>
      </div>

      {/* HEATMAP VIEW */}
      {viewMode === 'heatmap' && (
        <div className="card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-st-arctic text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>Mapa de Calor de Horários de Pico</span>
              </h3>
              <p className="text-xs text-st-muted">Identifique quais horários têm maior demanda para otimizar a escala da equipe</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-st-muted font-semibold">
              <span>Baixa</span>
              <div className="w-4 h-4 rounded bg-st-electric/20" />
              <div className="w-4 h-4 rounded bg-st-electric/50" />
              <div className="w-4 h-4 rounded bg-st-electric" />
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span>Alta demanda</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="border-b border-st-border/40 text-st-muted font-bold">
                  <th className="py-2.5 px-3 text-left">Horário</th>
                  {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((d) => (
                    <th key={d} className="py-2.5 px-3">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-st-border/20">
                {buildDynamicHeatmap(appointments).map((row) => (
                  <tr key={row.time}>
                    <td className="py-2 px-3 font-mono font-bold text-st-electric text-left">{row.time}</td>
                    <td className="p-1"><div className={`py-2 rounded-lg text-xs ${getHeatmapBg(row.Seg)}`}>{row.Seg}</div></td>
                    <td className="p-1"><div className={`py-2 rounded-lg text-xs ${getHeatmapBg(row.Ter)}`}>{row.Ter}</div></td>
                    <td className="p-1"><div className={`py-2 rounded-lg text-xs ${getHeatmapBg(row.Qua)}`}>{row.Qua}</div></td>
                    <td className="p-1"><div className={`py-2 rounded-lg text-xs ${getHeatmapBg(row.Qui)}`}>{row.Qui}</div></td>
                    <td className="p-1"><div className={`py-2 rounded-lg text-xs ${getHeatmapBg(row.Sex)}`}>{row.Sex}</div></td>
                    <td className="p-1"><div className={`py-2 rounded-lg text-xs ${getHeatmapBg(row.Sab)}`}>{row.Sab}</div></td>
                    <td className="p-1"><div className={`py-2 rounded-lg text-xs ${getHeatmapBg(row.Dom)}`}>{row.Dom}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NORMAL AGENDA LIST VIEW */}
      {viewMode !== 'heatmap' && (
        <div className="grid grid-cols-1 w-full space-y-3">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="card p-4 sm:p-5 rounded-2xl w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-st-border hover:border-st-electric/40 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-st-electric/20 text-st-electric border border-st-electric/30 flex items-center justify-center font-extrabold text-sm shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-st-arctic text-base truncate">{apt.pet_name}</h3>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      apt.status === 'done' ? 'bg-st-success/20 text-st-success border-st-success/30' :
                      apt.status === 'confirmed' ? 'bg-st-electric/20 text-st-electric border-st-electric/30' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-xs text-st-muted mt-0.5">Tutor: {apt.customer_name} • Serviço: <strong className="text-st-arctic">{apt.service_type}</strong></p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                {apt.status === 'done' && (
                  <button
                    onClick={() => handleRequestReview(apt)}
                    className="px-3.5 py-2 rounded-xl bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500 hover:text-st-navy transition-all text-xs font-bold border border-yellow-500/30 flex items-center gap-1.5"
                    title="Enviar Link de Avaliação Pós-Consulta no WhatsApp"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Pedir Avaliação</span>
                  </button>
                )}

                <button
                  onClick={() => handleSendWhatsApp(apt)}
                  className="px-3.5 py-2 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-bold border border-st-border flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-st-electric" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(apt.id, 'done')}
                  className="px-3.5 py-2 rounded-xl bg-st-electric text-white text-xs font-bold shadow-glow border-none"
                >
                  Concluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
