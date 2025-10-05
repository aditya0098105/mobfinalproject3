import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../../lib/db";

type Booking = {
  id: number;
  hotel_name: string;
  city: string;
  customer_name: string;
  customer_address: string;
  start_date: string;
  end_date: string;
};

export default function BookingsScreen() {
  const { cityId } = useLocalSearchParams<{ cityId: string }>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const result: any = await db.getAllAsync(
        "SELECT * FROM bookings WHERE city=?",
        [cityId]
      );
      setBookings(result);
    } catch (err) {
      console.log("❌ Error loading bookings:", err);
    }
  };

  const deleteBooking = async (id: number) => {
    await db.runAsync("DELETE FROM bookings WHERE id=?", [id]);
    loadBookings();
  };

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setName(booking.customer_name);
    setAddress(booking.customer_address);
    setStart(booking.start_date);
    setEnd(booking.end_date);
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
  if (!selectedBooking) return;

  // ✅ Validation: check empty fields
  if (!name || !address || !start || !end) {
    Alert.alert("⚠️ Missing Info", "Please fill all fields before saving changes.");
    return;
  }

  await db.runAsync(
    "UPDATE bookings SET customer_name=?, customer_address=?, start_date=?, end_date=? WHERE id=?",
    [name, address, start, end, selectedBooking.id]
  );

  Alert.alert("✅ Success", "Booking updated!");
  setEditModalVisible(false);
  setSelectedBooking(null);
  loadBookings();
};


  return (
    <View style={s.wrap}>
      <Text style={s.h1}>📖 Bookings in {cityId}</Text>

      {bookings.length === 0 ? (
        <Text style={{ marginTop: 10 }}>No bookings found.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={s.card}>
              <Text style={s.title}>{item.hotel_name}</Text>
              <Text>👤 {item.customer_name}</Text>
              <Text>🏠 {item.customer_address}</Text>
              <Text>
                📅 {item.start_date} → {item.end_date}
              </Text>

              <View style={s.row}>
                <TouchableOpacity
                  style={[s.btn, { backgroundColor: "#007AFF" }]}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={s.btnText}>✏️ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.btn, { backgroundColor: "#FF3B30" }]}
                  onPress={() =>
                    Alert.alert("Delete?", "Are you sure?", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => deleteBooking(item.id) },
                    ])
                  }
                >
                  <Text style={s.btnText}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* ✏️ Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={s.modalWrap}>
          <View style={s.modalContent}>
            <Text style={s.h1}>Edit Booking</Text>

            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Name" />
            <TextInput style={s.input} value={address} onChangeText={setAddress} placeholder="Address" />
            <TextInput style={s.input} value={start} onChangeText={setStart} placeholder="Start Date" />
            <TextInput style={s.input} value={end} onChangeText={setEnd} placeholder="End Date" />

            <View style={s.row}>
              <TouchableOpacity
                style={[s.btn, { backgroundColor: "#ccc" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={s.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.btn, { backgroundColor: "#28a745" }]}
                onPress={saveEdit}
              >
                <Text style={s.btnText}>💾 Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  h1: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  title: { fontWeight: "700", fontSize: 16, marginBottom: 4 },
  row: { flexDirection: "row", marginTop: 10, justifyContent: "space-between" },
  btn: { flex: 1, marginHorizontal: 5, padding: 10, borderRadius: 6, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
});
