import {
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Appearance, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/common/States';
import { AnimatedSplash } from '@/components/layout/AnimatedSplash';
import { Screen } from '@/components/layout/Screen';
import { palette } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { isOnboarded } from '@/lib/learning';
import { useAuthStore } from '@/stores/auth.store';
import { useLearningStore } from '@/stores/learning.store';

void SplashScreen.preventAutoHideAsync().catch(() => {});

// The app is light-only. Without this, a phone in dark mode paints the navigator's backdrop black,
// which showed up as a dark flash while moving between pages.
if (typeof Appearance.setColorScheme === 'function') Appearance.setColorScheme('light');

const navTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.light.blue,
    background: palette.light.background,
    card: palette.light.surface,
    text: palette.light.text,
    border: palette.light.border,
  },
};

/** Last-resort guard: the native splash is never allowed to stay up longer than this. */
const SPLASH_MAX_MS = 8000;

export default function RootLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const segments = useSegments() as string[];
  // Fonts are bundled in the app (no network). If loading fails we continue with system fonts.
  const [fontsLoaded, fontError] = useFonts({
    LilitaOne_400Regular,
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });
  const fontsReady = fontsLoaded || !!fontError;
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const initError = useAuthStore((s) => s.initError);
  const profile = useLearningStore((s) => s.profile);
  const isLoaded = useLearningStore((s) => s.isLoaded);
  const loadError = useLearningStore((s) => s.error);
  const [attempt, setAttempt] = useState(0);
  const [splashDone, setSplashDone] = useState(false);

  // Open the local database (migrations + seed) and restore the remembered user.
  useEffect(() => {
    void useAuthStore.getState().restoreSession();
  }, [attempt]);

  // Load the child's data whenever a different user signs in.
  useEffect(() => {
    if (!isInitialized || initError) return;
    if (userId) void useLearningStore.getState().load(userId);
    else useLearningStore.getState().reset();
  }, [isInitialized, initError, userId]);

  // Every path ends in "ready": initialized, logged out, data loaded, or an error to show.
  const ready = fontsReady && isInitialized && (!!initError || !userId || isLoaded || !!loadError);

  // Hand over from the native splash to the animated one (same logo and background).
  const hideNativeSplash = useCallback(() => void SplashScreen.hideAsync().catch(() => {}), []);
  useEffect(() => {
    const t = setTimeout(hideNativeSplash, SPLASH_MAX_MS);
    return () => clearTimeout(t);
  }, [hideNativeSplash]);

  // Redirect: logged out -> login, new child -> onboarding (daily goal), otherwise -> home.
  useEffect(() => {
    if (!ready || initError) return;
    const root = segments[0];
    const inAuth = root === '(auth)';

    if (!user) return inAuth ? undefined : router.replace('/login');
    if (loadError) return;
    if (!isOnboarded(profile))
      return root === 'onboarding' ? undefined : router.replace('/onboarding');
    if (inAuth || root === 'onboarding' || root === undefined) router.replace('/home');
  }, [ready, initError, user, profile, loadError, segments, router]);

  let body: ReactNode = null;
  if (ready && initError) {
    body = (
      <Screen scroll={false}>
        <ErrorState
          title="Database belum bisa dibuka"
          message="Data belajar di HP ini belum bisa dimuat. Tutup aplikasi lain lalu coba lagi."
          detail={initError}
          retryLabel="Coba Lagi"
          onRetry={() => setAttempt((a) => a + 1)}
        />
      </Screen>
    );
  } else if (ready && user && loadError && !profile) {
    body = (
      <Screen scroll={false}>
        <ErrorState
          message={loadError}
          retryLabel="Coba Lagi"
          onRetry={() => userId && void useLearningStore.getState().load(userId)}
        />
      </Screen>
    );
  } else if (ready) {
    body = (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          // Light, soft transitions: new pages fade up from below instead of sliding across.
          animation: 'fade_from_bottom',
          animationDuration: 280,
        }}
      >
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(child)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
        <Stack.Screen name="game/result" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen
          name="lesson/complete"
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
      </Stack>
    );
  }

  return (
    <ThemeProvider value={navTheme}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <StatusBar style="dark" />
          {body}
          {splashDone ? null : (
            <AnimatedSplash
              ready={ready}
              fontsReady={fontsReady}
              onShown={hideNativeSplash}
              onDone={() => setSplashDone(true)}
            />
          )}
        </View>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
