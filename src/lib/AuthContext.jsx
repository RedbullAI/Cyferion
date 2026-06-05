import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [guardianProfile, setGuardianProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the guardian profile row from DB
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch error:', error.message);
        setGuardianProfile(null);
        return null;
      }
      setGuardianProfile(data);
      return data;
    } catch (err) {
      console.error('Failed to load profile:', err);
      setGuardianProfile(null);
      return null;
    }
  };

  // Ensure a guardian profile row exists for any authenticated user
  const ensureGuardianProfile = async (authUser) => {
    if (!authUser?.id) return;

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
        if (insertError.code === '23505') {
          // Duplicate key — profile was created by database trigger, just fetch it
          await fetchProfile(authUser.id);
        } else {
          console.warn('Profile creation error (non-fatal):', insertError.message);
          // Don't block — the user can still use the app, profile will be retried next session
        }
      } else {
        await fetchProfile(authUser.id);
      }
    } catch (err) {
      console.warn('Error ensuring guardian profile (non-fatal):', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          setUser(session.user);
          await ensureGuardianProfile(session.user);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Safety timeout — ALWAYS resolve loading after 5 seconds
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return;

        if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setGuardianProfile(null);
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          setUser(session.user);
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await ensureGuardianProfile(session.user);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email/password and create guardian profile
  const signUp = async (email, password, fullName, phone) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
        },
      });
      if (error) throw error;

      const needsConfirmation = !data.session;

      if (data.user && data.session) {
        setUser(data.user);
        // Create guardian profile immediately
        try {
          await supabase.from('guardians').insert({
            id: data.user.id,
            name: fullName,
            email,
            phone: phone || '',
          });
          await fetchProfile(data.user.id);
        } catch (profileErr) {
          console.warn('Profile creation during signup:', profileErr);
        }
      }

      return { data, error: null, needsConfirmation };
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
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Google sign-in failed:', error.message);
      return { data: null, error };
    }
  };

  // Secure sign-out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign-out failed:', error.message);
    } finally {
      setUser(null);
      setGuardianProfile(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    guardianProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
