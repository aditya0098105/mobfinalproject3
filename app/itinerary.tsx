import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { db } from "../lib/db";
import { Colors, Radius } from "../theme";

type Itinerary = {
  id: number;
  title: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  experiences: string | null;
  created_at?: string | null;
};

export function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return "Flexible dates";
  if (start && !end) return `Starting ${start}`;
  if (!start && end) return `Wrapping up by ${end}`;
  return `${start} → ${end}`;
}

export function tripDuration(start?: string | null, end?: string | null) {
  if (!start || !end) return null;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return null;
  const diff = Math.max(0, Math.round((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1);
  if (!diff) return null;
  return `${diff} day${diff === 1 ? "" : "s"}`;
}

export default function ItineraryPlanner() {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [experiences, setExperiences] = useState("");
  const [plans, setPlans] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlans = useCallback(async () => {
    try {
      const rows = await db.getAllAsync<Itinerary>(
        "SELECT id, title, destination, start_date, end_date, experiences, created_at FROM itineraries ORDER BY datetime(created_at) DESC"
      );
      setPlans(rows ?? []);
    } catch (error) {
      console.log("❌ Error loading itineraries", error);
      Alert.alert("Database error", "Could not load saved itineraries.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [loadPlans])
  );

  const resetForm = () => {
    setTitle("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    setExperiences("");
  };

  const savePlan = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Give your itinerary a memorable name.");
      return;
    }

    if (!destination.trim()) {
      Alert.alert("Destination needed", "Where are you heading?");
      return;
    }

    try {
      setLoading(true);
      await db.runAsync(
        "INSERT INTO itineraries (title, destination, start_date, end_date, experiences) VALUES (?, ?, ?, ?, ?)",
        [title.trim(), destination.trim(), startDate.trim() || null, endDate.trim() || null, experiences.trim() || null]
      );
      resetForm();
      await loadPlans();
      Alert.alert("Saved", "Your itinerary has been added.");
    } catch (error) {
      console.log("❌ Error saving itinerary", error);
      Alert.alert("Database error", "Could not save itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: number) => {
    Alert.alert("Remove itinerary?", "This will permanently delete your plan.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await db.runAsync("DELETE FROM itineraries WHERE id=?", [id]);
            await loadPlans();
          } catch (error) {
            console.log("❌ Error deleting itinerary", error);
            Alert.alert("Database error", "Could not delete itinerary.");
          }
        },
      },
    ]);
  };

  const headline = useMemo(() => {
    if (!plans.length) return "Let’s design your dream journey";
    if (plans.length === 1) return "One beautiful adventure awaits";
    return `${plans.length} crafted journeys ready to explore`;
  }, [plans.length]);

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>{headline}</Text>
            <Text style={styles.heroSubtitle}>
              Keep track of where you are headed and the key details for each trip.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formHeading}>New itinerary</Text>
            <TextInput
              style={styles.input}
              placeholder="Trip title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Destination"
              value={destination}
              onChangeText={setDestination}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Start date"
                value={startDate}
                onChangeText={setStartDate}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="End date"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Notes"
              value={experiences}
              onChangeText={setExperiences}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.saveButton} activeOpacity={0.7} onPress={savePlan} disabled={loading}>
              <Text style={styles.saveText}>{loading ? "Saving..." : "Save itinerary"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.listHeading}>Saved itineraries</Text>
          {plans.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No itineraries yet</Text>
              <Text style={styles.emptySubtitle}>Add your first trip using the form above.</Text>
            </View>
          ) : (
            plans.map((plan) => {
              const duration = tripDuration(plan.start_date, plan.end_date);
              return (
                <View key={plan.id} style={styles.planCard}>
                  <View style={styles.planHeader}>
                    <View style={styles.headerText}>
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      <Text style={styles.planDestination}>{plan.destination}</Text>
                    </View>
                    <TouchableOpacity onPress={() => confirmDelete(plan.id)} accessibilityLabel={`Delete ${plan.title}`}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.planMetaRow}>
                    <Text style={styles.metaText}>{formatDateRange(plan.start_date, plan.end_date)}</Text>
                    {duration && <Text style={styles.metaText}>• {duration}</Text>}
                  </View>
                  {!!plan.experiences && <Text style={styles.planNotes}>{plan.experiences}</Text>}
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export const options = {
  title: "Itinerary planner",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  heroCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  heroSubtitle: {
    marginTop: 8,
    color: "#4b5563",
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 20,
  },
  formHeading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    color: "#111827",
    fontSize: 15,
    marginBottom: 12,
  },
  textarea: {
    minHeight: 90,
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  saveText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  listHeading: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  emptyState: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    alignItems: "center",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  emptySubtitle: {
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 20,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 16,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  planDestination: {
    color: Colors.textDim,
    marginTop: 2,
  },
  planMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaText: {
    color: Colors.textDim,
    fontSize: 13,
  },
  planNotes: {
    marginTop: 8,
    color: Colors.text,
    lineHeight: 20,
    fontSize: 14,
  },
  deleteText: {
    color: "#b91c1c",
    fontSize: 14,
  },
});
