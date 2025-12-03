import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithDiscord, isLoading } = useAuth();
  const { t } = useLanguage();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDiscordLogin = async () => {
    setIsSigningIn(true);
    try {
      await signInWithDiscord();
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      setIsSigningIn(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 animate-fade-in pointer-events-none">
        <div
          className="bg-background rounded-2xl shadow-2xl max-w-md w-full border border-border animate-scale-in pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">{t('auth.title')}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                {t('auth.subtitle')}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {t('auth.description')}
              </p>
            </div>

            <button
              onClick={handleDiscordLogin}
              disabled={isLoading || isSigningIn}
              className="w-full group relative bg-gradient-to-r from-[#5865F2] to-[#4752C4] text-white font-semibold py-4 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#5865F2]/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#4752C4] to-[#5865F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {isSigningIn || isLoading ? (
                <>
                  <div className="relative w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="relative">{t('auth.loading')}</span>
                </>
              ) : (
                <>
                  <svg className="relative w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.445.864-.608 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.397-.875-.609-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.08.08 0 00.087-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.294.075.075 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 01.079.009c.12.098.246.198.373.295a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.699.772 1.365 1.225 1.994a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-4.467.151-8.35-.885-12.467a.07.07 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.931-2.157 2.157-2.157 1.226 0 2.157.964 2.157 2.157 0 1.191-.931 2.157-2.157 2.157zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.931-2.157 2.157-2.157 1.226 0 2.157.964 2.157 2.157 0 1.191-.931 2.157-2.157 2.157z" />
                  </svg>
                  <span className="relative">{t('auth.discord_button')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
