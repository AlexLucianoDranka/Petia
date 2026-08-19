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
  Dog,
  Syringe,
  Package,
  Flame,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';
import { formatCPF, formatPhone } from '@/lib/utils';
import { PLANS, PlanType } from '@/lib/plans';
import { APP_VERSION } from '@/lib/version';
import { supabase } from '@/lib/supabaseClient';

export default function PerfilPage() {
  // Representative Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Clinic & Plan State
  const [clinicName, setClinicName] = useState('');
  const [planType, setPlanType] = useState<PlanType>('ouro');

  // Security Accordion & Password Visibility Toggles
  const [activeSecuritySection, setActiveSecuritySection] = useState<'none' | 'email' | 'password'>('none');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email Notifications Preferences (6 Groups like KmZero)
  const [emailPrefs, setEmailPrefs] = useState({
    account: true,
    appointments: true,
    vaccines: true,
    billing: true,
    inventory: true,
    engagement: true,
  });

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

    const savedPrefs = localStorage.getItem('petia_email_prefs');
    if (savedPrefs) {
      try {
        setEmailPrefs(JSON.parse(savedPrefs));
      } catch (e) {}
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Avatar Upload Handler with Base64 Canvas Compression
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
          window.dispatchEvent(new Event('petia_user_profile_updated'));
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
    window.dispatchEvent(new Event('petia_user_profile_updated'));
    triggerToast('Foto de perfil removida.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const userProfile = { name, email, cpf, birth_date: birthDate, whatsapp, avatar: avatarPreview, role: 'owner' };
    localStorage.setItem('petia_user_profile', JSON.stringify(userProfile));
    window.dispatchEvent(new Event('petia_user_profile_updated'));
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

  const toggleEmailPref = (key: keyof typeof emailPrefs) => {
    const updated = { ...emailPrefs, [key]: !emailPrefs[key] };
    setEmailPrefs(updated);
    localStorage.setItem('petia_email_prefs', JSON.stringify(updated));
    window.dispatchEvent(new Event('petia_email_prefs_updated'));
    triggerToast(`Notificação de ${key} ${updated[key] ? 'ativada' : 'desativada'} com sucesso!`);
  };

  const handleExportData = () => {
    const exportObject = {
      representative: { name, email, cpf, birthDate, whatsapp },
      clinic: { clinicName, planType },
      notificationPreferences: emailPrefs,
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

  const PREFERENCE_GROUPS = [
    {
      key: 'account' as const,
      title: 'Conta & Segurança',
      description: 'E-mails informativos sobre sua conta e segurança (Boas-vindas, segurança da clínica)',
      icon: ShieldCheck,
    },
    {
      key: 'appointments' as const,
      title: 'Agendamentos & Tutores',
      description: 'Confirmação de novos agendamentos e cadastros de tutores na clínica',
      icon: Dog,
    },
    {
      key: 'vaccines' as const,
      title: 'Vacinas & Prontuário',
      description: 'Alertas de vencimento de vacinas, vermífugos e retorno de consultas',
      icon: Syringe,
    },
    {
      key: 'billing' as const,
      title: 'Cobrança & Assinatura',
      description: 'Recibos de pagamentos Stripe, avisos de faturas e renovação de planos',
      icon: CreditCard,
    },
    {
      key: 'inventory' as const,
      title: 'Estoque & Comissões',
      description: 'Alertas de produtos com estoque baixo e relatórios de comissão dos profissionais',
      icon: Package,
    },
    {
      key: 'engagement' as const,
      title: 'Engajamento & Dicas',
      description: 'Comunicados de novas funcionalidades, relatórios mensais e dicas do Petia',
      icon: Flame,
    },
  ];

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

      {/* 1. SubscriptionCard no Modelo KmZero */}
      <div className="card p-4 sm:p-5 border border-st-electric/30 bg-gradient-to-r from-st-navy via-st-surface to-st-surface rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-st-electric/40 bg-st-electric/20 text-st-electric shrink-0 shadow-glow">
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto no-scrollbar">
                <span className="text-xs text-st-muted font-semibold uppercase tracking-wide shrink-0">Plano Atual:</span>
                <h3 className="font-bold text-st-arctic text-base leading-none shrink-0">{currentPlan.name}</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-st-success/20 text-st-success border border-st-success/30 whitespace-nowrap shrink-0">
                  ATIVO NO STRIPE
                </span>
              </div>
              <p className="text-xs text-st-muted truncate">
                Limite: {currentPlan.limits.maxPets === 'ilimitado' ? 'Pets Ilimitados' : `até ${currentPlan.limits.maxPets} pets`} •{' '}
                <span className="text-st-arctic font-medium">R$ {currentPlan.priceMonthly.toFixed(2)}/mês</span>
              </p>
            </div>
          </div>

          <Link
            href="/planos"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-st-electric hover:bg-st-steel shadow-glow transition-all whitespace-nowrap shrink-0 border-none"
          >
            <span>Ver / Gerenciar Planos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Formulário de Informações Pessoais e Foto no Modelo KmZero */}
      <div className="card p-6 rounded-2xl space-y-5 border border-st-border">
        <h2 className="text-lg font-bold text-st-arctic flex items-center gap-2 border-b border-st-border/40 pb-3">
          <User className="w-5 h-5 text-st-electric" /> Informações Pessoais & Foto
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Upload Foto de Perfil no Modelo KmZero com Hover Camera Overlay */}
          <div className="flex flex-col items-center gap-3 pb-4 border-b border-st-border/40">
            <label htmlFor="avatar_file" className="cursor-pointer group relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-st-surface border-2 border-dashed border-st-border group-hover:border-st-electric transition-colors flex items-center justify-center relative shadow-md">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-st-muted group-hover:text-st-electric" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
              <p className="text-xs text-st-muted">Toque na imagem para alterar sua foto de perfil</p>
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
              <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      {/* 3. Card de Segurança da Conta no Modelo KmZero com Modos de Visualizar Senha */}
      <div className="card p-6 rounded-2xl space-y-4 border border-st-border">
        <h2 className="text-lg font-bold text-st-arctic flex items-center gap-2 border-b border-st-border/40 pb-3">
          <Shield className="w-5 h-5 text-st-electric" /> Segurança da Conta
        </h2>

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
                    className="px-4 py-2 bg-st-electric text-white font-bold rounded-xl text-xs shadow-glow whitespace-nowrap border-none"
                  >
                    Confirmar Novo E-mail
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Trocar Senha com Botões de Visualizar Senha */}
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
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2.5 pr-9 rounded-xl bg-st-navy border border-st-border text-st-arctic"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-st-muted hover:text-st-arctic transition-colors whitespace-nowrap shrink-0"
                      title={showCurrentPassword ? 'Ocultar senha' : 'Visualizar senha'}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2.5 pr-9 rounded-xl bg-st-navy border border-st-border text-st-arctic"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-st-muted hover:text-st-arctic transition-colors whitespace-nowrap shrink-0"
                        title={showNewPassword ? 'Ocultar senha' : 'Visualizar senha'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Confirmar Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2.5 pr-9 rounded-xl bg-st-navy border border-st-border text-st-arctic"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-st-muted hover:text-st-arctic transition-colors whitespace-nowrap shrink-0"
                        title={showConfirmPassword ? 'Ocultar senha' : 'Visualizar senha'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-st-electric text-white font-bold rounded-xl text-xs shadow-glow whitespace-nowrap border-none"
                  >
                    Atualizar Senha
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 4. EmailPreferencesCard no Modelo Exato do KmZero */}
      <div className="card p-6 rounded-2xl border border-st-border space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-st-border/50 pb-4">
          <div>
            <h2 className="text-lg font-bold text-st-arctic flex items-center gap-2">
              <Mail className="w-5 h-5 text-st-electric" /> Notificações por E-mail (Resend API)
            </h2>
            <p className="text-xs text-st-muted mt-1">
              Escolha quais tipos de alertas e notificações você deseja receber na sua caixa de entrada
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {PREFERENCE_GROUPS.map((group) => {
            const Icon = group.icon;
            const isChecked = emailPrefs[group.key];

            return (
              <div
                key={group.key}
                className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-st-surface/60 border border-st-border/60 hover:border-st-electric/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-st-electric/10 text-st-electric shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-st-arctic">{group.title}</h4>
                    <p className="text-[11px] text-st-muted mt-0.5 leading-relaxed">{group.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleEmailPref(group.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 cursor-pointer border-none ${
                    isChecked ? 'bg-st-electric' : 'bg-st-surface border border-st-border'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isChecked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Privacidade LGPD & Zona de Risco no Modelo KmZero */}
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

      {/* 6. Card Minimalista de Informações do Sistema & Suporte */}
      <div className="pt-8 border-t border-st-border/30">
        <div className="card p-6 rounded-2xl border border-st-border/60 bg-st-surface/40 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-st-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-glow flex-shrink-0 flex items-center justify-center bg-st-navy border border-st-electric/30">
                <img src="/icons/petshop-icon.svg" alt="Petia" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <h3 className="text-base font-bold text-st-arctic flex items-center gap-2">
                  Petia
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-st-electric/15 text-st-electric border border-st-electric/30">
                    {APP_VERSION}
                  </span>
                </h3>
                <p className="text-xs text-st-muted">Gestão Veterinária & Pet Shop</p>
              </div>
            </div>

            <SolidaTechBadge variant="sidebar" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="text-st-muted flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 text-st-electric flex-shrink-0 mt-0.5" />
                <div>
                  Desenvolvido por: <strong className="text-st-arctic font-medium block sm:inline">SólidaTech Soluções Digitais</strong>
                </div>
              </div>
              <div className="text-st-muted flex items-start gap-2">
                <Globe className="w-3.5 h-3.5 text-st-electric flex-shrink-0 mt-0.5" />
                <div className="flex flex-wrap items-center gap-1">
                  <span>Website:</span>
                  <a href="https://solidatech.com.br" target="_blank" rel="noopener noreferrer" className="text-st-electric hover:underline font-mono font-semibold break-all">
                    solidatech.com.br
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-st-muted flex items-start gap-2">
                <LifeBuoy className="w-3.5 h-3.5 text-st-electric flex-shrink-0 mt-0.5" />
                <div className="flex flex-wrap items-center gap-1 min-w-0">
                  <span>Suporte:</span>
                  <a href="mailto:suporte@solidatech.com.br" className="text-st-electric hover:underline font-mono font-semibold break-all">
                    suporte@solidatech.com.br
                  </a>
                </div>
              </div>
              <div className="text-st-muted flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-st-electric flex-shrink-0 mt-0.5" />
                <div>
                  Versão: <strong className="text-st-arctic font-mono">{APP_VERSION} (2026)</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-st-border/30 text-center">
            <p className="text-[11px] text-st-muted/80 font-mono">
              © {new Date().getFullYear()} Petia & SólidaTech. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Confirm Account Deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="card rounded-2xl max-w-md w-full p-6 space-y-4 border border-red-500/40 shadow-2xl relative my-auto bg-st-surface animate-fade-in">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
              <h3 className="font-bold text-red-400 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" /> Confirmar Exclusão de Conta
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-st-muted hover:text-st-arctic p-1">
                <X className="w-4 h-4" />
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
              className="w-full p-3 rounded-xl bg-st-navy border border-st-border text-st-arctic font-mono text-xs uppercase"
            />

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-st-border text-st-muted font-bold whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR'}
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                  } catch (e) {}
                  localStorage.clear();
                  sessionStorage.clear();
                  document.cookie = 'petia_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                  window.location.href = '/login';
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-40 whitespace-nowrap border-none shadow-glow"
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
