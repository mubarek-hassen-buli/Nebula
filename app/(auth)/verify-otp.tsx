import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OTPInput } from '../../components/auth/OTPInput';
import { useAuth } from '../../lib/hooks/useAuth';

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const { verifyOTP, sendOTP, isSubmitting } = useAuth();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOTP();
    }
  }, [otp]);

  const handleVerifyOTP = async () => {
    if (!params.email) return;

    const result = await verifyOTP(params.email, otp);
    
    if (result.success) {
      // Navigation will be handled by root layout based on user role
      router.replace('/');
    } else {
      // Clear OTP on error
      setOtp('');
    }
  };

  const handleResendOTP = async () => {
    if (!params.email || !canResend) return;

    const result = await sendOTP(params.email);
    
    if (result.success) {
      setCountdown(60);
      setCanResend(false);
      setOtp('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={48} color="#F59E0B" />
            </View>

            <Text style={styles.title}>Verify It's You</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to
            </Text>
            <Text style={styles.emailText}>{params.email}</Text>
          </View>

          {/* OTP Card */}
          <View style={styles.card}>
            <View style={styles.otpContainer}>
              <OTPInput
                value={otp}
                onChange={setOtp}
                length={6}
                autoFocus
              />
            </View>

            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#F59E0B" />
                <Text style={styles.loadingText}>Verifying code...</Text>
              </View>
            ) : (
              <View style={styles.divider} />
            )}

            {/* Resend Section */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendLabel}>Didn't receive the code?</Text>
              {canResend ? (
                <TouchableOpacity onPress={handleResendOTP} disabled={isSubmitting}>
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.countdownText}>
                  Resend in <Text style={styles.countdownValue}>{countdown}s</Text>
                </Text>
              )}
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#60A5FA" />
            <Text style={styles.infoText}>
              Tip: The code will be automatically verified once you enter all 6 digits.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  otpContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  loadingText: {
    color: '#D1D5DB',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginBottom: 24,
  },
  resendContainer: {
    alignItems: 'center',
    gap: 8,
  },
  resendLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  resendLink: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdownText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  countdownValue: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A20',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1E3A8A50',
    marginTop: 'auto',
  },
  infoText: {
    flex: 1,
    color: '#93C5FD',
    fontSize: 13,
    lineHeight: 20,
  },
});
