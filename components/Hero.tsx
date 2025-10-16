// components/Hero.tsx
import React from "react";
import { StyleSheet, ImageBackground } from "react-native";
import { Spacing, Radius } from "../theme";
import { LinearGradient } from "expo-linear-gradient";

export default function Hero() {
  return (
    <ImageBackground
      testID="hero-banner"
      source={require("../assets/images/banner.png")} // ✅ correct path
      style={s.wrap}
      imageStyle={s.image}
    >
      <LinearGradient
        colors={["rgba(16, 24, 40, 0.1)", "rgba(16, 24, 40, 0.55)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.overlay}
      />
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
    ...StyleSheet.absoluteFillObject,
  },
});
