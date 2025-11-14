import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter, useSegments } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useInterstitialAd } from '../../hooks/useInterstitialAd';

export default function TabLayout() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const segments = useSegments();
  const previousSegment = useRef<string | null>(null);
  const tabChangeCount = useRef(0);
  const { showAd } = useInterstitialAd();

  // Tab değişimini dinle ve haptic feedback ver + reklam göster
  useEffect(() => {
    const currentSegment = segments[segments.length - 1] || '';
    if (previousSegment.current && previousSegment.current !== currentSegment) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Her 2. tab değişiminde interstitial reklam göster
      tabChangeCount.current += 1;
      if (tabChangeCount.current % 2 === 0) {
        // Kısa bir gecikme ile reklam göster (kullanıcı deneyimi için)
        setTimeout(() => {
          showAd();
        }, 500);
      }
    }
    previousSegment.current = currentSegment;
  }, [segments, showAd]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: isDark ? '#666666' : '#999999',
        tabBarStyle: {
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          borderTopColor: isDark ? '#333333' : '#e0e0e0',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        },
        headerTintColor: isDark ? '#ffffff' : '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.home'),
          tabBarLabel: t('common.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerTitle: t('home.title'),
        }}
      />
      <Tabs.Screen
        name="vakitler"
        options={{
          title: t('times.title'),
          tabBarLabel: t('times.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dini-gunler"
        options={{
          title: t('religiousDays.title'),
          tabBarLabel: t('religiousDays.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarLabel: t('settings.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

