'use client';

import { useState, useEffect } from 'react';
import { Mail, ArrowRight, Dog, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function TutorLoginPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'pin'>('email');
  const [contact, setContact] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState('');
  const [clinicLogo, setClinicLogo] = useState<string | null>(null);
  const [isInvalidClinic, setIsInvalidClinic] = useState(false);

  useEffect(() => {
    async function loadClinic() {
      // Find the clinic by slug to show its name/logo
      const { data: clinic, error } = await supabase
        .from('clinics')
        .select('name, logo_url, plan, subscription_status, trial_ends_at')
        .eq('slug', params.slug)
        .single();

      if (error || !clinic) {
        setIsInvalidClinic(true);
        return;
      }

      // Check Plan Gate (Ouro, Platina, Diamond, or Trial)
      // Normally we would check this securely on the server, but for now we just check the fetched data
      const isTrial = clinic.subscription_status === 'trial' || (new Date(clinic.trial_ends_at) > new Date());
      const hasAccess = isTrial || ['ouro', 'platina', 'diamond'].includes(clinic.plan || '');
      
      if (!hasAccess) {
        setIsInvalidClinic(true); // Treat as invalid/blocked
        return;
      }

      setClinicName(clinic.name);
      setClinicLogo(clinic.logo_url);
    }
    loadClinic();
  }, [params.slug]);

  const handleSendPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tutor/auth/send-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, clinicSlug: params.slug }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Erro ao enviar código.');
        setIsLoading(false);
        return;
      }

      setStep('pin');
      setIsLoading(false);
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join('');
    if (fullPin.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tutor/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, pin: fullPin, clinicSlug: params.slug }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Código inválido.');
        setIsLoading(false);
        return;
      }

      // Success, redirect to dashboard
      router.push(`/t/${params.slug}/dashboard`);
      
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^[0-9]*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  if (isInvalidClinic) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center p-4 bg-st-navy">
        <div className="card max-w-sm w-full p-8 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-bold text-st-arctic text-xl">Portal Indisponível</h2>
          <p className="text-st-muted text-sm">
            O Portal do Tutor não está disponível para esta clínica no momento. Entre em contato com o estabelecimento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-st-navy">
      {/* Dynamic Background matching Petia aesthetic */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-10 bg-st-electric blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-10 bg-st-arctic blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 animate-fade-in">
        {/* Clinic Branding */}
        <div className="mb-8 text-center space-y-3">
          {clinicLogo ? (
            <img src={clinicLogo} alt={clinicName} className="w-20 h-20 rounded-2xl mx-auto shadow-glow object-cover bg-white" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-st-surface border border-st-border flex items-center justify-center mx-auto shadow-glow">
              <Dog className="w-10 h-10 text-st-electric" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-st-arctic">{clinicName || 'Carregando...'}</h1>
            <p className="text-st-muted text-sm">Portal do Tutor</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-st-border shadow-2xl relative overflow-hidden">
          
          {error && (
            <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendPin} className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-st-arctic">Acesse seus pets</h2>
                <p className="text-sm text-st-muted">
                  Digite o seu <strong>E-mail</strong> ou <strong>WhatsApp</strong> cadastrado na clínica para receber seu código de acesso. Sem senhas!
                </p>
              </div>

              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-st-muted" />
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Seu E-mail ou WhatsApp"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-base bg-st-surface/50 border border-st-border text-st-arctic focus:border-st-electric outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !contact.trim() || !clinicName}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
                style={{ background: 'linear-gradient(135deg, #2B5BAA, #3B82F6)' }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Receber Código</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyPin} className="space-y-6 animate-fade-in">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-st-arctic">Código Enviado</h2>
                <p className="text-sm text-st-muted">
                  Enviamos um código de 6 dígitos para o seu contato. Digite-o abaixo para acessar.
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 sm:gap-3 py-4">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    id={`pin-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 sm:w-12 h-12 sm:h-14 rounded-xl text-center text-xl font-bold bg-st-surface/50 border border-st-border text-st-arctic focus:border-st-electric outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || pin.join('').length !== 6}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-glow"
                style={{ background: 'linear-gradient(135deg, #2B5BAA, #3B82F6)' }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Portal</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full py-2 text-sm text-st-muted hover:text-st-arctic font-medium transition-colors"
              >
                Tentar outro contato
              </button>
            </form>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-xs text-st-muted font-medium">
          Tecnologia desenvolvida por <span className="font-bold text-st-arctic">Sólida Tech</span>
        </div>
      </div>
    </div>
  );
}
