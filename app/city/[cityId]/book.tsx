import { useLocalSearchParams } from "expo-router";
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
import { Colors, Radius, Spacing } from "../../../theme";

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
    <View style={s.container}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <Text style={s.title}>Book a hotel in {city}</Text>
            <Text style={s.subtitle}>Fill in your details below and we’ll save the reservation.</Text>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Guest details</Text>
            <TextInput
              style={s.input}
              placeholder="Your name"
              placeholderTextColor={Colors.textDim}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={s.input}
              placeholder="Your address"
              placeholderTextColor={Colors.textDim}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Stay dates</Text>
            <TextInput
              style={s.input}
              placeholder="Start date (YYYY-MM-DD)"
              placeholderTextColor={Colors.textDim}
              value={start}
              onChangeText={setStart}
            />
            <TextInput
              style={s.input}
              placeholder="End date (YYYY-MM-DD)"
              placeholderTextColor={Colors.textDim}
              value={end}
              onChangeText={setEnd}
            />
          </View>

          <TouchableOpacity style={s.button} activeOpacity={0.9} onPress={saveBooking}>
            <Text style={s.buttonText}>Confirm booking</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  header: { gap: Spacing.xs, marginBottom: Spacing.lg },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text },
  subtitle: { color: Colors.textDim, lineHeight: 20 },
  section: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionLabel: { fontWeight: "600", color: Colors.text },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    backgroundColor: Colors.cardAlt,
  },
  button: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
