'use client';

import { useState, useEffect } from 'react';
import { Share2, Link as LinkIcon, QrCode, Smartphone, Copy, Check, Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useCurrentPlan } from '@/hooks/useCurrentPlan';

export default function TutorSettingsPage() {
  const [clinicSlug, setClinicSlug] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [tempSlug, setTempSlug] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { planType, isTrial, isLoading: isPlanLoading } = useCurrentPlan();
  
  // Apenas Ouro, Platina, Diamond ou Trial têm acesso
  const hasAccess = isTrial || ['ouro', 'platina', 'diamond'].includes(planType);

  useEffect(() => {
    async function loadClinic() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data: userRecord } = await supabase
        .from('users')
        .select('clinic_id')
        .eq('auth_id', userData.user.id)
        .single();

      if (userRecord?.clinic_id) {
        setClinicId(userRecord.clinic_id);
        const { data: clinicRecord } = await supabase
          .from('clinics')
          .select('slug')
          .eq('id', userRecord.clinic_id)
          .single();

        if (clinicRecord) {
          setClinicSlug(clinicRecord.slug);
          setTempSlug(clinicRecord.slug);
        }
      }
      setIsLoading(false);
    }
    
    loadClinic();
  }, []);

  const portalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/t/${clinicSlug}`
    : `https://petia.com.br/t/${clinicSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveSlug = async () => {
    if (!tempSlug.trim() || tempSlug === clinicSlug) {
      setIsEditingSlug(false);
      return;
    }
    
    setIsSaving(true);
    // Simple format slug: lowercase, replace spaces with hyphens, remove special chars
    const formattedSlug = tempSlug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

    const { error } = await supabase
      .from('clinics')
      .update({ slug: formattedSlug })
      .eq('id', clinicId);

    setIsSaving(false);
    
    if (error) {
      if (error.code === '23505') {
        alert('Este nome (slug) já está em uso por outra clínica. Escolha outro.');
      } else {
        alert('Erro ao salvar.');
      }
    } else {
      setClinicSlug(formattedSlug);
      setTempSlug(formattedSlug);
      setIsEditingSlug(false);
    }
  };

  if (isLoading || isPlanLoading) {
    return <div className="p-8 text-center text-st-muted animate-pulse">Carregando configurações...</div>;
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-st-arctic tracking-tight flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-st-electric" />
          Portal do Tutor
        </h1>
        <p className="text-sm text-st-muted max-w-xl">
          Disponibilize para seus clientes um portal exclusivo onde eles acompanham histórico, vacinas e agendamentos dos pets.
        </p>
      </div>

      {!hasAccess ? (
        <div className="card p-8 rounded-2xl text-center border-amber-500/20 bg-amber-500/5 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Share2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-st-arctic text-lg">Recurso Premium</h3>
            <p className="text-st-muted text-sm mt-2 max-w-md mx-auto">
              O Portal do Tutor exclusivo com a sua marca está disponível apenas para assinantes do plano Ouro ou superior.
            </p>
          </div>
          <button className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors mt-4">
            Fazer Upgrade
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-6">
            <div className="card p-6 rounded-2xl border border-st-border">
              <h3 className="text-sm font-bold text-st-arctic mb-4 uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-st-electric" />
                Seu Link Exclusivo
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-st-muted">
                  Compartilhe este link com seus clientes via WhatsApp ou adicione à bio do seu Instagram.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {isEditingSlug ? (
                    <div className="flex flex-1 items-center gap-2 bg-st-surface/50 border border-st-border rounded-xl p-1.5 pl-3">
                      <span className="text-st-muted text-sm shrink-0 hidden sm:inline">petia.com.br/t/</span>
                      <input 
                        type="text" 
                        value={tempSlug}
                        onChange={(e) => setTempSlug(e.target.value)}
                        className="bg-transparent border-none text-st-arctic text-sm focus:outline-none w-full"
                        placeholder="minha-clinica"
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveSlug}
                        disabled={isSaving}
                        className="p-2 bg-st-electric text-white rounded-lg hover:bg-st-electric/80 transition-colors shrink-0"
                      >
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => {
                          setTempSlug(clinicSlug);
                          setIsEditingSlug(false);
                        }}
                        className="p-2 bg-st-surface-2 text-st-muted rounded-lg hover:text-white transition-colors shrink-0"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-between bg-st-surface/50 border border-st-border rounded-xl p-3 px-4">
                      <span className="text-st-arctic font-medium text-sm truncate select-all">{portalUrl}</span>
                      <button 
                        onClick={() => setIsEditingSlug(true)}
                        className="text-xs text-st-electric font-semibold hover:underline ml-3 shrink-0"
                      >
                        Personalizar link
                      </button>
                    </div>
                  )}

                  {!isEditingSlug && (
                    <button 
                      onClick={handleCopy}
                      className="px-4 py-3 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold text-sm transition-all shadow-glow flex items-center justify-center gap-2 shrink-0"
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {isCopied ? 'Copiado!' : 'Copiar Link'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="card p-6 rounded-2xl border border-st-border flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-st-arctic">QR Code para Balcão</h3>
                <p className="text-sm text-st-muted mt-1 mb-3">
                  Imprima um totem para colocar na recepção. Os tutores podem escanear para acessar rapidamente enquanto aguardam.
                </p>
                <a 
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(portalUrl)}&margin=10`}
                  target="_blank"
                  rel="noreferrer"
                  download="qrcode.png"
                  className="text-sm text-emerald-500 font-semibold hover:underline"
                >
                  Baixar QR Code
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="card rounded-2xl p-6 border border-st-border bg-gradient-to-br from-st-surface to-st-surface-2 h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-32 rounded-[2rem] border-4 border-st-border bg-st-navy relative shadow-2xl flex flex-col items-center p-2 pt-4">
                <div className="w-1/2 h-1 bg-st-border rounded-full absolute top-1.5"></div>
                <div className="w-8 h-8 rounded-full bg-st-electric/20 text-st-electric flex items-center justify-center mt-2 mb-2">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="w-full h-2 bg-st-surface rounded-sm"></div>
                <div className="w-3/4 h-2 bg-st-surface rounded-sm mt-1"></div>
              </div>
              <div>
                <h3 className="font-bold text-st-arctic">Como funciona?</h3>
                <p className="text-xs text-st-muted mt-2">
                  1. O tutor acessa o link<br/>
                  2. Digita o e-mail ou telefone<br/>
                  3. Recebe um código seguro de acesso<br/>
                  4. Acompanha vacinas e agendamentos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
