'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  Camera,
  KeyRound,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Phone,
  CreditCard,
  Calendar,
  Building2,
  Globe,
  LifeBuoy,
  Info,
  Mail,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Download,
  CheckCircle2,
  Crown,
  Bell,
  Save,
} from 'lucide-react';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';
import { formatCPF, formatPhone } from '@/lib/utils';
import { PLANS, PlanType } from '@/lib/plans';

export default function PerfilPage() {
  // Representative Profile State
  const [name, setName] = useState('Dr. Lucas Mendes');
  const [email, setEmail] = useState('lucas@petia.com.br');
  const [cpf, setCpf] = useState('384.921.048-29');
  const [birthDate, setBirthDate] = useState('1988-06-14');
  const [whatsapp, setWhatsapp] = useState('(11) 99123-4567');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Clinic & Plan State
  const [clinicName, setClinicName] = useState('Clínica Veterinária Petia');
  const [planType, setPlanType] = useState<PlanType>('ouro');

  // Security Accordion
  const [activeSecuritySection, setActiveSecuritySection] = useState<'none' | 'email' | 'password'>('none');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Email Notifications Preferences (Resend Ready)
  const [notifAppointments, setNotifAppointments] = useState(true);
  const [notifVaccines, setNotifVaccines] = useState(true);
  const [notifDailySummary, setNotifDailySummary] = useState(false);
  const [notifSolidaTech, setNotifSolidaTech] = useState(true);

  // Account Deletion Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('petia_user_profile');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.name) setName(parsedUser.name);
        if (parsedUser.email) setEmail(parsedUser.email);
        if (parsedUser.cpf) setCpf(formatCPF(parsedUser.cpf));
        if (parsedUser.birth_date) setBirthDate(parsedUser.birth_date);
        if (parsedUser.whatsapp) setWhatsapp(formatPhone(parsedUser.whatsapp));
        if (parsedUser.avatar) setAvatarPreview(parsedUser.avatar);
      } catch (e) {}
    }

    const savedClinic = localStorage.getItem('petia_clinic_data');
    if (savedClinic) {
      try {
        const parsedClinic = JSON.parse(savedClinic);
        if (parsedClinic.name) setClinicName(parsedClinic.name);
        if (parsedClinic.plan) setPlanType(parsedClinic.plan as PlanType);
      } catch (e) {}
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Avatar Upload Handler with Base64 Compression
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setAvatarPreview(compressedBase64);

          const savedUser = JSON.parse(localStorage.getItem('petia_user_profile') || '{}');
          savedUser.avatar = compressedBase64;
          localStorage.setItem('petia_user_profile', JSON.stringify(savedUser));
          triggerToast('Foto de perfil atualizada com sucesso!');
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    const savedUser = JSON.parse(localStorage.getItem('petia_user_profile') || '{}');
    delete savedUser.avatar;
    localStorage.setItem('petia_user_profile', JSON.stringify(savedUser));
    triggerToast('Foto de perfil removida.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const userProfile = { name, email, cpf, birth_date: birthDate, whatsapp, avatar: avatarPreview, role: 'owner' };
    localStorage.setItem('petia_user_profile', JSON.stringify(userProfile));
    triggerToast('Informações pessoais atualizadas!');
  };

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setEmail(newEmail);
    const userProfile = JSON.parse(localStorage.getItem('petia_user_profile') || '{}');
    userProfile.email = newEmail;
    localStorage.setItem('petia_user_profile', JSON.stringify(userProfile));
    setNewEmail('');
    setActiveSecuritySection('none');
    triggerToast('Solicitação de troca de e-mail efetuada com sucesso!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('A nova senha e a confirmação não coincidem.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setActiveSecuritySection('none');
    triggerToast('Senha alterada com sucesso!');
  };

  const handleExportData = () => {
    const exportObject = {
      representative: { name, email, cpf, birthDate, whatsapp },
      clinic: { clinicName, planType },
      notificationPreferences: { notifAppointments, notifVaccines, notifDailySummary, notifSolidaTech },
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petia_dados_pessoais_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Download dos seus dados iniciado!');
  };

  const currentPlan = PLANS[planType] || PLANS['ouro'];

  return (
    <div className="px-4 pt-6 pb-12 max-w-3xl mx-auto space-y-6 animate-fade-up">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight">Meu Perfil</h1>
        <p className="text-st-muted text-sm mt-0.5">
          Gerencie seus dados pessoais, assinatura, foto, segurança da conta e preferências de notificação
        </p>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-st-success/15 border border-st-success/30 text-st-success text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Formulário de Informações Pessoais e Foto de Perfil */}
      <div className="card p-6 rounded-2xl space-y-5 border border-st-border">
        <h2 className="text-lg font-bold text-st-arctic flex items-center gap-2 border-b border-st-border/40 pb-3">
          <User className="w-5 h-5 text-st-electric" /> Informações Pessoais & Foto
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Upload Foto de Perfil */}
          <div className="flex flex-col items-center gap-3 pb-4 border-b border-st-border/40">
            <label htmlFor="avatar_file" className="cursor-pointer group relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-st-surface border-2 border-dashed border-st-border group-hover:border-st-electric transition-colors flex items-center justify-center relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-st-muted group-hover:text-st-electric" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input id="avatar_file" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>

            {avatarPreview ? (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remover Foto
              </button>
            ) : (
              <p className="text-xs text-st-muted">Toque para alterar sua foto de perfil</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-st-muted mb-1">Nome completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
              />
            </div>
            <div>
              <label className="block font-semibold text-st-muted mb-1">E-mail de Acesso</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full p-3 rounded-xl bg-st-surface/50 border border-st-border/50 text-st-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-st-muted mb-1">CPF</label>
              <input
                type="text"
                maxLength={14}
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-st-muted mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
              />
            </div>
            <div>
              <label className="block font-semibold text-st-muted mb-1">WhatsApp / Celular</label>
              <input
                type="text"
                maxLength={15}
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-st-electric hover:bg-st-steel text-white font-extrabold text-xs rounded-xl shadow-glow transition-all whitespace-nowrap border-none"
            >
              <Save className="w-4 h-4" /> Save Alterações
            </button>
          </div>
        </form>
      </div>

      {/* 2. Card do Plano Ativo & Assinatura */}
      <div className="card p-6 rounded-2xl space-y-4 border border-st-border bg-st-surface/40">
        <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
          <h2 className="text-lg font-bold text-st-arctic flex items-center gap-2">
            <Crown className="w-5 h-5 text-st-electric" /> Plano & Assinatura Ativa
          </h2>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-success/20 text-st-success border border-st-success/30 whitespace-nowrap">
            Ativo no Stripe
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-xl text-st-arctic">{currentPlan.name}</h3>
            <p className="text-xs text-st-muted mt-0.5">{currentPlan.description}</p>
            <span className="text-xs text-st-electric font-bold block mt-1">
              R$ {currentPlan.priceMonthly.toFixed(2)} / mês
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/planos"
              className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-extrabold text-xs shadow-glow transition-all whitespace-nowrap"
            >
              Fazer Upgrade / Trocar Plano
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Card de Segurança da Conta (Trocar E-mail & Senha) */}
      <div className="card p-6 rounded-2xl space-y-4 border border-st-border">
        <h2 className="text-lg font-bold text-st-arctic flex items-center gap-2 border-b border-st-border/40 pb-3">
          <Shield className="w-5 h-5 text-st-electric" /> Segurança da Conta
        </h2>

        {/* Accordion Buttons */}
        <div className="space-y-3">
          {/* Trocar E-mail */}
          <div className="border border-st-border/60 rounded-xl overflow-hidden bg-st-surface">
            <button
              type="button"
              onClick={() => setActiveSecuritySection(activeSecuritySection === 'email' ? 'none' : 'email')}
              className="w-full p-4 flex items-center justify-between text-xs font-bold text-st-arctic hover:bg-st-surface-2 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-st-electric" /> Alterar E-mail de Acesso
              </span>
              {activeSecuritySection === 'email' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeSecuritySection === 'email' && (
              <form onSubmit={handleUpdateEmail} className="p-4 pt-0 space-y-3 text-xs border-t border-st-border/40">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Novo E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="novoemail@petia.com.br"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-st-navy border border-st-border text-st-arctic"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-st-electric text-white font-bold rounded-xl text-xs shadow-glow whitespace-nowrap"
                  >
                    Confirmar Novo E-mail
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Trocar Senha */}
          <div className="border border-st-border/60 rounded-xl overflow-hidden bg-st-surface">
            <button
              type="button"
              onClick={() => setActiveSecuritySection(activeSecuritySection === 'password' ? 'none' : 'password')}
              className="w-full p-4 flex items-center justify-between text-xs font-bold text-st-arctic hover:bg-st-surface-2 transition-colors"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-st-electric" /> Alterar Senha de Acesso
              </span>
              {activeSecuritySection === 'password' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeSecuritySection === 'password' && (
              <form onSubmit={handleUpdatePassword} className="p-4 pt-0 space-y-3 text-xs border-t border-st-border/40">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Senha Atual</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-st-navy border border-st-border text-st-arctic"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Nova Senha</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-st-navy border border-st-border text-st-arctic"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-st-navy border border-st-border text-st-arctic"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-st-electric text-white font-bold rounded-xl text-xs shadow-glow whitespace-nowrap"
                  >
                    Atualizar Senha
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 4. Notificações por E-mail (Resend Ready) */}
      <div className="card p-6 rounded-2xl space-y-4 border border-st-border">
        <h2 className="text-lg font-bold text-st-arctic flex items-center gap-2 border-b border-st-border/40 pb-3">
          <Bell className="w-5 h-5 text-st-electric" /> Notificações por E-mail (Resend API)
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-st-surface border border-st-border/60 cursor-pointer">
            <div>
              <span className="font-bold text-st-arctic block">Alertas de Agendamentos e Cancelamentos</span>
              <span className="text-st-muted text-[11px]">Receba e-mail quando um tutor agendar ou cancelar um atendimento</span>
            </div>
            <input
              type="checkbox"
              checked={notifAppointments}
              onChange={() => setNotifAppointments(!notifAppointments)}
              className="w-4 h-4 rounded text-st-electric focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-st-surface border border-st-border/60 cursor-pointer">
            <div>
              <span className="font-bold text-st-arctic block">Lembretes de Vacinas & Vermífugos</span>
              <span className="text-st-muted text-[11px]">Relatório diário de pets com vacinas prestes a vencer</span>
            </div>
            <input
              type="checkbox"
              checked={notifVaccines}
              onChange={() => setNotifVaccines(!notifVaccines)}
              className="w-4 h-4 rounded text-st-electric focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-st-surface border border-st-border/60 cursor-pointer">
            <div>
              <span className="font-bold text-st-arctic block">Resumo Financeiro Diário do Caixa</span>
              <span className="text-st-muted text-[11px]">E-mail de fechamento diário com total faturado no dia</span>
            </div>
            <input
              type="checkbox"
              checked={notifDailySummary}
              onChange={() => setNotifDailySummary(!notifDailySummary)}
              className="w-4 h-4 rounded text-st-electric focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-st-surface border border-st-border/60 cursor-pointer">
            <div>
              <span className="font-bold text-st-arctic block">Notificações e Atualizações da Sólida Tech</span>
              <span className="text-st-muted text-[11px]">Comunicados de novas funcionalidades e melhorias no Petia</span>
            </div>
            <input
              type="checkbox"
              checked={notifSolidaTech}
              onChange={() => setNotifSolidaTech(!notifSolidaTech)}
              className="w-4 h-4 rounded text-st-electric focus:ring-0 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 5. LGPD Export & Zona de Risco */}
      <div className="card p-6 rounded-2xl space-y-4 border border-st-border">
        <h2 className="text-lg font-bold text-st-arctic flex items-center gap-2 border-b border-st-border/40 pb-3">
          <Download className="w-5 h-5 text-st-electric" /> Privacidade & Dados LGPD
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-st-arctic block">Exportação de Dados Pessoais</span>
            <span className="text-st-muted text-[11px]">Baixe uma cópia completa dos seus dados cadastrais em formato JSON</span>
          </div>
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 bg-st-surface hover:bg-st-surface-2 text-st-arctic border border-st-border font-bold rounded-xl whitespace-nowrap shrink-0"
          >
            Baixar Arquivo JSON
          </button>
        </div>

        <div className="pt-4 border-t border-st-border/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-red-400 block">Excluir Conta / Workspace</span>
              <span className="text-st-muted text-[11px]">Esta ação apagará permanentemente seu cadastro e histórico da clínica</span>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl whitespace-nowrap shrink-0"
            >
              Excluir Minha Conta
            </button>
          </div>
        </div>
      </div>

      {/* Info do Sistema & Sólida Tech */}
      <div className="card p-6 rounded-2xl space-y-2 border border-st-border text-center">
        <p className="text-xs font-bold text-st-arctic">Petia • Gestão Veterinária v1.4.2</p>
        <p className="text-[11px] text-st-muted">Desenvolvido com excelência por Sólida Tech © 2026</p>
        <div className="pt-2">
          <SolidaTechBadge variant="auth" />
        </div>
      </div>

      {/* Modal Confirm Account Deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card rounded-2xl max-w-md w-full p-6 space-y-4 border border-red-500/40">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
              <h3 className="font-bold text-red-400 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" /> Confirmar Exclusão de Conta
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-st-muted hover:text-st-arctic">
                ✕
              </button>
            </div>

            <p className="text-xs text-st-muted leading-relaxed">
              Para confirmar a exclusão permanente da sua conta e de todos os dados cadastrais da clínica, digite{' '}
              <strong className="text-red-400 font-mono font-bold">EXCLUIR</strong> no campo abaixo:
            </p>

            <input
              type="text"
              placeholder="Digite EXCLUIR"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-mono text-xs uppercase"
            />

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-st-border text-st-muted font-bold whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                disabled={deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR'}
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-40 whitespace-nowrap"
              >
                Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
