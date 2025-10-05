import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    <LinearGradient colors={[Colors.bg, Colors.bgAlt]} style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.header}>
          <View>
            <Text style={s.heading}>Bookings</Text>
            <Text style={s.subheading}>Manage stays and guest details in {cityId}</Text>
          </View>
          <View style={s.headerBadge}>
            <Ionicons name="bed-outline" size={16} color={Colors.primary} />
            <Text style={s.headerBadgeText}>{bookings.length} active</Text>
          </View>
        </View>

        {bookings.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="calendar-clear" size={32} color={Colors.primary} />
            <Text style={s.emptyTitle}>No bookings yet</Text>
            <Text style={s.emptyText}>
              When guests reserve a stay, their confirmation will appear here so you can edit or manage it on the go.
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={s.list}
            renderItem={({ item }) => (
              <View style={s.card}>
                <View style={s.cardHeader}>
                  <Text style={s.title}>{item.hotel_name}</Text>
                  <View style={s.datePill}>
                    <Ionicons name="calendar" size={14} color={Colors.primary} />
                    <Text style={s.datePillText}>
                      {item.start_date} → {item.end_date}
                    </Text>
                  </View>
                </View>

                <View style={s.rowItem}>
                  <Ionicons name="person-circle-outline" size={18} color={Colors.textDim} />
                  <Text style={s.bodyText}>{item.customer_name}</Text>
                </View>
                <View style={s.rowItem}>
                  <Ionicons name="home-outline" size={18} color={Colors.textDim} />
                  <Text style={s.bodyText}>{item.customer_address}</Text>
                </View>

                <View style={s.cardActions}>
                  <TouchableOpacity style={[s.actionBtn, s.editBtn]} onPress={() => openEditModal(item)}>
                    <Ionicons name="create-outline" size={18} color={"#fff"} />
                    <Text style={s.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.actionBtn, s.deleteBtn]}
                    onPress={() =>
                      Alert.alert("Delete booking?", "This action cannot be undone.", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => deleteBooking(item.id) },
                      ])
                    }
                  >
                    <Ionicons name="trash-outline" size={18} color={"#fff"} />
                    <Text style={s.actionText}>Delete</Text>
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
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Edit booking</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)} style={s.modalClose}>
                  <Ionicons name="close" size={20} color={Colors.textDim} />
                </TouchableOpacity>
              </View>

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
              <View style={s.inputRow}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  value={start}
                  onChangeText={setStart}
                  placeholder="Start date"
                  placeholderTextColor={Colors.textDim}
                />
                <View style={{ width: Spacing.sm }} />
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  value={end}
                  onChangeText={setEnd}
                  placeholder="End date"
                  placeholderTextColor={Colors.textDim}
                />
              </View>

              <View style={s.modalActions}>
                <TouchableOpacity style={[s.modalBtn, s.cancelBtn]} onPress={() => setEditModalVisible(false)}>
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.modalBtn, s.saveBtn]} onPress={saveEdit}>
                  <Text style={s.saveText}>Save changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: { fontSize: 28, fontWeight: "800", color: Colors.text },
  subheading: { color: Colors.textDim, marginTop: 4 },
  headerBadge: {
    backgroundColor: Colors.card,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerBadgeText: { color: Colors.primary, fontWeight: "700", fontSize: 12, textTransform: "uppercase" },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: "center",
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.text },
  emptyText: { color: Colors.textDim, textAlign: "center", lineHeight: 20 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontWeight: "700", fontSize: 18, color: Colors.text, flex: 1, paddingRight: Spacing.sm },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.cardAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  datePillText: { color: Colors.text, fontWeight: "600", fontSize: 12 },
  rowItem: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: Spacing.sm },
  bodyText: { color: Colors.text, flex: 1, lineHeight: 20 },
  cardActions: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.lg },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  editBtn: { backgroundColor: Colors.primary },
  deleteBtn: { backgroundColor: Colors.accent },
  actionText: { color: "#fff", fontWeight: "700" },

  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(16,24,40,0.4)",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: Colors.text },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardAlt,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.sm,
    color: Colors.text,
    backgroundColor: Colors.cardAlt,
  },
  inputRow: { flexDirection: "row" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
  },
  cancelBtn: { backgroundColor: Colors.cardAlt, borderWidth: 1, borderColor: Colors.border },
  saveBtn: { backgroundColor: Colors.primary },
  cancelText: { color: Colors.text, fontWeight: "600" },
  saveText: { color: "#fff", fontWeight: "700" },
});
