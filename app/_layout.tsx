import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LanguageProvider } from "../context/LanguageContext";
import { NetworkProvider } from "../context/NetworkContext";
import { PrayerTimesProvider } from "../context/PrayerTimesContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "../i18n/config";

const ONBOARDING_STORAGE_KEY = '@onboarding_completed';

function RootLayoutNav() {
  const { isDark } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // İlk yüklemede onboarding durumunu kontrol et
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        setHasCompletedOnboarding(completed === 'true');
      } catch (error) {
        console.error('Onboarding kontrolü hatası:', error);
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  // Segments değiştiğinde onboarding durumunu kontrol et (sayfa değişimlerinde)
  useEffect(() => {
    if (!isLoading) {
      const checkOnboarding = async () => {
        try {
          const completed = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
          const isCompleted = completed === 'true';
          setHasCompletedOnboarding(isCompleted);
        } catch (error) {
          console.error('Onboarding kontrolü hatası:', error);
        }
      };
      checkOnboarding();
    }
  }, [segments, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      const inOnboarding = segments.includes('onboarding');
      
      if (!hasCompletedOnboarding && !inOnboarding) {
        // Onboarding tamamlanmamış ve onboarding sayfasında değilse, onboarding'e yönlendir
        router.replace('/onboarding');
      } else if (hasCompletedOnboarding && inOnboarding) {
        // Onboarding tamamlanmış ama hala onboarding sayfasındaysa, ana sayfaya yönlendir
        router.replace('/(tabs)');
      }
    }
  }, [hasCompletedOnboarding, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000000' : '#ffffff' }}>
        <ActivityIndicator size="large" color={isDark ? '#FF9800' : '#FF9800'} />
      </View>
    );
  }
  
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <NetworkProvider>
      <LanguageProvider>
        <ThemeProvider>
          <PrayerTimesProvider>
            <RootLayoutNav />
          </PrayerTimesProvider>
        </ThemeProvider>
      </LanguageProvider>
    </NetworkProvider>
  );
}
