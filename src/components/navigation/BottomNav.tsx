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
    <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pb-[env(safe-area-inset-bottom,0px)] w-full px-4 max-w-[380px]">
      <div className="bg-st-navy/90 backdrop-blur-2xl border border-st-border/50 rounded-full p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <nav className="flex items-center justify-between">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-full transition-all duration-300 select-none shrink-0 flex-1',
                  isActive
                    ? 'bg-st-electric/15 text-st-electric shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]'
                    : 'text-st-muted hover:text-st-arctic active:scale-95'
                )}
              >
                <Icon className={cn('w-[18px] h-[18px] shrink-0 transition-colors', isActive ? 'text-st-electric' : '')} />
                <span className={cn(
                  'text-[9px] tracking-tight whitespace-nowrap transition-all duration-300',
                  isActive ? 'font-bold' : 'font-medium'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
