import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

/**
 * AuthGuard component to protect routes based on authentication status and user role
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { session, profile, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // Type assertion for segments to avoid TypeScript strict checking
    const firstSegment = segments[0] as string;
    const inAuthGroup = firstSegment === '(auth)';
    const inCustomerGroup = firstSegment === '(customer)';
    const inAdminGroup = firstSegment === '(admin)';

    // Not authenticated
    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login' as any);
      }
      return;
    }

    // Authenticated but no profile yet
    if (!profile) {
      // Wait for profile to load
      return;
    }

    // Authenticated with profile
    if (inAuthGroup) {
      // Redirect to appropriate app based on role
      if (profile.role === 'admin') {
        router.replace('/(admin)/(tabs)/dashboard' as any);
      } else {
        router.replace('/(customer)/(tabs)/home' as any);
      }
      return;
    }

    // Check role-based access
    if (profile.role === 'admin' && !inAdminGroup) {
      router.replace('/(admin)/(tabs)/dashboard' as any);
    } else if (profile.role === 'customer' && !inCustomerGroup) {
      router.replace('/(customer)/(tabs)/home' as any);
    }
  }, [session, profile, isLoading, isInitialized, segments]);

  return <>{children}</>;
}
