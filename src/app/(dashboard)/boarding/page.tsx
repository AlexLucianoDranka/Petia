'use client';

import React, { useState, useEffect } from 'react';
import { Home, Calendar, Clock, Plus, CheckCircle2, Dog, Camera, X, Trash2 } from 'lucide-react';
import { getScopedData } from '@/lib/data/clinicDataScope';
import { showToast } from '@/components/ui/GlobalToastAndLoader';
import { ClientPortal } from '@/components/ui/ClientPortal';

export interface BoardingGuest {
  id: string;
  petName: string;
  breed: string;
  tutorName: string;
  type: 'Hospedagem (Hotel)' | 'Creche (Daycare)';
  unit: string;
  checkIn: string;
  checkOutExpected: string;
  dietNotes: string;
  created_at: string;
}

export default function BoardingPage() {
  const [currentGuests, setCurrentGuests] = useState<BoardingGuest[]>(() =>
    getScopedData('petia_boarding')
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [type, setType] = useState<'Hospedagem (Hotel)' | 'Creche (Daycare)'>('Hospedagem (Hotel)');
  const [unit, setUnit] = useState('Baia #01');
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutExpected, setCheckOutExpected] = useState('');
  const [dietNotes, setDietNotes] = useState('');

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

  const saveGuestsToStorage = (updated: BoardingGuest[]) => {
    setCurrentGuests(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('petia_boarding', JSON.stringify(updated));
      window.dispatchEvent(new Event('petia_data_updated'));
    }
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim() || !tutorName.trim()) return;

    const newGuest: BoardingGuest = {
      id: `brd-${Date.now()}`,
      petName: petName.trim(),
      breed: breed.trim() || 'SRD',
      tutorName: tutorName.trim(),
      type,
      unit,
      checkIn: new Date(checkIn).toLocaleDateString('pt-BR'),
      checkOutExpected: checkOutExpected
        ? new Date(checkOutExpected).toLocaleDateString('pt-BR')
        : 'A definir',
      dietNotes: dietNotes.trim() || 'Sem restrições alimentares informadas.',
      created_at: new Date().toISOString(),
    };

    const updated = [newGuest, ...currentGuests];
    saveGuestsToStorage(updated);

    // Reset form
    setPetName('');
    setBreed('');
    setTutorName('');
    setCheckOutExpected('');
    setDietNotes('');
    setIsModalOpen(false);

    showToast('Reserva / Check-in cadastrado com sucesso!', 'success');
  };

  const handleCheckout = (id: string, petName: string) => {
    if (window.confirm(`Confirmar checkout da hospedagem de "${petName}"?`)) {
      const updated = currentGuests.filter((g) => g.id !== id);
      saveGuestsToStorage(updated);
      showToast(`Checkout de ${petName} realizado com sucesso!`, 'success');
    }
  };

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Home className="w-6 h-6 text-st-electric" />
            <span>Hospedagem & Creche (Hotel & Daycare Pet)</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">
            Gestão de baias, check-in de estadia, diário de bordo com fotos e controle de alimentação/medicação
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap shrink-0 border-none cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Nova Reserva / Check-in</span>
        </button>
      </div>

      {/* Guest List */}
      {currentGuests.length === 0 ? (
        <div className="card p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-st-surface-2 border border-st-border flex items-center justify-center text-st-muted">
            <Home className="w-8 h-8 text-st-electric" />
          </div>
          <h3 className="text-lg font-bold text-st-arctic">Nenhum pet hospedado no momento</h3>
          <p className="text-xs text-st-muted max-w-sm">
            Sua creche / hotel está sem hóspedes no momento. Faça uma nova reserva ou check-in!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Reserva de Hospedagem</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 w-full space-y-3">
          {currentGuests.map((guest) => (
            <div key={guest.id} className="card p-5 rounded-2xl space-y-4 border border-st-border w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-st-border/40 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-st-electric/20 border border-st-electric/40 flex items-center justify-center text-st-electric font-bold shrink-0 shadow-glow">
                    <Dog className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-st-arctic text-lg">{guest.petName}</h3>
                    <p className="text-xs text-st-muted">{guest.breed} • Tutor: {guest.tutorName}</p>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-st-success/20 text-st-success border border-st-success/30 whitespace-nowrap self-start sm:self-auto">
                  {guest.type}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-st-navy p-3.5 rounded-xl border border-st-border/60">
                <div>
                  <span className="text-[9px] font-bold uppercase text-st-muted block">Baia / Vaga</span>
                  <span className="font-extrabold text-st-electric text-sm">{guest.unit}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-st-muted block">Entrada</span>
                  <span className="font-bold text-st-arctic">{guest.checkIn}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-st-muted block">Saída Prevista</span>
                  <span className="font-bold text-st-arctic">{guest.checkOutExpected}</span>
                </div>
              </div>

              <div className="text-xs text-st-muted space-y-1">
                <span className="text-[10px] font-bold uppercase text-st-electric block">Instruções de Alimentação & Saúde:</span>
                <p className="p-2.5 rounded-xl bg-st-surface border border-st-border/40 text-st-arctic text-[11px] leading-relaxed">
                  {guest.dietNotes}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-st-border/40 text-xs flex-wrap gap-2">
                <button
                  onClick={() => alert(`Enviando atualização fotográfica de ${guest.petName} via WhatsApp...`)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic font-semibold border border-st-border cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-st-electric" /> Enviar Foto no WhatsApp
                </button>
                <button
                  onClick={() => handleCheckout(guest.id, guest.petName)}
                  className="px-4 py-2 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold shadow-glow border-none whitespace-nowrap cursor-pointer"
                >
                  Realizar Check-out
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Nova Reserva / Check-in (Centralizado + Lock de Scroll + Portal) */}
      {isModalOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
          <div className="relative my-auto w-full max-w-md card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-st-arctic">Nova Reserva / Hospedagem</h3>
                  <p className="text-xs text-st-muted">Check-in de hotel ou creche daycare</p>
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

            <form onSubmit={handleCreateReservation} className="space-y-4 text-xs lg:text-sm overflow-y-auto sidebar-scrollbar flex-1 pr-1">
              <div>
                <label className="block font-semibold text-st-muted mb-1">Nome do Pet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Thor, Luna..."
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Raça</label>
                  <input
                    type="text"
                    placeholder="Ex: Golden, SRD"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Tutor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Clara"
                    value={tutorName}
                    onChange={(e) => setTutorName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Tipo de Estadia</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  >
                    <option value="Hospedagem (Hotel)">Hospedagem (Hotel)</option>
                    <option value="Creche (Daycare)">Creche (Daycare)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Baia / Vaga</label>
                  <input
                    type="text"
                    placeholder="Baia #01"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Data de Entrada</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Saída Prevista</label>
                  <input
                    type="date"
                    value={checkOutExpected}
                    onChange={(e) => setCheckOutExpected(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-st-muted mb-1">Instruções de Alimentação & Remédios</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Ração 200g às 08h e 18h. Remédio para ouvido após almoço..."
                  value={dietNotes}
                  onChange={(e) => setDietNotes(e.target.value)}
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
                  Confirmar Reserva
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
