'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { updateThemeAction } from '../app/actions';

const ThemeContext = createContext();

export const predefinedThemes = {
  light: {
    '--background': '#f8fafc',
    '--surface': '#ffffff',
    '--surface-hover': '#f1f5f9',
    '--border': '#e2e8f0',
    '--text-primary': '#0f172a',
    '--text-secondary': '#64748b',
    '--primary': '#6366f1',
    '--primary-hover': '#4f46e5',
  },
  dark: {
    '--background': '#0f172a',
    '--surface': '#1e293b',
    '--surface-hover': '#334155',
    '--border': '#334155',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#94a3b8',
    '--primary': '#6366f1',
    '--primary-hover': '#818cf8',
  },
  amoled: {
    '--background': '#000000',
    '--surface': '#0a0a0a',
    '--surface-hover': '#171717',
    '--border': '#262626',
    '--text-primary': '#ffffff',
    '--text-secondary:': '#a3a3a3',
    '--primary': '#6366f1',
    '--primary-hover': '#818cf8',
  },
  neon: {
    '--background': '#1e1b4b',
    '--surface': '#312e81',
    '--surface-hover': '#3730a3',
    '--border': '#4338ca',
    '--text-primary': '#f5f3ff',
    '--text-secondary': '#c4b5fd',
    '--primary': '#ec4899',
    '--primary-hover': '#f472b6',
  },
  ruby: {
    '--background': '#450a0a',
    '--surface': '#7f1d1d',
    '--surface-hover': '#991b1b',
    '--border': '#b91c1c',
    '--text-primary': '#fef2f2',
    '--text-secondary': '#fca5a5',
    '--primary': '#ef4444',
    '--primary-hover': '#f87171',
  },
  emerald: {
    '--background': '#022c22',
    '--surface': '#064e3b',
    '--surface-hover': '#065f46',
    '--border': '#047857',
    '--text-primary': '#ecfdf5',
    '--text-secondary': '#6ee7b7',
    '--primary': '#10b981',
    '--primary-hover': '#34d399',
  },
  ocean: {
    '--background': '#082f49',
    '--surface': '#0c4a6e',
    '--surface-hover': '#0369a1',
    '--border': '#0284c7',
    '--text-primary': '#f0f9ff',
    '--text-secondary': '#7dd3fc',
    '--primary': '#0ea5e9',
    '--primary-hover': '#38bdf8',
  },
  sunset: {
    '--background': '#431407',
    '--surface': '#7c2d12',
    '--surface-hover': '#9a3412',
    '--border': '#c2410c',
    '--text-primary': '#fff7ed',
    '--text-secondary': '#fdba74',
    '--primary': '#f97316',
    '--primary-hover': '#fb923c',
  },
  coffee: {
    '--background': '#292524',
    '--surface': '#44403c',
    '--surface-hover': '#57534e',
    '--border': '#78716c',
    '--text-primary': '#fafaf9',
    '--text-secondary': '#d6d3d1',
    '--primary': '#a8a29e',
    '--primary-hover': '#d6d3d1',
  }
};

export function ThemeProvider({ children, initialTheme = 'dark', initialCustomColors = {}, storeId }) {
  const [theme, setTheme] = useState(initialTheme);
  const [customColors, setCustomColors] = useState(initialCustomColors);

  // Injeta as variáveis no <html> ou <body> dinamicamente
  useEffect(() => {
    const root = document.documentElement;
    let colorsToApply = predefinedThemes[theme];

    if (theme === 'custom') {
      colorsToApply = { ...predefinedThemes.dark, ...customColors };
    }

    if (colorsToApply) {
      Object.keys(colorsToApply).forEach((key) => {
        root.style.setProperty(key, colorsToApply[key]);
      });
    }
  }, [theme, customColors]);

  const changeTheme = async (newTheme, newCustomColors = null) => {
    setTheme(newTheme);
    if (newCustomColors) {
      setCustomColors(newCustomColors);
    }
    
    // Salvar no servidor de forma síncrona/background (grava no banco e no cookie)
    await updateThemeAction(newTheme, newCustomColors || customColors);
  };

  return (
    <ThemeContext.Provider value={{ theme, customColors, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
