import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Trash2, Calendar, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from '../hooks/use-toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  project_type: string;
  created_at: string;
}

interface ProfileProps {
  onNavigateHome: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigateHome }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [autoJoinDiscord, setAutoJoinDiscord] = useState<boolean>(true);
  const [isUpdatingPreference, setIsUpdatingPreference] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

  useEffect(() => {
    fetchMessages();
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('auto_join_discord')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setAutoJoinDiscord(data.auto_join_discord);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoJoin = async () => {
    if (!user) return;
    
    try {
      setIsUpdatingPreference(true);
      const newValue = !autoJoinDiscord;
      
      const { error } = await supabase
        .from('profiles')
        .update({ auto_join_discord: newValue })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setAutoJoinDiscord(newValue);
      toast({
        title: "Préférence mise à jour",
        description: newValue 
          ? "Vous rejoindrez automatiquement le serveur Discord" 
          : "Vous ne rejoindrez plus automatiquement le serveur Discord",
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour la préférence",
      });
    } finally {
      setIsUpdatingPreference(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessages(messages.filter(msg => msg.id !== id));
      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le message",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const projectTypeLabels: Record<string, string> = {
    website: 'Site Internet',
    'discord-bot': 'Bot Discord',
    both: 'Les deux',
    other: 'Autre',
  };

  // Pagination
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (!user) {
    return (
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Accès non autorisé
          </h2>
          <button
            onClick={onNavigateHome}
            className="px-6 py-3 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </section>
    );
  }

  const avatarUrl = user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop';

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <button
            onClick={onNavigateHome}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
          >
            ← Retour à l'accueil
          </button>

          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <img
                src={avatarUrl}
                alt={user.username}
                className="w-24 h-24 rounded-full border-4 border-[#9cd4e3]"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {user.username}
                </h1>
                <div className="space-y-1 text-gray-600 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    ID Discord: {user.discord_id}
                  </p>
          </div>
        </div>

        {/* Section Préférences Discord */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Préférences Discord
          </h2>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1 mr-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Rejoindre automatiquement le serveur Discord
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lorsque activé, vous rejoindrez automatiquement notre serveur Discord lors de la connexion ou de l'envoi d'un message.
              </p>
            </div>
            
            <button
              onClick={handleToggleAutoJoin}
              disabled={isUpdatingPreference}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0
                ${autoJoinDiscord ? 'bg-gradient-to-r from-[#9cd4e3] to-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                ${isUpdatingPreference ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${autoJoinDiscord ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-6 h-6 text-[#9cd4e3]" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Vos messages ({messages.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-[#9cd4e3] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Aucun message envoyé pour le moment
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-[#9cd4e3]/30 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {message.subject}
                          </h3>
                          <span className="inline-flex px-3 py-1 bg-gradient-to-r from-[#9cd4e3]/20 to-blue-500/20 text-[#9cd4e3] rounded-full text-sm font-medium w-fit">
                            {projectTypeLabels[message.project_type]}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {message.email}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        disabled={deletingId === message.id}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer le message"
                      >
                        {deletingId === message.id ? (
                          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {message.message}
                    </div>
                  </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:border-[#9cd4e3]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </button>
                    
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} sur {totalPages}
                    </span>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:border-[#9cd4e3]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
