'use client';

import React, { useState } from 'react';
import { CreditCard, Plus, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { INITIAL_SUBSCRIPTION_PLANS, INITIAL_CUSTOMER_SUBSCRIPTIONS } from '@/lib/mockData';
import { createPetSubscriptionCheckoutSession } from '@/services/stripe';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState(INITIAL_SUBSCRIPTION_PLANS);
  const [subscriptions, setSubscriptions] = useState(INITIAL_CUSTOMER_SUBSCRIPTIONS);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleTestStripeCheckout = async (plan: any) => {
    setLoadingPlanId(plan.id);
    const session = await createPetSubscriptionCheckoutSession({
      customerId: 'cust-3',
      customerEmail: 'nanda.lima@email.com',
      planId: plan.id,
      planName: plan.name,
      priceInCents: plan.price * 100,
      returnUrl: window.location.href,
    });

    setLoadingPlanId(null);
    if (session.url) {
      window.location.href = session.url;
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-st-electric" />
            <span>Planos de Assinatura (Recorrência)</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Planos mensais para tutores (ex: Banho Mensal, Saúde Pet) cobrados via Stripe</p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all">
          <Plus className="w-4 h-4" />
          <span>Criar Novo Plano Recorrente</span>
        </button>
      </div>

      {/* Plans Catalog */}
      <div className="space-y-4">
        <h2 className="font-bold text-st-arctic text-base">Catálogo de Planos Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="card p-6 rounded-2xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
                  <div>
                    <h3 className="font-extrabold text-st-arctic text-lg">{plan.name}</h3>
                    <span className="text-[10px] bg-st-electric/20 text-st-electric border border-st-electric/30 font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Cobrança {plan.frequency}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-st-electric">R$ {plan.price.toFixed(2)}</span>
                    <span className="text-xs text-st-muted block font-medium">/mês</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-st-muted">Benefícios Inclusos</span>
                  <ul className="space-y-1.5 text-xs text-st-arctic">
                    {plan.services_included.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 font-medium">
                        <CheckCircle className="w-4 h-4 text-st-success shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleTestStripeCheckout(plan)}
                disabled={loadingPlanId === plan.id}
                className="w-full py-3 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow transition-all"
              >
                {loadingPlanId === plan.id ? (
                  <span>Iniciando Checkout Stripe...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Testar Checkout de Assinatura (Stripe)</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Customer Subscriptions */}
      <div className="card rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-st-arctic text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-st-electric" />
          <span>Assinaturas de Tutores Ativas ({subscriptions.length})</span>
        </h3>

        <div className="space-y-2">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 rounded-xl bg-st-navy border border-st-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <h4 className="font-extrabold text-st-arctic">{sub.customer_name}</h4>
                <p className="text-st-muted">{sub.plan_name} • Stripe ID: {sub.stripe_subscription_id}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-st-success/20 text-st-success border border-st-success/30 font-bold px-2.5 py-1 rounded-full text-[10px]">
                  Status: {sub.status.toUpperCase()}
                </span>
                <span className="text-st-muted font-medium">Renova em: 18 dias</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
