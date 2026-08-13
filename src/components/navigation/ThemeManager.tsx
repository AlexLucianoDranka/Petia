'use client';

import { useEffect } from 'react';

export function ThemeManager() {
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('petia_theme');
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

      let isLight = false;
      if (savedTheme === 'light') {
        isLight = true;
      } else if (savedTheme === 'dark') {
        isLight = false;
      } else {
        // Default to system preference
        isLight = prefersLight;
      }

      if (isLight) {
        document.documentElement.classList.add('light');
        updateThemeColor('#F8FAFC');
      } else {
        document.documentElement.classList.remove('light');
        updateThemeColor('#0F1F38');
      }
    };

    const updateThemeColor = (color: string) => {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', color);
    };

    // Initial run
    applyTheme();

    // Listen to system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (!localStorage.getItem('petia_theme') || localStorage.getItem('petia_theme') === 'system') {
        applyTheme();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    }

    // Listen to custom theme change event
    window.addEventListener('petia_theme_changed', applyTheme);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      }
      window.removeEventListener('petia_theme_changed', applyTheme);
    };
  }, []);

  return null;
}
