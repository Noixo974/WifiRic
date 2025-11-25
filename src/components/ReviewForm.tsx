import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { useToast } from '../hooks/use-toast';

export const ReviewForm: React.FC = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [projectType, setProjectType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !session) {
      setAuthModalOpen(true);
      return;
    }

    if (reviewContent.trim().length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez écrire un avis",
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
        project_type: projectType.trim() || null
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de poster votre avis",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Avis posté !",
        description: "Merci pour votre retour !"
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
              Connectez-vous pour partager votre expérience
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Votre note
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform duration-300 ease-out hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-all duration-300 ease-out ${
                        star <= (hoveredRating || selectedRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600 fill-transparent'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Type de projet (optionnel)
              </label>
              <input
                type="text"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder="Ex: Site Web, Bot Discord, Design..."
                className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#9cd4e3] focus:border-transparent outline-none transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-foreground">
                  Votre avis
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
                placeholder="Partagez votre expérience avec WifiRic..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#9cd4e3] focus:border-transparent outline-none transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 text-foreground placeholder:text-muted-foreground resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || reviewContent.trim().length === 0}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Envoi en cours...' : 'Publier mon avis'}</span>
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
