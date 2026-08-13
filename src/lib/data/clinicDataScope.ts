/**
 * Multi-Tenant Data Scope & Isolation Helper for Petia SaaS
 * Ensures newly registered clinics start with 100% clean, empty data (0 appointments, 0 pets, 0 stock alerts),
 * and only loads mock data if explicitly in Demo Mode (clinic_id === 'c101').
 */

export interface ClinicScopeInfo {
  clinicId: string;
  clinicName: string;
  isDemo: boolean;
  isNew: boolean;
}

export function getCurrentClinicScope(): ClinicScopeInfo {
  if (typeof window === 'undefined') {
    return { clinicId: 'c101', clinicName: 'Petia Demo', isDemo: true, isNew: false };
  }

  const savedClinic = localStorage.getItem('petia_clinic_data');
  const isNewAccount = localStorage.getItem('petia_is_new_account') === 'true';

  if (savedClinic) {
    try {
      const parsed = JSON.parse(savedClinic);
      const clinicId = parsed.id || 'real-clinic';
      const isDemo = clinicId === 'c101' && !isNewAccount && !parsed.is_new;

      return {
        clinicId,
        clinicName: parsed.name || 'Sua Clínica',
        isDemo,
        isNew: isNewAccount || !!parsed.is_new || !isDemo,
      };
    } catch (e) {}
  }

  // If user registered or logged in with real account, return clean scope
  const savedUser = localStorage.getItem('petia_user_profile');
  if (savedUser) {
    return { clinicId: 'real-clinic', clinicName: 'Sua Clínica', isDemo: false, isNew: true };
  }

  // Fallback default
  return { clinicId: 'c101', clinicName: 'Petia Demo', isDemo: true, isNew: false };
}

export function getScopedData<T>(storageKey: string, demoFallbackData: T[]): T[] {
  if (typeof window === 'undefined') return demoFallbackData;

  const scope = getCurrentClinicScope();
  const saved = localStorage.getItem(storageKey);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  // If real/new clinic and no custom data saved yet, return empty list (100% clean state)
  if (!scope.isDemo) {
    return [];
  }

  // If demo mode, return mock data
  return demoFallbackData;
}
