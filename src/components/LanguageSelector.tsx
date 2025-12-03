import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
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

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(l => l.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 px-3 rounded-lg text-foreground hover:bg-primary/10 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 border border-border/50 hover:border-primary/30"
        aria-label="Change language"
      >
        <img 
          src={currentLang?.flag} 
          alt={currentLang?.name} 
          className="w-6 h-4 object-cover rounded-sm shadow-sm"
        />
        <span className="text-sm font-medium hidden sm:inline">{currentLang?.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-border rounded-xl shadow-2xl z-[100] overflow-hidden animate-scale-in backdrop-blur-sm">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 hover:bg-primary/10 ${
                  language === lang.code 
                    ? 'bg-primary/5 text-primary' 
                    : 'text-foreground'
                }`}
              >
                <img 
                  src={lang.flag} 
                  alt={lang.name} 
                  className="w-6 h-4 object-cover rounded-sm shadow-sm"
                />
                <span className="font-medium">{lang.name}</span>
                {language === lang.code && (
                  <Check className="w-4 h-4 ml-auto text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
