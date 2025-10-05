// app/city/[cityId]/events.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
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
      <View style={s.wrap}>
        <Text style={s.h1}>No data for {cityName || cityId}</Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={s.wrap}>
        <Text style={s.h1}>Events in {city.name}</Text>
        <Text style={{ opacity: 0.7, marginTop: 10 }}>No events available.</Text>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <Text style={s.h1}>🎉 Events in {city.name}</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.date}>📅 {item.date}</Text>
            {!!item.desc && <Text style={s.desc}>{item.desc}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#f9f9f9",
  },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  date: { fontSize: 14, fontWeight: "500", color: "#333", marginBottom: 6 },
  desc: { fontSize: 14, color: "#555" },
});
