// components/Hero.tsx
import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { Colors, Spacing, Radius } from "../theme";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

export default function Hero() {
  return (
    <ImageBackground
      testID="hero-banner"
      source={require("../assets/images/banner.png")} // ✅ correct path
      style={s.wrap}
      imageStyle={s.image}
    >
      <LinearGradient
        colors={["rgba(16, 24, 40, 0.05)", "rgba(16, 24, 40, 0.65)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.overlay}
      >
        <Text style={s.kicker}>CityHop</Text>
        <Text style={s.lead}>Let’s</Text>
        <Text style={s.leadAccent}>Destinations today!</Text>
        <Text style={s.subtitle}>Elevate your travel plans with curated highlights, hidden gems, and boutique stays picked for you.</Text>
        <View style={s.badges}>
          <View style={s.badge}>
            <Feather name="sun" size={14} color={Colors.accent} />
            <Text style={s.badgeText}>Weekend ready</Text>
          </View>
          <View style={s.badge}>
            <Feather name="map" size={14} color="#4ADE80" />
            <Text style={s.badgeText}>Tailored guides</Text>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  wrap: {
    height: 220,
    padding: Spacing.lg,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: "hidden",
  },
  image: {
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  overlay: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  kicker: {
    color: "#fff",
    opacity: 0.85,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  lead: {
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 26,
    letterSpacing: 1,
  },
  leadAccent: {
    color: "#38bdf8",
    fontWeight: "900",
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    color: "#F8FAFC",
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 280,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
