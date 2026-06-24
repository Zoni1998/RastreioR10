'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ThemeSwitcher() {
  const { theme, changeTheme } = useTheme();
  
  const isLight = theme === 'light';

  const toggleTheme = () => {
    changeTheme(isLight ? 'dark' : 'light');
  };

  return (
    <button 
      onClick={toggleTheme}
      className="!fixed bottom-6 right-20 w-12 h-12 flex items-center justify-center liquid-glass rounded-full text-text-secondary hover:text-text-primary border border-border/40 shadow-lg hover:shadow-xl transition-all z-[998] hover:-translate-y-1 overflow-hidden"
      title={isLight ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
    >
      <AnimatePresence mode="wait">
        {isLight ? (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={20} strokeWidth={2} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={20} strokeWidth={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
