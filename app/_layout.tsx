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
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#ffffff",
          },
          headerTintColor: colorScheme === "dark" ? "#ffffff" : "#000000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "İftar/Sahur Vakti",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: "Ayarlar",
            presentation: "modal",
          }}
        />
      </Stack>
    </PrayerTimesProvider>
  );
}
