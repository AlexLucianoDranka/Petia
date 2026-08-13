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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-st-navy/95 backdrop-blur-lg border-t border-st-border/60 text-st-muted px-1.5 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl">
      <nav className="flex items-center justify-around">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all select-none shrink-0 min-w-[56px]',
                isActive
                  ? 'text-st-electric font-bold bg-st-electric/15 scale-105'
                  : 'text-st-muted hover:text-st-arctic active:scale-95'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-st-electric')} />
              <span className="text-[10px] tracking-tight whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
