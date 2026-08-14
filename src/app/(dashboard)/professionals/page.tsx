'use client';

import React, { useState } from 'react';
import { UserCheck, Plus, Search, Phone, Mail, DollarSign, Download, Percent, Award, Calendar, Sparkles } from 'lucide-react';
import { Professional } from '@/lib/data/professionals';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';
import { PlanGate } from '@/components/ui/PlanGate';
import jsPDF from 'jspdf';

interface CommissionReport {
  prof_id: string;
  name: string;
  role: string;
  commission_rate: number; // e.g. 15 for 15%
  total_sales: number;
  total_commission: number;
  completed_services: number;
}

const INITIAL_COMMISSIONS: CommissionReport[] = [
  {
    prof_id: 'prof-1',
    name: 'Dr. Lucas Mendes',
    role: 'Veterinário Responsável',
    commission_rate: 30,
    total_sales: 4500.00,
    total_commission: 1350.00,
    completed_services: 18,
  },
  {
    prof_id: 'prof-2',
    name: 'Dra. Camila Rocha',
    role: 'Veterinária Especialista',
    commission_rate: 30,
    total_sales: 3800.00,
    total_commission: 1140.00,
    completed_services: 14,
  },
  {
    prof_id: 'prof-3',
    name: 'Ana Beatris',
    role: 'Esteticista & Tosadora',
    commission_rate: 20,
    total_sales: 2200.00,
    total_commission: 440.00,
    completed_services: 22,
  },
];

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [commissions] = useState<CommissionReport[]>([]);
  const [activeTab, setActiveTab] = useState<'directory' | 'commissions'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Fevereiro / 2026');

  const filteredProfs = professionals.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCommissionPDF = (prof: CommissionReport) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Petia - Relatorio de Comissao Profissional', 14, 22);

    doc.setFontSize(12);
    doc.text(`Profissional: ${prof.name}`, 14, 34);
    doc.text(`Cargo / Especialidade: ${prof.role}`, 14, 42);
    doc.text(`Periodo: ${selectedMonth}`, 14, 50);

    doc.text('------------------------------------------------', 14, 58);
    doc.text(`Atendimentos Concluidos: ${prof.completed_services}`, 14, 68);
    doc.text(`Faturamento Total Gerado: R$ ${prof.total_sales.toFixed(2)}`, 14, 76);
    doc.text(`Taxa de Comissao: ${prof.commission_rate}%`, 14, 84);
    doc.setFontSize(14);
    doc.text(`VALOR TOTAL A PAGAR: R$ ${prof.total_commission.toFixed(2)}`, 14, 98);

    doc.save(`comissao-${prof.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <PlanGate
      requiredPlan="profissional"
      featureName="Cadastro de Profissionais & Controle de Comissões"
      featureDescription="Cadastre veterinários, tosadores e banhistas com cálculo automático de comissão por serviço prestado e relatório em PDF. Disponível no plano Profissional Prata ou superior."
    >
      <div className="space-y-6 animate-fade-up w-full pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
          <div>
            <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-st-electric" />
              <span>Profissionais & Relatório de Comissões</span>
            </h1>
            <p className="text-xs text-st-muted mt-0.5">
              Cadastro de veterinários, groomers, banhistas e cálculo de comissão sobre vendas
            </p>
          </div>

          <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none">
            <Plus className="w-4 h-4 shrink-0" />
            <span>Cadastrar Profissional</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-st-border/40 pb-2">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'directory'
                ? 'bg-st-electric text-white shadow-glow-sm'
                : 'text-st-muted hover:text-st-arctic'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Equipe de Atendimento ({professionals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('commissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'commissions'
                ? 'bg-st-electric text-white shadow-glow-sm'
                : 'text-st-muted hover:text-st-arctic'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Relatório de Comissões</span>
          </button>
        </div>

        {/* Tab 1: Directory */}
        {activeTab === 'directory' && (
          <div className="space-y-4">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
              <input
                type="text"
                placeholder="Buscar profissional por nome ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfs.map((prof) => (
                <div key={prof.id} className="card p-5 rounded-2xl border border-st-border space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric border border-st-electric/30 flex items-center justify-center font-extrabold text-base shrink-0">
                      {prof.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-st-arctic text-base">{prof.name}</h3>
                      <p className="text-xs text-st-electric font-semibold">{prof.specialty}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-st-muted pt-2 border-t border-st-border/40">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-st-electric shrink-0" />
                      <span>{prof.phone || '(11) 98765-4321'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-st-electric shrink-0" />
                      <span>{prof.email || 'profissional@petia.com.br'}</span>
                    </p>
                    {prof.document_number && (
                      <p className="text-[11px] font-mono text-st-arctic pt-1">
                        CRMV/Doc: <strong className="text-st-electric">{prof.document_number}</strong>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Commissions Report */}
        {activeTab === 'commissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 card p-4 rounded-xl border border-st-border bg-st-surface/40">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-st-electric" />
                <span className="text-xs text-st-muted font-bold">Mês de Referência:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-2 rounded-lg bg-st-navy border border-st-border text-st-arctic text-xs font-semibold"
                >
                  <option value="Fevereiro / 2026">Fevereiro / 2026</option>
                  <option value="Janeiro / 2026">Janeiro / 2026</option>
                  <option value="Dezembro / 2025">Dezembro / 2025</option>
                </select>
              </div>

              <div className="text-xs text-st-muted">
                Comissão Total do Mês:{' '}
                <strong className="text-st-success font-extrabold text-sm">
                  R$ {commissions.reduce((acc, c) => acc + c.total_commission, 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 w-full space-y-3">
              {commissions.map((comm) => (
                <div
                  key={comm.prof_id}
                  className="card p-5 rounded-2xl w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-st-border hover:border-st-electric/40 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-st-success/15 text-st-success border border-st-success/30 flex items-center justify-center font-extrabold text-lg shrink-0">
                      <Percent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-st-arctic text-base">{comm.name}</h3>
                      <p className="text-xs text-st-muted">{comm.role} • Taxa: <strong className="text-st-electric font-bold">{comm.commission_rate}%</strong></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-st-border/40 pt-3 lg:pt-0 lg:pl-6">
                    <div>
                      <span className="text-[10px] font-bold text-st-muted uppercase block">Atendimentos</span>
                      <span className="font-extrabold text-st-arctic text-sm block">{comm.completed_services} serviços</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-st-muted uppercase block">Faturamento Gerado</span>
                      <span className="font-mono font-semibold text-st-arctic block">R$ {comm.total_sales.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-st-muted uppercase block">Comissão a Pagar</span>
                      <span className="font-mono font-extrabold text-st-success text-sm block">R$ {comm.total_commission.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => exportCommissionPDF(comm)}
                      className="px-4 py-2.5 bg-st-electric hover:bg-st-steel text-white font-bold rounded-xl text-xs shadow-glow transition-all flex items-center gap-2 whitespace-nowrap border-none"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <SolidaTechBadge variant="auth" />
      </div>
    </PlanGate>
  );
}
