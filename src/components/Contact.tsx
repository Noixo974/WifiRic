import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Mail, ExternalLink, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from '../hooks/use-toast';

export const Contact: React.FC = () => {
  const { user, session, signInWithDiscord } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    projectType: 'website'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const projectTypes = [
    { value: 'website', label: 'Site Internet', emoji: '🌐' },
    { value: 'discord-bot', label: 'Bot Discord', emoji: '🤖' },
    { value: 'both', label: 'Les deux', emoji: '✨' },
    { value: 'other', label: 'Autre', emoji: '💡' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.subject.trim()) newErrors.subject = 'Le sujet est requis';
    if (!formData.message.trim()) newErrors.message = 'Le message est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !session) {
      setShowLoginPrompt(true);
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Sauvegarder dans la base de données
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([
          {
            user_id: session.user.id,
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            project_type: formData.projectType,
          },
        ]);

      if (dbError) throw dbError;

      // Envoyer sur Discord
      const { error: discordError } = await supabase.functions.invoke('send-contact-to-discord', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          project_type: formData.projectType,
        },
      });

      if (discordError) {
        console.error('Erreur Discord:', discordError);
        // Ne pas bloquer si Discord échoue
      }

      // Check auto_join_discord preference before adding user to Discord server
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('auto_join_discord')
          .eq('id', session.user.id)
          .single();

        if (profile?.auto_join_discord) {
          console.log('Calling add-user-to-discord-server from Contact');
          const token = session?.access_token;
          if (token) {
            const { error } = await supabase.functions.invoke('add-user-to-discord-server', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (error) {
              console.error('Error adding user to Discord server:', error);
            }
          } else {
            console.warn('No session token to call add-user-to-discord-server from Contact');
          }
        } else {
          console.log('Auto-join Discord is disabled for this user (Contact form)');
        }
      } catch (error) {
        console.error('Error adding user to Discord server:', error);
      }

      // Show success toast
      toast({
        title: "Demande envoyée avec succès !",
        description: "Nous vous répondrons dans les 48h sur notre Discord : WifiRic",
      });
      
      setFormData({ name: '', email: '', subject: '', message: '', projectType: 'website' });
    } catch (error) {
      console.error('Error submitting message:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'envoi du message. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  if (showLoginPrompt) {
    return (
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
                Connexion Requise
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Veuillez vous connecter avec votre compte Discord pour envoyer un message
            </p>
            <button
              onClick={() => signInWithDiscord()}
              className="group relative bg-gradient-to-r from-[#5865F2] to-[#4752C4] text-white font-semibold py-4 px-8 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#5865F2]/50 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center space-x-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.445.864-.608 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.397-.875-.609-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.08.08 0 00.087-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.294.075.075 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 01.079.009c.12.098.246.198.373.295a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.699.772 1.365 1.225 1.994a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-4.467.151-8.35-.885-12.467a.07.07 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.931-2.157 2.157-2.157 1.226 0 2.157.964 2.157 2.157 0 1.191-.931 2.157-2.157 2.157zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.931-2.157 2.157-2.157 1.226 0 2.157.964 2.157 2.157 0 1.191-.931 2.157-2.157 2.157z" />
              </svg>
              <span>Connexion avec Discord</span>
            </button>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="ml-4 px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
              Contactez-Nous
            </span>
          </h2>
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-300">
            Prêt à démarrer votre projet ? Nous sommes là pour vous accompagner
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Contact Options */}
          <div className="space-y-4 md:space-y-8">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Méthodes de Contact
              </h3>
              
              <div className="space-y-6">
                <a
                  href="https://discord.gg/9mKPA3kHBA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center p-4 bg-gradient-to-r from-[#9cd4e3]/10 to-blue-500/10 rounded-xl overflow-hidden transition-all duration-300 border border-[#9cd4e3]/20 hover:border-[#9cd4e3]/50 hover:shadow-xl hover:shadow-[#9cd4e3]/20 hover:-translate-y-1 active:translate-y-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#9cd4e3]/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-3 bg-gradient-to-r from-[#9cd4e3] to-blue-500 rounded-lg mr-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className="relative flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white transition-colors">
                      Discord (Recommandé)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Rejoignez notre serveur pour un support instantané
                    </p>
                  </div>
                  <ExternalLink className="relative w-5 h-5 text-gray-400 group-hover:text-[#9cd4e3] transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>

                <div className="flex items-center p-4 bg-gradient-to-r from-gray-100/50 to-gray-200/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:border-gray-300/50 dark:hover:border-gray-500/50 transition-all duration-300">
                  
                  <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg mr-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Email</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Utilisez le formulaire ci-contre
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#9cd4e3]/10 to-blue-500/10 dark:from-[#9cd4e3]/5 dark:to-blue-500/5 rounded-2xl p-5 md:p-8 backdrop-blur-sm border border-[#9cd4e3]/20 hover:border-[#9cd4e3]/30 transition-all duration-300">
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-[#9cd4e3] to-blue-500 bg-clip-text text-transparent">
                Pourquoi choisir WifiRic ?
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-center transition-colors duration-300">
                  <div className="w-2 h-2 bg-[#9cd4e3] rounded-full mr-3"></div>
                  Support réactif et personnalisé
                </li>
                <li className="flex items-center transition-colors duration-300">
                  <div className="w-2 h-2 bg-[#9cd4e3] rounded-full mr-3"></div>
                  Technologies de pointe
                </li>
                <li className="flex items-center transition-colors duration-300">
                  <div className="w-2 h-2 bg-[#9cd4e3] rounded-full mr-3"></div>
                  Satisfaction client garantie
                </li>
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-[#9cd4e3] to-blue-500 bg-clip-text text-transparent">
                Tarifs ?
              </h3>
                                <li className="flex items-center transition-colors duration-300">
                  <div className="w-2 h-2 bg-[#9cd4e3] rounded-full mr-3"></div>
                  Le devis de votre Site Internet/Bot Discord sera gratuit.
                </li>
                                               <li className="flex items-center transition-colors duration-300">
                  <div className="w-2 h-2 bg-[#9cd4e3] rounded-full mr-3"></div>
                  En fonction de votre demande, le tarif sera adapté.
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-[#9cd4e3]/30 transition-all duration-300 hover:shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-lg focus:ring-2 focus:ring-[#9cd4e3] focus:border-transparent outline-none transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                    placeholder="Votre nom"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-lg focus:ring-2 focus:ring-[#9cd4e3] focus:border-transparent outline-none transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                    placeholder="votre@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de projet
                </label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#9cd4e3] focus:border-[#9cd4e3] outline-none transition-all duration-300 hover:border-[#9cd4e3] hover:shadow-xl hover:shadow-[#9cd4e3]/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-gray-800 dark:text-white font-semibold text-left flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="transition-transform duration-300 group-hover:scale-110">{projectTypes.find(pt => pt.value === formData.projectType)?.emoji}</span>
                      <span>{projectTypes.find(pt => pt.value === formData.projectType)?.label}</span>
                    </span>
                    <ChevronDown className={`w-6 h-6 text-[#9cd4e3] transition-transform duration-300 group-hover:scale-110 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                      {projectTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, projectType: type.value }));
                            setIsDropdownOpen(false);
                          }}
                          className={`group w-full px-4 py-3.5 text-left flex items-center gap-3 transition-all duration-200 font-medium hover:scale-[1.02] active:scale-[0.98] ${
                            formData.projectType === type.value
                              ? 'bg-gradient-to-r from-[#9cd4e3]/20 to-blue-500/20 text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#9cd4e3]/10 hover:to-blue-500/10'
                          }`}
                        >
                          <span className="text-xl transition-transform duration-200 group-hover:scale-125 group-hover:rotate-12">{type.emoji}</span>
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sujet *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-lg focus:ring-2 focus:ring-[#9cd4e3] focus:border-transparent outline-none transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 ${errors.subject ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                  placeholder="Sujet de votre message"
                />
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border rounded-lg focus:ring-2 focus:ring-[#9cd4e3] focus:border-transparent outline-none transition-all duration-300 resize-none hover:bg-white/80 dark:hover:bg-gray-700/80 ${errors.message ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                  placeholder="Décrivez votre projet en détail..."
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold py-4 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#9cd4e3]/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-[#9cd4e3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isSubmitting ? (
                  <div className="relative w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="relative w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    <span className="relative">Envoyer le message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};