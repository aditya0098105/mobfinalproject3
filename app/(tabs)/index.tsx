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
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Card, Pill, SectionTitle, Divider } from "../../components/ui";
import Hero from "../../components/Hero";
import { Colors, Spacing, Radius } from "../../theme";

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
                      <Feather name="bookmark" size={16} color={Colors.primary} />
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

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
    backgroundColor: Colors.bg,
    paddingBottom: Spacing.xl, // extra bottom space for scroll
  },
  pillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: Spacing.lg, marginTop: Spacing.sm },
  tile: {
    width: "48%",
    borderRadius: Radius.lg,
  },
  emoji: { fontSize: 28 },
  tileLabel: { color: Colors.text, fontWeight: "800", fontSize: 18, marginTop: Spacing.sm },

  // sign out styles
  signoutBtn: {
    marginTop: Spacing.xl,
    alignSelf: "center",
    backgroundColor: Colors.card,
    borderRadius: 999,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  signoutText: { color: Colors.primary, fontWeight: "800" },

  welcomeCard: {
    marginTop: -Spacing.xl,
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6,
  },
  welcomeLabel: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
  },
  welcomeSubtitle: {
    color: Colors.textDim,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  welcomeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },
  searchCard: {
    gap: Spacing.md,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardAlt,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  searchBtn: {
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  tipText: {
    color: Colors.textDim,
    fontSize: 13,
    flex: 1,
  },
  savedList: {
    gap: Spacing.sm,
  },
  savedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  savedIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.bgAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  savedTitle: {
    color: Colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  savedMeta: {
    color: Colors.textDim,
    fontSize: 13,
  },
  sectionSubtitle: {
    color: Colors.textDim,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  tileGradient: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  tileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tileBadge: {
    backgroundColor: Colors.bgAlt,
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  tileBadgeText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.6,
  },
  tileFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tileFooterText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
