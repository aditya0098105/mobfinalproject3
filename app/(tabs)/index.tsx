// app/(tabs)/index.tsx
// Short, same behavior. Comments kept brief.

import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid, type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Hero from "../../components/Hero";
import { Card, Divider, Pill, SectionTitle } from "../../components/ui";
import { Colors, Radius, Spacing } from "../../theme";

// Polyfills
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

// Supabase (single-file client)
import { createClient, type Session } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
const store = {
  getItem: (k: string) => SecureStore.getItemAsync(k),
  setItem: (k: string, v: string) => SecureStore.setItemAsync(k, v),
  removeItem: (k: string) => SecureStore.deleteItemAsync(k),
};
const SUPABASE_URL = "https://zuzxgvriikesremzorkl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1enhndnJpaWtlc3JlbXpvcmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzQwNTAsImV4cCI6MjA3MjExMDA1MH0.jblgi8WQcBG2oeUymOOuhH8pPENSvAcikJeN21Nk5h0";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { storage: store, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});

// Data
const SUGGEST = ["London", "New York", "Paris", "Tokyo", "Jaipur", "Cherrapunji", "Tuscany", "Zurich", "Himalayas", "Wellington"];
const POPULAR = [
  { name: "Paris", emoji: "🗼" }, { name: "New York", emoji: "🗽" }, { name: "Tokyo", emoji: "🗾" },
  { name: "London", emoji: "🎡" }, { name: "Zurich", emoji: "🏔️" }, { name: "Tuscany", emoji: "🏛️" },
];

// Utils
const toSlug = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-");

// Types
type SavedRow = {
  id: string; place_key: string; name: string;
  city: string | null; country: string | null;
  lat: number; lon: number; description: string | null; created_at?: string;
};
type AuthState = {
  email: string; pass: string; fullName: string; dob: string; dobDate: Date | null;
  mode: "in" | "up"; loading: boolean; showPassword: boolean; showIosPicker: boolean;
};
const initAuth: AuthState = {
  email: "", pass: "", fullName: "", dob: "", dobDate: null, mode: "in",
  loading: false, showPassword: false, showIosPicker: false,
};

// ---------- Inline Auth (short) ----------
function InlineAuth() {
  const [st, set] = useState<AuthState>(initAuth);
  const isUp = st.mode === "up";
  const patch = (p: Partial<AuthState>) => set((x) => ({ ...x, ...p }));

  useEffect(() => { if (!isUp) patch({ showIosPicker: false }); }, [isUp]);

  const pickDob = (d: Date) => patch({ dobDate: d, dob: d.toISOString().split("T")[0] });
  const openDob = () => {
    const v = st.dobDate ?? new Date(2000, 0, 1);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date", value: v, maximumDate: new Date(),
        onChange: (_e, d) => d && pickDob(d),
      });
    } else patch({ showIosPicker: true });
  };
  const onIosDob = (_e: DateTimePickerEvent, d?: Date) => d && pickDob(d);

  const submit = async () => {
    const { email, pass, mode, fullName, dob } = st;
    if (!email || !pass) return Alert.alert("Missing", "Enter email and password");
    patch({ loading: true });
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password: pass, options: { data: { full_name: fullName || null, dob: dob || null } },
        });
        if (error) throw error;
        if (!data?.session) {
          const { error: e2 } = await supabase.auth.signInWithPassword({ email, password: pass });
          if (e2) throw e2;
        }
      }
    } catch (e: any) {
      Alert.alert(st.mode === "in" ? "Sign in failed" : "Sign up failed", e?.message ?? "Try again");
    } finally { patch({ loading: false }); }
  };

  const toggle = () => patch({ mode: isUp ? "in" : "up" });
  const label = st.loading ? (st.mode === "in" ? "Signing in…" : "Creating…") : (st.mode === "in" ? "Sign In" : "Sign Up");

  return (
    <View style={[fx1, pLG, { gap: Spacing.md, justifyContent: "center" }]}>
      <Text style={t.h1}>{isUp ? "Create your CityHop account" : "Sign in to CityHop"}</Text>
      <Card>
        <TextInput placeholder="Email" placeholderTextColor={Colors.textDim}
          autoCapitalize="none" keyboardType="email-address" style={stx.input}
          value={st.email} onChangeText={(email) => patch({ email })} />
        <View style={{ marginBottom: Spacing.md }}>
          <TextInput placeholder="Password" placeholderTextColor={Colors.textDim}
            secureTextEntry={!st.showPassword} autoCapitalize="none"
            style={[stx.input, { marginBottom: 0, paddingRight: Spacing.xl }]}
            value={st.pass} onChangeText={(pass) => patch({ pass })} />
          <TouchableOpacity
            accessibilityLabel={st.showPassword ? "Hide password" : "Show password"}
            onPress={() => patch({ showPassword: !st.showPassword })} style={stx.eye}>
            <Feather name={st.showPassword ? "eye-off" : "eye"} size={20} color={Colors.textDim} />
          </TouchableOpacity>
        </View>

        {isUp && (
          <>
            <TextInput placeholder="Full name (optional)" placeholderTextColor={Colors.textDim}
              style={stx.input} value={st.fullName} onChangeText={(fullName) => patch({ fullName })} />
            <TouchableOpacity activeOpacity={0.8} onPress={openDob} style={stx.dateBtn}>
              <Text style={st.dob ? t.body : t.dim}>{st.dob || "Date of birth (optional)"}</Text>
            </TouchableOpacity>
            {Platform.OS === "ios" && st.showIosPicker && (
              <View style={stx.iosBox}>
                <DateTimePicker value={st.dobDate ?? new Date(2000, 0, 1)}
                  mode="date" display="spinner" maximumDate={new Date()}
                  onChange={onIosDob} style={{ alignSelf: "stretch" }} />
                <TouchableOpacity onPress={() => patch({ showIosPicker: false })} style={stx.doneBtn}>
                  <Text style={t.btnWhite}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={stx.cta} onPress={submit} disabled={st.loading}>
          <Text style={t.btnWhite}>{label}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggle} style={center}>
          <Text style={t.link}>{isUp ? "Already have an account? Sign in" : "New here? Create an account"}</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
}

// ---------- Home ----------
export default function Home() {
  const [q, setQ] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const r = useRouter();

  // session
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setAuthLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // refresh saved on focus
  const refresh = useCallback(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return setSaved([]);
      supabase
        .from("saved_places")
        .select("id,place_key,name,city,country,lat,lon,description,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => { if (!error) setSaved(data || []); });
    });
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const go = (city: string) => { Keyboard.dismiss(); r.push(`/city/${encodeURIComponent(city)}` as any); };
  const onSearch = () => { const city = q.trim(); if (city) go(city); };
  const filtered = useMemo(
    () => (q ? SUGGEST.filter((c) => c.toLowerCase().startsWith(q.toLowerCase())).slice(0, 5) : SUGGEST.slice(0, 8)),
    [q]
  );
  const hint = useMemo(() => SUGGEST.slice(0, 3).join(", "), []);

  if (authLoading) return (<View style={loader}><ActivityIndicator /></View>);
  if (!session) return <InlineAuth />;

  return (
    <ScrollView style={fx1} contentContainerStyle={{ paddingBottom: Spacing.xl }} keyboardShouldPersistTaps="handled">
      <Hero />

      <View style={sx.container}>
        {/* Search */}
        <Card style={{ gap: Spacing.md }}>
          <Text style={t.h2}>Where are we headed?</Text>
          <View style={sx.searchRow}>
            <Feather name="search" size={18} color={Colors.textDim} />
            <TextInput
              placeholder="Search for a city or hidden gem" placeholderTextColor={Colors.textDim}
              value={q} onChangeText={setQ} onSubmitEditing={onSearch} returnKeyType="search"
              autoCorrect={false} style={sx.searchInput}
            />
          </View>
          <TouchableOpacity onPress={onSearch} activeOpacity={0.92}>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sx.searchBtn}>
              <Text style={t.btnWhiteBold}>Search destinations</Text>
              <Feather name="arrow-up-right" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <View style={row}>
            <Feather name="info" size={14} color={Colors.textDim} />
            <Text style={t.dim}>Try {hint} to get inspired.</Text>
          </View>
        </Card>

        {/* Itinerary link */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => r.push("/itinerary" as any)} style={sx.itinLink}>
          <Feather name="calendar" size={20} color={Colors.primary} />
          <Text style={t.btnText}>Itinerary</Text>
        </TouchableOpacity>

        {/* Saved */}
        {!!saved.length && (
          <>
            <SectionTitle>Saved</SectionTitle>
            <View style={{ gap: Spacing.sm }}>
              {saved.map((p) => {
                const citySlug = toSlug(p.city || "");
                const placeSlug = toSlug(p.name);
                const loc = [p.city, p.country].filter(Boolean).join(", ");
                return (
                  <TouchableOpacity key={p.id} style={sx.savedItem} activeOpacity={0.9}
                    onPress={() =>
                      r.push({
                        pathname: `/city/${citySlug}/place/${placeSlug}`,
                        params: {
                          name: p.name, lat: String(p.lat), lon: String(p.lon),
                          cityName: p.city || "", country: p.country || "", desc: p.description || "",
                        },
                      } as any)
                    }>
                    <Feather name="bookmark" size={18} color={Colors.textDim} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={t.titleSm} numberOfLines={1}>{p.name}</Text>
                      {!!loc && <Text style={t.dim} numberOfLines={1}>{loc}</Text>}
                    </View>
                    <Feather name="chevron-right" size={18} color={Colors.textDim} />
                  </TouchableOpacity>
                );
              })}
            </View>
            <Divider />
          </>
        )}

        {/* Suggestions */}
        <SectionTitle>Suggestions</SectionTitle>
        <Text style={t.dim}>Hand-picked destinations based on your recent searches.</Text>
        <View style={sx.pills}>
          {filtered.map((c) => (<Pill key={c} label={c} onPress={() => go(c)} />))}
        </View>
        <Divider />

        {/* Popular */}
        <SectionTitle>Popular cities</SectionTitle>
        <Text style={t.dim}>Trending hotspots that travelers can’t stop raving about.</Text>
        <View style={sx.grid}>
          {POPULAR.map((it, i) => (
            <TouchableOpacity key={it.name} style={sx.tile} activeOpacity={0.9} onPress={() => go(it.name)}>
              <LinearGradient colors={[Colors.cardAlt, "#FFFFFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sx.tileGrad}>
                <View style={rowBetween}>
                  <View style={sx.badge}><Text style={sx.badgeTxt}>{`0${i + 1}`}</Text></View>
                  <Text style={{ fontSize: 28 }}>{it.emoji}</Text>
                </View>
                <Text style={t.tile}>{it.name}</Text>
                <View style={row}>
                  <Feather name="navigation" size={14} color={Colors.primary} />
                  <Text style={sx.tileFoot}>Tap to explore</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity onPress={() => supabase.auth.signOut()} activeOpacity={0.85} style={sx.signout}>
          <Feather name="log-out" size={16} color={Colors.primary} />
          <Text style={t.linkBold}>Sign out ({session?.user?.email ?? "account"})</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---------- Shared tiny style tokens ----------
const fx1 = { flex: 1 };
const row = { flexDirection: "row", alignItems: "center", gap: Spacing.xs } as const;
const rowBetween = { flexDirection: "row", alignItems: "center", justifyContent: "space-between" } as const;
const pLG = { padding: Spacing.lg };
const center = { alignItems: "center" } as const;
const shadow = { shadowColor: Colors.shadow, shadowOpacity: 1, shadowOffset: { width: 0, height: 10 }, shadowRadius: 16, elevation: 3 } as const;
const loader = { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" } as const;

// Text presets
const t = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "800", color: Colors.text, textAlign: "center" },
  h2: { fontSize: 18, fontWeight: "700", color: Colors.text },
  body: { color: Colors.text, fontSize: 16 },
  dim: { color: Colors.textDim, fontSize: 13 },
  btnWhite: { color: "#fff", fontSize: 15, fontWeight: "700" },
  btnWhiteBold: { color: "#fff", fontWeight: "700", fontSize: 15 },
  link: { color: Colors.primary, fontWeight: "700" },
  linkBold: { color: Colors.primary, fontWeight: "800" },
  btnText: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  titleSm: { color: Colors.text, fontWeight: "700", fontSize: 15 },
  tile: { color: Colors.text, fontWeight: "800", fontSize: 18, marginTop: Spacing.sm },
});

// Auth styles (compact)
const field = { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md };
const inputBase = { ...field, color: Colors.text, fontSize: 16 } as const;
const stx = StyleSheet.create({
  input: { ...inputBase, marginBottom: Spacing.md },
  eye: { position: "absolute", right: Spacing.md, top: 0, bottom: 0, justifyContent: "center", paddingHorizontal: 4 },
  dateBtn: { ...field, marginBottom: Spacing.md },
  iosBox: { ...field, marginBottom: Spacing.md },
  doneBtn: { alignSelf: "flex-end", backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  cta: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: Radius.md, alignItems: "center", marginBottom: 10 },
});

// Screen styles (compact)
const sx = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.lg },
  searchRow: { ...row, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.cardAlt },
  searchInput: { flex: 1, color: Colors.text, fontSize: 16 },
  searchBtn: { ...row, marginTop: Spacing.sm, borderRadius: Radius.lg, paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.lg, justifyContent: "space-between" },
  itinLink: { ...row, gap: Spacing.sm, alignSelf: "flex-start", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  pills: { ...row, flexWrap: "wrap", gap: Spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: Spacing.lg, marginTop: Spacing.sm },
  tile: { width: "48%", borderRadius: Radius.lg },
  tileGrad: { borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  badge: { backgroundColor: Colors.bgAlt, borderRadius: 999, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  badgeTxt: { color: Colors.primary, fontWeight: "700", fontSize: 12, letterSpacing: 0.6 },
  tileFoot: { color: Colors.primary, fontWeight: "600", fontSize: 12, letterSpacing: 0.3, marginLeft: Spacing.xs },
  savedItem: { ...row, gap: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, borderWidth: 1, borderColor: Colors.border, ...shadow },
  signout: { ...row, marginTop: Spacing.xl, alignSelf: "center", backgroundColor: Colors.card, borderRadius: 999, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.xs, borderWidth: 1, borderColor: Colors.border },
});
