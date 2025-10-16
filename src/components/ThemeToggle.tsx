import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#9cd4e3] focus:ring-opacity-50 hover:shadow-xl hover:shadow-[#9cd4e3]/40 hover:scale-110 active:scale-95 group"
      aria-label="Toggle theme"
    >
      <div className={`absolute top-1 left-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center group-hover:scale-110 ${isDark ? 'translate-x-8' : 'translate-x-0'}`}>
        {isDark ? (
          <Moon className="w-3 h-3 text-[#9cd4e3] group-hover:rotate-12 transition-transform duration-300" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500 group-hover:rotate-90 transition-transform duration-300" />
        )}
      </div>

      {/* Animated background track */}
      <div className={`absolute inset-1 rounded-full transition-all duration-300 ${isDark ? 'bg-gradient-to-r from-blue-600 to-[#9cd4e3]' : 'bg-gradient-to-r from-yellow-400 to-orange-500'} opacity-20 group-hover:opacity-40`}></div>
    </button>
  );
};