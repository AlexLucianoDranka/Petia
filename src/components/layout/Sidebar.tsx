'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Dog,
  Users,
  Briefcase,
  CheckCircle2,
  Package,
  CreditCard,
  Zap,
  UserCheck,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Agenda Visual', href: '/agenda', icon: Calendar, badge: 'Hoje' },
  { label: 'Check-in & Checkout', href: '/checkin', icon: CheckCircle2 },
  { label: 'Pets (Prontuário)', href: '/pets', icon: Dog },
  { label: 'Tutores (Clientes)', href: '/tutores', icon: Users },
  { label: 'Serviços & Preços', href: '/services', icon: Briefcase },
  { label: 'Controle de Estoque', href: '/inventory', icon: Package },
  { label: 'Planos & Subscrições', href: '/subscriptions', icon: CreditCard },
  { label: 'Central de Automações', href: '/automations', icon: Zap, highlight: true },
  { label: 'Portal do Tutor (Visão Cliente)', href: '/tutor', icon: UserCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white min-h-screen border-r border-slate-800 shadow-xl fixed left-0 top-0 bottom-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Dog className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight flex items-center gap-1 text-white">
              Clinia <span className="text-brand-400 font-extrabold">Pet</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Gestão & Automação</p>
          </div>
        </Link>
      </div>



      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto sidebar-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-brand-500/30 text-brand-300 px-2 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Staff Profile Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            LM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">Usuário</p>
            <p className="text-[11px] text-slate-400 truncate">Petia</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
