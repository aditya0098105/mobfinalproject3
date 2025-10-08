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
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
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

const gradientColors = ["#141E30", "#243B55", "#1F2937"];

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
    <LinearGradient colors={gradientColors} style={styles.gradient}>
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
            <View style={styles.heroGlow} />
            <Text style={styles.heroEyebrow}>Itinerary atelier</Text>
            <Text style={styles.heroTitle}>{headline}</Text>
            <Text style={styles.heroSubtitle}>
              Sculpt day-by-day experiences, bookmark must-do moments and keep everything safely stored offline.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formHeading}>Create a new itinerary</Text>
            <TextInput
              style={styles.input}
              placeholder="Trip title (e.g. Amalfi Coast escape)"
              placeholderTextColor="rgba(226, 232, 240, 0.6)"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Primary destination"
              placeholderTextColor="rgba(226, 232, 240, 0.6)"
              value={destination}
              onChangeText={setDestination}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Start date (YYYY-MM-DD)"
                placeholderTextColor="rgba(226, 232, 240, 0.6)"
                value={startDate}
                onChangeText={setStartDate}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="End date (YYYY-MM-DD)"
                placeholderTextColor="rgba(226, 232, 240, 0.6)"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Signature experiences, dining reservations, hidden gems..."
              placeholderTextColor="rgba(226, 232, 240, 0.6)"
              value={experiences}
              onChangeText={setExperiences}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.9}
              onPress={savePlan}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.accent, "#f97316"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveGradient}
              >
                <View style={styles.saveIcon}>
                  <Feather name="zap" color="#0f172a" size={18} />
                </View>
                <Text style={styles.saveText}>{loading ? "Saving..." : "Save itinerary"}</Text>
                <Text style={styles.saveHint}>Instantly synced to your device</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.listHeading}>Saved itineraries</Text>
          {plans.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Feather name="map" size={28} color="rgba(248, 250, 252, 0.8)" />
              </View>
              <Text style={styles.emptyTitle}>No itineraries yet</Text>
              <Text style={styles.emptySubtitle}>
                Start crafting your first escape and we’ll keep it ready for offline adventures.
              </Text>
            </View>
          ) : (
            plans.map((plan) => {
              const duration = tripDuration(plan.start_date, plan.end_date);
              return (
                <View key={plan.id} style={styles.planCard}>
                  <LinearGradient
                    colors={["rgba(59, 130, 246, 0.18)", "rgba(59, 130, 246, 0.06)"]}
                    style={styles.planGradient}
                  >
                    <View style={styles.planHeader}>
                      <View style={styles.badge}>
                        <Feather name="compass" size={16} color={Colors.primary} />
                      </View>
                      <View style={styles.headerText}>
                        <Text style={styles.planTitle}>{plan.title}</Text>
                        <Text style={styles.planDestination}>{plan.destination}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => confirmDelete(plan.id)}
                        style={styles.deleteBtn}
                        accessibilityLabel={`Delete ${plan.title}`}
                      >
                        <Feather name="trash-2" size={18} color="rgba(15, 23, 42, 0.7)" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.planMetaRow}>
                      <View style={styles.metaChip}>
                        <Feather name="calendar" size={14} color={Colors.primary} />
                        <Text style={styles.metaText}>{formatDateRange(plan.start_date, plan.end_date)}</Text>
                      </View>
                      {duration && (
                        <View style={styles.metaChip}>
                          <Feather name="clock" size={14} color={Colors.primary} />
                          <Text style={styles.metaText}>{duration}</Text>
                        </View>
                      )}
                    </View>
                    {!!plan.experiences && (
                      <Text style={styles.planNotes}>{plan.experiences}</Text>
                    )}
                  </LinearGradient>
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

export const options = {
  title: "Itinerary planner",
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 24, paddingBottom: 80 },
  heroCard: {
    borderRadius: 30,
    padding: 24,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.25)",
    marginBottom: 28,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(59, 130, 246, 0.35)",
    top: -140,
    right: -120,
  },
  heroEyebrow: {
    color: "#60a5fa",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    marginTop: 12,
    fontSize: 30,
    fontWeight: "800",
    color: "#f8fafc",
  },
  heroSubtitle: {
    marginTop: 12,
    color: "rgba(226, 232, 240, 0.9)",
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.22)",
    marginBottom: 28,
  },
  formHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 18,
  },
  input: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
    color: "#f8fafc",
    fontSize: 15,
    marginBottom: 14,
  },
  textarea: {
    minHeight: 110,
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
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 6,
  },
  saveGradient: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  saveIcon: {
    position: "absolute",
    left: 18,
    top: 18,
    backgroundColor: "rgba(248, 250, 252, 0.9)",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 16,
  },
  saveHint: {
    color: "rgba(15, 23, 42, 0.7)",
    fontSize: 12,
    marginTop: 6,
  },
  listHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 12,
  },
  emptyState: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.25)",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    textAlign: "center",
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(248, 250, 252, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "rgba(226, 232, 240, 0.8)",
    textAlign: "center",
    lineHeight: 20,
  },
  planCard: {
    marginBottom: 18,
    borderRadius: Radius.xl,
    overflow: "hidden",
  },
  planGradient: {
    padding: 20,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  planDestination: {
    color: Colors.textDim,
    marginTop: 2,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  planMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.86)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  metaText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  planNotes: {
    marginTop: 14,
    color: "rgba(15, 23, 42, 0.8)",
    lineHeight: 20,
  },
});
