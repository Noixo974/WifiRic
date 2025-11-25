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
        setTimeout(async () => {
          await fetchUserProfile(newSession.user!.id);
          
          // Add user to Discord server after successful login and profile creation
          if (event === 'SIGNED_IN') {
            // Wait a bit longer to ensure the profile with access_token is created
            setTimeout(async () => {
              const { data: { session: freshSession } } = await supabase.auth.getSession();
              const accessToken = freshSession?.access_token;

              // Extract Discord token from multiple possible sources
              const identities = (freshSession as any)?.user?.identities || [];
              const firstIdentity = identities[0] || null;
              const identityAccessToken = firstIdentity?.identity_data?.access_token;

              const providerToken =
                (freshSession as any)?.provider_token ??
                identityAccessToken ??
                (freshSession as any)?.user?.user_metadata?.provider_token;

              try {
                // Update profile with provider token if available
                if (providerToken && freshSession?.user?.id) {
                  await supabase
                    .from('profiles')
                    .update({ discord_access_token: providerToken })
                    .eq('id', freshSession.user.id);
                  console.log('Updated profile.discord_access_token after SIGNED_IN');
                } else {
                  console.warn('No Discord provider token found in session');
                }

                // Check auto_join_discord preference before calling edge function
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('auto_join_discord')
                  .eq('id', freshSession.user.id)
                  .single();

                // Invoke edge function with Authorization header only if auto_join_discord is enabled
                if (accessToken && profile?.auto_join_discord) {
                  const { data, error } = await supabase.functions.invoke('add-user-to-discord-server', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                  });
                  if (error) {
                    console.error('Error adding user to Discord server (after login):', error);
                  } else {
                    console.log('Successfully added user to Discord server after login:', data);
                  }
                } else if (!profile?.auto_join_discord) {
                  console.log('Auto-join Discord is disabled for this user');
                } else {
                  console.warn('No access token available to call add-user-to-discord-server');
                }
              } catch (err) {
                console.error('Post-login Discord join flow error:', err);
              }
            }, 1000);
          }
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
          scopes: 'identify email guilds.join'
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
