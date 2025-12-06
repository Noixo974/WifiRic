import React, { useState, useEffect, useRef } from 'react';
import { Mail, MessageSquare, Trash2, Calendar, User as UserIcon, ChevronLeft, ChevronRight, Star, Edit3, X, ChevronDown, Package, Globe, Bot, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from '../hooks/use-toast';
import { useLanguage } from '../contexts/LanguageContext';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  project_type: string;
  created_at: string;
  discord_channel_name: string | null;
}

interface Review {
  id: string;
  content: string;
  rating: number;
  project_type: string | null;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  order_id: string;
  order_type: string;
  site_type: string;
  site_type_other: string | null;
  site_name: string;
  description: string;
  status: string;
  created_at: string;
  discord_channel_name: string | null;
}

interface ProfileProps {
  onNavigateHome: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigateHome }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [autoJoinDiscord, setAutoJoinDiscord] = useState<boolean>(true);
  const [isUpdatingPreference, setIsUpdatingPreference] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const messagesPerPage = 5;
  const reviewsPerPage = 5;
  const ordersPerPage = 5;

  // Edit review modal state
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editProjectType, setEditProjectType] = useState('');
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
  const editDropdownRef = useRef<HTMLDivElement>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchPreferences();
    fetchReviews();
    fetchOrders();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editDropdownRef.current && !editDropdownRef.current.contains(event.target as Node)) {
        setIsEditDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const projectTypeOptions = [
    { value: 'website', label: t('reviews.website') || 'Site Internet', emoji: '🌐' },
    { value: 'discord_bot', label: t('reviews.discord_bot') || 'Bot Discord', emoji: '🤖' },
    { value: 'other', label: t('reviews.other') || 'Autre', emoji: '💡' }
  ];

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
        .select('id, name, email, subject, message, project_type, created_at, discord_channel_name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!user) return;

    try {
      setIsLoadingReviews(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setIsLoadingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_id, order_type, site_type, site_type_other, site_name, description, status, created_at, discord_channel_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoadingOrders(false);
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
        title: t('profile.preference_updated'),
        description: newValue 
          ? t('profile.auto_join_enabled')
          : t('profile.auto_join_disabled'),
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        variant: "destructive",
        title: t('profile.error'),
        description: t('profile.error_preference'),
      });
    } finally {
      setIsUpdatingPreference(false);
    }
  };

  const handleDeleteMessage = async (id: string, discordChannelName: string | null) => {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Send notification to Discord using the stored channel name
      try {
        const shortId = id.substring(0, 8);
        await supabase.functions.invoke('send-deletion-to-discord', {
          body: {
            type: 'contact',
            item_id: shortId,
            channel_name: discordChannelName,
          },
        });
      } catch (discordError) {
        console.error('Error sending deletion to Discord:', discordError);
      }

      setMessages(messages.filter(msg => msg.id !== id));
      toast({
        title: t('profile.message_deleted'),
        description: t('profile.message_deleted_desc'),
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: "destructive",
        title: t('profile.error'),
        description: t('profile.error_delete_message'),
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      setDeletingReviewId(id);
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReviews(reviews.filter(r => r.id !== id));
      toast({
        title: t('profile.review_deleted') || "Avis supprimé",
        description: t('profile.review_deleted_desc') || "Votre avis a été supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        variant: "destructive",
        title: t('profile.error'),
        description: t('profile.error_delete_review'),
      });
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleDeleteOrder = async (id: string, discordChannelName: string | null) => {
    try {
      setDeletingOrderId(id);
      
      // Find the order to get its order_id for the notification
      const orderToDelete = orders.find(o => o.id === id);
      const orderId = orderToDelete?.order_id || id.substring(0, 8);
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Send notification to Discord using the stored channel name
      try {
        await supabase.functions.invoke('send-deletion-to-discord', {
          body: {
            type: 'order',
            item_id: orderId,
            channel_name: discordChannelName,
          },
        });
      } catch (discordError) {
        console.error('Error sending deletion to Discord:', discordError);
      }

      setOrders(orders.filter(o => o.id !== id));
      toast({
        title: "Commande supprimée",
        description: "Votre commande a été supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        variant: "destructive",
        title: t('profile.error'),
        description: "Erreur lors de la suppression de la commande",
      });
    } finally {
      setDeletingOrderId(null);
    }
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setEditContent(review.content);
    setEditRating(review.rating);
    setEditProjectType(review.project_type || 'other');
  };

  const closeEditModal = () => {
    setEditingReview(null);
    setEditContent('');
    setEditRating(5);
    setEditProjectType('');
  };

  const handleSaveReview = async () => {
    if (!editingReview || !editContent.trim()) return;

    try {
      setIsSavingReview(true);
      const { error } = await supabase
        .from('reviews')
        .update({
          content: editContent.trim(),
          rating: editRating,
          project_type: editProjectType,
        })
        .eq('id', editingReview.id);

      if (error) throw error;

      setReviews(reviews.map(r => 
        r.id === editingReview.id 
          ? { ...r, content: editContent.trim(), rating: editRating, project_type: editProjectType }
          : r
      ));
      
      toast({
        title: t('profile.review_updated') || "Avis modifié",
        description: t('profile.review_updated_desc') || "Votre avis a été mis à jour avec succès",
      });
      closeEditModal();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        variant: "destructive",
        title: t('profile.error'),
        description: t('profile.error_update_review'),
      });
    } finally {
      setIsSavingReview(false);
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
    website: t('reviews.website') || 'Site Internet',
    discord_bot: t('reviews.discord_bot') || 'Bot Discord',
    'discord-bot': t('reviews.discord_bot') || 'Bot Discord',
    both: 'Les deux',
    other: t('reviews.other') || 'Autre',
  };

  // Pagination messages
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  // Pagination reviews
  const indexOfLastReview = currentReviewPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);

  // Pagination orders
  const indexOfLastOrder = currentOrderPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalOrderPages = Math.ceil(orders.length / ordersPerPage);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePreviousReviewPage = () => {
    setCurrentReviewPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextReviewPage = () => {
    setCurrentReviewPage(prev => Math.min(prev + 1, totalReviewPages));
  };

  const handlePreviousOrderPage = () => {
    setCurrentOrderPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextOrderPage = () => {
    setCurrentOrderPage(prev => Math.min(prev + 1, totalOrderPages));
  };

  const getSiteTypeIcon = (siteType: string) => {
    switch (siteType) {
      case 'vitrine':
        return <Globe className="w-4 h-4" />;
      case 'e-commerce':
        return <Package className="w-4 h-4" />;
      case 'bot-discord':
        return <Bot className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getSiteTypeLabel = (siteType: string, siteTypeOther: string | null) => {
    switch (siteType) {
      case 'vitrine':
        return 'Site Vitrine';
      case 'e-commerce':
        return 'E-commerce';
      case 'bot-discord':
        return 'Bot Discord';
      case 'autre':
        return siteTypeOther || 'Autre';
      default:
        return siteType;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
      case 'in_progress':
        return { label: 'En cours', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'completed':
        return { label: 'Terminé', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
      case 'cancelled':
        return { label: 'Annulé', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' };
    }
  };

  if (!user) {
    return (
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {t('profile.unauthorized')}
          </h2>
          <button
            onClick={onNavigateHome}
            className="px-6 py-3 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            {t('profile.back_home')}
          </button>
        </div>
      </section>
    );
  }

  const avatarUrl = user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop';

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-12">
          <button
            onClick={onNavigateHome}
            className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 md:mb-8"
          >
            ← {t('profile.back_home')}
          </button>

          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-6 md:mb-8">
              <img
                src={avatarUrl}
                alt={user.username}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-[#9cd4e3]"
              />
              <div className="text-center sm:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {user.username}
                </h1>
                <div className="space-y-1 text-sm md:text-base text-gray-600 dark:text-gray-300">
                  <p className="flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  <p className="flex items-center justify-center sm:justify-start gap-2">
                    <UserIcon className="w-4 h-4" />
                    ID Discord: {user.discord_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Section Préférences Discord */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('profile.discord_preferences')}
              </h2>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white mb-1">
                    {t('profile.auto_join_discord')}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    {t('profile.auto_join_desc')}
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

        <div className="space-y-6 md:space-y-8">
          {/* Section Avis */}
          <div>
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 fill-current" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('profile.your_reviews') || 'Vos avis'} ({reviews.length})
              </h2>
            </div>

            {isLoadingReviews ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-[#9cd4e3] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">{t('profile.loading')}</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
                <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {t('profile.no_reviews') || "Vous n'avez pas encore laissé d'avis"}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 md:space-y-4">
                  {currentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-[#9cd4e3]/30 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            {review.project_type && (
                              <span className="inline-flex px-3 py-1 bg-gradient-to-r from-[#9cd4e3]/20 to-blue-500/20 text-[#9cd4e3] rounded-full text-sm font-medium w-fit">
                                {projectTypeLabels[review.project_type] || review.project_type}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(review)}
                            className="p-2 text-[#9cd4e3] hover:bg-[#9cd4e3]/10 rounded-lg transition-colors"
                            title={t('profile.edit_review') || "Modifier l'avis"}
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingReviewId === review.id}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t('profile.delete_review') || "Supprimer l'avis"}
                          >
                            {deletingReviewId === review.id ? (
                              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words italic">
                        "{review.content}"
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Reviews */}
                {totalReviewPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                      onClick={handlePreviousReviewPage}
                      disabled={currentReviewPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:border-[#9cd4e3]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t('profile.previous')}
                    </button>
                    
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('profile.page_of').replace('{current}', String(currentReviewPage)).replace('{total}', String(totalReviewPages))}
                    </span>
                    
                    <button
                      onClick={handleNextReviewPage}
                      disabled={currentReviewPage === totalReviewPages}
                      className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:border-[#9cd4e3]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('profile.next')}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section Commandes */}
          <div>
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-[#9cd4e3]" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Vos commandes ({orders.length})
              </h2>
            </div>

            {isLoadingOrders ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-[#9cd4e3] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">{t('profile.loading')}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Vous n'avez pas encore passé de commande
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 md:space-y-4">
                  {currentOrders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    return (
                      <div
                        key={order.id}
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-[#9cd4e3]/30 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {order.site_name}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#9cd4e3]/20 to-blue-500/20 text-[#9cd4e3] rounded-full text-sm font-medium">
                                  {getSiteTypeIcon(order.site_type)}
                                  {getSiteTypeLabel(order.site_type, order.site_type_other)}
                                </span>
                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                                  {statusBadge.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                #{order.order_id}
                              </span>
                              <span className="hidden sm:inline">•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(order.created_at)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteOrder(order.id, order.discord_channel_name)}
                            disabled={deletingOrderId === order.id}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Supprimer la commande"
                          >
                            {deletingOrderId === order.id ? (
                              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                          {order.description}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Orders */}
                {totalOrderPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                      onClick={handlePreviousOrderPage}
                      disabled={currentOrderPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:border-[#9cd4e3]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t('profile.previous')}
                    </button>
                    
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('profile.page_of').replace('{current}', String(currentOrderPage)).replace('{total}', String(totalOrderPages))}
                    </span>
                    
                    <button
                      onClick={handleNextOrderPage}
                      disabled={currentOrderPage === totalOrderPages}
                      className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:border-[#9cd4e3]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('profile.next')}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section Messages */}
          <div>
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-[#9cd4e3]" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('profile.your_messages')} ({messages.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-[#9cd4e3] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">{t('profile.loading')}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {t('profile.no_messages')}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 md:space-y-4">
                  {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-[#9cd4e3]/30 transition-all duration-300 hover:shadow-lg"
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
                        onClick={() => handleDeleteMessage(message.id, message.discord_channel_name)}
                        disabled={deletingId === message.id}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('profile.delete_message')}
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
                      {t('profile.previous')}
                    </button>
                    
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('profile.page_of').replace('{current}', String(currentPage)).replace('{total}', String(totalPages))}
                    </span>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:border-[#9cd4e3]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('profile.next')}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'édition d'avis */}
      {editingReview && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          <div className="relative z-[9999] w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('profile.edit_review')}
              </h3>
              <button
                onClick={closeEditModal}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hero.rating')}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star, index) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className="p-1 transition-all duration-200 ease-out hover:scale-125 active:scale-95"
                      style={{ transitionDelay: `${index * 30}ms` }}
                    >
                      <Star 
                        className={`w-8 h-8 transition-all duration-200 ease-out ${
                          star <= editRating 
                            ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        style={{ 
                          transform: star <= editRating ? 'scale(1.1)' : 'scale(1)',
                          transition: `all 0.2s ease-out ${index * 30}ms`
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hero.projectType')}
                </label>
                <div className="relative" ref={editDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsEditDropdownOpen(!isEditDropdownOpen)}
                    className="w-full px-4 py-3.5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#9cd4e3] focus:border-[#9cd4e3] outline-none transition-all duration-300 hover:border-[#9cd4e3] hover:shadow-xl hover:shadow-[#9cd4e3]/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-gray-800 dark:text-white font-semibold text-left flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="transition-transform duration-300 group-hover:scale-110">
                        {projectTypeOptions.find(pt => pt.value === editProjectType)?.emoji || '💡'}
                      </span>
                      <span>
                        {projectTypeOptions.find(pt => pt.value === editProjectType)?.label || t('reviews.other')}
                      </span>
                    </span>
                    <ChevronDown className={`w-6 h-6 text-[#9cd4e3] transition-transform duration-300 group-hover:scale-110 ${isEditDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isEditDropdownOpen && (
                    <div className="absolute z-[10000] w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                      {projectTypeOptions.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => {
                            setEditProjectType(type.value);
                            setIsEditDropdownOpen(false);
                          }}
                          className={`group w-full px-4 py-3.5 text-left flex items-center gap-3 transition-all duration-200 font-medium hover:scale-[1.02] active:scale-[0.98] ${
                            editProjectType === type.value
                              ? 'bg-gradient-to-r from-[#9cd4e3]/20 to-blue-500/20 text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#9cd4e3]/10 hover:to-blue-500/10'
                          }`}
                        >
                          <span className="transition-transform duration-300 group-hover:scale-110">{type.emoji}</span>
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('hero.yourReview')}
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#9cd4e3] focus:border-[#9cd4e3] outline-none transition-all resize-none text-gray-900 dark:text-white shadow-sm"
                  placeholder={t('hero.yourReview')}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('profile.cancel')}
                </button>
                <button
                  onClick={handleSaveReview}
                  disabled={isSavingReview || !editContent.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingReview ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('hero.submitting')}
                    </>
                  ) : (
                    t('profile.save')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
