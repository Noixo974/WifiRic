import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  discord_id: string;
  username: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      console.log('Auth state changed:', event, newSession?.user?.id);
      setSession(newSession);
      
      if (newSession?.user?.id) {
        // Defer profile fetching to avoid blocking the auth state change
        setTimeout(() => {
          fetchUserProfile(newSession.user!.id);
        }, 0);
      } else {
        setUser(null);
      }
    });

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError('Erreur lors de la récupération de la session');
          setIsLoading(false);
          return;
        }

        setSession(currentSession);

        if (currentSession?.user?.id) {
          await fetchUserProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError('Erreur lors de l\'initialisation de l\'authentification');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setError('Erreur lors de la récupération du profil utilisateur');
        setUser(null);
        return;
      }

      if (!data) {
        console.warn('No profile found for user:', userId);
        setError('Profil utilisateur introuvable. Veuillez réessayer.');
        setUser(null);
        return;
      }

      setUser(data);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      setError('Erreur inattendue lors de la récupération du profil');
      setUser(null);
    }
  };

  const signInWithDiscord = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      if (error) {
        console.error('Discord OAuth error:', error);
        setError(`Erreur de connexion Discord: ${error.message}`);
        throw error;
      }
    } catch (error: any) {
      console.error('Error signing in with Discord:', error);
      setError(error?.message || 'Erreur lors de la connexion avec Discord');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        setError(`Erreur de déconnexion: ${error.message}`);
        throw error;
      }
      setUser(null);
      setSession(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error?.message || 'Erreur lors de la déconnexion');
      throw error;
    }
  };

  const refreshUser = async () => {
    if (session?.user.id) {
      setError(null);
      await fetchUserProfile(session.user.id);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, error, signInWithDiscord, signOut, refreshUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
