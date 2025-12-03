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
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    if (isIOSDevice) {
      setActiveTab('ios');
    } else if (isAndroidDevice) {
      setActiveTab('android');
    }

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
      title: t('install.benefit1.title'),
      description: t('install.benefit1.desc')
    },
    {
      icon: Wifi,
      title: t('install.benefit2.title'),
      description: t('install.benefit2.desc')
    },
    {
      icon: Bell,
      title: t('install.benefit3.title'),
      description: t('install.benefit3.desc')
    },
    {
      icon: Shield,
      title: t('install.benefit4.title'),
      description: t('install.benefit4.desc')
    }
  ];

  const androidSteps = [
    {
      step: 1,
      icon: Chrome,
      title: t('install.android.step1.title'),
      description: t('install.android.step1.desc')
    },
    {
      step: 2,
      icon: MoreVertical,
      title: t('install.android.step2.title'),
      description: t('install.android.step2.desc')
    },
    {
      step: 3,
      icon: Download,
      title: t('install.android.step3.title'),
      description: t('install.android.step3.desc')
    },
    {
      step: 4,
      icon: CheckCircle2,
      title: t('install.android.step4.title'),
      description: t('install.android.step4.desc')
    }
  ];

  const iosSteps = [
    {
      step: 1,
      icon: Smartphone,
      title: t('install.ios.step1.title'),
      description: t('install.ios.step1.desc')
    },
    {
      step: 2,
      icon: Share,
      title: t('install.ios.step2.title'),
      description: t('install.ios.step2.desc')
    },
    {
      step: 3,
      icon: Plus,
      title: t('install.ios.step3.title'),
      description: t('install.ios.step3.desc')
    },
    {
      step: 4,
      icon: CheckCircle2,
      title: t('install.ios.step4.title'),
      description: t('install.ios.step4.desc')
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
            {t('install.installed')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t('install.installed_desc')}
          </p>
          <button
            onClick={onNavigateHome}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:scale-105"
          >
            {t('install.back_home')}
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
            {t('install.title')} <span className="text-primary">WifiRic</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('install.subtitle')}
          </p>
        </div>

        {/* Quick Install Button (if available) */}
        {deferredPrompt && (
          <div className="mb-12 p-6 md:p-8 glass-effect rounded-2xl border border-primary/30 shadow-neon text-center">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
              {t('install.quick_install')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('install.quick_install_desc')}
            </p>
            <button
              onClick={handleInstall}
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30 flex items-center gap-3 mx-auto"
            >
              <Download className="w-6 h-6" />
              {t('install.install_now')}
            </button>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            {t('install.why_install')}
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
            {t('install.guide')}
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
              {t('install.android')}
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
              {t('install.ios')}
            </button>
          </div>

          {/* Device Detection Notice */}
          {(isAndroid || isIOS) && (
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{t('install.detected')}</span>{' '}
                {isIOS ? t('install.device_ios') : t('install.device_android')}
                {' '}{t('install.instructions_shown')}
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
                    <h4 className="font-bold text-foreground mb-1">{t('install.android.tip')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('install.android.tip_desc')}
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
                    <h4 className="font-bold text-foreground mb-1">{t('install.ios.important')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('install.ios.important_desc')}
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
            {t('install.back_home')}
          </button>
        </div>
      </div>
    </div>
  );
};
