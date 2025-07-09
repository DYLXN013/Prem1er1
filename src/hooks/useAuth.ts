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
          console.warn('useAuth: Auth loading timeout reached, setting loading to false');
          setLoading(false);
        }
      }, 8000); // Increased to 8 seconds to give more time
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
        console.log('useAuth: Getting initial auth session...');
        
        // Add timeout to initial session check
        const getCurrentUserPromise = auth.getCurrentUser();
        const timeoutPromise = new Promise<null>((_, reject) => {
          setTimeout(() => reject(new Error('Initial session check timed out after 5 seconds')), 5000);
        });

        const currentUser = await Promise.race([getCurrentUserPromise, timeoutPromise]);
        
        if (mounted) {
          console.log('useAuth: Initial session result:', currentUser ? 'User found' : 'No user');
          setUser(currentUser);
        }
      } catch (error) {
        console.error('useAuth: Error getting initial session:', error);
        if (error instanceof Error && error.message.includes('timed out')) {
          console.warn('useAuth: Initial session check timed out - continuing without user');
        }
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
      console.log('useAuth: Setting up auth state change listener...');
      const { data } = auth.onAuthStateChange(async (event, session) => {
        console.log('useAuth: Auth state change event:', event);
        console.log('useAuth: Session details:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email 
        });
        
        if (!mounted) {
          console.log('useAuth: Component unmounted, ignoring auth change');
          return;
        }
        
        // Clear timeout since we got a response
        clearLoadingTimeout();

        setSession(session);
        
        if (session?.user) {
          try {
            console.log('useAuth: Getting user details for session...');
            const currentUser = await auth.getCurrentUser();
            if (mounted) {
              console.log('useAuth: Setting user state:', currentUser ? 'User loaded' : 'User null');
              setUser(currentUser);
            }
          } catch (error) {
            console.error('useAuth: Error getting user after auth change:', error);
            if (mounted) {
              setUser(null);
            }
          }
        } else {
          console.log('useAuth: No session user, clearing user state');
          if (mounted) {
            setUser(null);
          }
        }
        
        if (mounted) {
          console.log('useAuth: Setting loading to false after auth change');
          setLoading(false);
        }
      });
      
      subscription = data?.subscription;
      console.log('useAuth: Auth state listener set up successfully');
    } catch (error) {
      console.error('useAuth: Error setting up auth state listener:', error);
      if (mounted) {
        clearLoadingTimeout();
        setLoading(false);
      }
    }

    return () => {
      console.log('useAuth: Cleaning up auth hook');
      mounted = false;
      clearLoadingTimeout();
      if (subscription) {
        try {
          subscription.unsubscribe();
          console.log('useAuth: Auth listener unsubscribed');
        } catch (error) {
          console.error('useAuth: Error unsubscribing from auth changes:', error);
        }
      }
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      console.log('useAuth: Starting signup process...');
      const result = await auth.signUp(email, password, username);
      console.log('useAuth: Signup result:', { 
        hasUser: !!result.user, 
        hasSession: !!result.session,
        userId: result.user?.id 
      });
      
      // If we have a session immediately, update the user state
      if (result.session) {
        console.log('useAuth: Session available immediately, getting user...');
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
        setSession(result.session);
        setLoading(false);
        console.log('useAuth: User state updated immediately after signup');
      } else {
        console.log('useAuth: No immediate session, waiting for auth state update...');
        // If no session, wait for the auth state change listener to handle it
        // However, in some cases (e.g. email confirmation required) the auth
        // state change event may not fire immediately. To prevent the UI from
        // being stuck in a perpetual loading state we proactively clear the
        // loading flag after the signup request has completed.
        setLoading(false);
      }
      
      return result;
    } catch (error) {
      console.error('useAuth: Signup error:', error);
      setLoading(false); // Set loading to false on error
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('useAuth: Starting signin process...');
      const result = await auth.signIn(email, password);
      console.log('useAuth: Signin successful, result:', result);
      
      // If we have a session immediately, update the user state
      if (result.session) {
        console.log('useAuth: Session available immediately, getting user...');
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
        setSession(result.session);
        setLoading(false);
        console.log('useAuth: User state updated immediately after signin');
      } else {
        console.log('useAuth: No immediate session, waiting for auth state update...');
      }
      
      return result;
    } catch (error) {
      console.error('useAuth: Signin error:', error);
      setLoading(false); // Set loading to false on error
      throw error;
    }
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