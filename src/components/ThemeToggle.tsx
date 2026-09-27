'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-yellow-300 hover:bg-slate-800'
          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
      }`}
      title={`Switch to ${theme === 'light' ? 'Dark Mode (Night)' : 'Light Mode (Day)'}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-yellow-400" />
          <span className="hidden sm:inline">Day Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-slate-600" />
          <span className="hidden sm:inline font-bold">Night Mode</span>
        </>
      )}
    </button>
  );
}
