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

function getDaysRemaining(endDateStr: string | null): number {
  if (!endDateStr) return 0;
  const now = new Date();
  const endDate = new Date(endDateStr);
  return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

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
  const endDate = new Date(startDate.getTime() + DEFAULT_TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const daysRemaining = getDaysRemaining(endDate.toISOString());

  return {
    isTrial: daysRemaining > 0,
    daysRemaining,
    trialEndsAt: endDate.toISOString(),
  };
}

const initialTrial = getTrialInfo();

const DEFAULT_PLAN: CurrentPlan = {
  planType: 'diamond',
  planConfig: PLANS['diamond'],
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
              const status = clinicData.subscription_status || 'trial';
              
              const dbTrialEndsAt = clinicData.trial_ends_at;
              const actualTrialEndsAt = dbTrialEndsAt || trialInfo.trialEndsAt;
              const actualDaysRemaining = dbTrialEndsAt ? getDaysRemaining(dbTrialEndsAt) : trialInfo.daysRemaining;
              
              const isTrial = status === 'trial' || (status !== 'active' && actualDaysRemaining > 0);
              
              let planType = (clinicData.plan as PlanType) || 'basico';
              if (isTrial && status !== 'active') {
                planType = 'diamond';
              }
              const planConfig = PLANS[planType] || PLANS['basico'];

              const result: CurrentPlan = {
                planType,
                planConfig,
                subscriptionStatus: status as CurrentPlan['subscriptionStatus'],
                trialEndsAt: actualTrialEndsAt,
                trialDaysRemaining: actualDaysRemaining,
                isLoading: false,
                isTrial,
                isActive: status === 'active',
                isPastDue: status === 'past_due',
                isCanceled: status === 'canceled',
              };

              localStorage.setItem('petia_current_plan', JSON.stringify({ 
                planType, 
                status,
                trialEndsAt: actualTrialEndsAt
              }));
              setState(result);
              return;
            }
          }
        }

        // 2. Fallback to localStorage cache
        const cached = localStorage.getItem('petia_current_plan');
        if (cached) {
          const parsed = JSON.parse(cached) as {
            planType: PlanType;
            status: string;
            trialEndsAt?: string;
          };
          
          const actualTrialEndsAt = parsed.trialEndsAt || trialInfo.trialEndsAt;
          const actualDaysRemaining = parsed.trialEndsAt ? getDaysRemaining(parsed.trialEndsAt) : trialInfo.daysRemaining;
          const status = parsed.status || 'trial';
          const isTrial = status === 'trial' || (status !== 'active' && actualDaysRemaining > 0);
          
          let planType = parsed.planType || 'basico';
          if (isTrial && status !== 'active') {
            planType = 'diamond';
          }
          
          const planConfig = PLANS[planType] || PLANS['basico'];

          setState({
            planType,
            planConfig,
            subscriptionStatus: (status as CurrentPlan['subscriptionStatus']) || 'trial',
            trialEndsAt: actualTrialEndsAt,
            trialDaysRemaining: actualDaysRemaining,
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
        planType: 'diamond',
        planConfig: PLANS['diamond'],
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
