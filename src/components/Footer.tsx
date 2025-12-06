import React from 'react';
import { Instagram, Facebook, Mail, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const quickLinks = [
    { id: 'home', label: t('nav.home') },
    { id: 'about', label: t('nav.about') },
    { id: 'order', label: t('nav.order') },
    { id: 'faq', label: t('nav.faq') },
    { id: 'contact', label: t('nav.contact') },
  ];

  const socialLinks = [
    { icon: Instagram, label: 'Instagram', url: '#', external: true },
    { icon: Facebook, label: 'Facebook', url: '#', external: true },
    { icon: MessageSquare, label: 'Discord', url: 'https://discord.gg/9mKPA3kHBA', external: true },
    { icon: Mail, label: 'Email', url: 'mailto:contact@wifiric.com', external: false },
  ];

  const legalLinks = [
    { label: t('footer.support'), action: () => setCurrentPage('contact') },
    { label: t('footer.privacy'), action: () => {} },
    { label: t('footer.terms'), action: () => {} },
  ];

  return (
    <footer className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 text-gray-800 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-6 md:mb-8">
          <div className="space-y-4">
            <div className="group flex items-center space-x-2 cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => setCurrentPage('home')}>
              <div className="relative h-12 w-auto flex items-center">
                <img
                  src="https://i.ibb.co/dwHHgNHq/Logo-Texte.png"
                  alt="WifiRic Logo"
                  className={`h-12 w-auto transition-all duration-300 ${isDark ? 'opacity-0' : 'opacity-100'} group-hover:brightness-110`}
                />
                <img
                  src="https://i.ibb.co/7drDsrNz/Logo-Texte-Blanc.png"
                  alt="WifiRic Logo Dark"
                  className={`absolute top-0 left-0 h-12 w-auto transition-all duration-300 ${isDark ? 'opacity-100' : 'opacity-0'} group-hover:brightness-110`}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#9cd4e3] to-blue-500 bg-clip-text text-transparent">
              {t('footer.quick_links')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => setCurrentPage(link.id)}
                    className="group relative text-gray-600 dark:text-gray-400 hover:text-[#9cd4e3] dark:hover:text-[#9cd4e3] transition-all duration-300 text-sm font-semibold flex items-center space-x-2 hover:translate-x-2"
                  >
                    <span className="w-0 h-0.5 bg-gradient-to-r from-[#9cd4e3] to-blue-500 group-hover:w-4 transition-all duration-300"></span>
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#9cd4e3] to-blue-500 bg-clip-text text-transparent">
              {t('footer.contact')}
            </h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target={social.external ? "_blank" : undefined}
                  rel={social.external ? "noopener noreferrer" : undefined}
                  className="group relative p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-[#9cd4e3]/50 transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-[#9cd4e3]/20 hover:-rotate-6"
                  aria-label={social.label}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#9cd4e3]/0 to-blue-500/0 group-hover:from-[#9cd4e3]/10 group-hover:to-blue-500/10 rounded-2xl transition-all duration-500"></div>
                  <social.icon className="relative w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-[#9cd4e3] transition-all duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 md:pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              {t('footer.copyright')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {legalLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.action}
                  className="group relative text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-[#9cd4e3] dark:hover:text-[#9cd4e3] transition-all duration-300 font-medium px-1 md:px-2 py-1"
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#9cd4e3] to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
