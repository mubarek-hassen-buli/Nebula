import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { getUserProfile } from '../lib/supabase/auth';
import { supabase } from '../lib/supabase/client';
import { Profile } from '../types/database';

interface AuthState {
  // State
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  // Set session
  setSession: (session) => set({ session }),

  // Set user
  setUser: (user) => set({ user }),

  // Set profile
  setProfile: (profile) => set({ profile }),

  // Set loading
  setLoading: (loading) => set({ isLoading: loading }),

  // Initialize auth state
  initialize: async () => {
    try {
      set({ isLoading: true });

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session?.user) {
        set({ session, user: session.user });

        // Fetch user profile
        const { profile } = await getUserProfile(session.user.id);
        set({ profile });
      }

      set({ isInitialized: true, isLoading: false });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isInitialized: true, isLoading: false });
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ isLoading: true });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      set({
        session: null,
        user: null,
        profile: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ isLoading: false });
    }
  },

  // Refresh profile
  refreshProfile: async () => {
    const { user } = get();
    
    if (!user) return;

    try {
      const { profile } = await getUserProfile(user.id);
      set({ profile });
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  },
}));

// Set up auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore.getState();

  if (event === 'SIGNED_IN' && session) {
    store.setSession(session);
    store.setUser(session.user);
    store.refreshProfile();
  } else if (event === 'SIGNED_OUT') {
    store.setSession(null);
    store.setUser(null);
    store.setProfile(null);
  } else if (event === 'TOKEN_REFRESHED' && session) {
    store.setSession(session);
  }
});
