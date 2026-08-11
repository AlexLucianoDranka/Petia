'use client';

import { PLANS, PlanType } from '@/lib/plans';

export function usePlanLimits(currentPlanType: PlanType = 'ouro') {
  const plan = PLANS[currentPlanType] || PLANS['ouro'];

  function canAddPet(currentPetCount: number): boolean {
    if (plan.limits.maxPets === 'ilimitado') return true;
    return currentPetCount < plan.limits.maxPets;
  }

  function canAddStaff(currentStaffCount: number): boolean {
    if (plan.limits.maxStaff === 'ilimitado') return true;
    return currentStaffCount < plan.limits.maxStaff;
  }

  function isFeatureUnlocked(featureKey: keyof typeof plan.limits): boolean {
    const val = plan.limits[featureKey];
    if (typeof val === 'boolean') return val;
    return true;
  }

  return {
    plan,
    canAddPet,
    canAddStaff,
    isFeatureUnlocked,
  };
}
