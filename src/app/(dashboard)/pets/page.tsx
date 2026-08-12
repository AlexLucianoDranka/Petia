'use client';

import React, { useState } from 'react';
import {
  Dog,
  Plus,
  Search,
  FileText,
  Syringe,
  X,
  PlusCircle,
  Activity,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Weight,
} from 'lucide-react';
import { INITIAL_PETS, INITIAL_MEDICAL_RECORDS } from '@/lib/mockData';
import { Pet, PetMedicalRecord } from '@/types/database';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

export default function PetsPage() {
  const [pets, setPets] = useState(INITIAL_PETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState(INITIAL_MEDICAL_RECORDS);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);

  const [recordType, setRecordType] = useState<'vaccine' | 'deworming' | 'exam' | 'surgery' | 'consultation'>('vaccine');
  const [recordDesc, setRecordDesc] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordNextDate, setRecordNextDate] = useState('');

  const filteredPets = pets.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPetRecords = selectedPet
    ? medicalRecords.filter((m) => m.pet_id === selectedPet.id)
    : [];

  const handleAddMedicalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;

    const newRecord: PetMedicalRecord = {
      id: `med-${Date.now()}`,
      pet_id: selectedPet.id,
      type: recordType,
      description: recordDesc,
      date: recordDate,
      next_due_date: recordNextDate || undefined,
      vet_id: 'u1',
      vet_name: 'Dr. Lucas Mendes',
      created_at: new Date().toISOString(),
    };

    setMedicalRecords([newRecord, ...medicalRecords]);
    setIsAddRecordModalOpen(false);
    setRecordDesc('');
    setRecordNextDate('');
  };

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Dog className="w-6 h-6 text-st-electric" />
            <span>Pets & Prontuário Digital</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Ficha clínica, linha do tempo de vacinas, vermífugos e consultas no Petia</p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none">
          <Plus className="w-4 h-4 shrink-0" />
          <span>Cadastrar Novo Pet</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
        <input
          type="text"
          placeholder="Buscar pet por nome, raça ou tutor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
        />
      </div>

      {/* Unique Horizontal Column per Pet (1 Coluna por Pet na Horizontal / 100% Tela) */}
      <div className="grid grid-cols-1 w-full space-y-3">
        {filteredPets.map((pet) => (
          <div
            key={pet.id}
            onClick={() => setSelectedPet(pet)}
            className="card card-interactive p-4 sm:p-5 rounded-2xl w-full flex flex-col md:flex-row md:items-center justify-between gap-4 group border border-st-border hover:border-st-electric/40 transition-all cursor-pointer"
          >
            {/* Left Info: Pet Image Avatar & General Details */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-st-surface border border-st-border overflow-hidden shrink-0 flex items-center justify-center relative">
                {pet.photo_url ? (
                  <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <Dog className="w-7 h-7 text-st-electric" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-st-arctic text-base group-hover:text-st-electric transition-colors">{pet.name}</h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-st-electric/15 text-st-electric border border-st-electric/30 whitespace-nowrap">
                    {pet.species === 'dog' ? 'Cão' : pet.species === 'cat' ? 'Gato' : pet.species}
                  </span>
                  <span className="text-[10px] text-st-muted font-medium uppercase px-2 py-0.5 rounded-full bg-st-surface border border-st-border whitespace-nowrap">
                    {pet.sex === 'M' ? 'Macho' : 'Fêmea'}
                  </span>
                </div>
                <p className="text-xs text-st-muted mt-0.5 truncate">{pet.breed || 'SRD'}</p>
              </div>
            </div>

            {/* Middle Info: Tutor & Vitals in Columns inside Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs w-full md:w-auto border-t md:border-t-0 md:border-l border-st-border/40 pt-3 md:pt-0 md:pl-4">
              <div>
                <span className="text-[10px] font-bold text-st-muted uppercase block">Tutor Responsável</span>
                <span className="font-semibold text-st-arctic truncate block">{pet.customer_name || 'Mariana Silva'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-st-muted uppercase block">Idade / Peso</span>
                <span className="font-semibold text-st-arctic block">{pet.weight ? `${pet.weight} kg` : 'N/I'}</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] font-bold text-st-muted uppercase block">Prontuário</span>
                <span className="font-mono text-st-electric font-semibold block">#PR-{pet.id.slice(0, 4)}</span>
              </div>
            </div>

            {/* Right Action */}
            <div className="flex items-center justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-st-border/20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPet(pet);
                }}
                className="w-full md:w-auto px-4 py-2 bg-st-electric/15 hover:bg-st-electric text-st-electric hover:text-white font-bold rounded-xl text-xs transition-colors whitespace-nowrap border border-st-electric/30"
              >
                Abrir Prontuário
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Prontuário Drawer / Modal */}
      {selectedPet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-end p-0 sm:p-4">
          <div className="card w-full max-w-2xl h-full sm:h-auto max-h-[90vh] rounded-none sm:rounded-2xl p-6 space-y-5 overflow-y-auto border border-st-border">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-st-surface border border-st-border overflow-hidden flex items-center justify-center">
                  {selectedPet.photo_url ? (
                    <img src={selectedPet.photo_url} alt={selectedPet.name} className="w-full h-full object-cover" />
                  ) : (
                    <Dog className="w-6 h-6 text-st-electric" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-st-arctic">{selectedPet.name}</h2>
                  <p className="text-xs text-st-muted">{selectedPet.breed} • Tutor: {selectedPet.customer_name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPet(null)} className="text-st-muted hover:text-st-arctic">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-bold text-st-arctic text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-st-electric" /> Histórico Clínico & Vacinas
              </h3>
              <button
                onClick={() => setIsAddRecordModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-st-electric text-white text-xs font-bold shadow-glow border-none"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Adicionar Registro
              </button>
            </div>

            <div className="space-y-3">
              {selectedPetRecords.length === 0 ? (
                <p className="text-xs text-st-muted py-6 text-center">Nenhum registro clínico encontrado para este pet.</p>
              ) : (
                selectedPetRecords.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-xl bg-st-surface border border-st-border/60 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-st-electric uppercase text-[10px] tracking-wider font-extrabold">{rec.type}</span>
                      <span className="text-st-muted font-mono">{rec.date}</span>
                    </div>
                    <p className="text-st-arctic font-medium">{rec.description}</p>
                    <p className="text-[10px] text-st-muted">Vet: {rec.vet_name}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Registro Clínico */}
      {isAddRecordModalOpen && selectedPet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card rounded-2xl max-w-md w-full p-6 space-y-4 border border-st-border">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
              <h3 className="font-bold text-st-arctic text-base">Novo Registro Clínico</h3>
              <button onClick={() => setIsAddRecordModalOpen(false)} className="text-st-muted hover:text-st-arctic">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedicalRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-st-muted mb-1 font-semibold">Tipo de Registro</label>
                <select
                  value={recordType}
                  onChange={(e: any) => setRecordType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                >
                  <option value="vaccine">Vacina</option>
                  <option value="deworming">Vermífugo</option>
                  <option value="consultation">Consulta Geral</option>
                  <option value="exam">Exame Laboratorial</option>
                  <option value="surgery">Cirurgia / Procedimento</option>
                </select>
              </div>

              <div>
                <label className="block text-st-muted mb-1 font-semibold">Descrição / Observações</label>
                <textarea
                  required
                  rows={3}
                  value={recordDesc}
                  onChange={(e) => setRecordDesc(e.target.value)}
                  placeholder="Ex: Aplicada Vacina V10 Lote #892. Pet sem alterações."
                  className="w-full p-2.5 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-st-muted mb-1 font-semibold">Data da Aplicação</label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                  />
                </div>
                <div>
                  <label className="block text-st-muted mb-1 font-semibold">Próximo Vencimento</label>
                  <input
                    type="date"
                    value={recordNextDate}
                    onChange={(e) => setRecordNextDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-st-border text-st-muted font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-st-electric text-white font-bold shadow-glow border-none"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SolidaTechBadge variant="auth" />
    </div>
  );
}
