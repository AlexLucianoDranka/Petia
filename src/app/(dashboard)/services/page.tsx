'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Clock, X, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getScopedData } from '@/lib/data/clinicDataScope';
import { ServiceItem } from '@/types/database';
import { showToast } from '@/components/ui/GlobalToastAndLoader';
import { ClientPortal } from '@/components/ui/ClientPortal';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(() =>
    getScopedData('petia_services')
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'banho' | 'tosa' | 'consulta' | 'vacina' | 'cirurgia' | 'outro'>('banho');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('45');

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

  const saveServicesToStorage = (updated: ServiceItem[]) => {
    setServices(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('petia_services', JSON.stringify(updated));
      window.dispatchEvent(new Event('petia_data_updated'));
    }
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const newService: ServiceItem = {
      id: `srv-${Date.now()}`,
      clinic_id: 'real-clinic',
      name: name.trim(),
      category,
      price: parseFloat(price) || 0,
      duration_minutes: parseInt(durationMinutes, 10) || 30,
      active: true,
      created_at: new Date().toISOString(),
    };

    const updated = [newService, ...services];
    saveServicesToStorage(updated);

    // Reset form
    setName('');
    setPrice('');
    setDurationMinutes('45');
    setIsModalOpen(false);

    showToast('Serviço cadastrado com sucesso!', 'success');
  };

  const handleDeleteService = (id: string, serviceName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${serviceName}"?`)) {
      const updated = services.filter((s) => s.id !== id);
      saveServicesToStorage(updated);
      showToast('Serviço removido!', 'info');
    }
  };

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
          <p className="text-xs text-st-muted mt-0.5">
            Catálogo de banhos, tosas, consultas, cirurgias e procedimentos da clínica
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none cursor-pointer"
        >
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

      {/* Services List */}
      {filtered.length === 0 ? (
        <div className="card p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <Briefcase className="w-12 h-12 text-st-muted/40" />
          <h3 className="text-lg font-bold text-st-arctic">Nenhum serviço cadastrado</h3>
          <p className="text-xs text-st-muted max-w-sm">
            {searchTerm ? 'Nenhum resultado para essa busca.' : 'Cadastre os serviços prestados pela sua clínica e pet shop!'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Serviço</span>
            </button>
          )}
        </div>
      ) : (
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
                    <p className="text-xs text-st-muted mt-0.5 truncate">Atendimento especializado</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteService(service.id, service.name)}
                    className="p-2 rounded-xl bg-st-surface hover:bg-st-danger/20 text-st-muted hover:text-st-danger border border-st-border transition-colors cursor-pointer"
                    title="Excluir Serviço"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Inner Structured Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-st-surface/60 border border-st-border/50 text-xs">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Cadastrar Novo Serviço (Centralizado + Lock de Scroll + Portal) */}
      {isModalOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
          <div className="relative my-auto w-full max-w-md card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-st-arctic">Cadastrar Novo Serviço</h3>
                  <p className="text-xs text-st-muted">Adicione banho, consulta, vacina ou cirurgia</p>
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

            <form onSubmit={handleCreateService} className="space-y-4 text-xs lg:text-sm overflow-y-auto sidebar-scrollbar flex-1 pr-1">
              <div>
                <label className="block font-semibold text-st-muted mb-1">Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Banho & Tosa Higiênica Cão Médio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  >
                    <option value="banho">Banho</option>
                    <option value="tosa">Tosa</option>
                    <option value="consulta">Consulta</option>
                    <option value="vacina">Vacina</option>
                    <option value="cirurgia">Cirurgia</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-st-muted mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="85.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-st-muted mb-1">Duração Estimada (Minutos)</label>
                <input
                  type="number"
                  placeholder="45"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
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
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
        </ClientPortal>
      )}
    </div>
  );
}
