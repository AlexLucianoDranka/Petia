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
  Star,
  X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { supabase } from '@/lib/supabaseClient';
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
  { href: '/avaliacoes', key: 'avaliacoes', label: 'Avaliações & NPS', icon: Star },
  { href: '/staff', key: 'staff', label: 'Gestão de Equipe', icon: Shield },
  { href: '/planos', key: 'planos', label: 'Planos & Assinatura', icon: Crown },
  { href: '/perfil', key: 'perfil', label: 'Meu Perfil', icon: User },
  { href: '/settings', key: 'settings', label: 'Configurações Clínica', icon: Settings },
  { href: '/tutor', key: 'tutor', label: 'Portal do Tutor', icon: UserCheck },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen: externalIsOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const { isHidden, canView } = usePermissions();

  const isDrawerOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = onClose || (() => setInternalIsOpen(false));

  useEffect(() => {
    handleClose();
  }, [pathname]);

  useEffect(() => {
    const loadUserData = () => {
      const savedUser = localStorage.getItem('petia_user_profile');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.name) setUserName(parsed.name);
          if (parsed.avatar) setUserAvatar(parsed.avatar);
          else setUserAvatar(null);
        } catch (e) {}
      }
    };

    loadUserData();

    window.addEventListener('storage', loadUserData);
    window.addEventListener('petia_user_profile_updated', loadUserData);

    return () => {
      window.removeEventListener('storage', loadUserData);
      window.removeEventListener('petia_user_profile_updated', loadUserData);
    };
  }, []);

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'LM';
    const parts = nameStr.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    const cleanParts = parts.filter(p => !['dr.', 'dra.', 'dr', 'dra'].includes(p.toLowerCase()));
    if (cleanParts.length >= 2) {
      return (cleanParts[0][0] + cleanParts[cleanParts.length - 1][0]).toUpperCase();
    }
    if (cleanParts.length === 1) {
      return cleanParts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const visibleNavItems = navItems.filter((item) => !isHidden(item.key) && canView(item.key));

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in touch-none"
          onClick={handleClose}
        />
      )}

      {/* Main Desktop & Drawer Sidebar com bordas retas e mais espaço para marca */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-st-navy border-r border-st-border/10 flex flex-col transition-transform duration-300 ease-in-out h-full max-h-screen overflow-hidden shadow-sm pt-[env(safe-area-inset-top,0px)]',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header com bordas retas e espaço amplo */}
        <div className="h-[72px] px-5 flex items-center justify-between border-b border-st-border/10 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3.5 group">
            <img
              src="/icons/petshop-icon.svg"
              alt="Petia Logo"
              className="w-9 h-9 rounded-none group-hover:scale-105 transition-transform shrink-0 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-st-arctic tracking-tight text-lg leading-tight whitespace-nowrap">Petia</span>
              <span className="text-[10px] text-st-muted uppercase tracking-widest font-semibold whitespace-nowrap mt-0.5">
                Gestão Veterinária
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleClose}
            className="md:hidden p-1.5 text-st-muted hover:text-white rounded-none hover:bg-st-surface transition-colors whitespace-nowrap shrink-0"
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
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group whitespace-nowrap shrink-0',
                  isActive
                    ? 'bg-st-electric/15 text-st-electric font-semibold'
                    : 'text-st-muted hover:text-st-arctic hover:bg-st-surface-2/60'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors duration-200',
                    isActive ? 'text-st-electric' : 'text-st-muted group-hover:text-st-arctic'
                  )}
                />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="bg-st-surface/20 border-t border-st-border/10 shrink-0">
          {/* User Row */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-st-border/10">
            <Link href="/perfil" className="flex items-center gap-3 min-w-0 group" title="Ver Meu Perfil">
              <div className="w-8 h-8 rounded-full bg-st-electric/20 text-st-electric border border-st-electric/30 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden shadow-sm">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(userName)}</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-st-arctic truncate block group-hover:text-st-electric transition-colors">
                  {userName}
                </span>
                <span className="text-[10px] text-st-muted">Proprietário</span>
              </div>
            </Link>
            <button
              onClick={async () => {
                try { await supabase.auth.signOut(); } catch (_) {}
                localStorage.clear();
                sessionStorage.clear();
                // Clear all cookies
                document.cookie.split(';').forEach((c) => {
                  document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/');
                });
                window.location.href = '/login';
              }}
              className="p-1.5 text-st-muted hover:text-red-400 rounded-none hover:bg-red-500/10 transition-colors whitespace-nowrap shrink-0 border-none bg-transparent cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Theme Toggle Row */}
          <div className="px-4 py-2.5">
            <ThemeToggle />
          </div>

          {/* Badge */}
          <div className="px-4 pb-3">
            <SolidaTechBadge variant="sidebar" />
          </div>
        </div>
      </aside>
    </>
  );
}
