import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({
  user: null,
  guardianProfile: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [guardianProfile, setGuardianProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch guardian profile details from public.guardians
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile might not exist yet (e.g. first OAuth login)
        console.warn('Guardian profile not found, will attempt to create:', error.message);
        setGuardianProfile(null);
        return null;
      } else {
        setGuardianProfile(data);
        return data;
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setGuardianProfile(null);
      return null;
    }
  };

  // Ensure a guardian profile row exists for any authenticated user
  // This handles both email signup and OAuth flows
  const ensureGuardianProfile = async (authUser) => {
    const existing = await fetchProfile(authUser.id);
    if (existing) return; // Profile already exists

    // Build profile from available user metadata
    const meta = authUser.user_metadata || {};
    const name = meta.full_name || meta.name || meta.display_name || authUser.email?.split('@')[0] || 'Guardian';
    const email = authUser.email || '';
    const phone = meta.phone || '';

    try {
      const { error: insertError } = await supabase
        .from('guardians')
        .insert({
          id: authUser.id,
          name,
          email,
          phone,
        });

      if (insertError) {
        // Could be a duplicate key if profile was created in a race condition
        if (insertError.code === '23505') {
          // Profile exists (duplicate), just fetch it
          await fetchProfile(authUser.id);
        } else {
          console.error('Failed to create guardian profile:', insertError.message);
        }
      } else {
        // Successfully created — now fetch it
        await fetchProfile(authUser.id);
      }
    } catch (err) {
      console.error('Error ensuring guardian profile:', err);
    }
  };

  useEffect(() => {
    let initialized = false;

    // 1. Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await ensureGuardianProfile(session.user);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
      } finally {
        initialized = true;
        setLoading(false);
      }
    };

    initializeAuth();

    // Safety net: if getSession() or ensureGuardianProfile() hangs for > 8 seconds, force loading to false
    const safetyTimeout = setTimeout(() => {
      if (!initialized) {
        console.warn('Auth initialization timed out — forcing loading to false');
        initialized = true;
        setLoading(false);
      }
    }, 8000);

    // 2. Listen for auth changes (login, logout, token refresh, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip INITIAL_SESSION — already handled by getSession() above
        if (event === 'INITIAL_SESSION') return;

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setGuardianProfile(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);

          // On sign-in or OAuth callback, ensure profile exists
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await ensureGuardianProfile(session.user);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Sign up a new Guardian with email/password
  const signUp = async (email, password, name, phone) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Pass user metadata so it's available immediately
          data: {
            full_name: name,
            phone: phone,
          },
          // Skip email confirmation redirect — land back on our app
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      // Supabase returns a user with identities=[] when email confirmation is pending
      if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
        // Email confirmation is enabled in Supabase — user needs to verify
        return {
          data,
          error: null,
          needsConfirmation: true,
          message: 'Please check your email and click the confirmation link to activate your account.',
        };
      }

      // If email confirmation is disabled, user is immediately authenticated
      if (data?.user && data.user.identities && data.user.identities.length > 0) {
        // Create guardian profile immediately
        try {
          const { error: profileError } = await supabase
            .from('guardians')
            .insert({
              id: data.user.id,
              name,
              email,
              phone: phone || '',
            });

          if (profileError && profileError.code !== '23505') {
            console.error('Profile creation error:', profileError.message);
          }
        } catch (profileErr) {
          console.error('Profile insert exception:', profileErr);
        }
      }

      return { data, error: null, needsConfirmation: false };
    } catch (error) {
      console.error('Sign-up failed:', error.message);
      return { data: null, error, needsConfirmation: false };
    }
  };

  // Sign in existing Guardian with email/password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign-in failed:', error.message);
      return { data: null, error };
    }
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Google sign-in failed:', error.message);
      return { data: null, error };
    }
  };

  // Secure sign-out (purges local session cookies/state)
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign-out failed:', error.message);
    } finally {
      // Always clear local state even if Supabase call fails
      setUser(null);
      setGuardianProfile(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        guardianProfile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
