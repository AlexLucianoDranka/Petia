'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { PlanType, PLANS } from '@/lib/plans';
import { useCurrentPlan } from '@/hooks/useCurrentPlan';

const PLAN_ORDER: PlanType[] = [
  'basico',
  'essencial',
  'profissional',
  'ouro',
  'platina',
  'diamond',
];

function planRank(plan: PlanType): number {
  return PLAN_ORDER.indexOf(plan);
}

interface PlanGateProps {
  /** Minimum plan required to access this feature */
  requiredPlan: PlanType;
  /** Feature name shown in the upgrade card */
  featureName: string;
  /** Brief description of what this feature does */
  featureDescription?: string;
  /** Children to render if plan is sufficient */
  children: React.ReactNode;
}

/**
 * Wraps content behind a plan requirement.
 * If the user's active plan doesn't meet the requirement,
 * shows a premium upgrade card instead of the content.
 */
export function PlanGate({
  requiredPlan,
  featureName,
  featureDescription,
  children,
}: PlanGateProps) {
  const { planType, isLoading } = useCurrentPlan();

  // Show children while loading to avoid flicker
  if (isLoading) {
    return <>{children}</>;
  }

  const hasAccess = planRank(planType) >= planRank(requiredPlan);

  if (hasAccess) {
    return <>{children}</>;
  }

  const requiredPlanConfig = PLANS[requiredPlan];

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-6">
      <div className="card max-w-md w-full p-8 rounded-2xl border border-st-electric/20 bg-gradient-to-b from-st-surface to-st-navy text-center space-y-5 shadow-2xl relative overflow-hidden">
        {/* Decorative glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }}
        />

        <div className="w-14 h-14 rounded-2xl bg-st-electric/10 border border-st-electric/20 text-st-electric flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-st-electric/10 text-st-electric border border-st-electric/20">
            <Crown className="w-3 h-3" />
            Requer plano {requiredPlanConfig.name}
          </div>
          <h2 className="text-xl font-extrabold text-st-arctic">{featureName}</h2>
          {featureDescription && (
            <p className="text-xs text-st-muted leading-relaxed">{featureDescription}</p>
          )}
        </div>

        <div className="space-y-2 text-left border border-st-border/40 rounded-xl p-4 bg-st-surface/40">
          <p className="text-[10px] font-bold uppercase text-st-muted tracking-wider mb-2">
            Incluso no plano {requiredPlanConfig.name}:
          </p>
          {requiredPlanConfig.features.slice(0, 4).map((feat, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-st-arctic">
              <Sparkles className="w-3.5 h-3.5 text-st-electric shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        <Link
          href="/planos"
          className="w-full py-3 rounded-xl bg-st-electric hover:bg-st-steel text-white font-extrabold text-sm shadow-glow transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Crown className="w-4 h-4 shrink-0" />
          <span>Ver Planos e Fazer Upgrade</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>

        <p className="text-[11px] text-st-muted">
          Seu plano atual:{' '}
          <span className="font-bold text-st-arctic">{PLANS[planType]?.name || planType}</span>
        </p>
      </div>
    </div>
  );
}
