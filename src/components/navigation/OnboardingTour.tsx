'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Dog, CreditCard, ArrowRight, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { ClientPortal } from '@/components/ui/ClientPortal';

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  highlightRoute?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Bem-vindo ao Petia! 🐾',
    subtitle: 'Sua clínica veterinária pronta para crescer',
    description:
      'Sua conta foi criada com sucesso! Você tem 7 dias grátis de acesso total. Seu painel já está configurado e pronto para você cadastrar seus primeiros clientes e pets.',
    icon: Sparkles,
  },
  {
    title: 'Agenda Visual & Check-in 📅',
    subtitle: 'Controle total de horários e atendimento no balcão',
    description:
      'Gerencie consultas, procedimentos e banho & tosa em um quadro intuitivo. Envie lembretes via WhatsApp para os tutores em 1 clique.',
    icon: Calendar,
    highlightRoute: '/agenda',
  },
  {
    title: 'Pets, Prontuário & Raio-X 🐶',
    subtitle: 'Histórico clínico completo e seguro',
    description:
      'Cada pet possui sua carteira digital com QR Code, linha do tempo de vacinas e ferramenta interativa para desenhar anotações sobre imagens de raio-x e ultrassom.',
    icon: Dog,
    highlightRoute: '/pets',
  },
  {
    title: '7 Dias de Trial Ativado 💳',
    subtitle: 'Acesso liberado a todas as ferramentas',
    description:
      'Sua clínica iniciou com 7 dias de avaliação gratuita sem compromisso. Explore todos os módulos e escolha o plano ideal para o seu negócio a qualquer momento.',
    icon: CreditCard,
    highlightRoute: '/planos',
  },
];

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    async function checkTourStatus() {
      try {
        // 1. Check Supabase user metadata (persists across browser cache clears)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const metadata = user.user_metadata || {};

          // If onboarding is already completed in user metadata, NEVER show again
          if (metadata.onboarding_completed === true) {
            setIsOpen(false);
            return;
          }

          // Show ONLY if the user is marked as new user AND has not completed onboarding
          if (metadata.is_new_user === true && metadata.onboarding_completed !== true) {
            setIsOpen(true);
            return;
          }

          // For existing users without metadata flags, do not show again
          setIsOpen(false);
          return;
        }
      } catch (_) {}

      // 2. Fallback check for local storage
      const isNewAccount = localStorage.getItem('petia_is_new_account') === 'true';
      const isTourCompleted = localStorage.getItem('petia_tour_completed') === 'true';

      if (isNewAccount && !isTourCompleted) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }

    checkTourStatus();
  }, []);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsOpen(false);
    localStorage.setItem('petia_tour_completed', 'true');
    localStorage.removeItem('petia_is_new_account');

    // Persist permanently to Supabase User Metadata so clearing browser cache won't re-trigger it
    try {
      await supabase.auth.updateUser({
        data: { onboarding_completed: true, is_new_user: false },
      });
    } catch (_) {}
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
        <div className="relative my-auto w-full max-w-lg card rounded-3xl p-6 sm:p-8 space-y-6 border border-st-electric/50 shadow-2xl animate-fade-up overflow-hidden bg-gradient-to-b from-st-navy via-st-surface to-st-surface max-h-[90vh] flex flex-col">
          {/* Top Decorative Sparkles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-st-electric/15 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 p-2 text-st-muted hover:text-st-arctic rounded-xl hover:bg-st-surface transition-colors cursor-pointer"
            title="Pular Tour"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step Indicator Dots */}
          <div className="flex items-center gap-1.5 justify-center">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-8 bg-st-electric'
                    : idx < currentStepIndex
                    ? 'w-3 bg-st-success'
                    : 'w-3 bg-st-border'
                }`}
              />
            ))}
          </div>

          {/* Step Content Card */}
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-st-electric/20 text-st-electric border border-st-electric/40 flex items-center justify-center mx-auto shadow-glow">
              <StepIcon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{currentStep.title}</h3>
              <p className="text-xs font-semibold text-st-electric uppercase tracking-wider">{currentStep.subtitle}</p>
            </div>

            <p className="text-xs text-st-muted leading-relaxed max-w-md mx-auto">
              {currentStep.description}
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-st-border/40 flex items-center justify-between gap-3">
            <button
              onClick={handleComplete}
              className="text-xs font-bold text-st-muted hover:text-st-arctic transition-colors px-2 py-1 cursor-pointer"
            >
              Pular Guia
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-xl bg-st-electric hover:bg-st-steel text-white font-extrabold text-xs shadow-glow transition-all flex items-center gap-2 border-none whitespace-nowrap cursor-pointer"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Começar a Usar o Petia' : 'Próximo Passo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}
