import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Mail, ExternalLink, ChevronDown } from 'lucide-react';

export const Contact: React.FC = () => {
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
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Message envoyé ! Nous vous recontacterons bientôt.');
    setFormData({ name: '', email: '', subject: '', message: '', projectType: 'website' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
              Contactez-Nous
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Prêt à démarrer votre projet ? Nous sommes là pour vous accompagner
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Options */}
          <div className="space-y-8">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
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

            <div className="bg-gradient-to-r from-[#9cd4e3]/10 to-blue-500/10 dark:from-[#9cd4e3]/5 dark:to-blue-500/5 rounded-2xl p-8 backdrop-blur-sm border border-[#9cd4e3]/20 hover:border-[#9cd4e3]/30 transition-all duration-300">
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-[#9cd4e3] to-blue-500 bg-clip-text text-transparent">
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
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-[#9cd4e3]/30 transition-all duration-300 hover:shadow-lg">
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