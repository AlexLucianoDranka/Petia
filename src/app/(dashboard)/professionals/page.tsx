'use client';

import React, { useState } from 'react';
import { UserCheck, Plus, Search } from 'lucide-react';
import { INITIAL_PROFESSIONALS, Professional } from '@/lib/data/professionals';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

export default function ProfessionalsPage() {
  const [professionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = professionals.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.document_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-st-electric" />
            <span>Profissionais da Clínica</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">
            Cadastro de veterinários, groomers, banhistas e controle de comissões e CRMV
          </p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none">
          <Plus className="w-4 h-4 shrink-0" />
          <span>Cadastrar Profissional</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
        <input
          type="text"
          placeholder="Buscar por nome, CRMV ou especialidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
        />
      </div>

      {/* 1 Coluna por Profissional na Horizontal (100% Tela) */}
      <div className="grid grid-cols-1 w-full space-y-3">
        {filtered.map((prof) => (
          <div
            key={prof.id}
            className="card p-4 sm:p-5 rounded-2xl w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-st-border hover:border-st-electric/40 transition-all"
          >
            {/* Prof Info */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-st-electric/20 text-st-electric border border-st-electric/40 flex items-center justify-center font-extrabold text-base shrink-0 shadow-glow">
                {prof.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-st-arctic text-base truncate">{prof.name}</h3>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-electric/15 text-st-electric border border-st-electric/30 whitespace-nowrap">
                    {prof.specialty === 'veterinario' ? 'Veterinário' : prof.specialty === 'groomer' ? 'Groomer' : 'Banhista'}
                  </span>
                </div>
                <p className="text-xs text-st-muted mt-0.5 capitalize">{prof.specialty}</p>
              </div>
            </div>

            {/* Internal Columns: CRMV & Commission % */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-st-border/40 pt-3 lg:pt-0 lg:pl-4">
              <div>
                <span className="text-[10px] font-bold text-st-muted uppercase block">CRMV / Registro</span>
                <span className="font-mono font-semibold text-st-arctic block">{prof.document_number || 'Não aplicável'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-st-muted uppercase block">Comissão Padrão</span>
                <span className="font-extrabold text-st-electric block">{prof.commission_percent}% das vendas</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] font-bold text-st-muted uppercase block">Status Escala</span>
                <span className="text-st-success font-semibold block">Ativo (Seg a Sex)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-st-border/20">
              <button className="px-3 py-1.5 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border">
                Editar
              </button>
              <button className="px-4 py-2 bg-st-electric hover:bg-st-steel text-white font-bold rounded-xl text-xs shadow-glow transition-all whitespace-nowrap border-none">
                Escala de Horários
              </button>
            </div>
          </div>
        ))}
      </div>

      <SolidaTechBadge variant="auth" />
    </div>
  );
}
