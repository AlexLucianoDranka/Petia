'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface SolidaTechBadgeProps {
  variant?: 'auth' | 'sidebar';
  className?: string;
}

export function SolidaTechBadge({ variant = 'auth', className = '' }: SolidaTechBadgeProps) {
  const [darkError, setDarkError] = useState(false);
  const [lightError, setLightError] = useState(false);

  const showFallback = darkError && lightError;

  if (variant === 'sidebar') {
    return (
      <a
        href="https://solidatech.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex flex-col items-center justify-center transition-opacity hover:opacity-90 ${className}`}
        title="Visitar solidatech.com.br"
      >
        <span className="text-[8px] uppercase tracking-widest font-semibold text-st-muted/70 text-center mb-0.5">
          Desenvolvido por
        </span>
        {!showFallback ? (
          <>
            <img
              src="/icons/developed-by-logo-dark.svg"
              alt="Sólida Tech"
              className="dark-logo-img h-[15px] max-w-[125px] object-contain group-hover:scale-105 transition-transform"
              onError={() => setDarkError(true)}
            />
            <img
              src="/icons/developed-by-logo-light.svg"
              alt="Sólida Tech"
              className="light-logo-img h-[15px] max-w-[125px] object-contain group-hover:scale-105 transition-transform"
              onError={() => setLightError(true)}
            />
          </>
        ) : (
          <span className="text-xs font-bold text-st-arctic group-hover:text-st-electric transition-colors">
            Sólida<span className="text-st-electric">Tech</span>
          </span>
        )}
        <span className="text-[8px] font-medium text-st-muted/70 group-hover:text-st-electric transition-colors mt-0.5 tracking-tight flex items-center gap-0.5">
          solidatech.com.br <ExternalLink className="w-2.5 h-2.5 inline" />
        </span>
      </a>
    );
  }

  // Variant: Auth (Login, Register)
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <a
        href="https://solidatech.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center justify-center transition-opacity hover:opacity-90"
        title="Visitar solidatech.com.br"
      >
        <span className="text-[8px] uppercase tracking-widest font-semibold text-st-muted/70 text-center mb-0.5">
          Desenvolvido por
        </span>
        {!showFallback ? (
          <>
            <img
              src="/icons/developed-by-logo-dark.svg"
              alt="Sólida Tech"
              className="dark-logo-img h-4 sm:h-5 max-w-[140px] object-contain group-hover:scale-105 transition-transform"
              onError={() => setDarkError(true)}
            />
            <img
              src="/icons/developed-by-logo-light.svg"
              alt="Sólida Tech"
              className="light-logo-img h-4 sm:h-5 max-w-[140px] object-contain group-hover:scale-105 transition-transform"
              onError={() => setLightError(true)}
            />
          </>
        ) : (
          <span className="text-xs font-bold text-st-arctic group-hover:text-st-electric transition-colors">
            Sólida<span className="text-st-electric">Tech</span>
          </span>
        )}
        <span className="text-[8px] font-medium text-st-muted/70 group-hover:text-st-electric transition-colors mt-0.5 tracking-tight flex items-center gap-0.5">
          solidatech.com.br <ExternalLink className="w-2.5 h-2.5 inline" />
        </span>
      </a>
    </div>
  );
}
