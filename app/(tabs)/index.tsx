// app/(tabs)/index.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Card, Pill, SectionTitle, Divider } from "../../components/ui";
import Hero from "../../components/Hero";
import { Colors, Spacing, Radius } from "../../theme";
import { db } from "../../lib/db";

// Polyfills (keep at top)
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

// Supabase (single-file client)
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// ✅ your project values
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

const SUGGEST = [
  "London", "New York", "Paris", "Tokyo",
  "Jaipur", "Cherrapunji", "Tuscany", "Zurich",
  "Himalayas", "Wellington"
];

const POPULAR: { name: string; emoji: string }[] = [
  { name: "Paris", emoji: "🗼" }, { name: "New York", emoji: "🗽" }, { name: "Tokyo", emoji: "🗾" },
  { name: "London", emoji: "🎡" }, { name: "Zurich", emoji: "🏔️" }, { name: "Tuscany", emoji: "🏛️" },
];

// util
export const toSlug = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-");

// type for saved rows
type SavedRow = {
  id: string;
  place_key: string;
  name: string;
  city: string | null;
  country: string | null;
  lat: number;
  lon: number;
  description: string | null;
  created_at?: string;
};

type AuthState = {
  email: string;
  pass: string;
  fullName: string;
  dob: string;
  dobDate: Date | null;
  mode: "in" | "up";
  loading: boolean;
  showPassword: boolean;
  showIosPicker: boolean;
};

const defaultAuth: AuthState = {
  email: "",
  pass: "",
  fullName: "",
  dob: "",
  dobDate: null,
  mode: "in",
  loading: false,
  showPassword: false,
  showIosPicker: false,
};

// -------------------- INLINE AUTH --------------------
function InlineAuth() {
  const [state, setState] = useState<AuthState>(defaultAuth);
  const update = useCallback((patch: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const isSignUp = state.mode === "up";

  useEffect(() => {
    if (!isSignUp) update({ showIosPicker: false });
  }, [isSignUp, update]);

  const handleDobSelect = (date: Date) =>
    update({ dobDate: date, dob: date.toISOString().split("T")[0] });

  const openDatePicker = () => {
    const value = state.dobDate ?? new Date(2000, 0, 1);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date",
        value,
        maximumDate: new Date(),
        onChange: (_event, selectedDate) => selectedDate && handleDobSelect(selectedDate),
      });
      return;
    }
    update({ showIosPicker: true });
  };

  const onIosDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) =>
    selectedDate && handleDobSelect(selectedDate);

  const submit = async () => {
    const { email, pass, mode, fullName, dob } = state;
    if (!email || !pass) return Alert.alert("Missing", "Enter email and password");
    update({ loading: true });
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: fullName || null, dob: dob || null } },
      });
      if (error) throw error;
      if (!data?.session) {
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (e2) throw e2;
      }
    } catch (e: any) {
      Alert.alert(mode === "in" ? "Sign in failed" : "Sign up failed", e?.message ?? "Try again");
    } finally {
      update({ loading: false });
    }
  };

  const toggleMode = () => update({ mode: isSignUp ? "in" : "up" });
  const label = state.loading
    ? state.mode === "in"
      ? "Signing in…"
      : "Creating…"
    : state.mode === "in"
      ? "Sign In"
      : "Sign Up";

  return (
    <View style={{ padding: Spacing.lg, gap: Spacing.md, flex: 1, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "800", color: Colors.text, textAlign: "center" }}>
        {isSignUp ? "Create your CityHop account" : "Sign in to CityHop"}
      </Text>

      <Card>
        <TextInput
          placeholder="Email"
          placeholderTextColor={Colors.textDim}
          autoCapitalize="none"
          keyboardType="email-address"
          style={authStyles.input}
          value={state.email}
          onChangeText={(email) => update({ email })}
        />
        <View style={authStyles.passwordWrapper}>
          <TextInput
            placeholder="Password"
            placeholderTextColor={Colors.textDim}
            secureTextEntry={!state.showPassword}
            style={[authStyles.input, authStyles.passwordInput]}
            value={state.pass}
            onChangeText={(pass) => update({ pass })}
            autoCapitalize="none"
          />
          <TouchableOpacity
            accessibilityLabel={state.showPassword ? "Hide password" : "Show password"}
            onPress={() => update({ showPassword: !state.showPassword })}
            style={authStyles.eyeToggle}
          >
            <Feather name={state.showPassword ? "eye-off" : "eye"} size={20} color={Colors.textDim} />
          </TouchableOpacity>
        </View>

        {isSignUp && (
          <>
            <TextInput
              placeholder="Full name (optional)"
              placeholderTextColor={Colors.textDim}
              style={authStyles.input}
              value={state.fullName}
              onChangeText={(fullName) => update({ fullName })}
            />
            <TouchableOpacity activeOpacity={0.8} onPress={openDatePicker} style={authStyles.dateButton}>
              <Text style={state.dob ? authStyles.dateText : authStyles.datePlaceholder}>
                {state.dob || "Date of birth (optional)"}
              </Text>
            </TouchableOpacity>
            {Platform.OS === "ios" && state.showIosPicker && (
              <View style={authStyles.iosPickerContainer}>
                <DateTimePicker
                  value={state.dobDate ?? new Date(2000, 0, 1)}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={onIosDateChange}
                  style={authStyles.iosPicker}
                />
                <TouchableOpacity onPress={() => update({ showIosPicker: false })} style={authStyles.iosPickerDoneBtn}>
                  <Text style={authStyles.iosPickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={authStyles.btn} onPress={submit} disabled={state.loading}>
          <Text style={authStyles.btnText}>{label}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMode} style={{ marginTop: 10, alignItems: "center" }}>
          <Text style={{ color: Colors.primary, fontWeight: "700" }}>
            {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
          </Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
}

const fieldFrame = {
  borderWidth: 1,
  borderColor: Colors.border,
  backgroundColor: Colors.card,
  borderRadius: Radius.lg,
  padding: Spacing.md,
};

const textInputBase = {
  ...fieldFrame,
  color: Colors.text,
  fontSize: 16,
};

const authStyles = StyleSheet.create({
  input: { ...textInputBase, marginBottom: Spacing.md },
  passwordWrapper: { marginBottom: Spacing.md },
  passwordInput: { ...textInputBase, marginBottom: 0, paddingRight: Spacing.xl },
  eyeToggle: { position: "absolute", right: Spacing.md, top: 0, bottom: 0, justifyContent: "center", paddingHorizontal: 4 },
  dateButton: { ...fieldFrame, marginBottom: Spacing.md },
  dateText: { color: Colors.text, fontSize: 16 },
  datePlaceholder: { color: Colors.textDim, fontSize: 16 },
  iosPickerContainer: { ...fieldFrame, marginBottom: Spacing.md },
  iosPicker: { alignSelf: "stretch" },
  iosPickerDoneBtn: { alignSelf: "flex-end", backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  iosPickerDoneText: { color: "#fff", fontWeight: "600" },
  btn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: Radius.md, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
// -----------------------------------------------------

export default function Home() {
  const [q, setQ] = useState("");
  const router = useRouter();

  // auth
  const [authLoading, setAuthLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // saved rows
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [itineraryCount, setItineraryCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setAuthLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // refresh "Saved" whenever Home gains focus
  const refreshHome = useCallback(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setSaved([]); return; }
      supabase
        .from("saved_places")
        .select("id,place_key,name,city,country,lat,lon,description,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => { if (!error) setSaved(data || []); });
    });

    db.getAllAsync<{ count: number | string }>("SELECT COUNT(*) as count FROM itineraries")
      .then((rows) => setItineraryCount(Number(rows?.[0]?.count ?? 0) || 0))
      .catch((error) => {
        console.log("❌ Error loading itinerary count", error);
        setItineraryCount(0);
      });
  }, []);

  useFocusEffect(useCallback(() => { refreshHome(); }, [refreshHome]));

  const go = (city: string) => { Keyboard.dismiss(); router.push(`/city/${encodeURIComponent(city)}` as any); };
  const onSearch = () => { const city = q.trim(); if (!city) return; go(city); };

  const filtered = q.length
    ? SUGGEST.filter((c) => c.toLowerCase().startsWith(q.toLowerCase())).slice(0, 5)
    : SUGGEST.slice(0, 8);

  const userName = session?.user?.user_metadata?.full_name as string | undefined;
  const greeting = userName ? `Welcome back, ${userName.split(" ")[0]}!` : "Welcome back";
  const subGreeting = "Let’s curate a bespoke city guide for your next getaway.";
  const suggestionHint = SUGGEST.slice(0, 3).join(", ");

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) return <InlineAuth />;

  // ✅ Scrollable Home + Saved + bottom Sign Out
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={{ paddingBottom: Spacing.xl }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Banner */}
      <Hero />

      {/* Home content */}
      <View style={s.container}>
        <View style={s.welcomeCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.welcomeLabel}>{greeting}</Text>
            <Text style={s.welcomeSubtitle}>{subGreeting}</Text>
          </View>
          <View style={s.welcomeBadge}>
            <Feather name="compass" size={24} color="#fff" />
          </View>
        </View>

        <Card style={s.searchCard}>
          <Text style={s.searchTitle}>Where are we headed?</Text>
          <View style={s.searchRow}>
            <Feather name="search" size={18} color={Colors.textDim} />
            <TextInput
              placeholder="Search for a city or hidden gem"
              placeholderTextColor={Colors.textDim}
              value={q}
              onChangeText={setQ}
              onSubmitEditing={onSearch}
              returnKeyType="search"
              autoCorrect={false}
              style={s.searchInput}
            />
          </View>
          <TouchableOpacity onPress={onSearch} activeOpacity={0.92}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.searchBtn}
            >
              <Text style={s.searchBtnText}>Search destinations</Text>
              <Feather name="arrow-up-right" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <View style={s.tipRow}>
            <Feather name="info" size={14} color={Colors.textDim} />
            <Text style={s.tipText}>Try {suggestionHint} to get inspired.</Text>
          </View>
        </Card>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/itinerary" as any)}
          style={s.itineraryLink}
        >
          <Feather name="calendar" size={20} color={Colors.primary} />
          <Text style={s.itineraryLinkText}>
            {`Itinerary${itineraryCount > 0 ? ` (${itineraryCount})` : ""}`}
          </Text>
        </TouchableOpacity>

        {/* Saved from Supabase */}
        {saved.length > 0 && (
          <>
            <SectionTitle>Saved</SectionTitle>
            <View style={s.savedList}>
              {saved.map((p) => {
                const citySlug = toSlug(p.city || "");
                const placeSlug = toSlug(p.name);
                const location = [p.city, p.country].filter(Boolean).join(", ");
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={s.savedItem}
                    activeOpacity={0.9}
                    onPress={() =>
                      router.push({
                        pathname: `/city/${citySlug}/place/${placeSlug}`,
                        params: {
                          name: p.name,
                          lat: String(p.lat),
                          lon: String(p.lon),
                          cityName: p.city || "",
                          country: p.country || "",
                          desc: p.description || "",
                        },
                      } as any)
                    }
                  >
                    <View style={s.savedIconWrap}>
                      <Feather name="bookmark" size={18} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={s.savedTitle} numberOfLines={1}>{p.name}</Text>
                      {!!location && (
                        <Text style={s.savedMeta} numberOfLines={1}>{location}</Text>
                      )}
                    </View>
                    <Feather name="chevron-right" size={18} color={Colors.textDim} />
                  </TouchableOpacity>
                );
              })}
            </View>
            <Divider />
          </>
        )}

        <SectionTitle>Suggestions</SectionTitle>
        <Text style={s.sectionSubtitle}>Hand-picked destinations based on your recent searches.</Text>
        <View style={s.pillsWrap}>
          {filtered.map((c) => (<Pill key={c} label={c} onPress={() => go(c)} />))}
        </View>

        <Divider />

        <SectionTitle>Popular cities</SectionTitle>
        <Text style={s.sectionSubtitle}>Trending hotspots that travelers can’t stop raving about.</Text>
        <View style={s.grid}>
          {POPULAR.map((item, index) => (
            <TouchableOpacity key={item.name} style={s.tile} activeOpacity={0.9} onPress={() => go(item.name)}>
              <LinearGradient
                colors={[Colors.cardAlt, "#FFFFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.tileGradient}
              >
                <View style={s.tileHeader}>
                  <View style={s.tileBadge}>
                    <Text style={s.tileBadgeText}>{`0${index + 1}`}</Text>
                  </View>
                  <Text style={s.emoji}>{item.emoji}</Text>
                </View>
                <Text style={s.tileLabel}>{item.name}</Text>
                <View style={s.tileFooter}>
                  <Feather name="navigation" size={14} color={Colors.primary} />
                  <Text style={s.tileFooterText}>Tap to explore</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* 👇 Sign Out — bottom */}
        <TouchableOpacity onPress={() => supabase.auth.signOut()} activeOpacity={0.85} style={s.signoutBtn}>
          <Feather name="log-out" size={16} color={Colors.primary} />
          <Text style={s.signoutText}>Sign out ({session?.user?.email ?? "account"})</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const rowCenter = { flexDirection: "row", alignItems: "center" } as const;
const center = { alignItems: "center", justifyContent: "center" } as const;
const shadowBase = { shadowColor: Colors.shadow, shadowOpacity: 1, shadowOffset: { width: 0, height: 16 }, elevation: 6 } as const;
const shadowSoft = { shadowColor: Colors.shadow, shadowOpacity: 1, shadowOffset: { width: 0, height: 10 }, shadowRadius: 16, elevation: 3 } as const;
const dimText = { color: Colors.textDim, fontSize: 13 } as const;

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.lg, backgroundColor: Colors.bg, paddingBottom: Spacing.xl },
  pillsWrap: { ...rowCenter, flexWrap: "wrap", gap: Spacing.sm },
  grid: { ...rowCenter, flexWrap: "wrap", justifyContent: "space-between", rowGap: Spacing.lg, marginTop: Spacing.sm },
  tile: { width: "48%", borderRadius: Radius.lg },
  emoji: { fontSize: 28 },
  tileLabel: { color: Colors.text, fontWeight: "800", fontSize: 18, marginTop: Spacing.sm },
  signoutBtn: { ...rowCenter, marginTop: Spacing.xl, alignSelf: "center", backgroundColor: Colors.card, borderRadius: 999, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.xs, borderWidth: 1, borderColor: Colors.border },
  signoutText: { color: Colors.primary, fontWeight: "800" },
  welcomeCard: { ...rowCenter, marginTop: -Spacing.xl, backgroundColor: Colors.card, padding: Spacing.lg, borderRadius: Radius.xl, gap: Spacing.lg, ...shadowBase, shadowRadius: 22 },
  welcomeLabel: { fontSize: 22, fontWeight: "800", color: Colors.text },
  welcomeSubtitle: { ...dimText, marginTop: Spacing.xs, lineHeight: 20 },
  welcomeBadge: { ...center, width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary },
  searchCard: { gap: Spacing.md },
  searchTitle: { fontSize: 18, fontWeight: "700", color: Colors.text },
  searchRow: { ...rowCenter, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.cardAlt },
  searchInput: { flex: 1, color: Colors.text, fontSize: 16 },
  searchBtn: { ...rowCenter, marginTop: Spacing.sm, borderRadius: Radius.lg, paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.lg, justifyContent: "space-between" },
  searchBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  itineraryLink: {
    ...rowCenter,
    gap: Spacing.sm,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  itineraryLinkText: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  tipRow: { ...rowCenter, gap: Spacing.xs },
  tipText: { ...dimText, flex: 1 },
  savedList: { gap: Spacing.sm },
  savedItem: { ...rowCenter, gap: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, borderWidth: 1, borderColor: Colors.border, ...shadowSoft },
  savedIconWrap: { ...center, width: 28, height: 28 },
  savedTitle: { color: Colors.text, fontWeight: "700", fontSize: 15 },
  savedMeta: { ...dimText },
  sectionSubtitle: { ...dimText, marginBottom: Spacing.sm },
  tileGradient: { borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  tileHeader: { ...rowCenter, justifyContent: "space-between" },
  tileBadge: { backgroundColor: Colors.bgAlt, borderRadius: 999, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  tileBadgeText: { color: Colors.primary, fontWeight: "700", fontSize: 12, letterSpacing: 0.6 },
  tileFooter: { ...rowCenter, gap: Spacing.xs, marginTop: Spacing.sm },
  tileFooterText: { color: Colors.primary, fontWeight: "600", fontSize: 12, letterSpacing: 0.3 },
});
