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
  college_name?: string | null;
  profession?: string | null;
  company_name?: string | null;
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
  latitude?: number | null;
  longitude?: number | null;
  country_code?: string | null;
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
  // Fetch profile for a given userId
  const fetchProfile = async (userId: string) => {
    console.log('🔍 Auth: Fetching profile for user ID:', userId);
    try {
      const { data, error } = await supabase
        .from('alumni')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('❌ Auth: Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('❌ Auth: Profile fetch failed with exception:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };
  console.log('🔐 AuthProvider: Initializing...');
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Alumni | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔐 AuthProvider: Initial state set, loading:', loading);

  useEffect(() => {
    console.log('🔍 Auth: Initializing auth state...');
    
    // Restore session on mount
    const restoreSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        fetchProfile(data.session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };
    restoreSession();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

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

    console.log('🔍 Auth updateProfile: Starting update process...');
    console.log('🔍 Auth updateProfile: User ID:', user.id);
    console.log('🔍 Auth updateProfile: User email:', user.email);
    console.log('🔍 Auth updateProfile: Updates to apply:', updates);

    try {
      // Let's try a simple existence check first with timeout
      console.log('🔍 Auth updateProfile: Testing basic table access...');
      
      const testPromise = supabase
        .from('alumni')
        .select('count(*)')
        .limit(1);
      
      const testTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Basic table access timeout')), 5000);
      });

      try {
        const testResult = await Promise.race([testPromise, testTimeout]);
        console.log('✅ Auth updateProfile: Basic table access works:', testResult);
      } catch (testError: any) {
        console.error('❌ Auth updateProfile: Basic table access failed:', testError);
        throw new Error(`Database access issue: ${testError.message}`);
      }

      // Now try to find our specific record
      console.log('🔍 Auth updateProfile: Searching for user record...');
      
      const searchPromise = supabase
        .from('alumni')
        .select('id, email, name, profile_completed')
        .eq('id', user.id);
      
      const searchTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User search timeout')), 5000);
      });

      const searchResult = await Promise.race([searchPromise, searchTimeout]) as any;
      const { data: searchData, error: searchError } = searchResult;

      if (searchError) {
        console.error('❌ Auth updateProfile: Search failed:', searchError);
        throw new Error(`Cannot search for user profile: ${searchError.message}`);
      }

      console.log('🔍 Auth updateProfile: Search results:', searchData);

      if (!searchData || searchData.length === 0) {
        console.error('❌ Auth updateProfile: No profile found for user ID:', user.id);
        throw new Error('Profile record not found. You may need to register again.');
      }

      const existingProfile = searchData[0];
      console.log('✅ Auth updateProfile: Found existing profile:', existingProfile);

      // Now attempt the update
      console.log('🔍 Auth updateProfile: Attempting update...');
      
      const updatePromise = supabase
        .from('alumni')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      const updateTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Update timeout')), 10000);
      });

      const updateResult = await Promise.race([updatePromise, updateTimeout]) as any;
      const { data, error } = updateResult;

      if (error) {
        console.error('❌ Auth updateProfile: Update failed:', error);
        throw error;
      }
      
      console.log('✅ Auth updateProfile: Profile updated successfully:', data);
      setProfile(data);
      return data;

    } catch (error: any) {
      console.error('❌ Auth updateProfile: Operation failed:', error);
      throw error;
    }
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