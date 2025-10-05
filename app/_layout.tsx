// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { initDB } from "../lib/db"; // ✅ db import
import { Colors } from "../theme";

export default function RootLayout() {
  // ✅ Run DB init when app starts
  useEffect(() => {
    initDB();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {/* Light theme → status bar text dark */}
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTitle: "CityHop",
          headerTintColor: Colors.text,
          headerStyle: { backgroundColor: Colors.tabBar },
          headerTitleStyle: { fontWeight: "800" },
          contentStyle: { backgroundColor: Colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
