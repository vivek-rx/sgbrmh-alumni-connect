import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import toast from 'react-hot-toast';

// Define the Alumni type directly here to avoid import issues
export interface Alumni {
  id: string;
  email: string;
  name: string;
  batch_year: number;
  profile_photo_url?: string | null;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'prefer_not_to_say' | null;
  date_of_birth?: string | null;
  age?: number | null;
  bio?: string | null;
  whatsapp_number?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
  snapchat_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  current_city?: string | null;
  current_country?: string | null;
  role?: 'admin' | 'alumni' | 'student' | 'guest';
  verified?: boolean;
  profile_completed?: boolean;
  last_active?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Alumni | null;
  loading: boolean;
  signUp: (email: string, password: string, profileData: Partial<Alumni>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  emergencySignOut: () => void;
  updateProfile: (updates: Partial<Alumni>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('🔐 AuthProvider: Initializing...');
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Alumni | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔐 AuthProvider: Initial state set, loading:', loading);

  useEffect(() => {
    console.log('🔍 Auth: Initializing auth state...');
    
    // Set a maximum timeout to prevent infinite loading
    const maxLoadingTimeout = setTimeout(() => {
      console.log('⏰ Auth: Maximum loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 15000); // 15 second timeout
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Auth: Initial session check:', session ? 'Session found' : 'No session');
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('🔍 Auth: User found, fetching profile...');
        fetchProfile(session.user.id);
      } else {
        console.log('🔍 Auth: No user, setting loading to false');
        setLoading(false);
      }
      clearTimeout(maxLoadingTimeout);
    }).catch((error) => {
      console.error('❌ Auth: Error getting initial session:', error);
      setLoading(false);
      clearTimeout(maxLoadingTimeout);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 Auth: Auth state changed:', event, session ? 'Session exists' : 'No session');
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('🔍 Auth: User authenticated, fetching profile...');
        try {
          await fetchProfile(session.user.id);
        } catch (error) {
          console.error('❌ Auth: Error fetching profile on auth change:', error);
          setLoading(false);
        }
      } else {
        console.log('🔍 Auth: User signed out, clearing profile');
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(maxLoadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log('🔍 Auth: Fetching profile for user ID:', userId);
    console.log('🔍 Auth: User ID type:', typeof userId, 'length:', userId.length);
    
    try {
      // First, let's try to query the table to see if it's accessible
      console.log('🔍 Auth: Attempting to query alumni table...');
      
      const { data, error, count } = await supabase
        .from('alumni')
        .select('*', { count: 'exact' })
        .eq('id', userId)
        .single();

      console.log('🔍 Auth: Query response:', { data, error, count });
      console.log('🔍 Auth: Error details:', error?.message, error?.code, error?.details);

      if (error) {
        console.error('❌ Auth: Error fetching profile:', error);
        // If no profile exists, create a basic one or handle gracefully
        if (error.code === 'PGRST116') {
          console.log('⚠️ Auth: No profile found, user might need to complete registration');
          setProfile(null);
        } else {
          console.error('❌ Auth: Database error:', error);
          setProfile(null);
        }
      } else {
        console.log('✅ Auth: Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('❌ Auth: Profile fetch failed with exception:', error);
      setProfile(null);
    } finally {
      console.log('🏁 Auth: Setting loading to false after profile fetch attempt');
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, profileData: Partial<Alumni>) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile in alumni table
        const { error: profileError } = await supabase
          .from('alumni')
          .insert({
            id: authData.user.id,
            email,
            ...profileData,
            profile_completed: false,
          });

        if (profileError) throw profileError;
      }
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    console.log('🔓 Signing out user...');
    
    // Set a timeout for the signOut operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SignOut timeout')), 5000);
    });
    
    try {
      // Race between signOut and timeout
      const signOutPromise = supabase.auth.signOut();
      await Promise.race([signOutPromise, timeoutPromise]);
      console.log('✅ Supabase sign out completed');
    } catch (error) {
      console.error('❌ Sign out error (will continue anyway):', error);
    }
    
    console.log('🧹 Clearing local auth state...');
    
    // Always clear local state regardless of Supabase response
    setUser(null);
    setProfile(null);
    setLoading(false);
    
    console.log('🏠 Redirecting to home...');
    
    // Force redirect immediately
    window.location.href = '/';
  };

  // Emergency logout that completely bypasses Supabase
  const emergencySignOut = () => {
    console.log('🚨 Emergency sign out triggered');
    
    // Clear all auth state immediately
    setUser(null);
    setProfile(null);
    setLoading(false);
    
    // Clear any localStorage/sessionStorage auth data
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 Cleared all storage');
    } catch (e) {
      console.log('⚠️ Could not clear storage:', e);
    }
    
    // Force redirect
    window.location.href = '/';
  };

  const updateProfile = async (updates: Partial<Alumni>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('alumni')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    emergencySignOut,
    updateProfile,
  };

  console.log('🔐 AuthProvider: Creating context value with:', {
    user: user ? { id: user.id, email: user.email } : null,
    profile: profile ? { id: profile.id, name: profile.name } : null,
    loading,
    hasSignUp: !!signUp,
    hasSignIn: !!signIn,
    hasSignOut: !!signOut,
    hasUpdateProfile: !!updateProfile
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  console.log('🔐 useAuth: Hook called, context exists:', !!context);
  
  if (context === undefined) {
    console.error('❌ useAuth: Hook used outside AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  console.log('🔐 useAuth: Returning context with:', {
    user: context.user ? { id: context.user.id, email: context.user.email } : null,
    profile: context.profile ? { id: context.profile.id, name: context.profile.name } : null,
    loading: context.loading,
    hasSignOut: !!context.signOut
  });
  
  return context;
}