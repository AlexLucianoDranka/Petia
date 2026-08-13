'use client';

import React, { useState } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, Dog, MessageSquare, ChevronRight } from 'lucide-react';
import { INITIAL_CUSTOMERS } from '@/lib/mockData';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

import { getScopedData } from '@/lib/data/clinicDataScope';

export default function TutoresPage() {
  const [tutores] = useState(() => getScopedData('petia_customers', INITIAL_CUSTOMERS));
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTutores = tutores.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-st-electric" />
            <span>Tutores (Clientes)</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Gestão de contatos, histórico de pets e faturamento dos tutores</p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none">
          <Plus className="w-4 h-4 shrink-0" />
          <span>Novo Tutor</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
        <input
          type="text"
          placeholder="Buscar tutor por nome, e-mail ou WhatsApp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
        />
      </div>

      {/* Structured Single Column Layout per Tutor */}
      <div className="grid grid-cols-1 w-full space-y-3">
        {filteredTutores.map((tutor) => (
          <div
            key={tutor.id}
            className="card p-4 sm:p-5 rounded-2xl w-full border border-st-border hover:border-st-electric/40 transition-all space-y-4"
          >
            {/* Header Line */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric border border-st-electric/40 flex items-center justify-center font-extrabold text-base shrink-0 shadow-glow">
                  {tutor.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-st-arctic text-base truncate leading-tight">{tutor.name}</h3>
                  <p className="text-xs text-st-muted mt-0.5 truncate">{tutor.email || 'contato@email.com'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/55${tutor.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic font-semibold text-xs border border-st-border flex items-center gap-1.5 whitespace-nowrap"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-st-electric" /> WhatsApp
                </a>
                <button className="px-4 py-1.5 bg-st-electric hover:bg-st-steel text-white font-bold rounded-xl text-xs shadow-glow transition-all whitespace-nowrap border-none">
                  Ficha Completa
                </button>
              </div>
            </div>

            {/* Inner Structured Box (Dados Ancorados) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-st-surface/60 border border-st-border/50 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">WhatsApp / Telefone</span>
                <span className="font-mono font-semibold text-st-arctic flex items-center gap-1">
                  <Phone className="w-3 h-3 text-st-electric shrink-0" /> {tutor.phone}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">Endereço Principal</span>
                <span className="font-medium text-st-arctic flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-st-electric shrink-0" /> São Paulo - SP
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">Pets Vínculados</span>
                <span className="font-semibold text-st-electric flex items-center gap-1 truncate">
                  <Dog className="w-3.5 h-3.5 shrink-0" /> Thor (Golden), Luna (Persa)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SolidaTechBadge variant="auth" />
    </div>
  );
}
