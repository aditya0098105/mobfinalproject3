import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
    <View style={s.wrap}>
      {/* ✅ Heading changed */}
      <Text style={s.title}>Book a Hotel in {city}</Text>

      <TextInput
        style={s.input}
        placeholder="Your Name"
        placeholderTextColor="#555"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={s.input}
        placeholder="Your Address"
        placeholderTextColor="#555"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={s.input}
        placeholder="Start Date (YYYY-MM-DD)"
        placeholderTextColor="#555"
        value={start}
        onChangeText={setStart}
      />
      <TextInput
        style={s.input}
        placeholder="End Date (YYYY-MM-DD)"
        placeholderTextColor="#555"
        value={end}
        onChangeText={setEnd}
      />

      <TouchableOpacity style={s.btn} onPress={saveBooking}>
        <Text style={s.btnText}>Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 16,
    color: "#000",
  },
  btn: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
