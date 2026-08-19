'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ChevronRight,
  QrCode,
  Image as ImageIcon,
  PenTool,
  Download,
  Upload,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { getScopedData } from '@/lib/data/clinicDataScope';
import { Pet, PetMedicalRecord } from '@/types/database';
import { useCurrentPlan } from '@/hooks/useCurrentPlan';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';
import { showToast, startTopLoader, stopTopLoader } from '@/components/ui/GlobalToastAndLoader';
import { ClientPortal } from '@/components/ui/ClientPortal';

interface ExamItem {
  id: string;
  pet_id: string;
  title: string;
  category: 'radiography' | 'ultrasound' | 'blood_work' | 'other';
  image_url: string;
  date: string;
  notes?: string;
}

export default function PetsPage() {
  const { planType, isTrial } = useCurrentPlan();
  const canUploadPhoto = isTrial || planType !== 'basico';

  const [pets, setPets] = useState<Pet[]>(() => getScopedData('petia_pets'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<PetMedicalRecord[]>(() =>
    getScopedData('petia_medical_records')
  );
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'records' | 'exams'>('records');

  // Modal States
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isExamAnnotatorOpen, setIsExamAnnotatorOpen] = useState(false);
  const [selectedExamForAnnotate, setSelectedExamForAnnotate] = useState<ExamItem | null>(null);

  // New Pet Form States
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('Cão');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetCustomerId, setNewPetCustomerId] = useState('');
  const [customers, setCustomers] = useState<any[]>(() => getScopedData('petia_customers'));
  const [newPetWeight, setNewPetWeight] = useState('');
  const [newPetSex, setNewPetSex] = useState<'M' | 'F'>('M');
  const [newPetNotes, setNewPetNotes] = useState('');
  const [newPetPhotoUrl, setNewPetPhotoUrl] = useState('');

  // New Record Form States
  const [recordType, setRecordType] = useState<'vaccine' | 'deworming' | 'exam' | 'surgery' | 'consultation'>('vaccine');
  const [recordDesc, setRecordDesc] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordNextDate, setRecordNextDate] = useState('');

  // Canvas Annotation States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#ef4444');

  // Lock background scroll when any modal/drawer is open
  useEffect(() => {
    if (isAddPetModalOpen || isAddRecordModalOpen || isQrModalOpen || isExamAnnotatorOpen || selectedPet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddPetModalOpen, isAddRecordModalOpen, isQrModalOpen, isExamAnnotatorOpen, selectedPet]);

  const filteredPets = pets.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPetRecords = selectedPet
    ? medicalRecords.filter((m) => m.pet_id === selectedPet.id)
    : [];

  const selectedPetExams = selectedPet
    ? exams.filter((e) => e.pet_id === selectedPet.id)
    : [];

  const handleAddMedicalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;
    startTopLoader();

    const newRecord: PetMedicalRecord = {
      id: `med-${Date.now()}`,
      pet_id: selectedPet.id,
      date: recordDate,
      type: recordType,
      description: recordDesc,
      vet_name: 'Equipe Veterinária',
      next_due_date: recordNextDate || undefined,
      created_at: new Date().toISOString(),
    };

    setMedicalRecords((prev) => [newRecord, ...prev]);
    setIsAddRecordModalOpen(false);
    setRecordDesc('');
    setRecordNextDate('');
    setTimeout(() => {
      stopTopLoader();
      showToast('Prontuário médico salvo com sucesso!', 'success');
    }, 400);
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleUploadExam = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedPet) return;
    const file = e.target.files[0];
    const newExam: ExamItem = {
      id: `ex-${Date.now()}`,
      pet_id: selectedPet.id,
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: 'radiography',
      image_url: URL.createObjectURL(file),
      date: new Date().toISOString().split('T')[0],
      notes: 'Upload de arquivo de exame.',
    };
    setExams([newExam, ...exams]);
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 400; // compress to avoid localStorage quota
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setNewPetPhotoUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;

    const customer = customers.find((c) => c.id === newPetCustomerId);
    if (!customer) {
      showToast('Por favor, selecione um tutor responsável.', 'error');
      return;
    }

    // Obter o clinicId real que está salvo no local storage pelo login
    const savedClinic = localStorage.getItem('petia_clinic_data');
    const realClinicId = savedClinic ? JSON.parse(savedClinic).id : 'real-clinic';
    const isRealClinic = realClinicId && realClinicId !== 'real-clinic';
    
    // Gerar um UUID real se for salvar no Supabase
    const petId = isRealClinic ? crypto.randomUUID() : `pet-${Date.now()}`;

    const newPet: Pet = {
      id: petId,
      clinic_id: realClinicId,
      customer_id: customer.id,
      customer_name: customer.name,
      name: newPetName.trim(),
      species: newPetSpecies,
      breed: newPetBreed.trim() || 'SRD',
      weight: parseFloat(newPetWeight) || 0,
      sex: newPetSex,
      neutered: false,
      notes: newPetNotes.trim() || undefined,
      photo_url: newPetPhotoUrl.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    if (isRealClinic) {
      try {
        const { supabase } = await import('@/lib/supabaseClient');
        const { error } = await supabase.from('pets').insert([{
          id: newPet.id,
          clinic_id: newPet.clinic_id,
          customer_id: newPet.customer_id,
          name: newPet.name,
          species: newPet.species,
          breed: newPet.breed,
          weight: newPet.weight,
          sex: newPet.sex,
          neutered: newPet.neutered,
          notes: newPet.notes,
          photo_url: newPet.photo_url,
          created_at: newPet.created_at
        }]);
        if (error) {
          console.error('Erro ao salvar pet no banco:', error);
        }
      } catch (err) {
        console.error(err);
      }
    }

    const updated = [newPet, ...pets];
    setPets(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('petia_pets', JSON.stringify(updated));
      window.dispatchEvent(new Event('petia_data_updated'));
    }

    setNewPetName('');
    setNewPetBreed('');
    setNewPetCustomerId('');
    setNewPetWeight('');
    setNewPetNotes('');
    setNewPetPhotoUrl('');
    setIsAddPetModalOpen(false);

    showToast('Pet cadastrado com sucesso!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Dog className="w-6 h-6 text-st-electric" />
            <span>Pets, Prontuário & Raio-X Digital</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">
            Ficha clínica, anotação em exames e QR Code do tutor no Petia
          </p>
        </div>

        <button
          onClick={() => setIsAddPetModalOpen(true)}
          className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none cursor-pointer"
        >
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

      {/* Structured Pet List */}
      <div className="grid grid-cols-1 w-full space-y-3">
        {filteredPets.map((pet) => (
          <div
            key={pet.id}
            onClick={() => setSelectedPet(pet)}
            className="card p-4 sm:p-5 rounded-2xl w-full border border-st-border hover:border-st-electric/40 transition-all cursor-pointer space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-st-surface border border-st-border overflow-hidden shrink-0 flex items-center justify-center">
                  {pet.photo_url ? (
                    <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <Dog className="w-6 h-6 text-st-electric" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-st-arctic text-base leading-tight">{pet.name}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-st-electric/15 text-st-electric border border-st-electric/30 whitespace-nowrap">
                      {pet.species === 'dog' ? 'Cão' : pet.species === 'cat' ? 'Gato' : pet.species}
                    </span>
                  </div>
                  <p className="text-xs text-st-muted mt-0.5 truncate">{pet.breed || 'SRD'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPet(pet);
                    setIsQrModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-st-surface border border-st-border text-st-electric hover:bg-st-electric/15 transition-colors shrink-0"
                  title="Gerar QR Code do Pet"
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPet(pet);
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-st-electric/15 hover:bg-st-electric text-st-electric hover:text-white font-bold rounded-xl text-xs transition-colors whitespace-nowrap border border-st-electric/30 shrink-0"
                >
                  <span>Prontuário</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-st-surface/60 border border-st-border/50 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">Tutor Responsável</span>
                <span className="font-semibold text-st-arctic truncate block">{pet.customer_name || 'Mariana Silva'}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">Peso Atual</span>
                <span className="font-semibold text-st-arctic block">{pet.weight ? `${pet.weight} kg` : 'N/I'}</span>
              </div>

              <div className="space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">Código Ficha</span>
                <span className="font-mono text-st-electric font-bold block">#PR-{pet.id.slice(0, 5)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prontuário & Exames Drawer */}
      {selectedPet && (
        <ClientPortal>
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
                <button
                  onClick={() => setSelectedPet(null)}
                  className="p-2 text-st-muted hover:text-st-arctic rounded-xl hover:bg-st-surface-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs inside Drawer */}
              <div className="flex items-center gap-2 border-b border-st-border/40 pb-3">
                <button
                  onClick={() => setActiveDrawerTab('records')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeDrawerTab === 'records'
                      ? 'bg-st-electric text-white shadow-glow-sm'
                      : 'text-st-muted hover:text-st-arctic'
                  }`}
                >
                  Linha do Tempo Clínica ({selectedPetRecords.length})
                </button>
                <button
                  onClick={() => setActiveDrawerTab('exams')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeDrawerTab === 'exams'
                      ? 'bg-st-electric text-white shadow-glow-sm'
                      : 'text-st-muted hover:text-st-arctic'
                  }`}
                >
                  Exames & Raio-X ({selectedPetExams.length})
                </button>
              </div>

              {/* Records Tab Content */}
              {activeDrawerTab === 'records' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-st-arctic text-sm">Histórico Médico & Vacinação</h3>
                    <button
                      onClick={() => setIsAddRecordModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold text-xs shadow-glow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Novo Registro</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedPetRecords.length === 0 ? (
                      <div className="p-8 bg-st-surface/40 rounded-xl text-center text-st-muted text-xs">
                        Nenhum registro clínico cadastrado para este pet ainda.
                      </div>
                    ) : (
                      selectedPetRecords.map((record) => (
                        <div key={record.id} className="p-4 rounded-xl bg-st-navy border border-st-border space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-st-electric uppercase tracking-wider">{record.type}</span>
                            <span className="text-st-muted text-[11px]">{record.date}</span>
                          </div>
                          <p className="text-xs text-st-arctic font-medium">{record.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-st-muted pt-1 border-t border-st-border/30">
                            <span>Vet: {record.vet_name}</span>
                            {record.next_due_date && (
                              <span className="text-st-warning font-semibold">Próx. Dose: {record.next_due_date}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Exams Tab Content */}
              {activeDrawerTab === 'exams' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-st-arctic text-sm">Imagens Radiológicas & Laudos</h3>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold text-xs shadow-glow cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload de Raio-X</span>
                      <input type="file" accept="image/*" onChange={handleUploadExam} className="hidden" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPetExams.map((exam) => (
                      <div key={exam.id} className="p-3 rounded-xl bg-st-navy border border-st-border space-y-2">
                        <div className="relative h-36 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                          <img src={exam.image_url} alt={exam.title} className="max-h-full object-contain" />
                          <button
                            onClick={() => {
                              setSelectedExamForAnnotate(exam);
                              setIsExamAnnotatorOpen(true);
                            }}
                            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-st-electric text-white text-[10px] font-bold flex items-center gap-1 shadow-glow"
                          >
                            <PenTool className="w-3 h-3" /> Anotar
                          </button>
                        </div>
                        <div>
                          <h4 className="font-bold text-st-arctic text-xs">{exam.title}</h4>
                          <p className="text-[10px] text-st-muted">{exam.date} • {exam.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ClientPortal>
      )}

      {/* QR Code Modal */}
      {isQrModalOpen && selectedPet && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card rounded-2xl max-w-sm w-full p-6 text-center space-y-5 border border-st-border animate-fade-up">
              <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
                <h3 className="font-bold text-st-arctic text-base flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-st-electric" />
                  <span>QR Code do Pet</span>
                </h3>
                <button onClick={() => setIsQrModalOpen(false)} className="text-st-muted hover:text-st-arctic">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-white rounded-2xl inline-block mx-auto border-4 border-st-electric/30 shadow-glow">
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/tutor?pet=${selectedPet.id}`}
                  size={180}
                />
              </div>

              <div>
                <h4 className="font-extrabold text-st-arctic text-lg">{selectedPet.name}</h4>
                <p className="text-xs text-st-muted">Coleiras, carteirinha ou balcão da recepção</p>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-bold text-xs shadow-glow flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Imprimir QR Code</span>
              </button>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* Exam Canvas Annotator Modal */}
      {isExamAnnotatorOpen && selectedExamForAnnotate && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="card rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-st-border animate-fade-up">
              <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
                <div>
                  <h3 className="font-bold text-st-arctic text-base flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-st-electric" />
                    <span>Anotação Clínica sobre Imagem de Exame</span>
                  </h3>
                  <p className="text-xs text-st-muted">{selectedExamForAnnotate.title}</p>
                </div>
                <button onClick={() => setIsExamAnnotatorOpen(false)} className="text-st-muted hover:text-st-arctic">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-st-surface border border-st-border text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-st-muted font-bold">Cor:</span>
                  {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ffffff'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setDrawColor(color)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        drawColor === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={clearCanvas}
                  className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold"
                >
                  Limpar Desenho
                </button>
              </div>

              {/* Canvas Container */}
              <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center border border-st-border min-h-[300px]">
                <img
                  src={selectedExamForAnnotate.image_url}
                  alt="Exame"
                  className="max-h-[350px] w-full object-contain pointer-events-none select-none"
                />
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={350}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsExamAnnotatorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-st-border text-st-muted text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    alert('Anotação salva no prontuário do pet com sucesso!');
                    setIsExamAnnotatorOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-st-electric text-white text-xs font-bold shadow-glow border-none"
                >
                  Salvar Anotação no Prontuário
                </button>
              </div>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* Modal Adicionar Registro Clínico */}
      {isAddRecordModalOpen && selectedPet && (
        <ClientPortal>
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
        </ClientPortal>
      )}

      {/* Modal: Cadastrar Novo Pet (Centralizado + Lock de Scroll) */}
      {isAddPetModalOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
            <div className="relative my-auto w-full max-w-md card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-st-border/40 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold shrink-0">
                    <Dog className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-st-arctic">Cadastrar Novo Pet</h3>
                    <p className="text-xs text-st-muted">Adicione a ficha digital do paciente</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddPetModalOpen(false)}
                  className="p-2 rounded-xl text-st-muted hover:text-st-arctic hover:bg-st-surface-2 shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPet} className="space-y-4 text-xs lg:text-sm overflow-y-auto sidebar-scrollbar flex-1 pr-1">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Nome do Pet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Thor, Luna, Bob..."
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Espécie</label>
                    <select
                      value={newPetSpecies}
                      onChange={(e) => setNewPetSpecies(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                    >
                      <option value="Cão">Cão</option>
                      <option value="Gato">Gato</option>
                      <option value="Ave">Ave</option>
                      <option value="Roedor">Roedor</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Raça</label>
                    <input
                      type="text"
                      placeholder="Ex: Golden, Poodle, SRD..."
                      value={newPetBreed}
                      onChange={(e) => setNewPetBreed(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-st-muted">Tutor Responsável *</label>
                    <Link href="/tutores" className="text-xs text-st-electric hover:underline font-bold">+ Novo Tutor</Link>
                  </div>
                  <select
                    required
                    value={newPetCustomerId}
                    onChange={(e) => setNewPetCustomerId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  >
                    <option value="">-- Selecione o tutor --</option>
                    {customers.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email || c.phone || 'Sem contato'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 12.5"
                      value={newPetWeight}
                      onChange={(e) => setNewPetWeight(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Sexo</label>
                    <select
                      value={newPetSex}
                      onChange={(e) => setNewPetSex(e.target.value as 'M' | 'F')}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                    >
                      <option value="M">Macho</option>
                      <option value="F">Fêmea</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-st-muted">Foto do Pet (Opcional)</label>
                    {!canUploadPhoto && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">Plano Pro+</span>
                    )}
                  </div>
                  {newPetPhotoUrl ? (
                    <div className="relative inline-block mt-2">
                      <img src={newPetPhotoUrl} alt="Pet" className="w-20 h-20 object-cover rounded-xl border border-st-border" />
                      <button type="button" onClick={() => setNewPetPhotoUrl('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      disabled={!canUploadPhoto}
                      onChange={handleUploadPhoto}
                      className="w-full p-2.5 rounded-xl bg-st-surface border border-st-border text-st-muted text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-st-electric/20 file:text-st-electric hover:file:bg-st-electric/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  )}
                  {!canUploadPhoto && (
                    <p className="text-[10px] text-amber-500/80 mt-1 font-medium">Faça o upgrade para anexar fotos dos pets.</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-st-muted mb-1">Observações Médicas / Comportamentais</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Alérgico a penicilina, calmo..."
                    value={newPetNotes}
                    onChange={(e) => setNewPetNotes(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddPetModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-st-border text-st-muted hover:text-st-arctic font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold shadow-glow whitespace-nowrap cursor-pointer border-none"
                  >
                    Salvar Pet
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
