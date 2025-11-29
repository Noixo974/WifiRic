import React, { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink, Code, Bot, Palette, Star, Quote, TrendingUp, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ReviewForm } from './ReviewForm';

interface HeroProps {
  onNavigateToServices?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateToServices }) => {
  const [currentText, setCurrentText] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const texts = [
    "Sites Internet adaptés à vos besoins et à vos moyens financiers",
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

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles(username, avatar_url)
      `)
      .order('created_at', { ascending: false });
      
    if (data && !error) {
      setAllReviews(data);
      setTotalReviews(data.length);
      
      if (data.length > 0) {
        const avg = data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length;
        setAverageRating(avg);
      }
      
      // Apply filters
      applyFilters(data, selectedRating, selectedProjectType);
    }
  };

  const applyFilters = (data: any[], rating: number | null, projectType: string | null) => {
    let filtered = [...data];
    
    if (rating !== null) {
      filtered = filtered.filter(r => r.rating === rating);
    }
    
    if (projectType !== null) {
      filtered = filtered.filter(r => r.project_type === projectType);
    }
    
    setReviews(filtered);
    setCurrentReviewIndex(0);
  };

  const handleRatingFilter = (rating: number | null) => {
    setSelectedRating(rating);
    applyFilters(allReviews, rating, selectedProjectType);
  };

  const handleProjectTypeFilter = (type: string | null) => {
    setSelectedProjectType(type);
    applyFilters(allReviews, selectedRating, type);
  };

  const clearFilters = () => {
    setSelectedRating(null);
    setSelectedProjectType(null);
    setReviews(allReviews);
    setCurrentReviewIndex(0);
  };

  const hasActiveFilters = selectedRating !== null || selectedProjectType !== null;

  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  const goToNextReviews = () => {
    setCurrentReviewIndex((prev) => {
      const next = prev + 1;
      return next >= reviews.length ? 0 : next;
    });
  };

  const goToPreviousReviews = () => {
    setCurrentReviewIndex((prev) => 
      prev === 0 ? reviews.length - 1 : prev - 1
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        goToNextReviews();
      } else {
        goToPreviousReviews();
      }
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    // Trigger cascade animation after a brief delay
    const loadTimeout = setTimeout(() => {
      setHasLoaded(true);
    }, 100);
    
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length);
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(loadTimeout);
    };
  }, []);

  useEffect(() => {
    fetchReviews();
    
    const channel = supabase
      .channel('reviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Re-apply filters when selection changes
  useEffect(() => {
    if (allReviews.length > 0) {
      applyFilters(allReviews, selectedRating, selectedProjectType);
    }
  }, [selectedRating, selectedProjectType]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling || reviews.length <= visibleCount) return;
    
    const interval = setInterval(() => {
      goToNextReviews();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoScrolling, reviews.length, currentReviewIndex, visibleCount]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newCount = getVisibleCount();
      setVisibleCount(newCount);
      if (currentReviewIndex >= reviews.length) {
        setCurrentReviewIndex(0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentReviewIndex, reviews.length]);

  return (
    <div className="relative">
      {/* Section Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#9cd4e3]/10 to-blue-100/30 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center min-h-[80vh]">
            {/* Contenu à gauche */}
            <div 
              className={`transform transition-all duration-700 ${
                hasLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 leading-tight text-left">
                <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
                  WifiRic
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#9cd4e3] to-blue-500 bg-clip-text text-transparent">
                  Créateur Digital 
                </span>
              </h1>
              
              <div className="h-12 md:h-16 flex items-center mb-4 md:mb-8">
                <p className="text-base sm:text-lg md:text-2xl text-gray-600 dark:text-gray-300 font-light transition-all duration-300">
                  {texts[currentText]}
                </p>
              </div>
              
              <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 mb-6 md:mb-12 leading-relaxed text-left">
                Nous créons des sites internet ou bots discord selon vos besoins !  <br></br>
                Des sites web modernes ou anciens aux bots Discord complexes, nous transformons vos idées en réalité.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-start">
                <a
                  href="https://discord.gg/9mKPA3kHBA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#9cd4e3]/50 hover:scale-105 active:scale-95 text-sm md:text-base"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-[#9cd4e3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center space-x-2">
                    <span>Rejoindre notre Discord</span>
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </span>
                </a>

                <button
                  onClick={onNavigateToServices}
                  className="group relative px-6 py-3 md:px-8 md:py-4 border-2 border-[#9cd4e3] text-[#9cd4e3] font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#9cd4e3]/30 hover:scale-105 active:scale-95 text-sm md:text-base"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#9cd4e3] to-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center justify-center space-x-2 group-hover:text-white transition-colors duration-300">
                    <span>Découvrir nos services</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </div>
            </div>

            {/* Logo à droite */}
            <div 
              className={`flex justify-center lg:justify-end transform transition-all duration-700 ${
                hasLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="relative">
                <img 
                  src="https://i.ibb.co/dxm3TCb/Logo.png" 
                  alt="WifiRic Logo" 
                  className="h-48 sm:h-64 md:h-80 lg:h-96 transition-all duration-300 filter drop-shadow-2xl animate-float"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#9cd4e3]/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Nos Services */}
      <section id="nos-services" className="py-12 md:py-20 bg-white dark:bg-gray-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`text-left mb-8 md:mb-16 transform transition-all duration-700 ${
              hasLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
                Nos Services
              </span>
            </h2>
            <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
              Des solutions digitales complètes pour transformer votre présence en ligne
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group relative bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-gray-200/50 dark:border-gray-600/50 hover:border-[#9cd4e3]/50 transition-all duration-700 hover:shadow-xl hover:-translate-y-2 ${
                  hasLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${700 + index * 150}ms` }}
              >
                <div className={`inline-flex p-3 md:p-4 bg-gradient-to-r ${service.gradient} rounded-xl mb-4 md:mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <service.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4 text-gray-800 dark:text-white group-hover:text-[#9cd4e3] transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Nos Avis */}
      <section className="py-12 md:py-20 bg-gray-100 dark:bg-gray-700 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`text-left mb-6 md:mb-8 transform transition-all duration-700 ${
              hasLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '1300ms' }}
          >
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              <h2 className="text-3xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
                  Nos Avis
                </span>
              </h2>
              
              {totalReviews > 0 && (
                <div className="flex items-center gap-1 md:gap-2 group relative">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 md:w-6 md:h-6 ${
                          star <= Math.round(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <span className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-semibold">
                    ({totalReviews})
                  </span>
                  
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {averageRating.toFixed(2)} / 5
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mt-2 md:mt-4">
              Ce que nos clients disent de notre travail
            </p>
          </div>

          {/* Filters Section */}
          {allReviews.length > 0 && (
            <div 
              className={`mb-6 md:mb-8 transform transition-all duration-700 ${
                hasLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: '1500ms' }}
            >
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-[#9cd4e3] text-sm md:text-base"
              >
                <Filter className="w-4 h-4 md:w-5 md:h-5 text-[#9cd4e3]" />
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  Filtres
                </span>
                {hasActiveFilters && (
                  <span className="ml-1 px-2 py-0.5 bg-[#9cd4e3] text-white text-xs rounded-full">
                    {(selectedRating ? 1 : 0) + (selectedProjectType ? 1 : 0)}
                  </span>
                )}
              </button>

              {showFilters && (
                <div className="mt-4 p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 animate-fade-in">
                  <div className="flex flex-col gap-4 md:gap-6">
                    {/* Rating Filters */}
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Note
                      </h3>
                      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        <button
                          onClick={() => handleRatingFilter(null)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            selectedRating === null
                              ? 'bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Toutes
                        </button>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleRatingFilter(rating)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-1 ${
                              selectedRating === rating
                                ? 'bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {rating} <Star className="w-4 h-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Project Type Filters */}
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <Code className="w-4 h-4 text-[#9cd4e3]" />
                        Type de projet
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleProjectTypeFilter(null)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            selectedProjectType === null
                              ? 'bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Tous
                        </button>
                        <button
                          onClick={() => handleProjectTypeFilter('Sites Web')}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            selectedProjectType === 'Sites Web'
                              ? 'bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Sites Web
                        </button>
                        <button
                          onClick={() => handleProjectTypeFilter('Bot Discord')}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            selectedProjectType === 'Bot Discord'
                              ? 'bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Bot Discord
                        </button>
                        <button
                          onClick={() => handleProjectTypeFilter('Autre')}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            selectedProjectType === 'Autre'
                              ? 'bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Autre
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
                      >
                        <X className="w-4 h-4" />
                        Réinitialiser les filtres
                      </button>
                    </div>
                  )}

                  {/* Results count */}
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    {reviews.length} avis {hasActiveFilters ? 'correspondent aux filtres' : 'au total'}
                  </div>
                </div>
              )}
            </div>
          )}

          {reviews.length === 0 ? (
            <div 
              className={`text-center py-12 transform transition-all duration-700 ${
                hasLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: '1700ms' }}
            >
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Aucun avis pour le moment. Soyez le premier à partager votre expérience !
              </p>
            </div>
          ) : (
            <div 
              className={`relative transform transition-all duration-700 ${
                hasLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: '1700ms' }}
              onMouseEnter={() => setIsAutoScrolling(false)}
              onMouseLeave={() => setIsAutoScrolling(true)}
            >
              {reviews.length > visibleCount && (
                <button
                  onClick={() => {
                    goToPreviousReviews();
                    setIsAutoScrolling(false);
                  }}
                  className="absolute left-1 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-4 lg:-translate-x-6 z-10 bg-white dark:bg-gray-800 p-2 md:p-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-600 hover:border-[#9cd4e3] hover:bg-gradient-to-r hover:from-[#9cd4e3]/10 hover:to-blue-500/10"
                  aria-label="Avis précédents"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-[#9cd4e3]" />
                </button>
              )}
              
              <div 
                className="overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ 
                    transform: `translateX(-${(currentReviewIndex % reviews.length) * (100 / visibleCount)}%)` 
                  }}
                >
                  {[...reviews, ...reviews.slice(0, visibleCount)].map((review, idx) => (
                    <div
                      key={`${review.id}-${idx}`}
                      className="flex-shrink-0 px-2 md:px-4"
                      style={{ width: `${100 / visibleCount}%` }}
                    >
                      <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-600/50 hover:border-[#9cd4e3]/50 h-full animate-fade-in">
                        <div className="absolute top-6 right-6 text-[#9cd4e3] opacity-20 group-hover:opacity-40 group-hover:rotate-12 transition-all duration-300">
                          <Quote className="w-8 h-8" />
                        </div>
                        
                        <div className="flex items-center mb-4 md:mb-6">
                          <img
                            src={review.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + review.profiles?.username}
                            alt={review.profiles?.username || 'User'}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover mr-3 md:mr-4 ring-2 ring-[#9cd4e3]/20 group-hover:ring-4 group-hover:ring-[#9cd4e3]/40 transition-all duration-300"
                          />
                          <div>
                            <h4 className="font-bold text-sm md:text-base text-gray-800 dark:text-white">
                              {review.profiles?.username || 'Utilisateur'}
                            </h4>
                            {review.project_type && (
                              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                {review.project_type}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex mb-3 md:mb-4">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-200" style={{ transitionDelay: `${i * 50}ms` }} />
                          ))}
                        </div>
                        
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed italic line-clamp-4 md:line-clamp-none">
                          "{review.content}"
                        </p>
                        
                        <p className="text-xs text-gray-400 mt-3 md:mt-4">
                          {new Date(review.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {reviews.length > visibleCount && (
                <button
                  onClick={() => {
                    goToNextReviews();
                    setIsAutoScrolling(false);
                  }}
                  className="absolute right-1 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-4 lg:translate-x-6 z-10 bg-white dark:bg-gray-800 p-2 md:p-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-600 hover:border-[#9cd4e3] hover:bg-gradient-to-r hover:from-[#9cd4e3]/10 hover:to-blue-500/10"
                  aria-label="Avis suivants"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-[#9cd4e3]" />
                </button>
              )}

              {/* Pagination Dots */}
              {reviews.length > visibleCount && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: reviews.length }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentReviewIndex(idx);
                        setIsAutoScrolling(false);
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        idx === currentReviewIndex % reviews.length
                          ? 'w-8 h-3 bg-gradient-to-r from-[#9cd4e3] to-blue-500'
                          : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-[#9cd4e3]/50'
                      }`}
                      aria-label={`Aller à l'avis ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section Poster un avis */}
      <section className="py-10 md:py-16 bg-white dark:bg-gray-800 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`text-center mb-6 md:mb-10 transform transition-all duration-700 ${
              hasLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '1900ms' }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
              <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
                Partagez votre expérience
              </span>
            </h2>
            <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300">
              Vous avez travaillé avec nous ? Laissez-nous votre avis !
            </p>
          </div>
          
          <div 
            className={`transform transition-all duration-700 ${
              hasLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: '2100ms' }}
          >
            <ReviewForm />
          </div>
        </div>
      </section>
    </div>
  );
};