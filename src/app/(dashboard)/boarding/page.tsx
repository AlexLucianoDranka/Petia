'use client';

import React, { useState } from 'react';
import { Home, Calendar, Clock, Plus, CheckCircle2, AlertCircle, Dog, Heart, Camera, Phone, UserCheck, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

export default function BoardingPage() {
  const [currentGuests] = useState([
    {
      id: 'b-1',
      petName: 'Thor',
      breed: 'Golden Retriever',
      tutorName: 'Mariana Silva Santos',
      phone: '(11) 99123-4567',
      unit: 'Baia #01 (Canil VIP)',
      checkIn: '2026-08-10 09:00',
      checkOutExpected: '2026-08-15 18:00',
      type: 'Hotelzinho',
      dietNotes: 'Ração Premier 300g às 08:00 e 18:00. Medicação para articulação às 12:00.',
      status: 'checked_in',
    },
    {
      id: 'b-2',
      petName: 'Luna',
      breed: 'Persa',
      tutorName: 'Carlos Eduardo',
      phone: '(11) 98765-4321',
      unit: 'Gatil Suíte #03',
      checkIn: '2026-08-11 08:30',
      checkOutExpected: '2026-08-11 19:00',
      type: 'Daycare / Creche',
      dietNotes: 'Sachê sachê sachê às 13:00. Adora brincar com o arranhador azul.',
      status: 'checked_in',
    },
  ]);

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Home className="w-6 h-6 text-st-electric" />
            <span>Hospedagem & Creche (Hotel & Daycare Pet)</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">
            Gestão de baias, check-in de estadia, diário de bordo com fotos e controle de alimentação/medicação
          </p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap shrink-0 border-none">
          <Plus className="w-4 h-4 shrink-0" />
          <span>Nova Reserva / Check-in</span>
        </button>
      </div>

      {/* 1 Coluna por Hospedagem na Horizontal (100% Tela) */}
      <div className="grid grid-cols-1 w-full space-y-3">
        {currentGuests.map((guest) => (
          <div key={guest.id} className="card p-5 rounded-2xl space-y-4 border border-st-border w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-st-border/40 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-st-electric/20 border border-st-electric/40 flex items-center justify-center text-st-electric font-bold shrink-0 shadow-glow">
                  <Dog className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-st-arctic text-lg">{guest.petName}</h3>
                  <p className="text-xs text-st-muted">{guest.breed} • Tutor: {guest.tutorName}</p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-st-success/20 text-st-success border border-st-success/30 whitespace-nowrap self-start sm:self-auto">
                {guest.type}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-st-navy p-3.5 rounded-xl border border-st-border/60">
              <div>
                <span className="text-[9px] font-bold uppercase text-st-muted block">Baia / Vaga</span>
                <span className="font-extrabold text-st-electric text-sm">{guest.unit}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-st-muted block">Entrada</span>
                <span className="font-bold text-st-arctic">{guest.checkIn}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-st-muted block">Saída Prevista</span>
                <span className="font-bold text-st-arctic">{guest.checkOutExpected}</span>
              </div>
            </div>

            <div className="text-xs text-st-muted space-y-1">
              <span className="text-[10px] font-bold uppercase text-st-electric block">Instruções de Alimentação & Saúde:</span>
              <p className="p-2.5 rounded-xl bg-st-surface border border-st-border/40 text-st-arctic text-[11px] leading-relaxed">
                {guest.dietNotes}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-st-border/40 text-xs flex-wrap gap-2">
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic font-semibold border border-st-border">
                <Camera className="w-3.5 h-3.5 text-st-electric" /> Enviar Foto no WhatsApp
              </button>
              <button className="px-4 py-2 rounded-xl bg-st-electric text-white font-semibold shadow-glow border-none whitespace-nowrap">
                Realizar Check-out
              </button>
            </div>
          </div>
        ))}
      </div>

      <SolidaTechBadge variant="auth" />
    </div>
  );
}
