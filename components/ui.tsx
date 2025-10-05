// components/ui.tsx
import React from "react";
import { Text, View, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Colors, Radius, Spacing } from "../theme";

export function H1({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.h1, style]}>{children}</Text>;
}
export function H2({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.h2, style]}>{children}</Text>;
}
export function P({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.p, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  compact = false,
  right,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "outline";
  compact?: boolean;
  right?: React.ReactNode;
}) {
  const base = [styles.btn, compact && { paddingVertical: 10, paddingHorizontal: 14 }];
  const variants = {
    primary: {
      backgroundColor: Colors.primary,
      shadowColor: Colors.shadow,
      shadowOpacity: 1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 10 },
      elevation: 3,
    },
    ghost: { backgroundColor: "transparent" as const },
    outline: { backgroundColor: "transparent" as const, borderWidth: 1, borderColor: Colors.border },
  };
  const textVariants = {
    primary: { color: "#FFFFFF" }, // light theme: white text on primary
    ghost: { color: Colors.text },
    outline: { color: Colors.text },
  } as const;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      activeOpacity={0.85}
      style={[...base, variants[variant]]}
    >
      <Text style={[styles.btnText, textVariants[variant]]}>{title}</Text>
      {right ? <View style={{ marginLeft: 8 }}>{right}</View> : null}
    </TouchableOpacity>
  );
}

export function Pill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.pill} activeOpacity={0.85}>
      <Text style={styles.pillText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  // Typography
  h1: { color: Colors.text, fontSize: 24, fontWeight: "800", letterSpacing: 0.3 },
  h2: { color: Colors.text, opacity: 0.9, fontSize: 16, fontWeight: "700" },
  p: { color: Colors.textDim, fontSize: 14, lineHeight: 20 },

  // Surfaces
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },

  // Buttons
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: Radius.md,
  },
  btnText: { fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },

  // Pills (light)
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: { color: Colors.text, fontWeight: "600", letterSpacing: 0.2 },

  // Section header + divider
  section: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
});
