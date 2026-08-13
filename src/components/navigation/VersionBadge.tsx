'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { APP_VERSION } from '@/lib/version';

export function VersionBadge() {
  const [isChecking, setIsChecking] = useState(false);

  function handleCheck() {
    setIsChecking(true);
    window.dispatchEvent(new Event('clinia_check_version'));
    setTimeout(() => setIsChecking(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCheck}
      className="hidden md:flex fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-[calc(1.25rem+env(safe-area-inset-right,0px))] z-40 items-center gap-1.5 px-2.5 py-1 rounded-full bg-st-surface/90 border border-st-border/60 text-[10px] text-st-muted hover:text-white hover:border-st-electric transition-all select-none shadow-md group"
      title={`Versão ${APP_VERSION} — Clique para buscar atualizações`}
    >
      <RefreshCw
        className={`w-2.5 h-2.5 md:w-3 md:h-3 text-st-electric group-hover:rotate-180 transition-transform duration-500 ${
          isChecking ? 'animate-spin' : ''
        }`}
      />
      <span className="font-mono font-semibold">{APP_VERSION}</span>
    </button>
  );
}
