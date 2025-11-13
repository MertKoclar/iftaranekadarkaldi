import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LanguageProvider } from "../context/LanguageContext";
import { PrayerTimesProvider } from "../context/PrayerTimesContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "../i18n/config";

function RootLayoutNav() {
  const { isDark } = useTheme();
  
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <PrayerTimesProvider>
          <RootLayoutNav />
        </PrayerTimesProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
