import { supabase } from './client';

/**
 * Send OTP to user's email
 */
export async function sendOTP(email: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Verify OTP and sign in user
 */
export async function verifyOTP(email: string, token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { error: error.message };
  }
}

/**
 * Get current user session
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error: any) {
    console.error('Error getting session:', error);
    return { session: null, error: error.message };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error: any) {
    console.error('Error getting user:', error);
    return { user: null, error: error.message };
  }
}

/**
 * Get user profile from profiles table
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error getting profile:', error);
    return { profile: null, error: error.message };
  }
}

/**
 * Create or update user profile
 */
export async function upsertProfile(userId: string, profileData: {
  full_name?: string;
  role?: 'customer' | 'admin';
  preferred_language?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profileData,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error upserting profile:', error);
    return { profile: null, error: error.message };
  }
}
