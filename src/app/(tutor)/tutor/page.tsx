'use client';

import React, { useState, useEffect } from 'react';
import { Syringe, Dog, Calendar, CreditCard, Heart, Lock, Crown, ArrowRight, Sparkles, CalendarPlus } from 'lucide-react';
import Link from 'next/link';
import { PLANS } from '@/lib/plans';
import { useCurrentPlan } from '@/hooks/useCurrentPlan';
import { getScopedData } from '@/lib/data/clinicDataScope';

function TutorPlanGate({ children }: { children: React.ReactNode }) {
  const { isTrial, trialDaysRemaining, planType, isLoading } = useCurrentPlan();

  if (isLoading) {
    return <div className="min-h-screen bg-st-navy" />;
  }

  const PLAN_ORDER = ['basico', 'essencial', 'profissional', 'ouro', 'platina', 'diamond'];
  const hasAccess =
    (isTrial && trialDaysRemaining > 0) ||
    PLAN_ORDER.indexOf(planType) >= PLAN_ORDER.indexOf('ouro');

  if (hasAccess) {
    return <>{children}</>;
  }

  const requiredPlan = PLANS['ouro'];
  return (
    <div className="min-h-screen bg-st-navy flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/40 to-slate-900 text-center space-y-5 shadow-2xl relative overflow-hidden">
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

export default function TutorPortalPage() {
  const [activeTab, setActiveTab] = useState<'pets' | 'appointments' | 'subscriptions'>('pets');

  // Dados reais do localStorage
  const [tutorPets, setTutorPets] = useState<any[]>([]);
  const [tutorAppointments, setTutorAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('petia_user_profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserName(profile.name || profile.email?.split('@')[0] || '');
      }
    } catch (_) {}

    setTutorPets(getScopedData('petia_pets'));
    setTutorAppointments(getScopedData('petia_appointments'));
    setMedicalRecords(getScopedData('petia_medical_records'));
  }, []);

  return (
    <TutorPlanGate>
      <div className="min-h-screen bg-st-navy text-st-arctic pb-12">
        {/* Header */}
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
              {userName ? `Olá, ${userName}` : 'Bem-vindo ao Portal'}{' '}
              <Heart className="w-5 h-5 text-st-electric inline" />
            </h2>
            <p className="text-st-muted text-xs">
              {tutorPets.length > 0
                ? `Acompanhe a saúde e vacinas de ${tutorPets.map((p) => p.name).slice(0, 2).join(' e ')} no Petia`
                : 'Acompanhe a saúde dos seus pets e agendamentos na clínica'}
            </p>
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
              Meus Pets ({tutorPets.length})
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === 'appointments' ? 'bg-st-electric text-white shadow-glow-sm' : 'hover:text-st-arctic'
              }`}
            >
              Agendamentos ({tutorAppointments.length})
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

          {/* Tab 1: Pets & Carteira de Vacinação Digital */}
          {activeTab === 'pets' && (
            <div className="space-y-4">
              {tutorPets.length === 0 ? (
                <div className="card rounded-2xl p-10 text-center space-y-3">
                  <Dog className="w-12 h-12 text-st-muted/40 mx-auto" />
                  <h3 className="font-bold text-st-arctic text-base">Nenhum pet cadastrado</h3>
                  <p className="text-xs text-st-muted">
                    Peça à clínica para cadastrar seus pets para acompanhar a carteira de vacinação digital.
                  </p>
                  <Link
                    href="/pets"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold text-xs shadow-glow"
                  >
                    <Dog className="w-4 h-4" />
                    Cadastrar Pet
                  </Link>
                </div>
              ) : (
                tutorPets.map((pet) => {
                  const petRecords = medicalRecords.filter((r: any) => r.pet_id === pet.id);
                  return (
                    <div key={pet.id} className="card rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-3 border-b border-st-border/40 pb-3">
                        {pet.photo_url ? (
                          <img
                            src={pet.photo_url}
                            alt={pet.name}
                            className="w-14 h-14 rounded-xl object-cover border border-st-border shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-st-electric/20 border border-st-electric/30 flex items-center justify-center shrink-0">
                            <Dog className="w-7 h-7 text-st-electric" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-extrabold text-st-arctic text-lg">{pet.name}</h3>
                          <p className="text-xs text-st-electric font-semibold">{pet.species} • {pet.breed || 'SRD'}</p>
                          {pet.weight ? (
                            <p className="text-[11px] text-st-muted font-medium">Peso: {pet.weight} kg</p>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-xs text-st-arctic flex items-center gap-1.5">
                          <Syringe className="w-4 h-4 text-st-electric" />
                          <span>
                            Carteira Digital de Vacinação ({petRecords.filter((r: any) => r.type === 'vaccine').length} registros)
                          </span>
                        </h4>

                        {petRecords.length === 0 ? (
                          <p className="text-xs text-st-muted p-3 bg-st-surface/50 rounded-xl border border-st-border/40">
                            Nenhum registro clínico disponível ainda para este pet.
                          </p>
                        ) : (
                          petRecords.slice(0, 5).map((rec: any) => (
                            <div key={rec.id} className="p-3 rounded-xl bg-st-navy border border-st-border text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-st-arctic">{rec.description}</span>
                                <span className="text-[9px] font-bold bg-st-success/20 text-st-success border border-st-success/30 px-2 py-0.5 rounded-full uppercase">
                                  {rec.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-st-muted">Data: {rec.date} — Vet: {rec.vet_name}</p>
                              {rec.next_due_date && (
                                <p className="text-[11px] font-bold text-st-electric mt-1">
                                  Próximo Reforço: {rec.next_due_date}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Agendamentos */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Link
                  href="/agenda"
                  className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold text-xs shadow-glow"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Solicitar Novo Agendamento
                </Link>
              </div>

              {tutorAppointments.length === 0 ? (
                <div className="card rounded-2xl p-10 text-center space-y-3">
                  <Calendar className="w-12 h-12 text-st-muted/40 mx-auto" />
                  <h3 className="font-bold text-st-arctic text-base">Nenhum agendamento encontrado</h3>
                  <p className="text-xs text-st-muted">
                    Solicite um agendamento através do botão acima ou entre em contato com a clínica.
                  </p>
                </div>
              ) : (
                tutorAppointments.map((apt) => (
                  <div key={apt.id} className="card rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-st-arctic text-base">{apt.pet_name}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        apt.status === 'confirmed'
                          ? 'bg-st-success/20 text-st-success border-st-success/30'
                          : apt.status === 'done'
                          ? 'bg-st-surface-2 text-st-muted border-st-border'
                          : 'bg-st-warning/20 text-st-warning border-st-warning/30'
                      }`}>
                        {apt.status === 'confirmed' ? 'CONFIRMADO' : apt.status === 'done' ? 'CONCLUÍDO' : 'AGENDADO'}
                      </span>
                    </div>
                    <p className="text-xs text-st-muted font-medium">Serviço: {apt.service_type}</p>
                    <p className="text-xs font-mono font-bold text-st-electric">
                      Data: {new Date(apt.scheduled_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Assinaturas */}
          {activeTab === 'subscriptions' && (
            <div className="card rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center mx-auto border border-st-electric/30">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-st-arctic text-base">Planos & Clube de Benefícios Pet</h3>
              <p className="text-xs text-st-muted">
                Assine banho semanal com desconto automático no cartão de crédito via Stripe.
              </p>
              <Link
                href="/planos"
                className="block w-full py-3 rounded-xl bg-st-electric hover:bg-st-steel text-white font-bold text-xs shadow-glow text-center"
              >
                Ver Planos de Assinatura
              </Link>
            </div>
          )}
        </main>
      </div>
    </TutorPlanGate>
  );
}
