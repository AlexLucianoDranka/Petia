'use client';

import React, { useState } from 'react';
import { Syringe, Dog, Calendar, CreditCard, Heart, CalendarPlus, LogOut } from 'lucide-react';
import Link from 'next/link';

interface Props {
  customer: any;
  clinic: any;
  pets: any[];
  appointments: any[];
  medicalRecords: any[];
}

export function TutorDashboardClient({ customer, clinic, pets, appointments, medicalRecords }: Props) {
  const [activeTab, setActiveTab] = useState<'pets' | 'appointments' | 'subscriptions'>('pets');
  const userName = customer.name.split(' ')[0];

  let clinicName = clinic.name;
  if (clinicName === 'Minha Clínica Veterinária' && clinic.slug) {
    clinicName = clinic.slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  const handleLogout = async () => {
    // Apaga o cookie e recarrega a página
    document.cookie = 'petia_tutor_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = `/t/${clinic.slug}`;
  };

  return (
    <div className="min-h-screen bg-st-navy text-st-arctic pb-12">
      {/* Header */}
      <header className="bg-st-surface border-b border-st-border p-6 rounded-b-2xl shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clinic.logo_url ? (
              <img src={clinic.logo_url} alt={clinicName} className="w-10 h-10 rounded-xl object-cover bg-white" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric border border-st-electric/30 flex items-center justify-center">
                <Dog className="w-5 h-5" />
              </div>
            )}
            <h1 className="font-extrabold text-lg tracking-tight text-white">{clinicName}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-st-surface-2 border border-st-border flex items-center justify-center text-st-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Olá, {userName} <Heart className="w-5 h-5 text-st-electric inline" />
          </h2>
          <p className="text-st-muted text-xs">
            {pets.length > 0
              ? `Acompanhe a saúde e vacinas de ${pets.map((p) => p.name).slice(0, 2).join(' e ')}`
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
            Meus Pets ({pets.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-2.5 rounded-lg transition-all ${
              activeTab === 'appointments' ? 'bg-st-electric text-white shadow-glow-sm' : 'hover:text-st-arctic'
            }`}
          >
            Agendamentos ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 py-2.5 rounded-lg transition-all ${
              activeTab === 'subscriptions' ? 'bg-st-electric text-white shadow-glow-sm' : 'hover:text-st-arctic'
            }`}
          >
            Planos
          </button>
        </div>

        {/* Tab 1: Pets & Carteira de Vacinação Digital */}
        {activeTab === 'pets' && (
          <div className="space-y-4 animate-fade-in">
            {pets.length === 0 ? (
              <div className="card rounded-2xl p-10 text-center space-y-3">
                <Dog className="w-12 h-12 text-st-muted/40 mx-auto" />
                <h3 className="font-bold text-st-arctic text-base">Nenhum pet encontrado</h3>
                <p className="text-xs text-st-muted">
                  A clínica ainda não cadastrou nenhum pet no seu nome.
                </p>
              </div>
            ) : (
              pets.map((pet) => {
                const petRecords = medicalRecords.filter((r) => r.pet_id === pet.id);
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
                          Carteira de Vacinação ({petRecords.filter((r) => r.type === 'vaccine').length} registros)
                        </span>
                      </h4>

                      {petRecords.length === 0 ? (
                        <p className="text-xs text-st-muted p-3 bg-st-surface/50 rounded-xl border border-st-border/40">
                          Nenhum registro clínico disponível ainda para este pet.
                        </p>
                      ) : (
                        petRecords.map((rec) => (
                          <div key={rec.id} className="p-3 rounded-xl bg-st-navy border border-st-border text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-st-arctic">{rec.description}</span>
                              <span className="text-[9px] font-bold bg-st-success/20 text-st-success border border-st-success/30 px-2 py-0.5 rounded-full uppercase">
                                {rec.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-st-muted">Data: {rec.date} — Vet: {rec.vet_name || 'Clínica'}</p>
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
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
              <a
                href={`https://wa.me/${clinic.phone?.replace(/\D/g, '') || ''}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold text-xs shadow-glow"
              >
                <CalendarPlus className="w-4 h-4" />
                Agendar via WhatsApp
              </a>
            </div>

            {appointments.length === 0 ? (
              <div className="card rounded-2xl p-10 text-center space-y-3">
                <Calendar className="w-12 h-12 text-st-muted/40 mx-auto" />
                <h3 className="font-bold text-st-arctic text-base">Nenhum agendamento futuro</h3>
                <p className="text-xs text-st-muted">
                  Você não possui agendamentos programados na clínica.
                </p>
              </div>
            ) : (
              appointments.map((apt) => {
                const pet = pets.find(p => p.id === apt.pet_id);
                return (
                  <div key={apt.id} className="card rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-st-arctic text-base">{pet?.name || 'Pet'}</h3>
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
                )
              })
            )}
          </div>
        )}

        {/* Tab 3: Assinaturas */}
        {activeTab === 'subscriptions' && (
          <div className="card rounded-2xl p-6 text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center mx-auto border border-st-electric/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-st-arctic text-base">Clube de Benefícios Pet</h3>
            <p className="text-xs text-st-muted">
              Pergunte sobre os planos de assinatura da clínica para obter descontos exclusivos em banhos, consultas e vacinas.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
