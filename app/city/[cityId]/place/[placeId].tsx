// app/city/[cityId]/place/[placeId].tsx
// params-based polished detail screen

import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  Modal,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import MapView, { Marker, MapType } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius } from "../../../../theme";
import { Card, H1, P, Divider, SectionTitle } from "../../../../components/ui";

// 🔐 Supabase (self-contained client for this screen)
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
const ExpoSecureStoreAdapter = {
  getItem: (k: string) => SecureStore.getItemAsync(k),
  setItem: (k: string, v: string) => SecureStore.setItemAsync(k, v),
  removeItem: (k: string) => SecureStore.deleteItemAsync(k),
};
const SUPABASE_URL = "https://zuzxgvriikesremzorkl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1enhndnJpaWtlc3JlbXpvcmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzQwNTAsImV4cCI6MjA3MjExMDA1MH0.jblgi8WQcBG2oeUymOOuhH8pPENSvAcikJeN21Nk5h0";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

type Params = {
  cityName?: string;
  country?: string;
  name?: string;
  lat?: string;
  lon?: string;
  desc?: string;
};

// Some RN Maps typings don't include "mutedStandard" (iOS).
// So we extend locally to avoid TS errors.
type MapTypeX = MapType | "mutedStandard";

function gmaps(lat: number, lng: number, mode: "driving" | "walking" | "transit") {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`;
}
function amaps(lat: number, lng: number, flag: "d" | "w" | "r") {
  return `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=${flag}`;
}

/* ---------- Tiny reusable UI bits ---------- */
function Chip({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string }) {
  return (
    <View style={s.chip}>
      <Ionicons name={icon} size={13} color={Colors.textDim} />
      <Text style={s.chipText}>{label}</Text>
    </View>
  );
}

function ActionTile({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.07)" }}
      style={({ pressed }) => [s.tile, pressed && { opacity: 0.85 }]}
    >
      <View style={s.tileIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <Text style={s.tileLabel}>{label}</Text>
    </Pressable>
  );
}

function ActionRow({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} android_ripple={{ color: "rgba(0,0,0,0.07)" }} style={s.row}>
      <View style={s.iconWrap}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={s.rowCenter}>
        <Text style={s.rowLabel}>{label}</Text>
        {!!badge && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textDim} />
    </Pressable>
  );
}

/* ---------- Screen ---------- */
export default function PlaceDetails() {
  const { cityName, country, name, lat, lon, desc } = useLocalSearchParams<Params>();

  const latitude = Number(lat);
  const longitude = Number(lon);
  const label = String(name || "Place");
  const info = String(desc || "");

  const [mapType, setMapType] = useState<MapTypeX>("standard");
  const [mapOpen, setMapOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // ✅ Supabase-backed Saved toggle
  const toSlug = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-");
  const placeKey = `${toSlug(cityName || "")}|${toSlug(label)}`;
  const [isSaved, setIsSaved] = useState(false);
  const [rowId, setRowId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("saved_places")
        .select("id")
        .eq("user_id", user.id)
        .eq("place_key", placeKey)
        .maybeSingle();
      if (!error && data) {
        setIsSaved(true);
        setRowId(data.id);
      } else {
        setIsSaved(false);
        setRowId(null);
      }
    })();
  }, [placeKey]);

  const toggleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Sign in required", "Please sign in to save places.");
        return;
      }
      if (isSaved && rowId) {
        const { error } = await supabase.from("saved_places").delete().eq("id", rowId);
        if (error) throw error;
        setIsSaved(false);
        setRowId(null);
        Alert.alert("Removed", "Removed from Saved");
      } else {
        const { data, error } = await supabase
          .from("saved_places")
          .upsert({
            user_id: user.id,
            place_key: placeKey,
            name: label,
            city: cityName,
            country,
            lat: latitude,
            lon: longitude,
            description: info,
          })
          .select("id")
          .single();
        if (error) throw error;
        setIsSaved(true);
        setRowId(data?.id ?? null);
        Alert.alert("Saved", "Added to Saved");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not update Saved");
    } finally {
      setSaving(false);
    }
  };

  const coordsValid = useMemo(
    () => !!lat && !!lon && !Number.isNaN(latitude) && !Number.isNaN(longitude),
    [lat, lon, latitude, longitude]
  );

  if (!coordsValid) {
    return (
      <View style={s.emptyWrap}>
        <H1>Missing coordinates</H1>
        <P>Open this place from the City list.</P>
      </View>
    );
  }

  const cycleMapType = () => {
    const orderIOS: MapTypeX[] = ["standard", "mutedStandard", "satellite"];
    const orderAndroid: MapTypeX[] = ["standard", "terrain", "satellite"];
    const order = Platform.OS === "ios" ? orderIOS : orderAndroid;
    const idx = order.indexOf(mapType);
    setMapType(order[(idx + 1) % order.length]);
  };

  const sharePlace = async () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}(${encodeURIComponent(label)})`;
    await Share.share({
      message: `${label}${cityName ? ` — ${cityName}` : ""}${country ? `, ${country}` : ""}\n${
        info ? info + "\n" : ""
      }${url}`,
    });
  };

  const openGSearch = () =>
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}(${encodeURIComponent(label)})`);
  const openASearch = () =>
    Linking.openURL(`http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(label)}`);

  const placeLine = `${label}${cityName ? ` — ${cityName}` : ""}${country ? `, ${country}` : ""}`;

  return (
    <ScrollView style={{ backgroundColor: Colors.bg }} contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}>
      {/* Title */}
      <H1>{label}</H1>
      <P style={{ marginTop: -4 }}>{(cityName || "") + (cityName && country ? ", " : "") + (country || "")}</P>
      {!!info && <P style={{ marginTop: Spacing.sm }}>{info}</P>}

      {/* Quick facts */}
      <View style={s.chipsRow}>
        {!!cityName && <Chip icon="location-outline" label={cityName} />}
        {!!country && <Chip icon="flag-outline" label={country} />}
        <Chip icon="time-outline" label="Best: sunset" />
        <Chip icon="walk-outline" label="Visit: 60–90m" />
        <Chip icon="accessibility-outline" label="Family-friendly" />
      </View>

      {/* Actions grid (2×2) */}
      <View style={s.grid}>
        <ActionTile
          icon={isSaved ? "star" : "star-outline"}
          label={isSaved ? "Saved" : "Save"}
          onPress={toggleSave}
        />
        <ActionTile icon="share-outline" label="Share" onPress={sharePlace} />
        <ActionTile icon="map-outline" label="Google Maps" onPress={openGSearch} />
        {Platform.OS === "ios" ? (
          <ActionTile icon="logo-apple" label="Apple Maps" onPress={openASearch} />
        ) : (
          <ActionTile icon="cloud-download-outline" label="Offline tips" onPress={() => setHelpOpen(true)} />
        )}
      </View>

      {/* Mini-Map (non-interactive) */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <MapView
          pointerEvents="none"
          style={{ height: 160, width: "100%" }}
          mapType={mapType as MapType}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker coordinate={{ latitude, longitude }} title={label} />
        </MapView>

        {/* Expand overlay button */}
        <Pressable onPress={() => setMapOpen(true)} style={s.expandOverlay}>
          <Ionicons name="resize-outline" size={16} color={Colors.text} />
          <Text style={s.expandText}>Expand map</Text>
        </Pressable>
      </Card>

      {/* Directions */}
      <SectionTitle>Directions</SectionTitle>
      <Card style={{ paddingVertical: 2, paddingHorizontal: Spacing.md }}>
        <ActionRow icon="car-outline" label="Drive" badge="Google" onPress={() => Linking.openURL(gmaps(latitude, longitude, "driving"))} />
        <View style={s.hr} />
        <ActionRow icon="walk-outline" label="Walk" badge="Google" onPress={() => Linking.openURL(gmaps(latitude, longitude, "walking"))} />
        <View style={s.hr} />
        <ActionRow icon="train-outline" label="Transit" badge="Google" onPress={() => Linking.openURL(gmaps(latitude, longitude, "transit"))} />

        {Platform.OS === "ios" && (
          <>
            <View style={s.hrWide} />
            <ActionRow icon="car-outline" label="Drive" badge="Apple" onPress={() => Linking.openURL(amaps(latitude, longitude, "d"))} />
            <View style={s.hr} />
            <ActionRow icon="walk-outline" label="Walk" badge="Apple" onPress={() => Linking.openURL(amaps(latitude, longitude, "w"))} />
            <View style={s.hr} />
            <ActionRow icon="train-outline" label="Transit" badge="Apple" onPress={() => Linking.openURL(amaps(latitude, longitude, "r"))} />
          </>
        )}
      </Card>

      {/* Info footnote */}
      <P style={{ textAlign: "center", opacity: 0.7 }}>Directions open in external map apps.</P>

      {/* Offline tips modal */}
      <Modal visible={helpOpen} animationType="slide" transparent>
        <View style={s.modalWrap}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Offline tips</Text>
            <P>• Google Maps → Profile → Offline maps → Select your own map → Download.</P>
            <P>• Apple Maps (iOS 17+) → Search an area → Download.</P>
            <TouchableOpacity onPress={() => setHelpOpen(false)} style={[s.pill, { alignSelf: "flex-end", marginTop: Spacing.md }]}>
              <Text style={s.pillText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full-screen map modal */}
      <Modal visible={mapOpen} animationType="slide" presentationStyle="fullScreen">
        <View style={s.fullMap}>
          <View style={s.fullHeader}>
            <Pressable onPress={() => setMapOpen(false)} style={s.headerBtn}>
              <Ionicons name="close" size={22} color={Colors.text} />
              <Text style={s.headerBtnText}>Close</Text>
            </Pressable>
            <Pressable onPress={cycleMapType} style={s.headerBtn}>
              <Ionicons name="layers-outline" size={18} color={Colors.text} />
              <Text style={s.headerBtnText}>Map: {mapType}</Text>
            </Pressable>
          </View>

          <MapView
            style={{ flex: 1 }}
            mapType={mapType as MapType}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={{ latitude, longitude }} title={placeLine} />
          </MapView>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------- Styles ---------- */
const s = StyleSheet.create({
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.lg, backgroundColor: Colors.bg },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { color: Colors.textDim, fontSize: 12, fontWeight: "800" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, justifyContent: "space-between" },
  tile: {
    width: "48%",
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: "center",
    gap: 8,
  },
  tileIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tileLabel: { color: Colors.text, fontWeight: "800" },

  expandOverlay: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  expandText: { color: Colors.text, fontWeight: "800" },

  /* rows */
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  iconWrap: { width: 26, alignItems: "center", marginRight: 8 },
  rowCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  rowLabel: { color: Colors.text, fontSize: 16, fontWeight: "800" },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: { color: Colors.textDim, fontSize: 12, fontWeight: "800" },

  hr: { height: 1, backgroundColor: Colors.border },
  hrWide: { height: 1, backgroundColor: Colors.border, marginVertical: 2 },

  /* pill (reused for close button) */
  pill: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: { color: Colors.text, fontWeight: "800" },

  /* modal styles */
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalCard: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: Spacing.sm,
  },

  /* full-screen map */
  fullMap: { flex: 1, backgroundColor: Colors.bg },
  fullHeader: {
    paddingTop: Platform.OS === "ios" ? 56 : 16,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerBtnText: { color: Colors.text, fontWeight: "800" },
});
