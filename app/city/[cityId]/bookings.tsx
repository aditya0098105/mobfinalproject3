import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../../lib/db";
import { Colors, Radius, Spacing } from "../../../theme";

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

  const loadBookings = useCallback(async () => {
    try {
      const result: any = await db.getAllAsync(
        "SELECT * FROM bookings WHERE city=?",
        [cityId]
      );
      setBookings(result);
    } catch (err) {
      console.log("❌ Error loading bookings:", err);
    }
  }, [cityId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

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
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.heading}>Bookings</Text>
        <Text style={s.subheading}>Manage stays in {cityId}</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>No bookings yet</Text>
          <Text style={s.emptyText}>Add a reservation to see it listed here.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          renderItem={({ item }) => (
            <View style={s.card}>
              <Text style={s.cardTitle}>{item.hotel_name}</Text>
              <Text style={s.cardMeta}>
                {item.start_date} to {item.end_date}
              </Text>
              <Text style={s.cardMeta}>Guest: {item.customer_name}</Text>
              <Text style={s.cardMeta}>Address: {item.customer_address}</Text>

              <View style={s.cardActions}>
                <TouchableOpacity style={s.linkBtn} onPress={() => openEditModal(item)}>
                  <Text style={s.linkText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.linkBtn}
                  onPress={() =>
                    Alert.alert("Delete booking?", "This action cannot be undone.", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => deleteBooking(item.id) },
                    ])
                  }
                >
                  <Text style={[s.linkText, { color: Colors.accent }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={editModalVisible} animationType="fade" transparent>
        <View style={s.modalWrap}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Edit booking</Text>

            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Guest name"
              placeholderTextColor={Colors.textDim}
            />
            <TextInput
              style={s.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Guest address"
              placeholderTextColor={Colors.textDim}
            />
            <TextInput
              style={s.input}
              value={start}
              onChangeText={setStart}
              placeholder="Start date"
              placeholderTextColor={Colors.textDim}
            />
            <TextInput
              style={s.input}
              value={end}
              onChangeText={setEnd}
              placeholder="End date"
              placeholderTextColor={Colors.textDim}
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={[s.modalBtn, s.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, s.saveBtn]} onPress={saveEdit}>
                <Text style={s.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md, gap: 4 },
  heading: { fontSize: 24, fontWeight: "700", color: Colors.text },
  subheading: { color: Colors.textDim },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  separator: { height: Spacing.md },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: Colors.text },
  emptyText: { color: Colors.textDim, textAlign: "center" },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: { fontWeight: "700", fontSize: 16, color: Colors.text },
  cardMeta: { color: Colors.textDim, marginTop: 4 },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", gap: Spacing.md, marginTop: Spacing.md },
  linkBtn: { paddingVertical: 4, paddingHorizontal: Spacing.xs },
  linkText: { color: Colors.primary, fontWeight: "600" },
  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", padding: Spacing.lg },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: Colors.text },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    backgroundColor: Colors.cardAlt,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: Spacing.sm, marginTop: Spacing.sm },
  modalBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.sm },
  cancelBtn: { backgroundColor: Colors.cardAlt },
  saveBtn: { backgroundColor: Colors.primary },
  cancelText: { color: Colors.text },
  saveText: { color: "#fff", fontWeight: "600" },
});
