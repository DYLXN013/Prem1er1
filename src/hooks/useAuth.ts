import { useState, useEffect } from 'react';
import { auth, type AuthUser } from '../lib/auth';
import type { Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let mounted = true;

    // Set a timeout to ensure loading doesn't persist indefinitely
    const setLoadingTimeout = () => {
      timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn('Auth loading timeout reached, setting loading to false');
          setLoading(false);
        }
      }, 5000); // Reduced to 5 seconds for faster feedback
    };

    const clearLoadingTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial auth session...');
        const currentUser = await auth.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          console.log('Initial auth check completed:', currentUser ? 'User found' : 'No user');
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          clearLoadingTimeout();
          setLoading(false);
        }
      }
    };

    // Start timeout and initial session check
    setLoadingTimeout();
    getInitialSession();

    // Listen for auth changes
    let subscription: any = null;
    
    try {
      const { data } = auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session ? 'Session present' : 'No session');
        
        if (!mounted) return;
        
        // Clear timeout since we got a response
        clearLoadingTimeout();

        setSession(session);
        
        if (session?.user) {
          try {
            const currentUser = await auth.getCurrentUser();
            if (mounted) {
              setUser(currentUser);
            }
          } catch (error) {
            console.error('Error getting user after auth change:', error);
            if (mounted) {
              setUser(null);
            }
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      });
      
      subscription = data?.subscription;
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      if (mounted) {
        clearLoadingTimeout();
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
      clearLoadingTimeout();
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth changes:', error);
        }
      }
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      console.log('useAuth: Starting signup process...');
      const result = await auth.signUp(email, password, username);
      console.log('useAuth: Signup successful, result:', result);
      console.log('useAuth: Waiting for auth state update...');
      
      // Wait for the auth state to be updated by the listener
      return result;
    } catch (error) {
      console.error('useAuth: Signup error:', error);
      setLoading(false); // Set loading to false on error
      throw error;
    }
    // Don't set loading to false here - let the auth state change listener handle it
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('useAuth: Starting signin process...');
      const result = await auth.signIn(email, password);
      console.log('useAuth: Signin successful, result:', result);
      console.log('useAuth: Waiting for auth state update...');
      
      // Wait for the auth state to be updated by the listener
      return result;
    } catch (error) {
      console.error('useAuth: Signin error:', error);
      setLoading(false); // Set loading to false on error
      throw error;
    }
    // Don't set loading to false here - let the auth state change listener handle it
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<AuthUser, 'username' | 'avatar_url'>>) => {
    if (!user) throw new Error('Not authenticated');
    
    await auth.updateProfile(updates);
    
    // Update local user state
    setUser({ ...user, ...updates });
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user
  };
};