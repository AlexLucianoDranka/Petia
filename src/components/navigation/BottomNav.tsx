'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, CheckCircle2, Dog, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_NAV = [
  { label: 'Painel', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Agenda', href: '/agenda', icon: Calendar },
  { label: 'Check-in', href: '/checkin', icon: CheckCircle2 },
  { label: 'Pets', href: '/pets', icon: Dog },
  { label: 'Automação', href: '/automations', icon: Zap },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="bg-st-navy/85 backdrop-blur-xl border border-st-electric/20 rounded-[2rem] p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] shadow-st-electric/10">
        <nav className="flex items-center justify-around">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-[1.5rem] transition-all duration-300 ease-out select-none shrink-0 min-w-[60px]',
                  isActive
                    ? 'bg-gradient-to-tr from-st-electric to-st-electric/80 text-white shadow-lg shadow-st-electric/30 scale-105 -translate-y-1'
                    : 'text-st-muted hover:text-st-arctic active:scale-95 hover:bg-st-surface/50'
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0 transition-colors', isActive && 'text-white')} />
                <span className="text-[10px] tracking-tight whitespace-nowrap font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
