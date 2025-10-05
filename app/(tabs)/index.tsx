// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

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

// UI imports
import { Colors, Spacing, Radius } from "../../theme";
import { Button, Card, Pill, SectionTitle, Divider } from "../../components/ui";
import Hero from "../../components/Hero";

const SUGGEST = [
  "London", "New York", "Paris", "Tokyo",
  "Jaipur", "Cherrapunji", "Tuscany", "Zurich",
  "Himalayas", "Wellington"
];

const POPULAR: Array<{ name: string; emoji: string }> = [
  { name: "Paris", emoji: "🗼" }, { name: "New York", emoji: "🗽" }, { name: "Tokyo", emoji: "🗾" },
  { name: "London", emoji: "🎡" }, { name: "Zurich", emoji: "🏔️" }, { name: "Tuscany", emoji: "🏛️" },
];

// util
const toSlug = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-");

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

// -------------------- INLINE AUTH --------------------
function InlineAuth() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [loading, setLoading] = useState(false);

  // NEW: extra fields for Sign Up
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD (optional)

  const submit = async () => {
    if (!email || !pass) return Alert.alert("Missing", "Enter email and password");
    setLoading(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
      } else {
        // ✅ Save metadata on sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              full_name: fullName || null,
              dob: dob || null, // keep string format
            },
          },
        });
        if (error) throw error;
        // If email confirm OFF, session exists; else fallback sign-in
        if (!data?.session) {
          const { error: e2 } = await supabase.auth.signInWithPassword({ email, password: pass });
          if (e2) throw e2;
        }
      }
    } catch (e: any) {
      Alert.alert(mode === "in" ? "Sign in failed" : "Sign up failed", e?.message ?? "Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: Spacing.lg, gap: Spacing.md, flex: 1, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "800", color: Colors.text, textAlign: "center" }}>
        {mode === "in" ? "Sign in to CityHop" : "Create your CityHop account"}
      </Text>

      <Card>
        <TextInput
          placeholder="Email"
          placeholderTextColor={Colors.textDim}
          autoCapitalize="none"
          keyboardType="email-address"
          style={authStyles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={Colors.textDim}
          secureTextEntry
          style={authStyles.input}
          value={pass}
          onChangeText={setPass}
        />

        {/* show only in Sign Up */}
        {mode === "up" && (
          <>
            <TextInput
              placeholder="Full name (optional)"
              placeholderTextColor={Colors.textDim}
              style={authStyles.input}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              placeholder="Date of birth (YYYY-MM-DD) (optional)"
              placeholderTextColor={Colors.textDim}
              style={authStyles.input}
              keyboardType="numeric"
              value={dob}
              onChangeText={setDob}
            />
          </>
        )}

        <TouchableOpacity style={authStyles.btn} onPress={submit} disabled={loading}>
          <Text style={authStyles.btnText}>
            {loading ? (mode === "in" ? "Signing in…" : "Creating…") : mode === "in" ? "Sign In" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === "in" ? "up" : "in")} style={{ marginTop: 10, alignItems: "center" }}>
          <Text style={{ color: Colors.primary, fontWeight: "700" }}>
            {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
}

const authStyles = StyleSheet.create({
  input: {
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, color: Colors.text,
    borderRadius: Radius.lg, padding: Spacing.md, fontSize: 16, marginBottom: Spacing.md,
  },
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
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setSaved([]); return; }
        const { data, error } = await supabase
          .from("saved_places")
          .select("id,place_key,name,city,country,lat,lon,description,created_at")
          .eq("user_id", user.id) // 🔒 filter to current user
          .order("created_at", { ascending: false });
        if (!error) setSaved(data || []);
      })();
    }, [])
  );

  const go = (city: string) => { Keyboard.dismiss(); router.push(`/city/${encodeURIComponent(city)}` as any); };
  const onSearch = () => { const city = q.trim(); if (!city) return; go(city); };

  const filtered = q.length
    ? SUGGEST.filter((c) => c.toLowerCase().startsWith(q.toLowerCase())).slice(0, 5)
    : SUGGEST.slice(0, 8);

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
      contentContainerStyle={{ paddingBottom: Spacing.lg }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Banner */}
      <Hero />

      {/* Home content */}
      <View style={s.container}>
        <View style={{ marginTop: -28 }}>
          <Card>
            <TextInput
              placeholder="Search city (e.g., Tokyo)"
              placeholderTextColor={Colors.textDim}
              value={q}
              onChangeText={setQ}
              onSubmitEditing={onSearch}
              returnKeyType="search"
              autoCorrect={false}
              style={s.input}
            />
            <Button title="Search" onPress={onSearch} />
          </Card>
        </View>

        {/* Saved from Supabase */}
        {saved.length > 0 && (
          <>
            <SectionTitle>Saved</SectionTitle>
            <View style={s.savedWrap}>
              {saved.map((p) => {
                const citySlug = toSlug(p.city || "");
                const placeSlug = toSlug(p.name);
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={s.savedChip}
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
                    <Text style={s.savedChipText} numberOfLines={1}>{p.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Divider />
          </>
        )}

        <SectionTitle>Suggestions</SectionTitle>
        <View style={s.pillsWrap}>
          {filtered.map((c) => (<Pill key={c} label={c} onPress={() => go(c)} />))}
        </View>

        <Divider />

        <SectionTitle>Popular cities</SectionTitle>
        <View style={s.grid}>
          {POPULAR.map((item) => (
            <TouchableOpacity key={item.name} style={s.tile} activeOpacity={0.9} onPress={() => go(item.name)}>
              <Text style={s.emoji}>{item.emoji}</Text>
              <Text style={s.tileLabel}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 👇 Sign Out — bottom */}
        <TouchableOpacity onPress={() => supabase.auth.signOut()} style={s.signoutBtn}>
          <Text style={s.signoutText}>Sign Out ({session?.user?.email ?? "account"})</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.bg,
    paddingBottom: Spacing.lg, // extra bottom space for scroll
  },
  input: {
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, color: Colors.text,
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, fontSize: 16,
  },
  // Saved chips
  savedWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  savedChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  savedChipText: { color: Colors.text, fontWeight: "600" },

  pillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: Spacing.md, marginTop: Spacing.sm },
  tile: {
    width: "48%", backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 16, alignItems: "center", gap: 6,
  },
  emoji: { fontSize: 26 },
  tileLabel: { color: Colors.text, fontWeight: "700" },

  // sign out styles
  signoutBtn: { marginTop: Spacing.lg, alignSelf: "center" },
  signoutText: { color: Colors.primary, fontWeight: "800" },
});
