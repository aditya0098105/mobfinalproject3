// app/city/[cityId]/events.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { CITY_DATA } from "./index"; // ✅ import from index.tsx

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
            <View style={s.header}>
              <Text style={s.h1}>🎉 Events in {city.name}</Text>
              <Text style={s.subtitle}>Make plans with hand-picked gatherings and unforgettable nights out.</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
          renderItem={({ item }) => (
            <View style={s.card}>
              <LinearGradient
                colors={["#1d4ed8", "#9333ea"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.cardAccent}
              />
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.date}>{`📅\n${item.date}`}</Text>
              {!!item.desc && <Text style={s.desc}>{item.desc}</Text>}
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
  list: { padding: 24, paddingBottom: 48 },
  header: { marginBottom: 12 },
  h1: { fontSize: 28, fontWeight: "800", color: "#f8fafc" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 20 },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    top: -40,
    right: -60,
    width: 180,
    height: 180,
    opacity: 0.2,
    borderRadius: 999,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#f8fafc", marginBottom: 12 },
  date: { color: "#bfdbfe", fontWeight: "600", fontSize: 15, marginBottom: 12, lineHeight: 20 },
  desc: { color: "#cbd5e1", lineHeight: 20 },
});
