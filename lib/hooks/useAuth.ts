import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { sendOTP, verifyOTP } from '../supabase/auth';
import { sendOTPSchema, verifyOTPSchema } from '../validation/auth';

/**
 * Custom hook for authentication operations
 */
export function useAuth() {
  const { session, user, profile, isLoading, signOut, refreshProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Send OTP to user's email
   */
  const handleSendOTP = async (email: string) => {
    try {
      setIsSubmitting(true);

      // Validate email
      const validation = sendOTPSchema.safeParse({ email });
      if (!validation.success) {
        Alert.alert('Validation Error', validation.error.issues[0].message);
        return { success: false, error: validation.error.issues[0].message };
      }

      // Send OTP
      const { data, error } = await sendOTP(email);

      if (error) {
        Alert.alert('Error', error);
        return { success: false, error };
      }

      Alert.alert('Success', 'OTP sent to your email. Please check your inbox.');
      return { success: true, data };
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Verify OTP and sign in
   */
  const handleVerifyOTP = async (email: string, token: string) => {
    try {
      setIsSubmitting(true);

      // Validate inputs
      const validation = verifyOTPSchema.safeParse({ email, token });
      if (!validation.success) {
        Alert.alert('Validation Error', validation.error.issues[0].message);
        return { success: false, error: validation.error.issues[0].message };
      }

      // Verify OTP
      const { data, error } = await verifyOTP(email, token);

      if (error) {
        Alert.alert('Error', error);
        return { success: false, error };
      }

      // Profile will be loaded automatically by auth state listener
      return { success: true, data };
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to verify OTP');
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Sign out user
   */
  const handleSignOut = async () => {
    try {
      setIsSubmitting(true);
      await signOut();
      Alert.alert('Success', 'You have been signed out');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    session,
    user,
    profile,
    isLoading,
    isSubmitting,
    isAuthenticated: !!session,
    role: profile?.role || null,

    // Actions
    sendOTP: handleSendOTP,
    verifyOTP: handleVerifyOTP,
    signOut: handleSignOut,
    refreshProfile,
  };
}
