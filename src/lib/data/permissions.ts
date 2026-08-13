import { supabase } from '@/lib/supabaseClient';
import { UserRole } from '@/types/database';

export interface SystemMenuItem {
  key: string;
  label: string;
  sort_order: number;
}

export interface StaffPermissionRule {
  id?: string;
  clinic_id?: string;
  user_id: string;
  menu_key: string;
  is_hidden: boolean;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

/** All menu keys with human-readable labels for the permissions matrix */
export const ALL_MENU_KEYS: { key: string; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'agenda', label: 'Agenda Visual' },
  { key: 'checkin', label: 'Check-in & Checkout' },
  { key: 'pets', label: 'Pets (Prontuário)' },
  { key: 'tutores', label: 'Tutores (Clientes)' },
  { key: 'financial', label: 'Financeiro & Caixa PDV' },
  { key: 'boarding', label: 'Hospedagem & Creche' },
  { key: 'store', label: 'Loja & Catálogo' },
  { key: 'professionals', label: 'Profissionais' },
  { key: 'services', label: 'Serviços & Preços' },
  { key: 'inventory', label: 'Estoque & Insumos' },
  { key: 'subscriptions', label: 'Planos Recorrentes' },
  { key: 'automations', label: 'Central Automações' },
  { key: 'staff', label: 'Gestão de Equipe' },
  { key: 'tutor', label: 'Portal do Tutor' },
  { key: 'avaliacoes', label: 'Avaliações & NPS' },
  { key: 'planos', label: 'Planos & Assinatura' },
  { key: 'perfil', label: 'Meu Perfil' },
  { key: 'settings', label: 'Configurações Clínica' },
];

export function getRolePresetPermissions(role: UserRole, userId: string): StaffPermissionRule[] {
  return ALL_MENU_KEYS.map(({ key }) => {
    if (role === 'owner') {
      return {
        user_id: userId,
        menu_key: key,
        is_hidden: false,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      };
    }

    if (role === 'manager') {
      const restricted = ['staff', 'settings', 'planos'];
      return {
        user_id: userId,
        menu_key: key,
        is_hidden: false,
        can_view: true,
        can_create: !restricted.includes(key),
        can_edit: !restricted.includes(key),
        can_delete: !restricted.includes(key),
      };
    }

    if (role === 'vet') {
      const allowed = ['dashboard', 'agenda', 'checkin', 'pets', 'tutores', 'services', 'boarding'];
      return {
        user_id: userId,
        menu_key: key,
        is_hidden: !allowed.includes(key),
        can_view: allowed.includes(key),
        can_create: allowed.includes(key),
        can_edit: allowed.includes(key),
        can_delete: false,
      };
    }

    // attendant
    const allowed = ['agenda', 'checkin', 'pets', 'tutores', 'inventory', 'boarding', 'store', 'financial'];
    return {
      user_id: userId,
      menu_key: key,
      is_hidden: !allowed.includes(key),
      can_view: allowed.includes(key),
      can_create: allowed.includes(key) && !['inventory', 'financial'].includes(key),
      can_edit: allowed.includes(key) && !['inventory', 'financial'].includes(key),
      can_delete: false,
    };
  });
}

export async function fetchUserPermissions(userId: string): Promise<StaffPermissionRule[]> {
  try {
    const { data, error } = await supabase
      .from('staff_permissions')
      .select('*')
      .eq('user_id', userId);

    if (error || !data || data.length === 0) {
      return getRolePresetPermissions('owner', userId);
    }
    return data as StaffPermissionRule[];
  } catch (_err) {
    return getRolePresetPermissions('owner', userId);
  }
}

export async function upsertStaffPermissions(rules: StaffPermissionRule[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('staff_permissions')
      .upsert(rules, { onConflict: 'user_id,menu_key' });
    return !error;
  } catch (_err) {
    return true;
  }
}
