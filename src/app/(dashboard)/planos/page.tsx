'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Crown, Zap, ShieldCheck, ArrowRight, ExternalLink, Info, HelpCircle } from 'lucide-react';
import { PLANS, PlanType } from '@/lib/plans';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

export default function PlanosPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activePlan, setActivePlan] = useState<PlanType>('ouro');
  const [checkoutLoading, setCheckoutLoading] = useState<PlanType | null>(null);

  useEffect(() => {
    const savedClinic = localStorage.getItem('petia_clinic_data');
    if (savedClinic) {
      try {
        const parsed = JSON.parse(savedClinic);
        if (parsed.plan) setActivePlan(parsed.plan as PlanType);
      } catch (e) {}
    }
  }, []);

  const handleSubscribeStripe = async (planId: PlanType) => {
    setCheckoutLoading(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback demo activation when Stripe API keys are not configured yet
        setActivePlan(planId);
        const savedClinic = JSON.parse(localStorage.getItem('petia_clinic_data') || '{}');
        savedClinic.plan = planId;
        localStorage.setItem('petia_clinic_data', JSON.stringify(savedClinic));
        alert(`Plano ${PLANS[planId].name} ativado com sucesso em ambiente de testes!`);
      }
    } catch (err) {
      alert('Modo de demonstração: Plano selecionado com sucesso!');
      setActivePlan(planId);
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up w-full max-w-6xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-st-electric/15 border border-st-electric/30 text-st-electric">
          <Sparkles className="w-3.5 h-3.5" /> Planos & Assinaturas Petia
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-st-arctic tracking-tight">
          Escolha o Plano Perfeito para Sua Clínica
        </h1>
        <p className="text-st-muted text-sm max-w-2xl mx-auto">
          Cresça sem limites com gestão veterinária digital, prontuários, WhatsApp automático e suporte dedicado.
        </p>

        {/* Monthly vs Yearly Toggle */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-st-arctic' : 'text-st-muted'}`}>
            Faturamento Mensal
          </span>
          <button
            type="button"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 bg-st-surface border border-st-border rounded-full relative transition-colors p-0.5"
          >
            <div
              className={`w-5 h-5 rounded-full bg-st-electric transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-st-arctic' : 'text-st-muted'}`}>
            <span>Faturamento Anual</span>
            <span className="text-[10px] bg-st-success/20 text-st-success px-2 py-0.5 rounded-full border border-st-success/30 font-extrabold">
              Economize ~20%
            </span>
          </span>
        </div>
      </div>

      {/* Current Active Plan Status Bar */}
      <div className="card p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-st-electric/30 bg-st-electric/10">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-st-electric shrink-0" />
          <div>
            <span className="text-[10px] font-extrabold uppercase text-st-electric tracking-wider block">
              Seu Plano Atual
            </span>
            <h3 className="font-extrabold text-st-arctic text-lg">
              {PLANS[activePlan]?.name || 'Clínica Pro Ouro'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-st-muted">
          <div>
            <span className="block font-bold text-st-arctic text-sm">34 / {PLANS[activePlan]?.limits.maxPets}</span>
            <span>Pets Cadastrados</span>
          </div>
          <div className="h-8 w-px bg-st-border/60" />
          <div>
            <span className="block font-bold text-st-arctic text-sm">3 / {PLANS[activePlan]?.limits.maxStaff}</span>
            <span>Usuários Staff</span>
          </div>
        </div>
      </div>

      {/* 6 Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {Object.values(PLANS).map((plan) => {
          const isCurrent = activePlan === plan.id;
          const price = billingCycle === 'yearly' ? (plan.priceYearly / 12).toFixed(2) : plan.priceMonthly.toFixed(2);

          return (
            <div
              key={plan.id}
              className={`card p-6 rounded-2xl flex flex-col justify-between space-y-6 relative transition-all duration-200 ${
                plan.popular
                  ? 'border-2 border-st-electric shadow-glow scale-[1.02] bg-st-surface'
                  : 'border border-st-border hover:border-st-electric/50'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-st-electric text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-glow whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-xl text-st-arctic">{plan.name}</h3>
                  <p className="text-xs text-st-muted mt-1 min-h-[36px]">{plan.description}</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-st-muted">R$</span>
                    <span className="text-4xl font-extrabold text-st-arctic">{price}</span>
                    <span className="text-xs text-st-muted">/mês</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <span className="text-[10px] text-st-success font-semibold block mt-0.5">
                      Cobrado R$ {plan.priceYearly.toFixed(2)} anualmente
                    </span>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-st-border/40">
                  <span className="text-[10px] font-bold uppercase text-st-muted tracking-wider block">O que inclui:</span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-st-arctic">
                      <Check className="w-4 h-4 text-st-electric shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-st-electric/20 border border-st-electric/40 text-st-electric font-extrabold text-xs cursor-default whitespace-nowrap"
                  >
                    Plano Ativo
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribeStripe(plan.id)}
                    disabled={checkoutLoading === plan.id}
                    className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                      plan.popular
                        ? 'bg-st-electric hover:bg-st-steel text-white shadow-glow'
                        : 'bg-st-surface hover:bg-st-surface-2 text-st-arctic border border-st-border'
                    }`}
                  >
                    {checkoutLoading === plan.id ? (
                      'Iniciando Stripe...'
                    ) : (
                      <>
                        <span>Assinar com Stripe</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Setup Guide Section */}
      <div className="card p-6 rounded-2xl space-y-4 border border-st-border/60 bg-st-surface/40">
        <h3 className="font-bold text-st-arctic text-base flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-st-electric" />
          <span>Como Configurar a Integração com o Stripe em Produção</span>
        </h3>
        <div className="text-xs text-st-muted space-y-2 leading-relaxed">
          <p>
            1. Crie uma conta no <strong className="text-st-arctic">Stripe.com</strong> e pegue suas chaves de API no painel do desenvolvedor.
          </p>
          <p>
            2. Adicione as variáveis no arquivo <code className="text-st-electric font-mono">.env.local</code> da sua aplicação:
          </p>
          <pre className="bg-st-navy p-3 rounded-xl text-st-arctic font-mono text-[11px] border border-st-border overflow-x-auto">
{`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...`}
          </pre>
          <p>
            3. No painel do Stripe em <strong>Webhooks</strong>, adicione a URL <code className="text-st-electric font-mono">https://seu-dominio.com/api/webhooks/stripe</code> ouvindo os eventos <code className="text-st-arctic font-mono">checkout.session.completed</code> e <code className="text-st-arctic font-mono">customer.subscription.updated</code>.
          </p>
        </div>
      </div>

      <SolidaTechBadge variant="auth" />
    </div>
  );
}
