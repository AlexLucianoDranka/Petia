'use client';

import React, { useState } from 'react';
import { Search, Bell, CalendarPlus, ShieldCheck, Syringe, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onOpenQuickAppointment?: () => void;
}

export function Header({ onOpenQuickAppointment }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-st-navy/90 backdrop-blur-md px-4 lg:px-8 py-3 flex items-center justify-between shadow-sm border-none">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-st-muted" />
          <input
            type="text"
            placeholder="Buscar pet, tutor, vacina ou agendamento (ex: Thor, Mariana...)"
            className="w-full bg-st-surface text-st-arctic text-xs lg:text-sm pl-9 pr-4 py-2 rounded-xl border-none focus:border-st-electric outline-none transition-all placeholder:text-st-muted/60"
          />
        </div>
      </div>

      {/* Right Action Icons & Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-st-electric/15 text-st-electric text-xs font-semibold whitespace-nowrap border-none">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Vila Madalena • RLS Ativo</span>
        </div>

        <button
          onClick={onOpenQuickAppointment}
          className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-glow hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 border-none"
        >
          <CalendarPlus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Novo Agendamento</span>
          <span className="sm:hidden">Agendar</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-muted hover:text-st-arctic transition-colors relative border-none whitespace-nowrap shrink-0"
            title="Notificações"
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-st-danger animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-st-danger"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-st-surface rounded-2xl shadow-2xl p-4 z-50 animate-fade-in border-none">
              <div className="flex items-center justify-between mb-3 pb-2 border-none">
                <h4 className="font-semibold text-sm text-st-arctic">Notificações Recentes</h4>
                <span className="text-[10px] bg-st-electric/20 text-st-electric font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  2 novas
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-st-navy border-none flex items-start gap-2.5">
                  <Syringe className="w-4 h-4 text-st-electric shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-st-arctic">Vacina V4 Felina Próxima</p>
                    <p className="text-st-muted text-[11px]">Luna (Mariana) vence em 5 dias.</p>
                    <span className="text-[9px] text-st-muted/60">Há 2 horas</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-st-navy border-none flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-st-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-st-warning">Estoque Baixo</p>
                    <p className="text-st-muted text-[11px]">Shampoo Hipoalergênico tem 3 un.</p>
                    <span className="text-[9px] text-st-muted/60">Há 4 horas</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
