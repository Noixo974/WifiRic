import { useState, useEffect } from 'react';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect mobile
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());
    
    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if dismissed recently (only 1 hour for mobile to show more often)
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const dismissDuration = checkMobile() ? 1 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 1h mobile, 24h desktop
      if (Date.now() - dismissedTime < dismissDuration) {
        return () => window.removeEventListener('resize', handleResize);
      }
    }

    // Show prompt after a short delay
    const timer = setTimeout(() => setShowPrompt(true), 1500);

    // For other browsers, listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('resize', handleResize);
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

  // Mobile: Full-width banner at top
  if (isMobile) {
    return (
      <div className="fixed top-16 left-0 right-0 z-50 px-3 animate-slide-up-fade">
        <div className="glass-effect rounded-2xl p-3 border border-primary/40 shadow-neon bg-background/95 dark:bg-background/95">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-primary/20 transition-colors z-10"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-bold text-foreground text-sm">
                📲 Installer WifiRic
              </h3>
              {isIOS ? (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                  <Share className="w-3.5 h-3.5 text-primary inline" /> puis 
                  <Plus className="w-3.5 h-3.5 text-primary inline" /> "Sur l'écran d'accueil"
                </p>
              ) : (
                <button
                  onClick={handleInstall}
                  className="mt-1.5 py-1.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg transition-all duration-200 shadow-md hover:shadow-primary/30 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Installer maintenant
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Bottom right card
  return (
    <div className="fixed bottom-4 right-4 w-80 z-50 animate-slide-up-fade">
      <div className="glass-effect rounded-2xl p-4 border border-primary/30 shadow-neon bg-background/95 dark:bg-background/95">
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
