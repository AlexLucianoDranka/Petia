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
} from 'lucide-react';
import { INITIAL_PETS, INITIAL_MEDICAL_RECORDS } from '@/lib/mockData';
import { Pet, PetMedicalRecord } from '@/types/database';

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
    <div className="space-y-6 animate-fade-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Dog className="w-6 h-6 text-st-electric" />
            <span>Pets & Prontuário Digital</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Ficha clínica, linha do tempo de vacinas, vermífugos e consultas no Petia</p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all">
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Pet</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
        <input
          type="text"
          placeholder="Buscar pet por nome, raça ou tutor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
        />
      </div>

      {/* Pets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPets.map((pet) => (
          <div
            key={pet.id}
            onClick={() => setSelectedPet(pet)}
            className="card card-interactive p-5 rounded-2xl space-y-4 group"
          >
            <div className="flex items-start gap-3">
              <img
                src={pet.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150'}
                alt={pet.name}
                className="w-14 h-14 rounded-xl object-cover border border-st-border group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-st-arctic text-base truncate">{pet.name}</h3>
                <p className="text-xs text-st-electric font-semibold">{pet.species} • {pet.breed}</p>
                <p className="text-[11px] text-st-muted truncate mt-0.5">Tutor: {pet.customer_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-st-navy p-2.5 rounded-xl border border-st-border/60">
              <div>
                <span className="text-st-muted font-bold block text-[9px] uppercase">Peso</span>
                <span className="font-extrabold text-st-arctic">{pet.weight} kg</span>
              </div>
              <div>
                <span className="text-st-muted font-bold block text-[9px] uppercase">Castrado</span>
                <span className="font-extrabold text-st-arctic flex items-center gap-1 mt-0.5">
                  {pet.neutered ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-st-success inline" /> Sim
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-st-muted inline" /> Não
                    </>
                  )}
                </span>
              </div>
            </div>

            <button className="w-full py-2 bg-st-electric/15 hover:bg-st-electric/25 text-st-electric font-semibold text-xs rounded-xl border border-st-electric/30 transition-colors flex items-center justify-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Ver Prontuário Médico</span>
            </button>
          </div>
        ))}
      </div>

      {/* Pet Medical Records Modal */}
      {selectedPet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-fade-up">
            <div className="flex items-start justify-between border-b border-st-border/40 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPet.photo_url}
                  alt={selectedPet.name}
                  className="w-14 h-14 rounded-xl object-cover border border-st-border"
                />
                <div>
                  <h3 className="font-extrabold text-xl text-st-arctic">{selectedPet.name}</h3>
                  <p className="text-xs text-st-muted">
                    {selectedPet.breed} • Tutor: <span className="font-semibold text-st-arctic">{selectedPet.customer_name}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddRecordModalOpen(true)}
                  className="px-3 py-1.5 bg-st-electric hover:bg-st-steel text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-glow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Novo Registro</span>
                </button>
                <button
                  onClick={() => setSelectedPet(null)}
                  className="p-2 text-st-muted hover:text-st-arctic rounded-xl hover:bg-st-surface-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Medical Timeline */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-st-arctic flex items-center gap-2">
                <Activity className="w-4 h-4 text-st-electric" />
                <span>Linha do Tempo Médica & Carteira Digital</span>
              </h4>

              {selectedPetRecords.length === 0 ? (
                <div className="p-8 text-center bg-st-navy rounded-xl text-st-muted text-xs border border-st-border">
                  Nenhum histórico médico registrado para este pet ainda.
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-st-border">
                  {selectedPetRecords.map((rec) => (
                    <div key={rec.id} className="relative pl-10">
                      <div className="absolute left-2.5 top-1.5 w-5 h-5 rounded-full bg-st-electric text-white flex items-center justify-center border border-st-electric/50 shadow-md">
                        <Syringe className="w-3 h-3 text-white" />
                      </div>
                      <div className="p-4 rounded-xl bg-st-navy border border-st-border/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-st-arctic text-xs lg:text-sm">{rec.description}</span>
                          <span className="text-[10px] font-bold bg-st-surface-2 text-st-muted px-2 py-0.5 rounded-full uppercase border border-st-border">
                            {rec.type}
                          </span>
                        </div>
                        <p className="text-xs text-st-muted">Realizado em: {rec.date} por {rec.vet_name}</p>
                        {rec.next_due_date && (
                          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold bg-st-success/20 text-st-success px-2.5 py-1 rounded-lg border border-st-success/30">
                            <span>Próxima Dose / Retorno: {rec.next_due_date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Medical Record */}
      {isAddRecordModalOpen && selectedPet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
              <h3 className="font-bold text-st-arctic text-base">Adicionar Registro para {selectedPet.name}</h3>
              <button onClick={() => setIsAddRecordModalOpen(false)} className="text-st-muted hover:text-st-arctic">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedicalRecord} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-st-muted mb-1">Tipo de Procedimento</label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                >
                  <option value="vaccine">Vacina</option>
                  <option value="deworming">Vermifugação</option>
                  <option value="consultation">Consulta Médica</option>
                  <option value="exam">Exame Laboratorial</option>
                  <option value="surgery">Cirurgia</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-st-muted mb-1">Descrição / Medicamento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vacina V10 Importada Lote #9981"
                  value={recordDesc}
                  onChange={(e) => setRecordDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Data Aplicação</label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Próxima Dose</label>
                  <input
                    type="date"
                    value={recordNextDate}
                    onChange={(e) => setRecordNextDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-st-border text-st-muted font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-st-electric text-white font-semibold shadow-glow"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
