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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-st-navy/95 backdrop-blur-lg border-t border-st-border/60 text-st-muted px-2 py-2 shadow-2xl">
      <nav className="flex items-center justify-around">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all',
                isActive
                  ? 'text-st-electric font-bold bg-st-electric/10 scale-105'
                  : 'text-st-muted hover:text-st-arctic'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-st-electric animate-pulse')} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
