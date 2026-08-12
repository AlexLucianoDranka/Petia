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

export const ALL_MENU_KEYS = [
  'dashboard',
  'agenda',
  'checkin',
  'pets',
  'tutores',
  'financial',
  'boarding',
  'store',
  'professionals',
  'services',
  'inventory',
  'subscriptions',
  'automations',
  'staff',
  'planos',
  'perfil',
  'settings',
];

export function getRolePresetPermissions(role: UserRole, userId: string): StaffPermissionRule[] {
  return ALL_MENU_KEYS.map((key) => {
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
      return {
        user_id: userId,
        menu_key: key,
        is_hidden: false,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: key !== 'staff' && key !== 'settings',
      };
    }

    if (role === 'vet') {
      const isAllowed = ['dashboard', 'agenda', 'checkin', 'pets', 'tutores', 'services', 'boarding'].includes(key);
      return {
        user_id: userId,
        menu_key: key,
        is_hidden: !isAllowed,
        can_view: isAllowed,
        can_create: isAllowed,
        can_edit: isAllowed,
        can_delete: false,
      };
    }

    // Attendant
    const isAllowed = ['agenda', 'checkin', 'pets', 'tutores', 'inventory', 'boarding', 'store', 'financial'].includes(key);
    return {
      user_id: userId,
      menu_key: key,
      is_hidden: !isAllowed,
      can_view: isAllowed,
      can_create: isAllowed && key !== 'inventory' && key !== 'financial',
      can_edit: isAllowed && key !== 'inventory' && key !== 'financial',
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
  } catch (err) {
    return getRolePresetPermissions('owner', userId);
  }
}

export async function upsertStaffPermissions(rules: StaffPermissionRule[]): Promise<boolean> {
  try {
    const { error } = await supabase.from('staff_permissions').upsert(rules, { onConflict: 'user_id,menu_key' });
    return !error;
  } catch (err) {
    return true;
  }
}
