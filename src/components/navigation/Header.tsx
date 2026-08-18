'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  CalendarPlus,
  Menu,
  X,
  Syringe,
  AlertTriangle,
  Package,
  Check,
  Dog,
  CheckCircle2,
  UserPlus,
  Hotel,
} from 'lucide-react';

interface HeaderProps {
  onOpenQuickAppointment?: () => void;
  onToggleMobileMenu?: () => void;
}

interface Notification {
  id: string;
  icon: 'vaccine' | 'stock' | 'appointment';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

function buildNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];

  const notes: Notification[] = [];

  // Upcoming vaccines from medical records
  try {
    const records = JSON.parse(localStorage.getItem('petia_medical_records') || '[]');
    const today = new Date();
    records
      .filter((r: any) => r.next_due_date)
      .forEach((r: any) => {
        const due = new Date(r.next_due_date);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 14) {
          notes.push({
            id: `vac-${r.id}`,
            icon: 'vaccine',
            title: 'Vacina Vencendo em Breve',
            body: `${r.description} vence em ${diffDays === 0 ? 'hoje' : `${diffDays} dia${diffDays > 1 ? 's' : ''}`}.`,
            time: `Vencimento: ${new Date(r.next_due_date).toLocaleDateString('pt-BR')}`,
            read: false,
          });
        }
      });
  } catch (_) {}

  // Low stock items
  try {
    const inventory = JSON.parse(localStorage.getItem('petia_inventory') || '[]');
    inventory
      .filter((item: any) => item.quantity <= item.min_quantity)
      .slice(0, 3)
      .forEach((item: any) => {
        notes.push({
          id: `stock-${item.id}`,
          icon: 'stock',
          title: 'Estoque Abaixo do Mínimo',
          body: `${item.name}: ${item.quantity} un restantes (mín: ${item.min_quantity}).`,
          time: 'Verifique o estoque',
          read: false,
        });
      });
  } catch (_) {}

  // Unconfirmed appointments
  try {
    const appointments = JSON.parse(localStorage.getItem('petia_appointments') || '[]');
    const pending = appointments.filter((a: any) => a.status === 'scheduled').slice(0, 2);
    pending.forEach((apt: any) => {
      notes.push({
        id: `apt-${apt.id}`,
        icon: 'appointment',
        title: 'Agendamento Não Confirmado',
        body: `${apt.pet_name} — ${apt.service_type}.`,
        time: `Tutor: ${apt.customer_name}`,
        read: false,
      });
    });
  } catch (_) {}

  return notes;
}

export function Header({ onOpenQuickAppointment, onToggleMobileMenu }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ label: string; href: string; type: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setNotifications(buildNotifications());

    const refresh = () => setNotifications(buildNotifications());
    window.addEventListener('petia_user_profile_updated', refresh);
    window.addEventListener('petia_data_updated', refresh);
    return () => {
      window.removeEventListener('petia_user_profile_updated', refresh);
      window.removeEventListener('petia_data_updated', refresh);
    };
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Global search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results: { label: string; href: string; type: string }[] = [];

    try {
      const pets = JSON.parse(localStorage.getItem('petia_pets') || '[]');
      pets
        .filter((p: any) => p.name?.toLowerCase().includes(q) || p.breed?.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach((p: any) => results.push({ label: `🐾 ${p.name} (${p.breed})`, href: '/pets', type: 'Pet' }));

      const customers = JSON.parse(localStorage.getItem('petia_customers') || '[]');
      customers
        .filter((c: any) => c.name?.toLowerCase().includes(q) || c.phone?.includes(q))
        .slice(0, 3)
        .forEach((c: any) => results.push({ label: `👤 ${c.name}`, href: '/tutores', type: 'Tutor' }));
    } catch (_) {}

    setSearchResults(results);
  }, [searchQuery]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const NotifIcon = ({ type }: { type: string }) => {
    if (type === 'vaccine') return <Syringe className="w-4 h-4 text-st-electric shrink-0 mt-0.5" />;
    if (type === 'stock') return <AlertTriangle className="w-4 h-4 text-st-warning shrink-0 mt-0.5" />;
    return <Package className="w-4 h-4 text-st-muted shrink-0 mt-0.5" />;
  };

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

      {/* Minimalist Search Input with Ctrl+K shortcut badge */}
      <div className="flex items-center gap-2 flex-1 max-w-sm lg:max-w-md min-w-0 relative">
        <div className="relative w-full group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted/70 group-focus-within:text-st-electric transition-colors pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 150)}
            placeholder="Buscar por pet, tutor, telefone..."
            className="w-full bg-st-surface/70 focus:bg-st-surface text-st-arctic text-xs lg:text-sm pl-10 pr-14 py-2.5 rounded-xl border border-st-border/30 hover:border-st-border/60 focus:border-st-electric outline-none transition-all placeholder:text-st-muted/50 shadow-inner"
          />

          {!searchQuery ? (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-medium text-st-muted/60 bg-st-navy/80 border border-st-border/30 rounded pointer-events-none select-none">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          ) : (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-st-muted hover:text-st-arctic transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearch && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-st-surface rounded-xl shadow-2xl border border-st-border z-50 overflow-hidden animate-fade-in">
            {searchResults.map((r, i) => (
              <button
                key={i}
                onMouseDown={() => {
                  router.push(r.href);
                  setSearchQuery('');
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs hover:bg-st-surface-2 transition-colors text-left"
              >
                <span className="text-st-arctic font-medium">{r.label}</span>
                <span className="text-[10px] text-st-electric bg-st-electric/15 px-2 py-0.5 rounded-full font-semibold">
                  {r.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Quick Action Buttons (Atalhos no PC) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Check-in Button */}
        <Link
          href="/checkin"
          className="hidden 2xl:inline-flex items-center gap-1.5 bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold px-3 py-2 rounded-xl border border-st-border/50 transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
          title="Ir para Esteira de Check-in"
        >
          <CheckCircle2 className="w-4 h-4 text-st-success shrink-0" />
          <span>Check-in</span>
        </Link>

        {/* Quick Hotel / Creche Button */}
        <Link
          href="/boarding"
          className="hidden xl:inline-flex items-center gap-1.5 bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold px-3 py-2 rounded-xl border border-st-border/50 transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
          title="Nova Reserva para Hotel / Creche"
        >
          <Hotel className="w-4 h-4 text-amber-400 shrink-0" />
          <span>+ Reserva Creche</span>
        </Link>

        {/* Quick Inventory Button */}
        <Link
          href="/inventory"
          className="hidden xl:inline-flex items-center gap-1.5 bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold px-3 py-2 rounded-xl border border-st-border/50 transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
          title="Gerenciar Estoque"
        >
          <Package className="w-4 h-4 text-st-electric shrink-0" />
          <span>Estoque</span>
        </Link>

        {/* Quick New Tutor Button */}
        <Link
          href="/tutores"
          className="hidden lg:inline-flex items-center gap-1.5 bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold px-3 py-2 rounded-xl border border-st-border/50 transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
          title="Cadastrar Novo Tutor"
        >
          <UserPlus className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>+ Novo Tutor</span>
        </Link>

        {/* Quick New Pet Button */}
        <Link
          href="/pets"
          className="hidden md:inline-flex items-center gap-1.5 bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold px-3 py-2 rounded-xl border border-st-border/50 transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
          title="Cadastrar Novo Pet"
        >
          <Dog className="w-4 h-4 text-st-electric shrink-0" />
          <span>+ Novo Pet</span>
        </Link>

        {/* Primary CTA: Novo Agendamento */}
        <button
          onClick={onOpenQuickAppointment}
          className="flex items-center gap-1.5 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-3 lg:px-4 py-2 rounded-xl transition-all shadow-glow hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 border-none cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Novo Agendamento</span>
          <span className="sm:hidden text-xs">Agendar</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markAllRead();
            }}
            className="p-2 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-muted hover:text-st-arctic transition-colors relative border border-st-border/40 whitespace-nowrap shrink-0 cursor-pointer"
            title="Notificações"
          >
            <Bell className="w-4 h-4 shrink-0" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-st-danger animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-st-danger" />
              </>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-st-surface rounded-2xl shadow-2xl p-4 z-50 animate-fade-in border border-st-border">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-st-border/40">
                <h4 className="font-semibold text-sm text-st-arctic">Notificações</h4>
                {notifications.length > 0 && (
                  <span className="text-[10px] bg-st-electric/20 text-st-electric font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {notifications.length} alerta{notifications.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="flex flex-col items-center py-6 gap-2 text-center">
                  <Check className="w-8 h-8 text-st-success/60" />
                  <p className="text-xs text-st-muted font-medium">Tudo em dia! Sem alertas no momento.</p>
                </div>
              ) : (
                <div className="space-y-2 text-xs max-h-72 overflow-y-auto sidebar-scrollbar">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-st-navy border border-st-border/40 flex items-start gap-2.5">
                      <NotifIcon type={n.icon} />
                      <div className="min-w-0">
                        <p className="font-semibold text-st-arctic truncate">{n.title}</p>
                        <p className="text-st-muted text-[11px] leading-snug">{n.body}</p>
                        <span className="text-[9px] text-st-muted/60">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
