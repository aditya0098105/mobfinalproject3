// components/Hero.tsx
import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { Colors, Spacing, Radius } from "../theme";

export default function Hero() {
  return (
    <ImageBackground
      testID="hero-banner"
      source={require("../assets/images/banner.png")} // ✅ correct path
      style={s.wrap}
      imageStyle={s.image}
    >
      <Text style={s.kicker}>Let’s</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <Text style={s.title}>Discover </Text>
        <Text style={[s.title, { color: "#FFD166" }]}>New </Text>
        <Text style={s.title}>Destinations today!</Text>
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  wrap: {
    height: 180,
    padding: Spacing.lg,
    borderBottomLeftRadius: Radius.lg * 1.5,
    borderBottomRightRadius: Radius.lg * 1.5,
    justifyContent: "flex-end", // text ko bottom me rakha
  },
  image: {
    borderBottomLeftRadius: Radius.lg * 1.5,
    borderBottomRightRadius: Radius.lg * 1.5,
  },
  kicker: {
    color: "#fff",
    opacity: 0.9,
    fontWeight: "800",
    fontSize: 18,
  },
  title: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 26,
    lineHeight: 30,
  },
});
