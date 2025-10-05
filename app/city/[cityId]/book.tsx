import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
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
import { db } from "../../../lib/db";

export default function BookHotel() {
  const { cityId, city } = useLocalSearchParams<{
    cityId: string;
    city: string;
  }>();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const saveBooking = async () => {
  // ✅ Check: all fields must be filled
  if (!name || !address || !start || !end) {
    Alert.alert("⚠️ Missing Info", "Please fill all fields before booking.");
    return;
  }

  try {
    await db.runAsync(
      "INSERT INTO bookings (hotel_name, city, customer_name, customer_address, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)",
      ["CityHop Stay Hotel", cityId, name, address, start, end]
    );

    Alert.alert("✅ Success", "Booking confirmed!");

    // Clear form fields after success
    setName("");
    setAddress("");
    setStart("");
    setEnd("");
  } catch (e) {
    console.log("❌ Error:", e);
    Alert.alert("Error", "Could not save booking");
  }
};


  return (
    <LinearGradient colors={["#0f172a", "#0b1120", "#020617"]} style={s.gradient}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.hero}>
            <View style={s.heroAccent} />
            <Text style={s.eyebrow}>Stay in style</Text>
            <Text style={s.title}>Book a Hotel in {city}</Text>
            <Text style={s.subtitle}>Personalize your stay with our curated partner properties.</Text>
          </View>

          <View style={s.formCard}>
            <Text style={s.formLabel}>Guest details</Text>
            <TextInput
              style={s.input}
              placeholder="Your Name"
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={s.input}
              placeholder="Your Address"
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={s.formCard}>
            <Text style={s.formLabel}>Stay dates</Text>
            <TextInput
              style={s.input}
              placeholder="Start Date (YYYY-MM-DD)"
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
              value={start}
              onChangeText={setStart}
            />
            <TextInput
              style={s.input}
              placeholder="End Date (YYYY-MM-DD)"
              placeholderTextColor="rgba(148, 163, 184, 0.8)"
              value={end}
              onChangeText={setEnd}
            />
          </View>

          <TouchableOpacity style={s.button} activeOpacity={0.9} onPress={saveBooking}>
            <LinearGradient colors={["#ec4899", "#d946ef"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.buttonGradient}>
              <Text style={s.buttonText}>Confirm Booking</Text>
              <Text style={s.buttonHint}>Instant confirmation, no booking fees.</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 60 },
  hero: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
    marginBottom: 24,
    overflow: "hidden",
  },
  heroAccent: {
    position: "absolute",
    width: 220,
    height: 220,
    backgroundColor: "#ec4899",
    opacity: 0.18,
    borderRadius: 160,
    right: -80,
    top: -100,
  },
  eyebrow: { color: "#f472b6", textTransform: "uppercase", fontSize: 12, letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: "800", color: "#f8fafc" },
  subtitle: { color: "#cbd5e1", marginTop: 10, lineHeight: 20 },
  formCard: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    marginBottom: 20,
  },
  formLabel: { color: "#f8fafc", fontWeight: "700", fontSize: 16, marginBottom: 14 },
  input: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    color: "#f8fafc",
    fontSize: 16,
    marginBottom: 12,
  },
  button: { borderRadius: 24, overflow: "hidden" },
  buttonGradient: { padding: 20, alignItems: "center" },
  buttonText: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
  buttonHint: { color: "#fdf2f8", marginTop: 6, fontSize: 13, opacity: 0.9 },
});
