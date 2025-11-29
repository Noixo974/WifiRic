import { useState, useEffect } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if dismissed recently (24 hours)
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // For iOS, show prompt after a delay
    if (isIOSDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // For other browsers, listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up-fade">
      <div className="glass-effect rounded-2xl p-4 border border-primary/30 shadow-neon">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-primary/20 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
            <Download className="w-6 h-6 text-primary-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm md:text-base">
              Installer WifiRic
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {isIOS
                ? 'Ajoutez l\'app à votre écran d\'accueil pour un accès rapide.'
                : 'Installez l\'app pour une meilleure expérience hors-ligne.'}
            </p>

            {isIOS ? (
              <div className="mt-3 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                  <span className="flex items-center gap-1">
                    Appuyez sur <Share className="w-4 h-4 text-primary" />
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                  <span className="flex items-center gap-1">
                    Sélectionnez <Plus className="w-4 h-4 text-primary" /> "Sur l'écran d'accueil"
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="mt-3 w-full py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Installer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
