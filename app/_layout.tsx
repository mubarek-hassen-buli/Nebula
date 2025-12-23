import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthGuard } from '../components/auth/AuthGuard';
import '../lib/i18n'; // Initialize i18n
import { useAuthStore } from '../store/authStore';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading, isInitialized, initialize } = useAuthStore();
  
  const [fontsLoaded] = useFonts({
    'Billabong': require('../assets/fonts/Billabong.otf'),
  });

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isInitialized && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [isInitialized, fontsLoaded]);

  // Show loading screen while initializing
  if (!isInitialized || isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGuard>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <Slot />
            <StatusBar style="auto" />
          </View>
        </AuthGuard>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
