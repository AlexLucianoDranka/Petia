'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Upload, FileText, Clock, MapPin, Phone, Mail, Save, CheckCircle2, Camera, ShieldCheck, HelpCircle } from 'lucide-react';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';
import { formatCNPJ, formatPhone } from '@/lib/utils';

export default function SettingsPage() {
  // Clinic Registration Info
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Address
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // PDF & Document Customization
  const [vetResponsible, setVetResponsible] = useState('');
  const [pdfHeader, setPdfHeader] = useState('PETIA • Gestão Veterinária & Atendimento Especializado');
  const [pdfFooter, setPdfFooter] = useState('Emita seus comprovantes e atestados diretamente pelo sistema Petia.');

  // Weekly Schedule
  const [schedule, setSchedule] = useState([
    { day: 'Segunda-feira', open: '08:00', close: '19:00', active: true },
    { day: 'Terça-feira', open: '08:00', close: '19:00', active: true },
    { day: 'Quarta-feira', open: '08:00', close: '19:00', active: true },
    { day: 'Quinta-feira', open: '08:00', close: '19:00', active: true },
    { day: 'Sexta-feira', open: '08:00', close: '19:00', active: true },
    { day: 'Sábado', open: '08:00', close: '14:00', active: true },
    { day: 'Domingo', open: '09:00', close: '12:00', active: false },
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedClinic = localStorage.getItem('petia_clinic_data');
    if (savedClinic) {
      try {
        const parsed = JSON.parse(savedClinic);
        if (parsed.name) setName(parsed.name);
        if (parsed.cnpj) setCnpj(formatCNPJ(parsed.cnpj));
        if (parsed.address) setAddress(parsed.address);
        if (parsed.city) setCity(parsed.city);
        if (parsed.state) setState(parsed.state);
        if (parsed.logo) setLogoPreview(parsed.logo);
      } catch (e) {}
    }
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoPreview(result);
        const savedClinic = JSON.parse(localStorage.getItem('petia_clinic_data') || '{}');
        savedClinic.logo = result;
        localStorage.setItem('petia_clinic_data', JSON.stringify(savedClinic));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const clinicData = {
      name,
      cnpj,
      phone,
      email,
      address,
      district,
      city,
      state,
      zipCode,
      vetResponsible,
      pdfHeader,
      pdfFooter,
      logo: logoPreview,
      schedule,
    };
    localStorage.setItem('petia_clinic_data', JSON.stringify(clinicData));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleDay = (idx: number) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, active: !item.active } : item))
    );
  };

  return (
    <div className="space-y-6 animate-fade-up w-full max-w-5xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="card p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-st-electric" />
            <span>Configurações Gerais da Clínica</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">
            Personalize logo da clínica, cabeçalho de PDFs/receitas, dados de contato e horário de atendimento semanal
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-5 py-2.5 bg-st-electric hover:bg-st-steel text-white font-extrabold text-xs rounded-xl shadow-glow transition-all whitespace-nowrap shrink-0 border-none"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>Salvar Configurações</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-st-success/15 border border-st-success/30 text-st-success text-xs font-semibold flex items-center gap-2 animate-fade-in whitespace-nowrap">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configurações da clínica salvas com sucesso! Os novos dados já estão ativos nos relatórios e PDFs.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Logo & Identidade Visual */}
        <div className="card p-6 rounded-2xl space-y-4 border border-st-border">
          <h3 className="font-bold text-st-arctic text-base border-b border-st-border/40 pb-3 flex items-center gap-2">
            <Upload className="w-5 h-5 text-st-electric" /> Logo da Clínica (Documentos & PDFs)
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <label htmlFor="clinic_logo_input" className="cursor-pointer group relative">
              <div className="w-32 h-20 rounded-xl overflow-hidden bg-st-surface border-2 border-dashed border-st-border group-hover:border-st-electric transition-colors flex items-center justify-center relative">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo da Clínica" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center p-2">
                    <Camera className="w-6 h-6 text-st-muted mx-auto group-hover:text-st-electric" />
                    <span className="text-[10px] text-st-muted block mt-1">Carregar Logo</span>
                  </div>
                )}
              </div>
              <input id="clinic_logo_input" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>

            <div className="text-xs text-st-muted space-y-1">
              <p className="font-bold text-st-arctic">Formatos aceitos: PNG, SVG ou JPG (Fundo transparente recomendado)</p>
              <p>Esta logo será exibida automaticamente no topo de receitas, atestados, prontuários e faturas impressas.</p>
            </div>
          </div>
        </div>

        {/* 2. Dados Cadastrais & Endereço */}
        <div className="card p-6 rounded-2xl space-y-4 border border-st-border">
          <h3 className="font-bold text-st-arctic text-base border-b border-st-border/40 pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-st-electric" /> Dados Cadastrais & Endereço
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-st-muted mb-1">Nome Fantasia / Razão Social *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
              />
            </div>
            <div>
              <label className="block font-semibold text-st-muted mb-1">CNPJ (Opcional)</label>
              <input
                type="text"
                maxLength={18}
                placeholder="00.000.000/0001-00 (Opcional)"
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-st-muted mb-1">Telefone Principal</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-st-muted mb-1">E-mail da Clínica</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-st-muted mb-1">Logradouro / Endereço</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
              />
            </div>
            <div>
              <label className="block font-semibold text-st-muted mb-1">Bairro</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-st-muted mb-1">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
              />
            </div>
            <div>
              <label className="block font-semibold text-st-muted mb-1">Estado (UF)</label>
              <input
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-st-muted mb-1">CEP</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. Personalização de PDFs & Receituários */}
        <div className="card p-6 rounded-2xl space-y-4 border border-st-border">
          <h3 className="font-bold text-st-arctic text-base border-b border-st-border/40 pb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-st-electric" /> Personalização de PDFs, Receituários & Atestados
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-st-muted mb-1">Veterinário Responsável Técnico (CRMV)</label>
              <input
                type="text"
                value={vetResponsible}
                onChange={(e) => setVetResponsible(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
              />
            </div>

            <div>
              <label className="block font-semibold text-st-muted mb-1">Cabeçalho Padrão dos Documentos</label>
              <input
                type="text"
                value={pdfHeader}
                onChange={(e) => setPdfHeader(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
              />
            </div>

            <div>
              <label className="block font-semibold text-st-muted mb-1">Rodapé Padrão dos Receituários & Laudos</label>
              <textarea
                rows={2}
                value={pdfFooter}
                onChange={(e) => setPdfFooter(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
              />
            </div>
          </div>
        </div>

        {/* 4. Horário de Funcionamento Semanal */}
        <div className="card p-6 rounded-2xl space-y-4 border border-st-border">
          <h3 className="font-bold text-st-arctic text-base border-b border-st-border/40 pb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-st-electric" /> Grade de Horários de Atendimento
          </h3>

          <div className="space-y-2 text-xs">
            {schedule.map((item, idx) => (
              <div
                key={item.day}
                className="flex items-center justify-between p-3 rounded-xl bg-st-surface border border-st-border/60 gap-4"
              >
                <div className="flex items-center gap-3 w-40">
                  <input
                    type="checkbox"
                    checked={item.active}
                    onChange={() => toggleDay(idx)}
                    className="w-4 h-4 rounded text-st-electric focus:ring-0 cursor-pointer"
                  />
                  <span className={`font-bold ${item.active ? 'text-st-arctic' : 'text-st-muted/50'}`}>{item.day}</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    disabled={!item.active}
                    value={item.open}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSchedule((prev) => prev.map((s, i) => (i === idx ? { ...s, open: val } : s)));
                    }}
                    className="p-1.5 rounded-lg bg-st-navy border border-st-border text-st-arctic font-mono disabled:opacity-40"
                  />
                  <span className="text-st-muted">às</span>
                  <input
                    type="time"
                    disabled={!item.active}
                    value={item.close}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSchedule((prev) => prev.map((s, i) => (i === idx ? { ...s, close: val } : s)));
                    }}
                    className="p-1.5 rounded-lg bg-st-navy border border-st-border text-st-arctic font-mono disabled:opacity-40"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-st-electric hover:bg-st-steel text-white font-extrabold text-xs rounded-xl shadow-glow transition-all whitespace-nowrap shrink-0 border-none"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
}
