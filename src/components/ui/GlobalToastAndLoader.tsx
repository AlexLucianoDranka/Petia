'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export function GlobalToastAndLoader() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Listen to custom toast events: window.dispatchEvent(new CustomEvent('petia_toast', { detail: { type: 'success', message: 'Salvo com sucesso!' } }))
    const handleToastEvent = (e: any) => {
      const { type = 'success', message } = e.detail || {};
      if (!message) return;
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    // Listen to custom loading bar events
    const handleLoadingStart = () => {
      setIsLoading(true);
      setLoadingProgress(20);
      const timer = setInterval(() => {
        setLoadingProgress((old) => {
          if (old >= 90) {
            clearInterval(timer);
            return 90;
          }
          return old + 15;
        });
      }, 150);
    };

    const handleLoadingStop = () => {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 300);
    };

    window.addEventListener('petia_toast' as any, handleToastEvent);
    window.addEventListener('petia_loading_start' as any, handleLoadingStart);
    window.addEventListener('petia_loading_stop' as any, handleLoadingStop);

    return () => {
      window.removeEventListener('petia_toast' as any, handleToastEvent);
      window.removeEventListener('petia_loading_start' as any, handleLoadingStart);
      window.removeEventListener('petia_loading_stop' as any, handleLoadingStop);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {/* 1. Barra de Carregamento Superior (Top Loading Bar) */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-st-surface">
          <div
            className="h-full bg-gradient-to-r from-st-electric via-st-accent to-st-electric transition-all duration-200 shadow-glow"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      {/* 2. Card de Notificação Toast no Canto Inferior Direito */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md animate-fade-up text-xs font-semibold ${
                isSuccess
                  ? 'bg-st-surface/95 border-st-success/40 text-st-arctic'
                  : isError
                  ? 'bg-st-surface/95 border-red-500/40 text-st-arctic'
                  : 'bg-st-surface/95 border-st-electric/40 text-st-arctic'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-st-success shrink-0" />}
                {isError && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                {!isSuccess && !isError && <Info className="w-4 h-4 text-st-electric shrink-0" />}
                <span className="truncate">{toast.message}</span>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-st-muted hover:text-st-arctic p-1 rounded-lg transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Global Helper Functions to trigger toasts and top loading bar anywhere in the codebase
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('petia_toast', { detail: { type, message } }));
  }
}

export function startTopLoader() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('petia_loading_start'));
  }
}

export function stopTopLoader() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('petia_loading_stop'));
  }
}
