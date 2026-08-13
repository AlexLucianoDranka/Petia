'use client';

import { useState, useEffect } from 'react';
import { PLANS, PlanType, PlanConfig } from '@/lib/plans';
import { supabase } from '@/lib/supabaseClient';

export interface CurrentPlan {
  planType: PlanType;
  planConfig: PlanConfig;
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'canceled' | 'unknown';
  trialEndsAt: string | null;
  isLoading: boolean;
  isTrial: boolean;
  isActive: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
}

const DEFAULT_PLAN: CurrentPlan = {
  planType: 'basico',
  planConfig: PLANS['basico'],
  subscriptionStatus: 'trial',
  trialEndsAt: null,
  isLoading: true,
  isTrial: true,
  isActive: false,
  isPastDue: false,
  isCanceled: false,
};

export function useCurrentPlan(): CurrentPlan {
  const [state, setState] = useState<CurrentPlan>(DEFAULT_PLAN);

  useEffect(() => {
    async function load() {
      try {
        // 1. Try to get plan from Supabase auth session + clinic record
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Look up the user's clinic
          const { data: userData } = await supabase
            .from('users')
            .select('clinic_id')
            .eq('id', user.id)
            .maybeSingle();

          if (userData?.clinic_id) {
            const { data: clinicData } = await supabase
              .from('clinics')
              .select('plan, subscription_status, trial_ends_at, current_period_end')
              .eq('id', userData.clinic_id)
              .maybeSingle();

            if (clinicData) {
              const planType = (clinicData.plan as PlanType) || 'basico';
              const status = clinicData.subscription_status || 'trial';
              const planConfig = PLANS[planType] || PLANS['basico'];

              const result: CurrentPlan = {
                planType,
                planConfig,
                subscriptionStatus: status as CurrentPlan['subscriptionStatus'],
                trialEndsAt: clinicData.trial_ends_at || null,
                isLoading: false,
                isTrial: status === 'trial',
                isActive: status === 'active',
                isPastDue: status === 'past_due',
                isCanceled: status === 'canceled',
              };

              // Cache in localStorage for offline use
              localStorage.setItem('petia_current_plan', JSON.stringify({ planType, status }));
              setState(result);
              return;
            }
          }
        }

        // 2. Fallback to localStorage cache (offline or not authenticated)
        const cached = localStorage.getItem('petia_current_plan');
        if (cached) {
          const { planType, status } = JSON.parse(cached) as {
            planType: PlanType;
            status: string;
          };
          const planConfig = PLANS[planType] || PLANS['basico'];
          setState({
            planType,
            planConfig,
            subscriptionStatus: (status as CurrentPlan['subscriptionStatus']) || 'trial',
            trialEndsAt: null,
            isLoading: false,
            isTrial: status === 'trial',
            isActive: status === 'active',
            isPastDue: status === 'past_due',
            isCanceled: status === 'canceled',
          });
          return;
        }

        // 3. Fallback: check legacy petia_clinic_data
        const clinicData = localStorage.getItem('petia_clinic_data');
        if (clinicData) {
          const parsed = JSON.parse(clinicData);
          const planType = (parsed.plan as PlanType) || 'basico';
          const planConfig = PLANS[planType] || PLANS['basico'];
          setState({
            planType,
            planConfig,
            subscriptionStatus: 'trial',
            trialEndsAt: null,
            isLoading: false,
            isTrial: true,
            isActive: false,
            isPastDue: false,
            isCanceled: false,
          });
          return;
        }
      } catch (_err) {
        // ignore errors — show default
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    }

    load();
  }, []);

  return state;
}
