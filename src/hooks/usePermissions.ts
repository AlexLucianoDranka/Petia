'use client';

import { useState, useEffect } from 'react';
import { StaffPermissionRule, fetchUserPermissions, getRolePresetPermissions } from '@/lib/data/permissions';
import { UserRole } from '@/types/database';

export function usePermissions(userId: string = 'u1', role: UserRole = 'owner') {
  const [permissions, setPermissions] = useState<StaffPermissionRule[]>(getRolePresetPermissions(role, userId));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const rules = await fetchUserPermissions(userId);
      setPermissions(rules);
      setLoading(false);
    }
    load();
  }, [userId, role]);

  function isHidden(menuKey: string): boolean {
    const rule = permissions.find((p) => p.menu_key === menuKey);
    return rule ? rule.is_hidden : false;
  }

  function canView(menuKey: string): boolean {
    const rule = permissions.find((p) => p.menu_key === menuKey);
    return rule ? rule.can_view : true;
  }

  function canCreate(menuKey: string): boolean {
    const rule = permissions.find((p) => p.menu_key === menuKey);
    return rule ? rule.can_create : true;
  }

  function canEdit(menuKey: string): boolean {
    const rule = permissions.find((p) => p.menu_key === menuKey);
    return rule ? rule.can_edit : true;
  }

  function canDelete(menuKey: string): boolean {
    const rule = permissions.find((p) => p.menu_key === menuKey);
    return rule ? rule.can_delete : true;
  }

  return {
    permissions,
    loading,
    isHidden,
    canView,
    canCreate,
    canEdit,
    canDelete,
    setPermissions,
  };
}
