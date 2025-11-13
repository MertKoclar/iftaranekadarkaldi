import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

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

