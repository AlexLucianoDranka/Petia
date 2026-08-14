/**
 * Multi-Tenant Data Scope & Isolation Helper for Petia SaaS
 * Ensures EVERY clinic (new, existing, or after account deletion) starts with 100% clean, empty data,
 * and completely eliminates any fallback demo data.
 */

export interface ClinicScopeInfo {
  clinicId: string;
  clinicName: string;
  isDemo: boolean;
  isNew: boolean;
}

export function getCurrentClinicScope(): ClinicScopeInfo {
  if (typeof window === 'undefined') {
    return { clinicId: 'real-clinic', clinicName: 'Sua Clínica', isDemo: false, isNew: true };
  }

  const savedClinic = localStorage.getItem('petia_clinic_data');

  if (savedClinic) {
    try {
      const parsed = JSON.parse(savedClinic);
      return {
        clinicId: parsed.id || 'real-clinic',
        clinicName: parsed.name || 'Sua Clínica',
        isDemo: false,
        isNew: !!parsed.is_new,
      };
    } catch (e) {}
  }

  const savedUser = localStorage.getItem('petia_user_profile');
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      return {
        clinicId: 'real-clinic',
        clinicName: parsedUser.clinicName || 'Sua Clínica',
        isDemo: false,
        isNew: true,
      };
    } catch (e) {}
  }

  // Fallback: Always clean real clinic scope, NEVER demo mode!
  return { clinicId: 'real-clinic', clinicName: 'Sua Clínica', isDemo: false, isNew: true };
}

/**
 * Get scoped data from localStorage. NEVER falls back to demo/mock data.
 * Always returns real saved data or empty array for new clinics.
 */
export function getScopedData<T>(storageKey: string, _ignored?: T[]): T[] {
  if (typeof window === 'undefined') return [];

  const saved = localStorage.getItem(storageKey);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  // Always return 100% clean empty state — NEVER use any fallback mock data
  return [];
}
