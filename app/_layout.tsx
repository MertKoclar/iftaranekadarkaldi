import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PrayerTimesProvider } from "../context/PrayerTimesContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

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
    <ThemeProvider>
      <PrayerTimesProvider>
        <RootLayoutNav />
      </PrayerTimesProvider>
    </ThemeProvider>
  );
}
