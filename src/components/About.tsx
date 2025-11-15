import React, { useEffect, useRef, useState } from 'react';
import { Code, Bot, Palette, TrendingUp } from 'lucide-react';

export const About: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Code,
      title: 'Développement Web',
      description: 'Des sites web adaptés à vos besoins et à vos demandes, pour donner vie à tout ce que vous imaginez.',
      gradient: 'from-blue-500 to-[#9cd4e3]'
    },
    {
      icon: Bot,
      title: 'Bots Discord',
      description: 'Automatisation et fonctionnalités personnalisées pour votre communauté.',
      gradient: 'from-[#9cd4e3] to-green-500'
    },
    {
      icon: Palette,
      title: 'Design Futuriste',
      description: 'Interfaces utilisateur élégantes avec animations et micro-interactions et site sécurisées et optimisées pour garantir une meilleur expèriences utilisateur',
      gradient: 'from-purple-500 to-[#9cd4e3]'
    },
    {
      icon: TrendingUp,
      title: 'Coût',
      description: 'Des tarifs adaptés à vos besoins, avec des prix avantageux pour tous vos projets..',
      gradient: 'from-[#9cd4e3] to-yellow-500'
    }
  ];

  return (
    <section ref={ref} className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
              WifiRic - Notre Vision
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Chez WifiRic, nous repoussons les limites du développement pour créer des expériences 
            exceptionnelles qui marquent l'avenir du web et des communautés Discord.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 transform cursor-pointer will-change-transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} hover:-translate-y-2 hover:shadow-lg hover:border-[#9cd4e3]/50 transition-all duration-200 ease-out hover:scale-[1.02]`}
            >
              <div className={`inline-flex p-4 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6 transition-all duration-200 ease-out group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white transition-colors duration-200 group-hover:text-[#9cd4e3]">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className={`mt-20 text-center transform transition-all duration-500 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative bg-gradient-to-r from-[#9cd4e3]/10 to-blue-500/10 dark:from-[#9cd4e3]/5 dark:to-blue-500/5 rounded-2xl p-12 backdrop-blur-sm border border-[#9cd4e3]/20 hover:border-[#9cd4e3]/30 transition-all duration-300">
            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#9cd4e3] to-blue-500 bg-clip-text text-transparent">
              Prêt à transformer votre projet ?
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300">
              Rejoignez notre communauté Discord et découvrez comment nous pouvons vous aider 
              à créer quelque chose d'extraordinaire.
            </p>
            <a
              href="https://discord.gg/9mKPA3kHBA"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#9cd4e3]/50 hover:scale-110 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-[#9cd4e3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative group-hover:tracking-wide transition-all duration-300">Démarrer maintenant</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};