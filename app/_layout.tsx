import { Stack } from "expo-router";
import { PrayerTimesProvider } from "../context/PrayerTimesContext";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <PrayerTimesProvider>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </PrayerTimesProvider>
  );
}
