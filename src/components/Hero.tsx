import React, { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink, Code, Bot, Palette, Zap, Star, Quote } from 'lucide-react';

interface HeroProps {
  onNavigateToServices?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateToServices }) => {
  const [animateText, setAnimateText] = useState(false);
  const [currentText, setCurrentText] = useState(0);
  
  const texts = [
    "Sites Internet adaptés à vos besoins",
    "Bots Discord personnalisés selon vos besoins", 
    "Expériences Digitales Uniques"
  ];

  const services = [
    {
      icon: Code,
      title: 'Sites Web',
      description: 'Développement Full-Stack de sites internet (Front-End et Back-End).',
      gradient: 'from-blue-500 to-[#9cd4e3]'
    },
    {
      icon: Bot,
      title: 'Bots Discord',
      description: 'Création de bots Discord personnalisés pour automatiser et enrichir votre communauté.',
      gradient: 'from-[#9cd4e3] to-green-500'
    },
    {
      icon: Palette,
      title: 'Design UI/UX',
      description: 'Interfaces utilisateur élégantes avec animations et micro-interactions immersives.',
      gradient: 'from-purple-500 to-[#9cd4e3]'
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Solutions optimisées pour une vitesse et une sécurité maximales selons vos demandes.',
      gradient: 'from-[#9cd4e3] to-yellow-500'
    }
  ];

  const testimonials = [
    {
      name: '(Prenom + Initiale.)',
      role: '(Project)',
      content: 'Avis',
      rating: 3,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&=crop'
    },
    {
      name: '(Prenom + Initiale.)',
      role: '(Project)',
      content: 'Avis',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: '(Prenom + Initiale.)',
      role: '(Project)',
      content: 'Avis',
      rating: 4,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  useEffect(() => {
    setAnimateText(true);
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Section Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#9cd4e3]/10 to-blue-100/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Contenu à gauche */}
            <div className={`transform transition-all duration-500 ${animateText ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-left">
                <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
                  WifiRic
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#9cd4e3] to-blue-500 bg-clip-text text-transparent">
                  Créateur Digital 
                </span>
              </h1>
              
              <div className="h-16 flex items-center mb-8">
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light transition-all duration-300">
                  {texts[currentText]}
                </p>
              </div>
              
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 leading-relaxed text-left">
                Nous créons des sites internet ou bots discord selon vos besoins !  <br></br>
                Des sites web modernes ou anciens aux bots Discord complexes, nous transformons vos idées en réalité.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-start">
                <a
                  href="https://discord.gg/9mKPA3kHBA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#9cd4e3]/50 hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-[#9cd4e3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center space-x-2">
                    <span>Rejoindre notre Discord</span>
                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </span>
                </a>

                <button
                  onClick={onNavigateToServices}
                  className="group relative px-8 py-4 border-2 border-[#9cd4e3] text-[#9cd4e3] font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#9cd4e3]/30 hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#9cd4e3] to-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center justify-center space-x-2 group-hover:text-white transition-colors duration-300">
                    <span>Découvrir nos services</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </div>
            </div>

            {/* Logo à droite */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img 
                  src="https://i.ibb.co/4nXx45XS/Logo.png" 
                  alt="WifiRic Logo" 
                  className="h-64 md:h-80 lg:h-96 transition-all duration-300 filter drop-shadow-2xl animate-float"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#9cd4e3]/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Nos Services */}
      <section id="nos-services" className="py-20 bg-white dark:bg-gray-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
                Nos Services
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
              Des solutions digitales complètes pour transformer votre présence en ligne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-600/50 hover:border-[#9cd4e3]/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className={`inline-flex p-4 bg-gradient-to-r ${service.gradient} rounded-xl mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white group-hover:text-[#9cd4e3] transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Nos Avis */}
      <section className="py-20 bg-gray-100 dark:bg-gray-700 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
                Nos Avis
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
              Ce que nos clients disent de notre travail ?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-600/50 hover:border-[#9cd4e3]/50"
              >
                <div className="absolute top-6 right-6 text-[#9cd4e3] opacity-20 group-hover:opacity-40 transition-opacity">
                  <Quote className="w-8 h-8" />
                </div>
                
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4 ring-2 ring-[#9cd4e3]/20"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <a
              href="https://discord.gg/9mKPA3kHBA"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#9cd4e3]/50 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-[#9cd4e3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Rejoignez nos clients satisfaits</span>
              <ArrowRight className="w-5 h-5 ml-2 relative group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};