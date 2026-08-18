'use client';

import { useState, useEffect } from 'react';
import { PLANS, PlanType, PlanConfig } from '@/lib/plans';
import { supabase } from '@/lib/supabaseClient';

export interface CurrentPlan {
  planType: PlanType;
  planConfig: PlanConfig;
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'canceled' | 'unknown';
  trialEndsAt: string | null;
  trialDaysRemaining: number;
  isLoading: boolean;
  isTrial: boolean;
  isActive: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
}

const DEFAULT_TRIAL_DAYS = 7;

function getTrialInfo() {
  if (typeof window === 'undefined') {
    return { isTrial: true, daysRemaining: DEFAULT_TRIAL_DAYS, trialEndsAt: null };
  }

  let trialStart = localStorage.getItem('petia_trial_start');
  if (!trialStart) {
    trialStart = new Date().toISOString();
    localStorage.setItem('petia_trial_start', trialStart);
  }

  const startDate = new Date(trialStart);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, DEFAULT_TRIAL_DAYS - diffDays);
  const endDate = new Date(startDate.getTime() + DEFAULT_TRIAL_DAYS * 24 * 60 * 60 * 1000);

  return {
    isTrial: daysRemaining > 0,
    daysRemaining,
    trialEndsAt: endDate.toISOString(),
  };
}

const initialTrial = getTrialInfo();

const DEFAULT_PLAN: CurrentPlan = {
  planType: 'basico',
  planConfig: PLANS['basico'],
  subscriptionStatus: 'trial',
  trialEndsAt: initialTrial.trialEndsAt,
  trialDaysRemaining: initialTrial.daysRemaining,
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
      const trialInfo = getTrialInfo();

      try {
        // 1. Try to get plan from Supabase auth session + clinic record
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
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

              const isTrial = status === 'trial' || trialInfo.isTrial;

              const result: CurrentPlan = {
                planType,
                planConfig,
                subscriptionStatus: status as CurrentPlan['subscriptionStatus'],
                trialEndsAt: clinicData.trial_ends_at || trialInfo.trialEndsAt,
                trialDaysRemaining: trialInfo.daysRemaining,
                isLoading: false,
                isTrial,
                isActive: status === 'active',
                isPastDue: status === 'past_due',
                isCanceled: status === 'canceled',
              };

              localStorage.setItem('petia_current_plan', JSON.stringify({ planType, status }));
              setState(result);
              return;
            }
          }
        }

        // 2. Fallback to localStorage cache
        const cached = localStorage.getItem('petia_current_plan');
        if (cached) {
          const { planType, status } = JSON.parse(cached) as {
            planType: PlanType;
            status: string;
          };
          const planConfig = PLANS[planType] || PLANS['basico'];
          const isTrial = status === 'trial' || trialInfo.isTrial;

          setState({
            planType,
            planConfig,
            subscriptionStatus: (status as CurrentPlan['subscriptionStatus']) || 'trial',
            trialEndsAt: trialInfo.trialEndsAt,
            trialDaysRemaining: trialInfo.daysRemaining,
            isLoading: false,
            isTrial,
            isActive: status === 'active',
            isPastDue: status === 'past_due',
            isCanceled: status === 'canceled',
          });
          return;
        }
      } catch (_err) {
        // ignore errors
      }

      // Default: 7-day trial active
      setState({
        planType: 'basico',
        planConfig: PLANS['basico'],
        subscriptionStatus: 'trial',
        trialEndsAt: trialInfo.trialEndsAt,
        trialDaysRemaining: trialInfo.daysRemaining,
        isLoading: false,
        isTrial: trialInfo.isTrial,
        isActive: false,
        isPastDue: false,
        isCanceled: false,
      });
    }

    load();
  }, []);

  return state;
}
