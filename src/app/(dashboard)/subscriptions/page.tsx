'use client';

import React, { useState } from 'react';
import { CreditCard, Plus, Search, Sparkles, X, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';
import { PlanGate } from '@/components/ui/PlanGate';
import { ClientPortal } from '@/components/ui/ClientPortal';

interface ClubPlan {
  id: string;
  title: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
}

const INITIAL_CLUB_PLANS: ClubPlan[] = [
  {
    id: 'club-1',
    title: 'Clube Banho & Tosa Semanal',
    price: 149.90,
    interval: 'monthly',
    features: ['4 Banhos/mês', '1 Tosa Higiênica', '10% de desc. em medicamentos'],
  },
  {
    id: 'club-2',
    title: 'Plano Saúde Total Pet',
    price: 249.90,
    interval: 'monthly',
    features: ['Consultas ilimitadas', 'Vacinas anuais V10 e Raiva', 'Telemedicina 24h'],
  },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [clubPlans, setClubPlans] = useState<ClubPlan[]>(INITIAL_CLUB_PLANS);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedPlanForLink, setSelectedPlanForLink] = useState<ClubPlan | null>(null);

  // Lock background scroll when any modal is open
  React.useEffect(() => {
    if (isNewPlanModalOpen || isLinkModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNewPlanModalOpen, isLinkModalOpen]);
  const [copied, setCopied] = useState(false);

  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newFeatures, setNewFeatures] = useState('');

  const filtered = subscriptions.filter(
    (sub) =>
      sub.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClubPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ClubPlan = {
      id: `club-${Date.now()}`,
      title: newTitle,
      price: parseFloat(newPrice) || 99.90,
      interval: 'monthly',
      features: newFeatures.split(',').map((f) => f.trim()).filter(Boolean),
    };
    setClubPlans([...clubPlans, created]);
    setIsNewPlanModalOpen(false);
    setNewTitle('');
    setNewPrice('');
    setNewFeatures('');
  };

  const getStripeCheckoutLink = (plan: ClubPlan) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/tutor?checkout_club=${plan.id}&price=${plan.price}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PlanGate
      requiredPlan="ouro"
      featureName="Clube de Assinatura Recorrente para Tutores"
      featureDescription="Crie planos recorrentes de banho semanal, saúde e consultas para seus clientes pagarem mensalmente no cartão de crédito via Stripe. Disponível no plano Clínica Pro Ouro ou superior."
    >
      <div className="space-y-6 animate-fade-up w-full pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
          <div>
            <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-st-electric" />
              <span>Clube de Assinaturas & Planos Recorrentes de Tutores</span>
            </h1>
            <p className="text-xs text-st-muted mt-0.5">Cobrança automática no cartão de crédito via Stripe para tutores da sua clínica</p>
          </div>

          <button
            onClick={() => setIsNewPlanModalOpen(true)}
            className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Criar Novo Plano de Clube</span>
          </button>
        </div>

        {/* Club Plans Cards Carousel/Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-st-muted flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-st-electric" />
            <span>Planos do Clube Oferecidos Pela Clínica ({clubPlans.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubPlans.map((plan) => (
              <div key={plan.id} className="card p-5 rounded-2xl border border-st-border flex flex-col justify-between space-y-4 bg-st-surface/60">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-st-arctic text-base">{plan.title}</h3>
                    <span className="text-xs font-mono font-extrabold text-st-electric bg-st-electric/15 px-2.5 py-1 rounded-lg border border-st-electric/30">
                      R$ {plan.price.toFixed(2)}/mês
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-st-muted">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-st-arctic">
                        <Check className="w-3.5 h-3.5 text-st-electric shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-st-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-st-muted font-mono">Cobrança Stripe Automática</span>
                  <button
                    onClick={() => {
                      setSelectedPlanForLink(plan);
                      setIsLinkModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-st-electric/20 text-st-electric hover:bg-st-electric hover:text-white transition-colors text-xs font-bold rounded-xl border border-st-electric/30 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Link de Checkout</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full pt-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
          <input
            type="text"
            placeholder="Buscar tutores assinantes ativos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
          />
        </div>

        {/* Active Subscribers List */}
        <div className="grid grid-cols-1 w-full space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-st-muted">Tutores Assinantes Ativos</h2>
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="card p-4 sm:p-5 rounded-2xl w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-st-border hover:border-st-electric/40 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-st-electric/20 text-st-electric border border-st-electric/40 flex items-center justify-center font-extrabold text-base shrink-0 shadow-glow">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-st-arctic text-base truncate">{sub.customer_name}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-success/20 text-st-success border border-st-success/30 whitespace-nowrap">
                      {sub.status === 'active' ? 'Ativo' : 'Pendente'}
                    </span>
                  </div>
                  <p className="text-xs text-st-muted mt-0.5">Plano Assinado: <strong className="text-st-electric font-semibold">{sub.plan_name || 'Clube Banho & Tosa Semanal'}</strong></p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-st-border/40 pt-3 lg:pt-0 lg:pl-4">
                <div>
                  <span className="text-[10px] font-bold text-st-muted uppercase block">Status Assinatura</span>
                  <span className="font-extrabold text-st-success text-sm block uppercase">{sub.status}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-st-muted uppercase block">Próxima Renovação</span>
                  <span className="font-mono font-semibold text-st-arctic block">{formatDate(sub.current_period_end)}</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-[10px] font-bold text-st-muted uppercase block">Forma de Pagamento</span>
                  <span className="text-st-muted font-semibold block">Cartão Crédito (Stripe)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-st-border/20">
                <button className="px-4 py-2 bg-st-electric hover:bg-st-steel text-white font-bold rounded-xl text-xs shadow-glow transition-all whitespace-nowrap border-none">
                  Gerenciar Assinatura
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Criar Novo Plano do Clube (Centralizado + Lock de Scroll + Portal) */}
        {isNewPlanModalOpen && (
          <ClientPortal>
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
            <div className="relative my-auto w-full max-w-md card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
                <h3 className="font-bold text-st-arctic text-base">Criar Novo Plano do Clube</h3>
                <button onClick={() => setIsNewPlanModalOpen(false)} className="text-st-muted hover:text-st-arctic">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateClubPlan} className="space-y-3 text-xs">
                <div>
                  <label className="block text-st-muted mb-1 font-semibold">Nome do Plano</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clube Banho Semanal Premium"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                  />
                </div>

                <div>
                  <label className="block text-st-muted mb-1 font-semibold">Preço Mensal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="149.90"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-st-surface border border-st-border text-st-arctic font-mono"
                  />
                </div>

                <div>
                  <label className="block text-st-muted mb-1 font-semibold">Benefícios Incluídos (separados por vírgula)</label>
                  <textarea
                    rows={3}
                    placeholder="4 Banhos/mês, 1 Tosa higiênica, 10% desc em remédios"
                    value={newFeatures}
                    onChange={(e) => setNewFeatures(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPlanModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-st-border text-st-muted font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-st-electric text-white font-bold shadow-glow border-none"
                  >
                    Criar Plano
                  </button>
                </div>
              </form>
            </div>
          </div>
          </ClientPortal>
        )}

        {/* Modal Link de Checkout Stripe (Centralizado + Lock de Scroll + Portal) */}
        {isLinkModalOpen && selectedPlanForLink && (
          <ClientPortal>
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
            <div className="relative my-auto w-full max-w-md card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
                <h3 className="font-bold text-st-arctic text-base">Link de Assinatura para Tutor</h3>
                <button onClick={() => setIsLinkModalOpen(false)} className="text-st-muted hover:text-st-arctic">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-st-muted">
                  Envie este link direto para o tutor via WhatsApp para ele assinar o <strong className="text-st-arctic">{selectedPlanForLink.title}</strong> (R$ {selectedPlanForLink.price.toFixed(2)}/mês) no cartão de crédito:
                </p>

                <div className="p-3 bg-st-navy rounded-xl border border-st-border font-mono text-[11px] text-st-electric break-all select-all flex items-center justify-between gap-2">
                  <span>{getStripeCheckoutLink(selectedPlanForLink)}</span>
                  <button
                    onClick={() => copyToClipboard(getStripeCheckoutLink(selectedPlanForLink))}
                    className="p-1.5 rounded-lg bg-st-electric/20 hover:bg-st-electric text-st-electric hover:text-white transition-colors shrink-0"
                    title="Copiar Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-st-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 bg-st-surface/60 rounded-xl border border-st-border/40 space-y-1">
                  <span className="font-bold text-st-arctic block">Como funciona:</span>
                  <p className="text-[11px] text-st-muted leading-relaxed">
                    O tutor abre o link no celular, preenche os dados do cartão de crédito no Stripe seguro e o plano fica ativo no Petia imediatamente.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-st-electric text-white font-bold text-xs shadow-glow border-none"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
          </ClientPortal>
        )}
      </div>
    </PlanGate>
  );
}
