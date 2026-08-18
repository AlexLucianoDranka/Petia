'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Phone, Mail, DollarSign, Download, Percent, Award, Calendar, X, Trash2 } from 'lucide-react';
import { getScopedData } from '@/lib/data/clinicDataScope';
import { PlanGate } from '@/components/ui/PlanGate';
import { showToast } from '@/components/ui/GlobalToastAndLoader';
import { ClientPortal } from '@/components/ui/ClientPortal';
import jsPDF from 'jspdf';

export interface ProfessionalItem {
  id: string;
  name: string;
  specialty: string;
  crmv?: string;
  phone: string;
  email?: string;
  commission_rate: number;
  created_at: string;
}

export interface CommissionReport {
  prof_id: string;
  name: string;
  role: string;
  commission_rate: number;
  total_sales: number;
  total_commission: number;
  completed_services: number;
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>(() =>
    getScopedData('petia_professionals')
  );
  const [activeTab, setActiveTab] = useState<'directory' | 'commissions'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Fevereiro / 2026');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('Veterinário(a)');
  const [newCrmv, setNewCrmv] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState('20');

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const saveProfessionalsToStorage = (updated: ProfessionalItem[]) => {
    setProfessionals(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('petia_professionals', JSON.stringify(updated));
      window.dispatchEvent(new Event('petia_data_updated'));
    }
  };

  const handleCreateProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newProf: ProfessionalItem = {
      id: `prof-${Date.now()}`,
      name: newName.trim(),
      specialty: newSpecialty,
      crmv: newCrmv.trim() || undefined,
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      commission_rate: parseFloat(newCommissionRate) || 20,
      created_at: new Date().toISOString(),
    };

    const updated = [newProf, ...professionals];
    saveProfessionalsToStorage(updated);

    // Reset form
    setNewName('');
    setNewCrmv('');
    setNewPhone('');
    setNewEmail('');
    setIsModalOpen(false);

    showToast('Profissional cadastrado com sucesso!', 'success');
  };

  const handleDeleteProfessional = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${name}" da equipe?`)) {
      const updated = professionals.filter((p) => p.id !== id);
      saveProfessionalsToStorage(updated);
      showToast('Profissional removido!', 'info');
    }
  };

  const filteredProfs = professionals.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCommissionPDF = (prof: ProfessionalItem) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Petia - Relatorio de Comissao Profissional', 14, 22);

    doc.setFontSize(12);
    doc.text(`Profissional: ${prof.name}`, 14, 34);
    doc.text(`Cargo / Especialidade: ${prof.specialty}`, 14, 42);
    doc.text(`Periodo: ${selectedMonth}`, 14, 50);

    doc.text('------------------------------------------------', 14, 58);
    doc.text(`Taxa de Comissao Cadastrada: ${prof.commission_rate}%`, 14, 68);
    doc.setFontSize(14);
    doc.text(`STATUS: Relatorio atualizado em tempo real`, 14, 82);

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

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Cadastrar Profissional</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-st-border/40 pb-2">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'commissions'
                ? 'bg-st-electric text-white shadow-glow-sm'
                : 'text-st-muted hover:text-st-arctic'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Relatório de Comissões</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
          <input
            type="text"
            placeholder="Buscar por nome ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
          />
        </div>

        {/* DIRECTORY TAB */}
        {activeTab === 'directory' && (
          <div>
            {filteredProfs.length === 0 ? (
              <div className="card p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                <UserCheck className="w-12 h-12 text-st-muted/40" />
                <h3 className="text-lg font-bold text-st-arctic">Nenhum profissional cadastrado</h3>
                <p className="text-xs text-st-muted max-w-sm">
                  {searchTerm ? 'Nenhum resultado encontrado.' : 'Cadastre sua equipe veterinária e esteticistas para controlar comissões!'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-glow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Primeiro Profissional</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 w-full space-y-3">
                {filteredProfs.map((prof) => (
                  <div
                    key={prof.id}
                    className="card p-5 rounded-2xl w-full border border-st-border hover:border-st-electric/40 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric border border-st-electric/40 flex items-center justify-center font-extrabold text-base shrink-0 shadow-glow">
                          {prof.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-st-arctic text-base leading-tight">{prof.name}</h3>
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-electric/15 text-st-electric border border-st-electric/30 whitespace-nowrap">
                              {prof.specialty}
                            </span>
                            {prof.crmv && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-st-navy text-st-arctic border border-st-border whitespace-nowrap">
                                CRMV: {prof.crmv}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-st-muted mt-0.5">{prof.email || 'Sem e-mail informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          onClick={() => exportCommissionPDF(prof)}
                          className="px-3.5 py-1.5 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-st-electric" /> PDF Comissão
                        </button>
                        <button
                          onClick={() => handleDeleteProfessional(prof.id, prof.name)}
                          className="p-2 rounded-xl bg-st-surface hover:bg-st-danger/20 text-st-muted hover:text-st-danger border border-st-border transition-colors cursor-pointer"
                          title="Excluir Profissional"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-st-surface/60 border border-st-border/50 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">Telefone / WhatsApp</span>
                        <span className="font-mono font-semibold text-st-arctic flex items-center gap-1">
                          <Phone className="w-3 h-3 text-st-electric shrink-0" /> {prof.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">Taxa de Comissão</span>
                        <span className="font-extrabold text-st-electric text-sm">{prof.commission_rate}% por serviço</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">Status</span>
                        <span className="font-bold text-st-success">Ativo na Equipe</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMMISSIONS TAB */}
        {activeTab === 'commissions' && (
          <div className="space-y-4">
            <div className="card p-5 rounded-2xl border border-st-border flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-bold text-st-arctic text-base">Período de Apuração de Comissões</h3>
                <p className="text-xs text-st-muted">Cálculo automático de repasse profissional</p>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-2.5 rounded-xl bg-st-surface border border-st-border text-st-arctic font-semibold text-xs"
              >
                <option value="Fevereiro / 2026">Fevereiro / 2026</option>
                <option value="Janeiro / 2026">Janeiro / 2026</option>
              </select>
            </div>

            <div className="grid grid-cols-1 w-full space-y-3">
              {professionals.map((prof) => (
                <div key={prof.id} className="card p-5 rounded-2xl border border-st-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-st-arctic text-base">{prof.name}</h4>
                    <p className="text-xs text-st-muted">{prof.specialty} • Taxa: <strong className="text-st-electric">{prof.commission_rate}%</strong></p>
                  </div>

                  <button
                    onClick={() => exportCommissionPDF(prof)}
                    className="px-4 py-2 rounded-xl bg-st-electric hover:bg-st-steel text-white font-bold text-xs shadow-glow flex items-center gap-1.5 cursor-pointer border-none"
                  >
                    <Download className="w-4 h-4" /> Gerar Relatório PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Cadastrar Profissional (Centralizado + Lock de Scroll + Portal) */}
        {isModalOpen && (
          <ClientPortal>
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
            <div className="relative my-auto w-full max-w-md card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-st-border/40 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-st-arctic">Cadastrar Profissional</h3>
                    <p className="text-xs text-st-muted">Veterinário, tosador ou banhista</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-st-muted hover:text-st-arctic hover:bg-st-surface-2 shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProfessional} className="space-y-4 text-xs lg:text-sm overflow-y-auto sidebar-scrollbar flex-1 pr-1">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dr. Lucas Mendes"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Especialidade / Cargo</label>
                    <select
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                    >
                      <option value="Veterinário(a)">Veterinário(a)</option>
                      <option value="Tosador(a) / Groomer">Tosador(a) / Groomer</option>
                      <option value="Banhista">Banhista</option>
                      <option value="Auxiliar Veterinário">Auxiliar Veterinário</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-st-muted mb-1">CRMV (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: SP-12345"
                      value={newCrmv}
                      onChange={(e) => setNewCrmv(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Telefone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Taxa Comissão (%)</label>
                    <input
                      type="number"
                      step="1"
                      placeholder="20"
                      value={newCommissionRate}
                      onChange={(e) => setNewCommissionRate(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-st-muted mb-1">E-mail (Opcional)</label>
                  <input
                    type="email"
                    placeholder="lucas@clinica.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-st-border text-st-muted hover:text-st-arctic font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold shadow-glow whitespace-nowrap cursor-pointer border-none"
                  >
                    Salvar Profissional
                  </button>
                </div>
              </form>
            </div>
          </div>
          </ClientPortal>
        )}
      </div>
    </PlanGate>
  );
}
