import React, { useState } from 'react';
import { Star, Send, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { useToast } from '../hooks/use-toast';
import { useLanguage } from '../contexts/LanguageContext';

export const ReviewForm: React.FC = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [projectType, setProjectType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Internal keys stored in database
  const PROJECT_TYPE_KEYS = ['website', 'discord_bot', 'other'] as const;
  
  const getProjectTypeLabel = (key: string) => {
    const labels: Record<string, string> = {
      'website': t('reviews.website'),
      'discord_bot': t('reviews.discord_bot'),
      'other': t('reviews.other')
    };
    return labels[key] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !session) {
      setAuthModalOpen(true);
      return;
    }

    if (!projectType) {
      toast({
        title: t('reviews.no_reviews'),
        description: t('reviews.filter_type'),
        variant: "destructive"
      });
      return;
    }

    if (reviewContent.trim().length === 0) {
      toast({
        title: t('reviews.no_reviews'),
        description: t('reviews.leave_review'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        rating: selectedRating,
        content: reviewContent.trim(),
        project_type: projectType
      });

    setIsSubmitting(false);

    if (error) {
      const isLimitError = error.message?.includes('limite de 10 avis');
      toast({
        title: t('reviews.no_reviews'),
        description: isLimitError 
          ? "Vous avez atteint la limite de 10 avis maximum" 
          : "Impossible de poster votre avis",
        variant: "destructive"
      });
    } else {
      toast({
        title: t('hero.reviewSuccess'),
        description: t('hero.reviewSuccessDesc')
      });
      setReviewContent('');
      setProjectType('');
      setSelectedRating(5);
    }
  };

  return (
    <>
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-border">
        {!user ? (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground mb-6">
              {t('reviews.login_required')}
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              {t('auth.discord_button')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                {t('hero.rating')}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star, index) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-all duration-200 ease-out hover:scale-125 active:scale-95"
                    style={{ transitionDelay: `${index * 30}ms` }}
                  >
                    <Star
                      className={`w-8 h-8 transition-all duration-200 ease-out ${
                        star <= (hoveredRating || selectedRating)
                          ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                          : 'text-gray-300 dark:text-gray-600 fill-transparent'
                      }`}
                      style={{ 
                        transform: star <= (hoveredRating || selectedRating) ? 'scale(1.1)' : 'scale(1)',
                        transition: `all 0.2s ease-out ${index * 30}ms`
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t('hero.projectType')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#9cd4e3] focus:border-transparent outline-none transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-left flex items-center justify-between"
                >
                  <span className={projectType ? 'text-foreground' : 'text-muted-foreground'}>
                    {projectType ? getProjectTypeLabel(projectType) : t('reviews.filter_type')}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                    {PROJECT_TYPE_KEYS.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setProjectType(key);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-[#9cd4e3]/20 transition-colors duration-200 ${
                          projectType === key 
                            ? 'bg-[#9cd4e3]/30 text-[#9cd4e3] font-semibold' 
                            : 'text-foreground'
                        }`}
                      >
                        {getProjectTypeLabel(key)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-foreground">
                  {t('hero.yourReview')} <span className="text-red-500">*</span>
                </label>
                <span className={`text-sm ${
                  reviewContent.length > 500 ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {reviewContent.length} / 500
                </span>
              </div>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder={t('hero.yourReview')}
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#9cd4e3] focus:border-transparent outline-none transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 text-foreground placeholder:text-muted-foreground resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || reviewContent.trim().length === 0 || !projectType}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? t('hero.submitting') : t('hero.submit')}</span>
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
