'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckSquare, Square, Building2, User, FileText, Phone, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';
import { formatCPF, formatCNPJ, formatPhone } from '@/lib/utils';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [rememberEmail, setRememberEmail] = useState(false);

  // Registration States (Representante + Clínica)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');

  const [clinicName, setClinicName] = useState('');
  const [clinicCnpj, setClinicCnpj] = useState(''); // Opcional!
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicCity, setClinicCity] = useState('');
  const [clinicState, setClinicState] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('petia_saved_email');
    if (saved) {
      setEmail(saved);
      setRegEmail(saved);
      setRememberEmail(true);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rememberEmail && email) {
      localStorage.setItem('petia_saved_email', email);
    } else {
      localStorage.removeItem('petia_saved_email');
    }

    startTransition(() => {
      window.location.href = '/dashboard';
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName || !regEmail || !regPassword || !clinicName) {
      setError('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    // Save profile data for /perfil, /settings and /planos
    const userProfile = {
      name: regName,
      email: regEmail,
      cpf: regCpf,
      birth_date: regBirthDate,
      whatsapp: regWhatsapp,
      role: 'owner',
    };

    const clinicData = {
      name: clinicName,
      cnpj: clinicCnpj,
      address: clinicAddress,
      city: clinicCity,
      state: clinicState,
      plan: 'basico',
    };

    localStorage.setItem('petia_user_profile', JSON.stringify(userProfile));
    localStorage.setItem('petia_clinic_data', JSON.stringify(clinicData));

    startTransition(() => {
      window.location.href = '/planos?new_account=true';
    });
  };

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center px-4 py-8 bg-st-navy">
      {/* Decorative Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2B5BAA, transparent)' }}
        />
      </div>

      <div className="w-full max-w-lg animate-fade-up">
        {/* Brand Header com Logo SVG Ampliada e Nítida */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src="/icons/petshop-icon.svg"
              alt="Petia Logo"
              className="w-20 h-20 rounded-2xl shadow-glow object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Petia</h1>
          <p className="text-st-muted text-sm mt-1 font-medium">Gestão veterinária inteligente</p>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 mt-4 p-1 bg-st-surface/80 rounded-xl border border-st-border/60 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-st-electric text-white shadow-glow-sm'
                  : 'text-st-muted hover:text-st-arctic'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-st-electric text-white shadow-glow-sm'
                  : 'text-st-muted hover:text-st-arctic'
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Auth Form Card com Bordas KmZero */}
        <div className="card p-6 rounded-2xl border border-st-border shadow-2xl space-y-4">
          <h2 className="text-lg font-semibold text-st-arctic">
            {mode === 'login' ? 'Entrar na conta' : 'Criar conta da clínica'}
          </h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-sm text-red-400 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-st-muted mb-1.5 uppercase tracking-wide">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-st-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="vet@petia.com.br"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-medium text-st-muted uppercase tracking-wide">
                    Senha
                  </label>
                  <Link href="/esqueci-senha" className="text-xs text-st-electric hover:underline whitespace-nowrap">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-st-muted" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-st-muted hover:text-st-arctic transition-colors whitespace-nowrap shrink-0"
                    title={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label
                  onClick={() => setRememberEmail(!rememberEmail)}
                  className="flex items-center gap-2 cursor-pointer select-none text-xs text-st-muted hover:text-st-arctic transition-colors whitespace-nowrap"
                >
                  {rememberEmail ? (
                    <CheckSquare className="w-4 h-4 text-st-electric flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-st-muted flex-shrink-0" />
                  )}
                  <span>Salvar meu e-mail</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shrink-0 border-none"
                style={{
                  background: isPending ? '#2B5BAA' : 'linear-gradient(135deg, #2B5BAA, #3B82F6)',
                  boxShadow: isPending ? 'none' : '0 4px 15px rgba(59,130,246,0.3)',
                }}
              >
                {isPending ? 'Entrando no Petia...' : 'Entrar'}
              </button>
            </form>
          ) : (
            /* Register Form (Representante + Clínica com Visualização de Senha) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="text-[11px] font-bold uppercase text-st-electric border-b border-st-border/40 pb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Dados do Responsável</span>
              </div>

              <div>
                <label className="block text-st-muted mb-1 font-semibold">Nome Completo do Representante *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Lucas Mendes"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-st-muted mb-1 font-semibold">E-mail Corporativo *</label>
                  <input
                    type="email"
                    required
                    placeholder="lucas@clinica.com.br"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none"
                  />
                </div>
                <div>
                  <label className="block text-st-muted mb-1 font-semibold">Senha de Acesso *</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full p-2.5 pr-9 rounded-lg bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-st-muted hover:text-st-arctic transition-colors whitespace-nowrap shrink-0"
                      title={showRegPassword ? 'Ocultar senha' : 'Visualizar senha'}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-st-muted mb-1 font-semibold">CPF</label>
                  <input
                    type="text"
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={regCpf}
                    onChange={(e) => setRegCpf(formatCPF(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-st-muted mb-1 font-semibold">Data de Nasc.</label>
                  <input
                    type="date"
                    value={regBirthDate}
                    onChange={(e) => setRegBirthDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none"
                  />
                </div>
                <div>
                  <label className="block text-st-muted mb-1 font-semibold">WhatsApp</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="(11) 99123-4567"
                    value={regWhatsapp}
                    onChange={(e) => setRegWhatsapp(formatPhone(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none font-mono"
                  />
                </div>
              </div>

              <div className="text-[11px] font-bold uppercase text-st-electric border-b border-st-border/40 pb-1 pt-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Dados da Clínica Veterinária</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-st-muted mb-1 font-semibold">Nome da Clínica *</label>
                  <input
                    type="text"
                    required
                    placeholder="Clínica Veterinária Petia"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none"
                  />
                </div>
                <div>
                  <label className="block text-st-muted mb-1 font-semibold">CNPJ (Opcional)</label>
                  <input
                    type="text"
                    maxLength={18}
                    placeholder="00.000.000/0001-00 (Opcional)"
                    value={clinicCnpj}
                    onChange={(e) => setClinicCnpj(formatCNPJ(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-st-muted mb-1 font-semibold">Endereço Completo</label>
                  <input
                    type="text"
                    placeholder="Rua Harmonia, 450 - Vila Madalena"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none"
                  />
                </div>
                <div>
                  <label className="block text-st-muted mb-1 font-semibold">Cidade / UF</label>
                  <input
                    type="text"
                    placeholder="São Paulo - SP"
                    value={clinicCity}
                    onChange={(e) => setClinicCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-st-surface border border-st-border text-st-arctic focus:border-st-electric outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-all duration-200 mt-3 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 border-none"
                style={{
                  background: 'linear-gradient(135deg, #2B5BAA, #3B82F6)',
                  boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
                }}
              >
                <span>Criar Conta & Escolher Plano</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </form>
          )}

          <p className="text-center text-st-muted text-xs mt-4">
            Ainda não tem conta?{' '}
            <Link href="/dashboard" className="text-st-electric hover:text-st-ice transition-colors font-medium whitespace-nowrap">
              Acessar Demonstração
            </Link>
          </p>

          <div className="flex items-center justify-center gap-3 text-[11px] text-st-muted/80 mt-4 pt-3 border-t border-st-border/30">
            <Link href="/termos" className="hover:text-st-arctic transition-colors whitespace-nowrap">
              Termos de Uso
            </Link>
            <span>•</span>
            <Link href="/privacidade" className="hover:text-st-arctic transition-colors whitespace-nowrap">
              Política de Privacidade
            </Link>
          </div>
        </div>

        {/* Sólida Tech Developer Badge */}
        <SolidaTechBadge variant="auth" className="mt-6" />
      </div>
    </div>
  );
}
