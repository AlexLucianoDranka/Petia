'use client';

import React, { useState, useRef } from 'react';
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
import { QRCodeSVG } from 'qrcode.react';
import { INITIAL_PETS, INITIAL_MEDICAL_RECORDS } from '@/lib/mockData';
import { Pet, PetMedicalRecord } from '@/types/database';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';
import { showToast, startTopLoader, stopTopLoader } from '@/components/ui/GlobalToastAndLoader';

interface ExamItem {
  id: string;
  pet_id: string;
  title: string;
  category: 'radiography' | 'ultrasound' | 'blood_work' | 'other';
  image_url: string;
  date: string;
  notes?: string;
}

const INITIAL_EXAMS: ExamItem[] = [
  {
    id: 'ex-1',
    pet_id: 'pet-1',
    title: 'Raio-X Tórax e Abdômen',
    category: 'radiography',
    image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
    date: '2026-02-10',
    notes: 'Apresenta estrutura óssea sem fraturas visíveis.',
  },
  {
    id: 'ex-2',
    pet_id: 'pet-1',
    title: 'Ultrassom Abdominal Total',
    category: 'ultrasound',
    image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    date: '2026-01-15',
    notes: 'Órgãos internos sem alterações morfometria padrão.',
  },
];

import { getScopedData } from '@/lib/data/clinicDataScope';

export default function PetsPage() {
  const [pets, setPets] = useState(() => getScopedData('petia_pets', INITIAL_PETS));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState(INITIAL_MEDICAL_RECORDS);
  const [exams, setExams] = useState<ExamItem[]>(INITIAL_EXAMS);

  const [activeDrawerTab, setActiveDrawerTab] = useState<'records' | 'exams'>('records');

  // Modal States
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isExamAnnotatorOpen, setIsExamAnnotatorOpen] = useState(false);
  const [selectedExamForAnnotate, setSelectedExamForAnnotate] = useState<ExamItem | null>(null);

  // New Record Form States
  const [recordType, setRecordType] = useState<'vaccine' | 'deworming' | 'exam' | 'surgery' | 'consultation'>('vaccine');
  const [recordDesc, setRecordDesc] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordNextDate, setRecordNextDate] = useState('');

  // Canvas Annotation States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#ef4444');

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

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Dog className="w-6 h-6 text-st-electric" />
            <span>Pets, Prontuário & Raio-X Digital</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Ficha clínica, anotação em exames e QR Code do tutor no Petia</p>
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

            {/* Navigation Tabs Inside Drawer */}
            <div className="flex items-center gap-2 border-b border-st-border/40 pb-2">
              <button
                onClick={() => setActiveDrawerTab('records')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeDrawerTab === 'records'
                    ? 'bg-st-electric text-white shadow-glow-sm'
                    : 'text-st-muted hover:text-st-arctic'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Prontuário & Vacinas ({selectedPetRecords.length})</span>
              </button>
              <button
                onClick={() => setActiveDrawerTab('exams')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeDrawerTab === 'exams'
                    ? 'bg-st-electric text-white shadow-glow-sm'
                    : 'text-st-muted hover:text-st-arctic'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Exames & Raio-X ({selectedPetExams.length})</span>
              </button>
            </div>

            {/* Tab 1: Records */}
            {activeDrawerTab === 'records' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-st-arctic text-xs uppercase tracking-wider">Histórico Clínico</h3>
                  <button
                    onClick={() => setIsAddRecordModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-st-electric text-white text-xs font-bold shadow-glow border-none"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Adicionar Registro
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedPetRecords.length === 0 ? (
                    <p className="text-xs text-st-muted py-6 text-center">Nenhum registro clínico para este pet.</p>
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
            )}

            {/* Tab 2: Exams & Radiographies with Canvas Annotator */}
            {activeDrawerTab === 'exams' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-st-arctic text-xs uppercase tracking-wider">Imagens de Exame & Raio-X</h3>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-st-electric text-white text-xs font-bold shadow-glow cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Exame</span>
                    <input type="file" accept="image/*" onChange={handleUploadExam} className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPetExams.map((exam) => (
                    <div key={exam.id} className="card p-3 rounded-xl border border-st-border space-y-2">
                      <div className="h-32 rounded-lg bg-st-navy overflow-hidden relative border border-st-border/50">
                        <img src={exam.image_url} alt={exam.title} className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            setSelectedExamForAnnotate(exam);
                            setIsExamAnnotatorOpen(true);
                          }}
                          className="absolute bottom-2 right-2 px-2.5 py-1 bg-st-electric text-white text-[10px] font-extrabold rounded-md shadow-glow flex items-center gap-1"
                        >
                          <PenTool className="w-3 h-3" />
                          <span>Anotar</span>
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
      )}

      {/* QR Code Modal */}
      {isQrModalOpen && selectedPet && (
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
      )}

      {/* Exam Canvas Annotator Modal */}
      {isExamAnnotatorOpen && selectedExamForAnnotate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
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
