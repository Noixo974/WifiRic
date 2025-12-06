import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Loader2, Mail, User, Calendar, MessageSquare, FileText, ArrowLeft, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '../hooks/use-toast';

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

interface AdminProps {
  onNavigateHome: () => void;
}

export const Admin: React.FC<AdminProps> = ({ onNavigateHome }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10;

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
        fetchMessages();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
      setCheckingRole(false);
    };

    checkAdminRole();
  }, [user]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('id, name, email, subject, message, project_type, created_at, discord_channel_name')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des messages:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const handleDeleteMessage = async (messageId: string, discordChannelName: string | null) => {
    setDeletingId(messageId);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      // Send notification to Discord using the stored channel name
      try {
        const shortId = messageId.substring(0, 8);
        await supabase.functions.invoke('send-deletion-to-discord', {
          body: {
            type: 'contact',
            item_id: shortId,
            channel_name: discordChannelName,
          },
        });
      } catch (discordError) {
        console.error('Error sending deletion to Discord:', discordError);
        // Don't block deletion if Discord notification fails
      }

      setMessages(messages.filter(msg => msg.id !== messageId));
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
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Accès refusé</h2>
          <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette page.</p>
          <button
            onClick={onNavigateHome}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Accès refusé</h2>
          <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <button
            onClick={onNavigateHome}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={onNavigateHome}
              className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <h1 className="text-4xl font-bold text-foreground mb-2">Panneau d'administration</h1>
            <p className="text-muted-foreground">Gérez tous les messages de contact reçus</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total de messages</p>
            <p className="text-3xl font-bold text-primary">{messages.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun message de contact pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentMessages.map((message) => (
              <div
                key={message.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">{message.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <a
                      href={`mailto:${message.email}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {message.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{message.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-between md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{formatDate(message.created_at)}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteMessage(message.id, message.discord_channel_name)}
                      disabled={deletingId === message.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === message.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-1">Type de projet:</p>
                  <p className="text-muted-foreground mb-3">{message.project_type}</p>
                  
                  <p className="text-sm font-semibold text-foreground mb-1">Message:</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{message.message}</p>
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
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </button>
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};
