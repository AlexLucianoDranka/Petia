'use client';

import React, { useState } from 'react';
import { Search, Bell, CalendarPlus, Check } from 'lucide-react';

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
            placeholder="Buscar pet, tutor, telefone ou agendamento..."
            className="w-full bg-slate-100/80 focus:bg-white text-xs lg:text-sm pl-9 pr-4 py-2 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Action Icons & Buttons */}
      <div className="flex items-center gap-3">
        {/* Quick New Appointment Button */}
        <button
          onClick={onOpenQuickAppointment}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
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
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h4 className="font-semibold text-sm text-slate-900">Notificações</h4>
              </div>
              <div className="flex flex-col items-center py-6 gap-2 text-center">
                <Check className="w-8 h-8 text-emerald-400" />
                <p className="text-xs text-slate-500 font-medium">Tudo em dia! Sem alertas.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
