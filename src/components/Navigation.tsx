import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Accueil' },
    { id: 'about', label: 'À propos' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-lg' : currentPage === 'home' ? 'bg-gradient-to-br from-white/50 via-gray-50/30 to-blue-50/20 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-blue-900/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 relative">
          <div className="flex items-center space-x-2 group cursor-pointer relative overflow-hidden rounded-lg p-2 hover:bg-primary/5 transition-all duration-500" onClick={() => setCurrentPage('home')}>
            <div className="relative h-10 w-auto flex items-center">
              <img 
                src="https://i.ibb.co/dwHHgNHq/Logo-Texte.png" 
                alt="WifiRic Logo et Titre" 
                className={`h-10 w-auto transition-all duration-300 ${isDark ? 'opacity-0' : 'opacity-100'}`}
              />
              <img 
                src="https://i.ibb.co/7drDsrNz/Logo-Texte-Blanc.png" 
                alt="WifiRic Logo et Titre Dark" 
                className={`absolute top-0 left-0 h-10 w-auto transition-all duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`relative px-4 py-2 text-lg font-semibold transition-all duration-300 hover:text-primary hover:scale-110 active:scale-95 ${currentPage === item.id ? 'text-primary' : 'text-muted-foreground'} group rounded-lg`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${currentPage === item.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </button>
            ))}
            <ThemeToggle />
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-primary/5 rounded-lg"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-lg mt-2 mb-4 shadow-lg animate-slide-up-fade">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-3 text-left text-lg font-semibold transition-all duration-300 hover:bg-primary/10 hover:translate-x-2 active:translate-x-1 ${currentPage === item.id ? 'text-primary bg-primary/5 border-l-4 border-primary' : 'text-muted-foreground border-l-4 border-transparent'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};