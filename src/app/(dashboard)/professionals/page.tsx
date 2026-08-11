'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Award, Phone, Mail, DollarSign, Calendar, X, Edit2, CheckCircle2 } from 'lucide-react';
import { fetchProfessionals, createProfessional, Professional } from '@/lib/data/professionals';

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState<Professional['specialty']>('veterinario');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('30');
  const [createdSuccess, setCreatedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchProfessionals();
      setProfessionals(data);
    }
    load();
  }, []);

  const filteredProfessionals = professionals.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.document_number && p.document_number.includes(searchTerm))
  );

  const handleCreateProfessional = async (e: React.FormEvent) => {
    e.preventDefault();

    const newProf = await createProfessional({
      name,
      specialty,
      document_number: documentNumber,
      phone,
      email,
      commission_percent: parseFloat(commissionPercent) || 0,
      active: true,
    });

    setProfessionals([...professionals, newProf]);
    setCreatedSuccess(true);

    setTimeout(() => {
      setCreatedSuccess(false);
      setIsAddModalOpen(false);
      setName('');
      setDocumentNumber('');
      setPhone('');
      setEmail('');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-up w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-st-electric" />
            <span>Cadastro de Profissionais da Clínica</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Veterinários, groomers, banhistas e tosadores com CRMV, % de comissão e horários</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Novo Profissional</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
        <input
          type="text"
          placeholder="Buscar por nome, especialidade ou CRMV..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
        />
      </div>

      {/* Professionals Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {filteredProfessionals.map((prof) => (
          <div key={prof.id} className="card p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-start gap-3">
              <img
                src={prof.photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
                alt={prof.name}
                className="w-14 h-14 rounded-xl object-cover border border-st-border shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-st-arctic text-base truncate">{prof.name}</h3>
                <span className="text-[10px] font-bold bg-st-electric/20 text-st-electric px-2.5 py-0.5 rounded-full uppercase border border-st-electric/30 whitespace-nowrap inline-block mt-0.5">
                  {prof.specialty}
                </span>
                {prof.document_number && (
                  <p className="text-xs text-st-muted font-mono mt-1 font-semibold">{prof.document_number}</p>
                )}
              </div>
            </div>

            <div className="space-y-1 text-xs text-st-muted">
              {prof.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-st-electric shrink-0" />
                  <span className="font-mono font-medium text-st-arctic">{prof.phone}</span>
                </p>
              )}
              {prof.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-st-muted shrink-0" />
                  <span className="truncate">{prof.email}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-st-navy p-3 rounded-xl border border-st-border/60">
              <div>
                <span className="text-[9px] font-bold uppercase text-st-muted block">Comissão</span>
                <span className="font-extrabold text-st-success text-sm">{prof.commission_percent}% por serviço</span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase text-st-muted block">Status</span>
                <span className="font-extrabold text-st-arctic flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-st-success shrink-0" /> Ativo
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Professional */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
              <h3 className="font-bold text-st-arctic text-base">Cadastrar Novo Profissional</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-st-muted hover:text-st-arctic">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-st-success mx-auto" />
                <h4 className="font-bold text-st-arctic">Profissional Cadastrado!</h4>
                <p className="text-xs text-st-muted">Pronto para vincular agendamentos e calcular comissões no Petia.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateProfessional} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Mariana Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Especialidade</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value as any)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                    >
                      <option value="veterinario">Veterinário(a)</option>
                      <option value="groomer">Groomer</option>
                      <option value="banhista">Banhista</option>
                      <option value="tosador">Tosador</option>
                      <option value="adestrador">Adestrador</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">CRMV / Documento</label>
                    <input
                      type="text"
                      placeholder="Ex: CRMV-SP 48.912"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Telefone / Celular</label>
                    <input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Comissão (%)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-st-muted mb-1">E-mail Profissional</label>
                  <input
                    type="email"
                    placeholder="prof@petia.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-st-border text-st-muted font-semibold whitespace-nowrap shrink-0"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-st-electric text-white font-semibold shadow-glow whitespace-nowrap shrink-0"
                  >
                    Salvar Profissional
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
