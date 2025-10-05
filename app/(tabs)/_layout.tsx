// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme"; // ✅ relative import

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,  // light (white) tab bar from theme
          borderTopColor: Colors.border,   // subtle divider
          height: 58,
        },
        tabBarActiveTintColor: Colors.primary,   // active = blue
        tabBarInactiveTintColor: Colors.textDim, // inactive = grey
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
