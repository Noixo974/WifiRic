import { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Share, 
  Plus, 
  MoreVertical, 
  Chrome, 
  CheckCircle2,
  Zap,
  Wifi,
  Bell,
  Shield
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallProps {
  onNavigateHome: () => void;
}

export const Install = ({ onNavigateHome }: InstallProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'auto' | 'android' | 'ios'>('auto');

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect device
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Set default tab based on device
    if (isIOSDevice) {
      setActiveTab('ios');
    } else if (isAndroidDevice) {
      setActiveTab('android');
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const benefits = [
    {
      icon: Zap,
      title: 'Chargement instantané',
      description: 'L\'app se lance en une fraction de seconde, sans attendre le navigateur.'
    },
    {
      icon: Wifi,
      title: 'Mode hors-ligne',
      description: 'Accédez aux pages déjà visitées même sans connexion internet.'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Recevez des alertes sur les nouveautés et mises à jour importantes.'
    },
    {
      icon: Shield,
      title: 'Sécurisé',
      description: 'Connexion HTTPS et données protégées comme sur le site web.'
    }
  ];

  const androidSteps = [
    {
      step: 1,
      icon: Chrome,
      title: 'Ouvrez Chrome',
      description: 'Assurez-vous d\'être sur Chrome ou un navigateur compatible.'
    },
    {
      step: 2,
      icon: MoreVertical,
      title: 'Menu du navigateur',
      description: 'Appuyez sur les trois points en haut à droite du navigateur.'
    },
    {
      step: 3,
      icon: Download,
      title: 'Installer l\'application',
      description: 'Sélectionnez "Installer l\'application" ou "Ajouter à l\'écran d\'accueil".'
    },
    {
      step: 4,
      icon: CheckCircle2,
      title: 'Confirmer',
      description: 'Appuyez sur "Installer" dans la boîte de dialogue qui apparaît.'
    }
  ];

  const iosSteps = [
    {
      step: 1,
      icon: Smartphone,
      title: 'Ouvrez Safari',
      description: 'L\'installation PWA ne fonctionne qu\'avec Safari sur iOS.'
    },
    {
      step: 2,
      icon: Share,
      title: 'Bouton Partager',
      description: 'Appuyez sur l\'icône de partage en bas de l\'écran (carré avec flèche).'
    },
    {
      step: 3,
      icon: Plus,
      title: 'Sur l\'écran d\'accueil',
      description: 'Faites défiler et appuyez sur "Sur l\'écran d\'accueil".'
    },
    {
      step: 4,
      icon: CheckCircle2,
      title: 'Ajouter',
      description: 'Appuyez sur "Ajouter" en haut à droite pour confirmer.'
    }
  ];

  if (isInstalled) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Application installée !
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            WifiRic est déjà installé sur votre appareil. Retrouvez-le sur votre écran d'accueil.
          </p>
          <button
            onClick={onNavigateHome}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:scale-105"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
            <Download className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Installer <span className="text-primary">WifiRic</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Ajoutez WifiRic à votre écran d'accueil pour une expérience optimale, comme une vraie application native.
          </p>
        </div>

        {/* Quick Install Button (if available) */}
        {deferredPrompt && (
          <div className="mb-12 p-6 md:p-8 glass-effect rounded-2xl border border-primary/30 shadow-neon text-center">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
              Installation rapide disponible
            </h2>
            <p className="text-muted-foreground mb-6">
              Votre navigateur supporte l'installation automatique. Cliquez pour installer en un clic !
            </p>
            <button
              onClick={handleInstall}
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30 flex items-center gap-3 mx-auto"
            >
              <Download className="w-6 h-6" />
              Installer maintenant
            </button>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            Pourquoi installer l'app ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-5 md:p-6 glass-effect rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-neon group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Tabs */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
            Guide d'installation
          </h2>
          
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab('android')}
              className={`px-4 md:px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'android'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Android
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`px-4 md:px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'ios'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              iPhone / iPad
            </button>
          </div>

          {/* Device Detection Notice */}
          {(isAndroid || isIOS) && (
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Détecté :</span>{' '}
                {isIOS ? 'Appareil iOS (iPhone/iPad)' : 'Appareil Android'}
                {' - Les instructions correspondantes sont affichées ci-dessous.'}
              </p>
            </div>
          )}

          {/* Android Instructions */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              {androidSteps.map((step, index) => (
                <div
                  key={index}
                  className="p-5 md:p-6 glass-effect rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-up-fade"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <step.icon className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-foreground text-lg">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Visual Hint for Android */}
              <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Astuce</h4>
                    <p className="text-sm text-muted-foreground">
                      Si vous voyez une bannière "Ajouter WifiRic à l'écran d'accueil" en bas de l'écran, 
                      appuyez dessus pour une installation encore plus rapide !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* iOS Instructions */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              {iosSteps.map((step, index) => (
                <div
                  key={index}
                  className="p-5 md:p-6 glass-effect rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-up-fade"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <step.icon className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-foreground text-lg">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Important Notice for iOS */}
              <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Important pour iOS</h4>
                    <p className="text-sm text-muted-foreground">
                      L'installation sur iPhone et iPad nécessite obligatoirement Safari. 
                      Chrome, Firefox et autres navigateurs ne supportent pas cette fonctionnalité sur iOS.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center pt-8">
          <button
            onClick={onNavigateHome}
            className="px-8 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl transition-all duration-300 hover:scale-105"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};
