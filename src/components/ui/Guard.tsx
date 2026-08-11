'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface GuardProps {
  menu: string;
  action: 'view' | 'create' | 'edit' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Guard({ menu, action, children, fallback = null }: GuardProps) {
  const { canView, canCreate, canEdit, canDelete } = usePermissions();

  let isAllowed = true;
  if (action === 'view') isAllowed = canView(menu);
  if (action === 'create') isAllowed = canCreate(menu);
  if (action === 'edit') isAllowed = canEdit(menu);
  if (action === 'delete') isAllowed = canDelete(menu);

  if (!isAllowed) return <>{fallback}</>;
  return <>{children}</>;
}
