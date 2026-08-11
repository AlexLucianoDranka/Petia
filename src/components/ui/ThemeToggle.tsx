'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ThemeMode = 'dark' | 'light' | 'system';

export function ThemeToggle() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  function applyTheme(mode: ThemeMode) {
    if (mode === 'light') {
      document.documentElement.classList.add('light');
    } else if (mode === 'dark') {
      document.documentElement.classList.remove('light');
    } else if (mode === 'system') {
      const isSystemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      if (isSystemLight) {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('kmzero_theme_mode') as ThemeMode | null;
    const initial = saved || 'dark';
    setThemeMode(initial);
    applyTheme(initial);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => {
      const current = (localStorage.getItem('kmzero_theme_mode') as ThemeMode) || 'dark';
      if (current === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  function selectMode(mode: ThemeMode) {
    setThemeMode(mode);
    localStorage.setItem('kmzero_theme_mode', mode);
    applyTheme(mode);
  }

  return (
    <div className="flex items-center justify-between p-1 bg-st-navy/80 rounded-xl w-full border-none">
      <button
        type="button"
        onClick={() => selectMode('light')}
        className={cn(
          'flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 border-none',
          themeMode === 'light'
            ? 'bg-st-electric text-white shadow-glow-sm'
            : 'text-st-muted hover:text-st-arctic'
        )}
        title="Modo Claro"
      >
        <Sun className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[10px] whitespace-nowrap">Claro</span>
      </button>

      <button
        type="button"
        onClick={() => selectMode('dark')}
        className={cn(
          'flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 border-none',
          themeMode === 'dark'
            ? 'bg-st-electric text-white shadow-glow-sm'
            : 'text-st-muted hover:text-st-arctic'
        )}
        title="Modo Escuro"
      >
        <Moon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[10px] whitespace-nowrap">Escuro</span>
      </button>

      <button
        type="button"
        onClick={() => selectMode('system')}
        className={cn(
          'flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 border-none',
          themeMode === 'system'
            ? 'bg-st-electric text-white shadow-glow-sm'
            : 'text-st-muted hover:text-st-arctic'
        )}
        title="Modo do Sistema"
      >
        <Laptop className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[10px] whitespace-nowrap">Sistema</span>
      </button>
    </div>
  );
}
