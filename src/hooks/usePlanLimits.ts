'use client';

import { PLANS, PlanType } from '@/lib/plans';
import { useCurrentPlan } from '@/hooks/useCurrentPlan';

/**
 * Returns limit-checking functions for the currently active plan.
 * Reads the real plan from Supabase via useCurrentPlan.
 * Pass `overridePlan` to test a specific plan (e.g. on the /planos page).
 */
export function usePlanLimits(overridePlan?: PlanType) {
  const { planType: currentPlanType, isLoading } = useCurrentPlan();
  const planType = overridePlan ?? currentPlanType;
  const plan = PLANS[planType] || PLANS['basico'];

  function canAddPet(currentPetCount: number): boolean {
    if (plan.limits.maxPets === 'ilimitado') return true;
    return currentPetCount < (plan.limits.maxPets as number);
  }

  function canAddStaff(currentStaffCount: number): boolean {
    if (plan.limits.maxStaff === 'ilimitado') return true;
    return currentStaffCount < (plan.limits.maxStaff as number);
  }

  function isFeatureUnlocked(featureKey: keyof typeof plan.limits): boolean {
    const val = plan.limits[featureKey];
    if (typeof val === 'boolean') return val;
    return true;
  }

  function getRemainingWhatsApp(usedThisMonth: number): number {
    const limit = plan.limits.whatsappAutomations;
    return Math.max(0, limit - usedThisMonth);
  }

  return {
    plan,
    planType,
    isLoading,
    canAddPet,
    canAddStaff,
    isFeatureUnlocked,
    getRemainingWhatsApp,
  };
}
