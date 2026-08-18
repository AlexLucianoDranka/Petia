'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or installed before
    const isDismissed = localStorage.getItem('petia_pwa_dismissed');
    if (isDismissed === 'true') {
      return;
    }

    // Register Service Worker in production, or unregister in development
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('[PWA] Service Worker registrado:', reg.scope))
          .catch((err) => console.error('[PWA] Erro ao registrar SW:', err));
      } else {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
            console.log('[PWA] Service Worker desregistrado para ambiente de desenvolvimento.');
          }
        });
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    const standalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;

    if (iosDevice && !standalone) {
      setIsIos(true);
      setShowPrompt(true);
    }

    // Catch desktop Chrome/Edge & Android beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('petia_pwa_dismissed', 'true');
    setShowPrompt(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] Usuário aceitou instalar o Petia');
      localStorage.setItem('petia_pwa_dismissed', 'true');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-3 right-3 md:bottom-auto md:top-4 md:left-auto md:right-4 md:w-96 z-50 bg-st-surface border border-st-electric/50 rounded-2xl p-4 shadow-glow animate-fade-up md:animate-fade-down flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center shrink-0 border border-st-electric/30">
        {isIos ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
      </div>

      <div className="flex-1 space-y-1 text-xs">
        <h4 className="font-extrabold text-st-arctic text-sm whitespace-nowrap">Instalar Aplicativo Petia</h4>
        <p className="text-st-muted leading-tight">
          {isIos
            ? 'Para instalar no iPhone, toque no botão Compartilhar do Safari e selecione "Adicionar à Tela de Início".'
            : 'Instale o Petia para acesso rápido no balcão e funcionamento offline no seu computador ou celular.'}
        </p>

        {!isIos && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-st-electric hover:bg-st-steel text-white font-bold text-xs shadow-glow transition-all whitespace-nowrap shrink-0 border-none"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Instalar Petia Agora</span>
          </button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="p-1 rounded-lg text-st-muted hover:text-st-arctic hover:bg-st-surface-2 transition-colors shrink-0"
        title="Fechar aviso"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
