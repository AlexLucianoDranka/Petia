'use client';

import { useState, useEffect } from 'react';
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
  Shield,
  UserCheck as UserCheckIcon,
  Crown,
  User,
  Settings,
  DollarSign,
  Home,
  ShoppingBag,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', key: 'agenda', label: 'Agenda Visual', icon: Calendar },
  { href: '/pets', key: 'pets', label: 'Pets (Prontuário)', icon: Dog },
  { href: '/tutores', key: 'tutores', label: 'Tutores (Clientes)', icon: Users },
  { href: '/checkin', key: 'checkin', label: 'Check-in & Checkout', icon: CheckCircle2 },
  { href: '/financial', key: 'financial', label: 'Financeiro & Caixa PDV', icon: DollarSign },
  { href: '/boarding', key: 'boarding', label: 'Hospedagem & Creche', icon: Home },
  { href: '/store', key: 'store', label: 'Loja & Catálogo', icon: ShoppingBag },
  { href: '/professionals', key: 'professionals', label: 'Profissionais', icon: UserCheckIcon },
  { href: '/services', key: 'services', label: 'Serviços & Preços', icon: Briefcase },
  { href: '/inventory', key: 'inventory', label: 'Estoque & Insumos', icon: Package },
  { href: '/subscriptions', key: 'subscriptions', label: 'Planos Recorrentes', icon: CreditCard },
  { href: '/automations', key: 'automations', label: 'Central Automações', icon: Zap },
  { href: '/staff', key: 'staff', label: 'Gestão de Equipe', icon: Shield },
  { href: '/planos', key: 'planos', label: 'Planos & Assinatura', icon: Crown },
  { href: '/perfil', key: 'perfil', label: 'Meu Perfil', icon: User },
  { href: '/settings', key: 'settings', label: 'Configurações Clínica', icon: Settings },
  { href: '/tutor', key: 'tutor', label: 'Portal do Tutor', icon: UserCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isHidden, canView } = usePermissions();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const visibleNavItems = navItems.filter((item) => !isHidden(item.key) && canView(item.key));

  return (
    <>
      {/* Mobile Sticky Top Header (Compact & Discreto) */}
      <header className="md:hidden sticky top-0 z-40 bg-st-navy/95 backdrop-blur-md px-3 py-2 flex items-center justify-between shadow-sm border-none">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-st-muted hover:text-white rounded-lg hover:bg-st-surface transition-colors whitespace-nowrap shrink-0"
            aria-label="Abrir menu"
          >
            {isOpen ? <X className="w-4 h-4 shrink-0" /> : <Menu className="w-4 h-4 shrink-0" />}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src="/icons/petshop-icon.svg"
              alt="Petia Logo"
              className="w-6 h-6 rounded-lg shadow-glow object-contain shrink-0"
            />
            <span className="font-bold text-st-arctic tracking-tight text-sm whitespace-nowrap">Petia</span>
          </Link>
        </div>

        <Link
          href="/login"
          className="p-1.5 text-st-muted hover:text-red-400 transition-colors rounded-lg hover:bg-st-surface flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0"
        >
          <LogOut className="w-4 h-4 shrink-0" />
        </Link>
      </header>

      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in touch-none"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Desktop & Drawer Sidebar com borda direita minimalista */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-st-navy border-r border-st-border/30 flex flex-col transition-transform duration-300 ease-in-out h-full max-h-screen overflow-hidden shadow-sm',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header (Compact & Menor) */}
        <div className="px-4 py-3.5 flex items-center justify-between border-b border-st-border/20">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <img
              src="/icons/petshop-icon.svg"
              alt="Petia Logo"
              className="w-8 h-8 rounded-xl shadow-glow group-hover:scale-105 transition-transform shrink-0 object-contain"
            />
            <div>
              <span className="font-extrabold text-st-arctic tracking-tight text-base block leading-none whitespace-nowrap">Petia</span>
              <span className="text-[9px] text-st-muted uppercase tracking-wider font-semibold whitespace-nowrap">
                Gestão Veterinária
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 text-st-muted hover:text-white rounded-lg hover:bg-st-surface transition-colors whitespace-nowrap shrink-0"
          >
            <X className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Navigation Items (Filtrados por Permissões Granulares) */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto overscroll-contain">
          {visibleNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group whitespace-nowrap shrink-0',
                  isActive
                    ? 'bg-st-electric/15 text-st-electric font-semibold shadow-glow-sm border-none'
                    : 'text-st-muted hover:text-st-arctic hover:bg-st-surface-2'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-st-electric' : 'text-st-muted group-hover:text-st-arctic'
                  )}
                />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 bg-st-surface/30 space-y-2.5">
          <ThemeToggle />

          <div className="flex items-center justify-between gap-2 px-1 pt-1">
            <Link href="/perfil" className="flex items-center gap-2 min-w-0 group">
              <div className="w-7 h-7 rounded-full bg-st-electric/20 flex items-center justify-center text-xs font-bold text-st-electric shrink-0 group-hover:scale-105 transition-transform">
                LM
              </div>
              <span className="text-xs font-semibold text-st-arctic truncate whitespace-nowrap group-hover:text-st-electric transition-colors">
                Dr. Lucas Mendes
              </span>
            </Link>
            <Link
              href="/login"
              className="p-1.5 text-st-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors whitespace-nowrap shrink-0"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </Link>
          </div>

          <div className="pt-1">
            <SolidaTechBadge variant="sidebar" />
          </div>
        </div>
      </aside>
    </>
  );
}
