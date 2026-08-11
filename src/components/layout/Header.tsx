'use client';

import React, { useState } from 'react';
import { Search, Plus, Bell, Smartphone, ShieldCheck, CalendarPlus } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onOpenQuickAppointment?: () => void;
}

export function Header({ onOpenQuickAppointment }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-sm">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar pet, tutor, telefone ou agendamento (ex: Thor, Mariana...)"
            className="w-full bg-slate-100/80 focus:bg-white text-xs lg:text-sm pl-9 pr-4 py-2 rounded-xl border border-transparent focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Action Icons & Buttons */}
      <div className="flex items-center gap-3">
        {/* Mobile PWA Install / Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Multi-tenant RLS Ativo</span>
        </div>

        {/* Quick New Appointment Button */}
        <button
          onClick={onOpenQuickAppointment}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs lg:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-brand-600/20 active:scale-95"
        >
          <CalendarPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Agendamento</span>
          <span className="sm:hidden">Agendar</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition-colors relative"
            title="Notificações"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h4 className="font-semibold text-sm text-slate-900">Notificações Recentes</h4>
                <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-2 py-0.5 rounded-full">2 novas</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-start gap-2.5">
                  <span className="text-base">💉</span>
                  <div>
                    <p className="font-semibold text-slate-800">Vacina V4 Felina Próxima</p>
                    <p className="text-slate-500 text-[11px]">Luna (Mariana) vence em 5 dias.</p>
                    <span className="text-[9px] text-slate-400">Há 2 horas</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-start gap-2.5">
                  <span className="text-base">⚠️</span>
                  <div>
                    <p className="font-semibold text-amber-800">Estoque Baixo</p>
                    <p className="text-slate-500 text-[11px]">Shampoo Hipoalergênico tem apenas 3 un.</p>
                    <span className="text-[9px] text-slate-400">Há 4 horas</span>
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
