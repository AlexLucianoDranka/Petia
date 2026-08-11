'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[PWA] Service Worker registrado:', reg.scope))
        .catch((err) => console.error('[PWA] Erro ao registrar SW:', err));
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    const standalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;

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

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] Usuário aceitou instalar o Petia');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 bg-st-surface border border-st-electric/50 rounded-2xl p-4 shadow-glow animate-fade-down flex items-start gap-3">
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
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-st-electric hover:bg-st-steel text-white font-bold text-xs shadow-glow transition-all whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Instalar Petia Agora</span>
          </button>
        )}
      </div>

      <button
        onClick={() => setShowPrompt(false)}
        className="p-1 rounded-lg text-st-muted hover:text-st-arctic hover:bg-st-surface-2 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
