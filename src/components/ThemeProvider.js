'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { updateThemeAction } from '../app/actions';

const ThemeContext = createContext();

export const predefinedThemes = {
  dark: {
    '--background': '#09090b',
    '--surface': '#18181b',
    '--surface-hover': '#27272a',
    '--border': '#27272a',
    '--text-primary': '#fafafa',
    '--text-secondary': '#a1a1aa',
    '--primary': '#3b82f6',
    '--primary-hover': '#60a5fa',
  },
  light: {
    '--background': '#fdfdfd',
    '--surface': '#ffffff',
    '--surface-hover': '#f4f4f5',
    '--border': '#e5e5e5',
    '--text-primary': '#171717',
    '--text-secondary': '#737373',
    '--primary': '#000000',
    '--primary-hover': '#262626',
  }
};

export function ThemeProvider({ children, initialTheme = 'dark', storeId }) {
  // Se o tema inicial for antigo (ex: neon, amoled), força para dark
  const safeInitialTheme = predefinedThemes[initialTheme] ? initialTheme : 'dark';
  const [theme, setTheme] = useState(safeInitialTheme);

  // Injeta as variáveis no <html> dinamicamente
  useEffect(() => {
    const root = document.documentElement;
    const colorsToApply = predefinedThemes[theme] || predefinedThemes.dark;

    if (colorsToApply) {
      Object.keys(colorsToApply).forEach((key) => {
        root.style.setProperty(key, colorsToApply[key]);
      });
    }
  }, [theme]);

  const changeTheme = async (newTheme) => {
    const validTheme = predefinedThemes[newTheme] ? newTheme : 'dark';
    setTheme(validTheme);
    
    // Salvar no servidor de forma síncrona/background
    await updateThemeAction(validTheme, {});
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
