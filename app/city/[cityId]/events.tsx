// app/city/[cityId]/events.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
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
      <View style={s.container}>
        <View style={s.empty}>
          <Text style={s.title}>No details for {cityName || cityId}</Text>
          <Text style={s.message}>Choose another city to browse upcoming events.</Text>
        </View>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={s.container}>
        <View style={s.empty}>
          <Text style={s.title}>Events in {city.name}</Text>
          <Text style={s.message}>We don’t have any happenings right now. Check back soon!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        ListHeaderComponent={() => (
          <View style={s.header}>
            <Text style={s.title}>Events in {city.name}</Text>
            <Text style={s.message}>Simple highlights to help you plan an outing.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.date}>{item.date}</Text>
            <Text style={s.eventTitle}>{item.title}</Text>
            {!!item.desc && <Text style={s.message}>{item.desc}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  separator: { height: Spacing.md },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.lg, gap: Spacing.sm },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text },
  message: { color: Colors.textDim, lineHeight: 20, textAlign: "center" },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  date: { color: Colors.primary, fontWeight: "600", marginBottom: 4 },
  eventTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, marginBottom: 4 },
});
