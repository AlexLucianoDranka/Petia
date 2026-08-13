'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, CalendarPlus, ShieldCheck, Syringe, AlertTriangle, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenQuickAppointment?: () => void;
  onToggleMobileMenu?: () => void;
}

export function Header({ onOpenQuickAppointment, onToggleMobileMenu }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-st-navy/95 backdrop-blur-md h-[72px] px-3 lg:px-8 flex items-center justify-between gap-3 shadow-sm border-b border-st-border/10 pt-[env(safe-area-inset-top,0px)]">
      {/* Left: Mobile Menu Button & Brand (mobile only) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-st-muted hover:text-st-arctic rounded-xl hover:bg-st-surface transition-colors shrink-0"
          aria-label="Abrir menu principal"
        >
          <Menu className="w-5 h-5 shrink-0" />
        </button>

        <Link href="/dashboard" className="md:hidden flex items-center gap-1.5 shrink-0">
          <img
            src="/icons/petshop-icon.svg"
            alt="Petia Logo"
            className="w-7 h-7 rounded-lg shadow-glow object-contain shrink-0"
          />
          <span className="font-extrabold text-st-arctic tracking-tight text-sm shrink-0">Petia</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 flex-1 max-w-md min-w-0">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-st-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar pet, tutor, vacina..."
            className="w-full bg-st-surface text-st-arctic text-xs lg:text-sm pl-9 pr-3 py-2 rounded-xl border border-st-border/40 focus:border-st-electric outline-none transition-all placeholder:text-st-muted/60"
          />
        </div>
      </div>

      {/* Right Action Icons & Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-st-electric/15 text-st-electric text-xs font-semibold whitespace-nowrap border border-st-electric/20">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Vila Madalena</span>
        </div>

        <button
          onClick={onOpenQuickAppointment}
          className="flex items-center gap-1.5 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-3 lg:px-4 py-2 rounded-xl transition-all shadow-glow hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 border-none"
        >
          <CalendarPlus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Novo Agendamento</span>
          <span className="sm:hidden text-xs">Agendar</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-muted hover:text-st-arctic transition-colors relative border border-st-border/40 whitespace-nowrap shrink-0"
            title="Notificações"
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-st-danger animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-st-danger"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-st-surface rounded-2xl shadow-2xl p-4 z-50 animate-fade-in border border-st-border">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-st-border/40">
                <h4 className="font-semibold text-sm text-st-arctic">Notificações Recentes</h4>
                <span className="text-[10px] bg-st-electric/20 text-st-electric font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  2 novas
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-st-navy border border-st-border/40 flex items-start gap-2.5">
                  <Syringe className="w-4 h-4 text-st-electric shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-st-arctic">Vacina V4 Felina Próxima</p>
                    <p className="text-st-muted text-[11px]">Luna (Mariana) vence em 5 dias.</p>
                    <span className="text-[9px] text-st-muted/60">Há 2 horas</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-st-navy border border-st-border/40 flex items-start gap-2.5">
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
