'use client';

import React, { useState } from 'react';
import { Briefcase, Plus, Search, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-st-electric" />
            <span>Serviços & Tabela de Preços</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Catálogo de banhos, tosas, consultas, cirurgias e procedimentos da clínica</p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none">
          <Plus className="w-4 h-4 shrink-0" />
          <span>Cadastrar Novo Serviço</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
        <input
          type="text"
          placeholder="Buscar serviço por nome ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
        />
      </div>

      {/* Structured Single Column Layout per Service */}
      <div className="grid grid-cols-1 w-full space-y-3">
        {filtered.map((service) => (
          <div
            key={service.id}
            className="card p-4 sm:p-5 rounded-2xl w-full border border-st-border hover:border-st-electric/40 transition-all space-y-4"
          >
            {/* Header Line */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric border border-st-electric/40 flex items-center justify-center font-extrabold text-base shrink-0 shadow-glow">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-st-arctic text-base leading-tight">{service.name}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-electric/15 text-st-electric border border-st-electric/30 whitespace-nowrap">
                      {service.category}
                    </span>
                  </div>
                  <p className="text-xs text-st-muted mt-0.5 truncate">Atendimento veterinário especializado</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3.5 py-1.5 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border">
                  Editar
                </button>
                <button className="px-4 py-1.5 bg-st-electric hover:bg-st-steel text-white font-bold rounded-xl text-xs shadow-glow transition-all whitespace-nowrap border-none">
                  Agendar Serviço
                </button>
              </div>
            </div>

            {/* Inner Structured Box (Dados Ancorados) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-st-surface/60 border border-st-border/50 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">Duração Estimada</span>
                <span className="font-semibold text-st-arctic flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-st-electric shrink-0" /> {service.duration_minutes} minutos
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">Preço Padrão</span>
                <span className="font-extrabold text-st-electric text-base block">{formatCurrency(service.price)}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">Faixa de Comissão</span>
                <span className="text-st-success font-bold block">15% a 30%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SolidaTechBadge variant="auth" />
    </div>
  );
}
