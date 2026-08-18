'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, Dog, MessageSquare, X, Trash2 } from 'lucide-react';
import { getScopedData } from '@/lib/data/clinicDataScope';
import { Customer } from '@/types/database';
import { showToast } from '@/components/ui/GlobalToastAndLoader';
import { ClientPortal } from '@/components/ui/ClientPortal';

export default function TutoresPage() {
  const [tutores, setTutores] = useState<Customer[]>(() =>
    getScopedData('petia_customers')
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');

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

  const saveTutoresToStorage = (updated: Customer[]) => {
    setTutores(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('petia_customers', JSON.stringify(updated));
      window.dispatchEvent(new Event('petia_data_updated'));
    }
  };

  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newTutor: Customer = {
      id: `cust-${Date.now()}`,
      clinic_id: 'real-clinic',
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      whatsapp_opt_in: true,
      created_at: new Date().toISOString(),
    };

    const updated = [newTutor, ...tutores];
    saveTutoresToStorage(updated);

    // Reset form
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setIsModalOpen(false);

    showToast('Tutor cadastrado com sucesso!', 'success');
  };

  const handleDeleteTutor = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o tutor "${name}"? Os pets vinculados a este tutor também serão removidos.`)) {
      const updated = tutores.filter((t) => t.id !== id);
      saveTutoresToStorage(updated);

      // Remove pets vinculados ao tutor pelo customer_name
      try {
        const pets = JSON.parse(localStorage.getItem('petia_pets') || '[]');
        const filteredPets = pets.filter((p: any) => p.customer_name !== name);
        localStorage.setItem('petia_pets', JSON.stringify(filteredPets));
        window.dispatchEvent(new Event('petia_data_updated'));
      } catch (_) {}

      showToast('Tutor e pets vinculados removidos!', 'info');
    }
  };

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
          <p className="text-xs text-st-muted mt-0.5">
            Gestão de contatos, histórico de pets e faturamento dos tutores
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none cursor-pointer"
        >
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

      {/* Tutores List */}
      {filteredTutores.length === 0 ? (
        <div className="card p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-st-surface-2 border border-st-border flex items-center justify-center text-st-muted">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-st-arctic">Nenhum tutor encontrado</h3>
          <p className="text-xs text-st-muted max-w-sm">
            {searchTerm
              ? 'Nenhum resultado para essa busca.'
              : 'Você ainda não possui tutores cadastrados. Cadastre seu primeiro cliente!'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Tutor</span>
            </button>
          )}
        </div>
      ) : (
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
                    <p className="text-xs text-st-muted mt-0.5 truncate">{tutor.email || 'Sem e-mail cadastrado'}</p>
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
                  <button
                    onClick={() => handleDeleteTutor(tutor.id, tutor.name)}
                    className="p-1.5 rounded-xl bg-st-surface hover:bg-st-danger/20 text-st-muted hover:text-st-danger border border-st-border transition-colors cursor-pointer"
                    title="Excluir Tutor"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Inner Structured Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-st-surface/60 border border-st-border/50 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">
                    WhatsApp / Telefone
                  </span>
                  <span className="font-mono font-semibold text-st-arctic flex items-center gap-1">
                    <Phone className="w-3 h-3 text-st-electric shrink-0" /> {tutor.phone}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">
                    Status de Cadastro
                  </span>
                  <span className="font-medium text-st-success flex items-center gap-1">
                    <CheckCircleIcon /> Ativo no Sistema
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Novo Tutor (Centralizado + Lock de Scroll + Portal) */}
      {isModalOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
            <div className="relative my-auto w-full max-w-md card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-st-arctic">Cadastrar Novo Tutor</h3>
                  <p className="text-xs text-st-muted">Adicione os dados de contato do cliente</p>
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

            <form onSubmit={handleCreateTutor} className="space-y-4 text-xs lg:text-sm overflow-y-auto sidebar-scrollbar flex-1 pr-1">
              <div>
                <label className="block font-semibold text-st-muted mb-1">Nome Completo do Tutor *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Silva Santos"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-st-muted mb-1">WhatsApp / Celular *</label>
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
                <label className="block font-semibold text-st-muted mb-1">E-mail (Opcional)</label>
                <input
                  type="email"
                  placeholder="mariana@email.com"
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
                  Salvar Tutor
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

function CheckCircleIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-st-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
