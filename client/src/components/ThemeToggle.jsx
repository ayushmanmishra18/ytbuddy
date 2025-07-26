import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out hover:scale-105 group"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <div className="relative flex items-center justify-center w-full h-full">
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform duration-300 rotate-0 group-hover:rotate-12" />
        ) : (
          <Sun className="w-5 h-5 text-orange-500 transition-transform duration-300 rotate-0 group-hover:rotate-45" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;