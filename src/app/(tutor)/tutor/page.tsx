'use client';

import React, { useState, useEffect } from 'react';
import { Syringe, Dog, Calendar, CreditCard, Heart, ShieldCheck, Lock, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { INITIAL_PETS, INITIAL_MEDICAL_RECORDS, INITIAL_APPOINTMENTS } from '@/lib/mockData';
import Link from 'next/link';
import { PLANS } from '@/lib/plans';
import { supabase } from '@/lib/supabaseClient';

function TutorPlanGate({ children }: { children: React.ReactNode }) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAccess() {
      try {
        // Check via Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('clinic_id')
            .eq('id', user.id)
            .maybeSingle();

          if (userData?.clinic_id) {
            const { data: clinic } = await supabase
              .from('clinics')
              .select('plan')
              .eq('id', userData.clinic_id)
              .maybeSingle();

            const plan = clinic?.plan || 'basico';
            setHasAccess(['ouro', 'platina', 'diamond'].includes(plan));
            return;
          }
        }

        // Fallback: localStorage
        const cached = localStorage.getItem('petia_current_plan');
        if (cached) {
          const { planType } = JSON.parse(cached);
          setHasAccess(['ouro', 'platina', 'diamond'].includes(planType));
          return;
        }

        const clinicData = localStorage.getItem('petia_clinic_data');
        if (clinicData) {
          const { plan } = JSON.parse(clinicData);
          setHasAccess(['ouro', 'platina', 'diamond'].includes(plan || ''));
          return;
        }

        // Default: no access
        setHasAccess(false);
      } catch (_) {
        setHasAccess(false);
      }
    }
    checkAccess();
  }, []);

  if (hasAccess === null) {
    // Loading — show nothing to avoid flash
    return <div className="min-h-screen bg-st-navy" />;
  }

  if (!hasAccess) {
    const requiredPlan = PLANS['ouro'];
    return (
      <div className="min-h-screen bg-st-navy flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/40 to-slate-900 text-center space-y-5 shadow-2xl">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Crown className="w-3 h-3" /> Requer plano {requiredPlan.name}
            </div>
            <h2 className="text-xl font-extrabold text-white">Portal do Tutor Self-Service</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Permita que tutores acompanhem a saúde dos pets, agendamentos e carteira de vacinação digital — sem precisar ligar para a clínica.
            </p>
          </div>
          <div className="space-y-2 text-left border border-slate-700/40 rounded-xl p-4 bg-slate-800/40">
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">Incluso no plano {requiredPlan.name}:</p>
            {requiredPlan.features.slice(0, 4).map((feat, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
          <Link href="/planos"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2">
            <Crown className="w-4 h-4 shrink-0" />
            <span>Ver Planos e Fazer Upgrade</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function TutorPortalPage() {
  const [activeTab, setActiveTab] = useState<'pets' | 'appointments' | 'subscriptions'>('pets');
  const tutorPets = INITIAL_PETS.filter((p) => p.customer_id === 'cust-1');
  const tutorAppointments = INITIAL_APPOINTMENTS.filter((a) => a.customer_id === 'cust-1');

  return (
    <TutorPlanGate>
      <div className="min-h-screen bg-st-navy text-st-arctic pb-12">
        {/* Mobile Top Header */}
        <header className="bg-st-surface border-b border-st-border p-6 rounded-b-2xl shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-st-electric/20 text-st-electric border border-st-electric/30 flex items-center justify-center">
                <Dog className="w-5 h-5" />
              </div>
              <h1 className="font-extrabold text-lg tracking-tight text-white">Portal do Tutor • Petia</h1>
            </div>
            <Link
              href="/dashboard"
              className="text-xs bg-st-electric/20 hover:bg-st-electric/30 text-st-electric font-semibold px-3 py-1.5 rounded-full border border-st-electric/40 transition-colors"
            >
              Painel Vet
            </Link>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Olá, Mariana <Heart className="w-5 h-5 text-st-electric inline" />
            </h2>
            <p className="text-st-muted text-xs">Acompanhe a saúde e vacinas de Thor e Luna no Petia</p>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-4 mt-6 space-y-5">
          {/* Navigation Tabs */}
          <div className="bg-st-surface p-1 rounded-xl shadow-md border border-st-border flex items-center justify-around text-xs font-bold text-st-muted">
            <button
              onClick={() => setActiveTab('pets')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === 'pets' ? 'bg-st-electric text-white shadow-glow-sm' : 'hover:text-st-arctic'
              }`}
            >
              Meus Pets (2)
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === 'appointments' ? 'bg-st-electric text-white shadow-glow-sm' : 'hover:text-st-arctic'
              }`}
            >
              Agendamentos
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === 'subscriptions' ? 'bg-st-electric text-white shadow-glow-sm' : 'hover:text-st-arctic'
              }`}
            >
              Assinaturas
            </button>
          </div>

          {/* Tab 1: Pets & Digital Vaccine Cards */}
          {activeTab === 'pets' && (
            <div className="space-y-4">
              {tutorPets.map((pet) => {
                const records = INITIAL_MEDICAL_RECORDS.filter((m) => m.pet_id === pet.id);

                return (
                  <div key={pet.id} className="card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3 border-b border-st-border/40 pb-3">
                      <img
                        src={pet.photo_url}
                        alt={pet.name}
                        className="w-14 h-14 rounded-xl object-cover border border-st-border"
                      />
                      <div>
                        <h3 className="font-extrabold text-st-arctic text-lg">{pet.name}</h3>
                        <p className="text-xs text-st-electric font-semibold">{pet.species} • {pet.breed}</p>
                        <p className="text-[11px] text-st-muted font-medium">Peso: {pet.weight} kg</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-xs text-st-arctic flex items-center gap-1.5">
                        <Syringe className="w-4 h-4 text-st-electric" />
                        <span>Carteira Digital de Vacinação</span>
                      </h4>

                      {records.map((rec) => (
                        <div key={rec.id} className="p-3 rounded-xl bg-st-navy border border-st-border text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-st-arctic">{rec.description}</span>
                            <span className="text-[9px] font-bold bg-st-success/20 text-st-success border border-st-success/30 px-2 py-0.5 rounded-full">
                              APLICADA
                            </span>
                          </div>
                          <p className="text-[11px] text-st-muted">Data: {rec.date} — Vet: {rec.vet_name}</p>
                          {rec.next_due_date && (
                            <p className="text-[11px] font-bold text-st-electric mt-1">
                              Próximo Reforço: {rec.next_due_date}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Appointments */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="py-2.5 px-4 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold text-xs shadow-glow">
                  + Solicitar Novo Agendamento
                </button>
              </div>

              {tutorAppointments.map((apt) => (
                <div key={apt.id} className="card rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-st-arctic text-base">{apt.pet_name}</h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-st-success/20 text-st-success border border-st-success/30">
                      {apt.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-st-muted font-medium">Serviço: {apt.service_type}</p>
                  <p className="text-xs font-mono font-bold text-st-electric">
                    Data: {new Date(apt.scheduled_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Subscriptions */}
          {activeTab === 'subscriptions' && (
            <div className="card rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center mx-auto border border-st-electric/30">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-st-arctic text-base">Planos & Clube de Benefícios Pet</h3>
              <p className="text-xs text-st-muted">
                Assine banho semanal com desconto automático no cartão de crédito via Stripe.
              </p>
              <button className="w-full py-3 rounded-xl bg-st-electric hover:bg-st-steel text-white font-bold text-xs shadow-glow">
                Ver Planos de Assinatura
              </button>
            </div>
          )}
        </main>
      </div>
    </TutorPlanGate>
  );
}
