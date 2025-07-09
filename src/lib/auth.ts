import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  join_date?: string;
}

export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, username: string) => {
    console.log('Auth: Starting signup for email:', email);
    console.log('Auth: Username:', username);
    console.log('Auth: Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    
    try {
      // Skip the connection test that was causing hangs
      console.log('Auth: Making signup request to Supabase...');
      
      // Add timeout to the signup request
      const signupPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      // Add a timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Signup request timed out after 15 seconds')), 15000);
      });

      const { data, error } = await Promise.race([signupPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Auth: Signup error from Supabase:', error);
        console.error('Auth: Error details:', {
          message: error.message,
          status: error.status,
          statusCode: error.status_code
        });
        throw error;
      }

      console.log('Auth: Signup successful, data:', { 
        user: !!data.user, 
        session: !!data.session,
        userId: data.user?.id,
        userEmail: data.user?.email,
        emailConfirmed: data.user?.email_confirmed_at
      });

      // Only try to create profile if we have a user but no session
      // (which would indicate email verification is required)
      if (data.user && data.session) {
        console.log('Auth: User signed up with immediate session - profile should be created by trigger');
      } else if (data.user && !data.session) {
        console.log('Auth: User created but no session - email verification likely required');
      }

      return data;
    } catch (error) {
      console.error('Auth: Signup process failed:', error);
      if (error instanceof Error) {
        console.error('Auth: Error name:', error.name);
        console.error('Auth: Error message:', error.message);
        console.error('Auth: Error stack:', error.stack);
      }
      throw error;
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    console.log('Auth: Starting signin for email:', email);
    
    try {
      const signinPromise = supabase.auth.signInWithPassword({
        email,
        password
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Signin request timed out after 10 seconds')), 10000);
      });

      const { data, error } = await Promise.race([signinPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Auth: Signin error:', error);
        throw error;
      }
      
      console.log('Auth: Signin successful');
      return data;
    } catch (error) {
      console.error('Auth: Signin process failed:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    try {
      console.log('Auth: Getting current user...');
      // First, try to get the current session from local storage (no network call)
      const {
        data: { session: localSession }
      } = await supabase.auth.getSession();

      let supabaseUser = localSession?.user;

      // If no user was found in the local session, fall back to a network call
      if (!supabaseUser) {
        console.log('Auth: No user found in local session. Falling back to remote getUser() call...');
        const {
          data: { user: remoteUser }
        } = await supabase.auth.getUser();
        supabaseUser = remoteUser ?? undefined;
      }

      if (!supabaseUser) {
        console.log('Auth: No current user found after all checks');
        return null;
      }

      console.log('Auth: User found, getting profile...');

      // Get profile data - use maybeSingle() to handle cases where profile doesn't exist
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Auth: Error getting profile:', profileError);
      }

      const authUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        username: profile?.username || (supabaseUser.user_metadata as any)?.username || undefined,
        avatar_url: profile?.avatar_url || undefined,
        join_date: profile?.join_date || undefined
      };

      console.log('Auth: Current user loaded:', {
        id: authUser.id,
        email: authUser.email,
        username: authUser.username
      });
      return authUser;
    } catch (error) {
      console.error('Auth: Error in getCurrentUser:', error);
      return null;
    }
  },

  // Update profile
  updateProfile: async (updates: Partial<Pick<AuthUser, 'username' | 'avatar_url'>>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};