import React, { useState, useRef, useEffect } from 'react';
import { Settings, Sun, Moon, Check, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, Language } from '../contexts/LanguageContext';

import frFlag from '@/assets/flags/fr.png';
import gbFlag from '@/assets/flags/gb.png';
import esFlag from '@/assets/flags/es.png';
import deFlag from '@/assets/flags/de.png';
import ptFlag from '@/assets/flags/pt.png';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: frFlag },
  { code: 'en', name: 'English', flag: gbFlag },
  { code: 'es', name: 'Español', flag: esFlag },
  { code: 'de', name: 'Deutsch', flag: deFlag },
  { code: 'pt', name: 'Português', flag: ptFlag },
];

export const SettingsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const currentLang = languages.find(l => l.code === language);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowLanguages(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLanguages(false);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowLanguages(false);
        }}
        className="p-2 rounded-lg text-foreground hover:bg-primary/10 transition-all duration-300 hover:scale-105 active:scale-95 border border-border/50 hover:border-primary/30"
        aria-label="Settings"
      >
        <Settings className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-border rounded-xl shadow-xl overflow-hidden animate-fade-in z-50">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/10 transition-colors duration-200 text-foreground"
          >
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
              <span className="font-medium">{isDark ? 'Mode sombre' : 'Mode clair'}</span>
            </div>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${isDark ? 'bg-primary' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          <div className="h-px bg-border" />

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/10 transition-colors duration-200 text-foreground"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={currentLang?.flag} 
                  alt={currentLang?.name} 
                  className="w-5 h-4 object-cover rounded-sm shadow-sm"
                />
                <span className="font-medium">{currentLang?.name}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showLanguages ? 'rotate-90' : ''}`} />
            </button>

            {showLanguages && (
              <div className="border-t border-border bg-gray-50 dark:bg-gray-700/50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-primary/10 transition-colors duration-200 ${
                      language === lang.code 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-foreground'
                    }`}
                  >
                    <img 
                      src={lang.flag} 
                      alt={lang.name} 
                      className="w-5 h-4 object-cover rounded-sm shadow-sm"
                    />
                    <span className="font-medium flex-1 text-left">{lang.name}</span>
                    {language === lang.code && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
