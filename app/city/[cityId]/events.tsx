// app/city/[cityId]/events.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { CITY_DATA } from "./index"; // ✅ import from index.tsx
import { Colors, Radius, Spacing } from "../../../theme";

export default function EventsScreen() {
  const { cityId, cityName } = useLocalSearchParams<{
    cityId: string;
    cityName?: string;
  }>();

  const city = useMemo(() => CITY_DATA[cityId || ""] ?? null, [cityId]);
  const events = city?.events ?? [];

  if (!city) {
    return (
      <LinearGradient colors={["#0f172a", "#0b1120", "#020617"]} style={s.gradient}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={s.safe}>
          <View style={s.centerBox}>
            <Text style={s.h1}>No data for {cityName || cityId}</Text>
            <Text style={s.subtitle}>Try selecting another destination from the explore tab.</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (events.length === 0) {
    return (
      <LinearGradient colors={["#0f172a", "#0b1120", "#020617"]} style={s.gradient}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={s.safe}>
          <View style={s.centerBox}>
            <Text style={s.h1}>Events in {city.name}</Text>
            <Text style={s.subtitle}>We’re curating experiences here. Check back soon!</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f172a", "#0b1120", "#020617"]} style={s.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={s.safe}>
        <FlatList
          contentContainerStyle={s.list}
          data={events}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={s.heroCard}>
              <View style={s.heroBadge}>
                <Text style={s.badgeText}>City Spotlight</Text>
              </View>
              <Text style={s.heroTitle}>Events in {city.name}</Text>
              <Text style={s.heroSubtitle}>
                Make the most of your stay with curated happenings, live music, and pop-up culture moments.
              </Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 22 }} />}
          renderItem={({ item, index }) => (
            <View style={s.eventRow}>
              <View style={s.timeline}>
                <View style={s.timelineDot} />
                {index !== events.length - 1 && <View style={s.timelineLine} />}
              </View>
              <View style={s.card}>
                <Text style={s.date}>{item.date}</Text>
                <Text style={s.title}>{item.title}</Text>
                {!!item.desc && <Text style={s.desc}>{item.desc}</Text>}
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.lg },
  h1: { fontSize: 28, fontWeight: "800", color: "#f8fafc", textAlign: "center" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 20, textAlign: "center" },

  heroCard: {
    backgroundColor: "rgba(15,23,42,0.65)",
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.25)",
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(59,130,246,0.25)",
    marginBottom: Spacing.sm,
  },
  badgeText: { color: "#bfdbfe", fontWeight: "700", fontSize: 12, letterSpacing: 1 },
  heroTitle: { fontSize: 30, fontWeight: "800", color: "#f8fafc" },
  heroSubtitle: { color: "#cbd5f5", marginTop: Spacing.sm, lineHeight: 22 },

  eventRow: { flexDirection: "row", alignItems: "stretch" },
  timeline: { alignItems: "center", marginRight: Spacing.md },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: Colors.accent,
    borderWidth: 3,
    borderColor: "rgba(15,23,42,0.9)",
    marginTop: 6,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "rgba(148,163,184,0.3)",
    marginTop: 2,
  },
  card: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#f8fafc", marginTop: Spacing.xs },
  date: {
    color: Colors.accent,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  desc: { color: "#cbd5e1", lineHeight: 20, marginTop: Spacing.sm },
});
