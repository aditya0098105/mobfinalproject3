// app/city/[cityId]/index.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

type Place = {
  id: string;
  name: string;
  coords: { latitude: number; longitude: number };
  desc?: string;
  img?: any; // local image via require()
};
type Event = {
  id: string;
  title: string;
  date: string;
  desc?: string;
};
type CityData = { name: string; country: string; places: Place[]; events?: Event[] };





// ✅ fallback image
const PLACEHOLDER = { uri: "https://picsum.photos/640/360?cityhop" };

// ------------------- CITY DATA (all cities preserved, events added) -------------------
export const CITY_DATA: Record<string, CityData> = {
  london: {
    name: "London",
    country: "United Kingdom",
    places: [
      {
        id: "buckingham",
        name: "Buckingham Palace",
        coords: { latitude: 51.5014, longitude: -0.1419 },
        desc: "The monarch’s official residence and iconic ceremonial site.",
        img: require("../../../assets/images/palace.jpeg"),
      },
      {
        id: "britishmuseum",
        name: "British Museum",
        coords: { latitude: 51.5194, longitude: -0.1269 },
        desc: "World-class collections of art and antiquities, free entry.",
        img: require("../../../assets/images/mus.webp"),
      },
      {
        id: "tower",
        name: "Tower of London",
        coords: { latitude: 51.5081, longitude: -0.0759 },
        desc: "Medieval fortress and home of the Crown Jewels.",
        img: require("../../../assets/images/tower.webp"),
      },
    ],
    events: [
      { id: "concert1", title: "Royal Albert Concert", date: "2025-10-12", desc: "Classical music festival." },
      { id: "marathon", title: "London Marathon", date: "2025-11-05", desc: "Annual marathon race." },
    ],

    



  },

  "new-york": {
    name: "New York",
    country: "USA",
    places: [
      {
        id: "liberty",
        name: "Statue of Liberty",
        coords: { latitude: 40.6892, longitude: -74.0445 },
        desc: "Symbol of freedom on Liberty Island; ferries from Battery Park.",
        img: require("../../../assets/images/lib.jpg"),
      },
      {
        id: "centralpark",
        name: "Central Park",
        coords: { latitude: 40.7829, longitude: -73.9654 },
        desc: "843-acre green escape with lakes, bridges, and trails.",
        img: require("../../../assets/images/park.jpg"),
      },
      {
        id: "times",
        name: "Times Square",
        coords: { latitude: 40.758, longitude: -73.9855 },
        desc: "Neon heart of Manhattan with massive billboards.",
        img: require("../../../assets/images/square.webp"),
      },
    ],
    events: [
      { id: "broadway", title: "Broadway Week", date: "2025-10-18", desc: "Discounted Broadway shows all week." },
    ],
  },

  wellington: {
    name: "Wellington",
    country: "New Zealand",
    places: [
      {
        id: "tepapa",
        name: "Te Papa Museum",
        coords: { latitude: -41.2905, longitude: 174.7821 },
        desc: "National museum with interactive exhibits and Māori culture.",
        img: require("../../../assets/images/w1.jpeg"),
      },
      {
        id: "mtvictoria",
        name: "Mount Victoria Lookout",
        coords: { latitude: -41.2959, longitude: 174.7947 },
        desc: "Panoramic city + harbour views; great at sunset.",
        img: require("../../../assets/images/w2.jpg"),
      },
      {
        id: "cablecar",
        name: "Wellington Cable Car",
        coords: { latitude: -41.2907, longitude: 174.776 },
        desc: "Historic red cable car from Lambton Quay to Kelburn.",
        img: require("../../../assets/images/w3.jpg"),
      },
    ],
    events: [ { 
      id: "filmfest", 
      title: "New Zealand International Film Festival", 
      date: "2025-07-15", 
      desc: "Showcasing international and local films across Wellington cinemas." 
    },
    { 
      id: "cubadupa", 
      title: "CubaDupa Street Festival", 
      date: "2025-03-22", 
      desc: "Annual street festival with live music, dance, art, and food on Cuba Street." 
    },
    { 
      id: "worldofwearableart", 
      title: "World of WearableArt Show", 
      date: "2025-09-25", 
      desc: "Spectacular live show combining fashion, art, and performance." 
    },], 
  },

  paris: {
    name: "Paris",
    country: "France",
    places: [
      {
        id: "eiffel",
        name: "Eiffel Tower",
        coords: { latitude: 48.8584, longitude: 2.2945 },
        desc: "Paris’ iron icon; best views from Trocadéro and Champ de Mars.",
        img: require("../../../assets/images/etower.jpeg"),
      },
      {
        id: "louvre",
        name: "Louvre Museum",
        coords: { latitude: 48.8606, longitude: 2.3376 },
        desc: "World’s largest art museum; home to the Mona Lisa.",
        img: require("../../../assets/images/mus2.webp"),
      },
      {
        id: "notredame",
        name: "Notre-Dame",
        coords: { latitude: 48.852968, longitude: 2.349902 },
        desc: "Gothic cathedral on Île de la Cité; restoration ongoing.",
        img: require("../../../assets/images/dam.jpeg"),
      },
    ],
    events: [
      { id: "fashion", title: "Paris Fashion Week", date: "2025-10-20", desc: "Global fashion week." },
      { id: "wine", title: "Wine Festival", date: "2025-11-15", desc: "Celebration of French wine." },
    ],
  },

  jaipur: {
    name: "Jaipur",
    country: "India",
    places: [
      {
        id: "hawamahal",
        name: "Hawa Mahal",
        coords: { latitude: 26.9239, longitude: 75.8267 },
        desc: "‘Palace of Winds’ with honeycomb windows for royal women.",
        img: require("../../../assets/images/j1.jpeg"),
      },
      {
        id: "amberfort",
        name: "Amber (Amer) Fort",
        coords: { latitude: 26.9855, longitude: 75.8513 },
        desc: "Hilltop fort with ornate courtyards and mirror work.",
        img: require("../../../assets/images/j2.jpg"),
      },
      {
        id: "citypalace",
        name: "City Palace",
        coords: { latitude: 26.9258, longitude: 75.8246 },
        desc: "Royal residence showcasing Rajput and Mughal architecture.",
        img: require("../../../assets/images/j3.png"),
      },
    ],
    events: [ { id: "festival1", title: "Jaipur Literature Festival", date: "2025-01-28", desc: "World’s largest free literary festival." },
    { id: "festival2", title: "Teej Festival", date: "2025-08-10", desc: "Traditional festival for monsoon with cultural programs." },],
  },

  cherrapunji: {
    name: "Cherrapunji (Sohra)",
    country: "India",
    places: [
      {
        id: "nohkalikai",
        name: "Nohkalikai Falls",
        coords: { latitude: 25.2828, longitude: 91.6964 },
        desc: "One of India’s tallest plunge waterfalls with emerald pool.",
        img: require("../../../assets/images/c1.jpg"),
      },
      {
        id: "rootbridge",
        name: "Double Decker Root Bridge (Nongriat)",
        coords: { latitude: 25.2421, longitude: 91.7215 },
        desc: "Living root bridge built over decades by Khasi locals.",
        img: require("../../../assets/images/c2.jpg"),
      },
      {
        id: "mawsmai",
        name: "Mawsmai Cave",
        coords: { latitude: 25.2718, longitude: 91.7306 },
        desc: "Limestone cave with easy walkways and formations.",
        img: require("../../../assets/images/c3.jpg"),
      },
    ],
    events: [ { id: "festival", title: "Wangala Festival", date: "2025-11-12", desc: "Harvest festival of the Garo tribe with dance and music." },
    { id: "eco", title: "Cherrapunji Eco Tourism Fair", date: "2025-05-18", desc: "Promoting eco-tourism and local culture." },],
  },

  tuscany: {
    name: "Tuscany",
    country: "Italy",
    places: [
      {
        id: "duomo",
        name: "Florence Cathedral (Duomo)",
        coords: { latitude: 43.7731, longitude: 11.2556 },
        desc: "Brunelleschi’s dome crowning Florence’s skyline.",
        img: require("../../../assets/images/tus1.webp"),
      },
      {
        id: "pisa",
        name: "Leaning Tower of Pisa",
        coords: { latitude: 43.7229, longitude: 10.3966 },
        desc: "Iconic tilted bell tower in Piazza dei Miracoli.",
        img: require("../../../assets/images/tus2.webp"),
      },
      {
        id: "siena",
        name: "Piazza del Campo, Siena",
        coords: { latitude: 43.3188, longitude: 11.3317 },
        desc: "Shell-shaped square hosting the Palio horse race.",
        img: require("../../../assets/images/tus3.webp"),
      },
    ],
    events: [{ id: "palio", title: "Palio di Siena", date: "2025-07-02", desc: "Historic horse race in Siena’s Piazza del Campo." },
    { id: "wine", title: "Chianti Wine Festival", date: "2025-09-10", desc: "Celebration of Tuscany’s famous wines." },],
  },

  zurich: {
    name: "Zurich",
    country: "Switzerland",
    places: [
      {
        id: "lakeprom",
        name: "Lake Zurich Promenade",
        coords: { latitude: 47.3663, longitude: 8.5417 },
        desc: "Scenic lakeside walk; boat piers and swans at Bürkliplatz.",
        img: require("../../../assets/images/zu1.jpeg"),
      },
      {
        id: "oldtown",
        name: "Old Town (Niederdorf)",
        coords: { latitude: 47.3725, longitude: 8.5436 },
        desc: "Cobbled lanes, cafes, and churches along the Limmat.",
        img: require("../../../assets/images/zu2.jpeg"),
      },
      {
        id: "uetliberg",
        name: "Uetliberg",
        coords: { latitude: 47.3515, longitude: 8.492 },
        desc: "City’s backyard mountain with panoramic trails.",
        img: require("../../../assets/images/zu3.webp"),
      },
    ],
    events: [{ id: "street", title: "Street Parade", date: "2025-08-02", desc: "One of the largest techno parades in the world." },
    { id: "fest", title: "Sechseläuten", date: "2025-04-14", desc: "Spring festival with the burning of the Böögg." },],
  },

  himalayas: {
    name: "Himalayas",
    country: "Multiple countries",
    places: [
      {
        id: "rohtang",
        name: "Rohtang Pass (Himachal)",
        coords: { latitude: 32.3667, longitude: 77.2484 },
        desc: "High mountain pass near Manali; snow vistas in season.",
        img: require("../../../assets/images/h1.webp"),
      },
      {
        id: "pangong",
        name: "Pangong Lake (Ladakh)",
        coords: { latitude: 33.7499, longitude: 78.541 },
        desc: "High-altitude blue lake stretching into Tibet.",
        img: require("../../../assets/images/h2.jpeg"),
      },
      {
        id: "kedarnath",
        name: "Kedarnath Temple (Uttarakhand)",
        coords: { latitude: 30.7352, longitude: 79.0669 },
        desc: "Ancient Shiva shrine amid dramatic peaks.",
        img: require("../../../assets/images/h3.webp"),
      },
    ],
    events: [    { id: "trek", title: "Himalayan Adventure Festival", date: "2025-06-20", desc: "Celebration of trekking, climbing, and outdoor life." },
    { id: "spiti", title: "Spiti Tribal Fair", date: "2025-09-05", desc: "Showcasing culture and traditions of Spiti Valley." },],
  },

  tokyo: {
    name: "Tokyo",
    country: "Japan",
    places: [
      {
        id: "skytree",
        name: "Tokyo Skytree",
        coords: { latitude: 35.7101, longitude: 139.8107 },
        desc: "634m broadcasting tower with observation decks.",
        img: require("../../../assets/images/tree.webp"),
      },
      {
        id: "sensoji",
        name: "Senso-ji Temple (Asakusa)",
        coords: { latitude: 35.7148, longitude: 139.7967 },
        desc: "Tokyo’s oldest temple; Nakamise shopping street nearby.",
        img: require("../../../assets/images/temple.jpeg"),
      },
      {
        id: "shibuya",
        name: "Shibuya Crossing",
        coords: { latitude: 35.6595, longitude: 139.7005 },
        desc: "Famous scramble crossing beside Shibuya Station.",
        img: require("../../../assets/images/corss.jpg"),
      },
    ],
    events: [{ id: "sakura", title: "Cherry Blossom Festival", date: "2025-04-01", desc: "Viewing of blooming sakura trees across Tokyo." },
    { id: "anime", title: "Tokyo Anime Fair", date: "2025-03-18", desc: "One of the largest anime conventions worldwide." },],
  },
};
// --------------------------------------------------------------------------------------------------

function toSlug(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-");
}

export default function CityScreen() {
  const { cityId } = useLocalSearchParams<{ cityId: string }>();
  const router = useRouter();
  const raw = decodeURIComponent(String(cityId || ""));
  const slug = toSlug(raw);

  const city = useMemo(() => CITY_DATA[slug], [slug]);
  const places = city?.places ?? [];

  if (!city) {
    return (
      <View style={s.wrap}>
        <Text style={s.h1}>No data for “{raw}”</Text>
        <Text style={{ opacity: 0.7, marginTop: 6 }}>
          Try: London, New York, Wellington, Paris, Jaipur, Cherrapunji, Tuscany, Zurich, Himalayas, Tokyo
        </Text>
      </View>
    );
  }

  // Mini-map initial region (center on first place)
  const first = places[0];
  const initialRegion = first
    ? {
        latitude: first.coords.latitude,
        longitude: first.coords.longitude,
        latitudeDelta: 0.12,
        longitudeDelta: 0.12,
      }
    : undefined;

  return (
    <LinearGradient colors={["#0f172a", "#111c2d", "#060b19"]} style={s.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.hero}>
            <View style={s.heroGlow} />
            <Text style={s.heroEyebrow}>Discover</Text>
            <Text style={s.heroTitle}>{city.name}</Text>
            <Text style={s.heroSubtitle}>{city.country}</Text>
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>Curated escapes</Text>
            </View>
          </View>

          {initialRegion && (
            <View style={s.mapShell}>
              <MapView style={s.map} initialRegion={initialRegion}>
                {places.map((p) => (
                  <Marker key={p.id} coordinate={p.coords} title={p.name} description={p.desc || ""} />
                ))}
              </MapView>
            </View>
          )}

          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Must-see spots</Text>
            <Text style={s.sectionSubtitle}>Hand-picked highlights to make the most of your stay.</Text>
          </View>

          <View style={s.places}>
            {places.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={s.placeCard}
                onPress={() =>
                  router.push(
                    `/city/${slug}/place/${item.id}?name=${encodeURIComponent(item.name)}&lat=${item.coords.latitude}&lon=${item.coords.longitude}&cityName=${encodeURIComponent(city.name)}&country=${encodeURIComponent(city.country)}&desc=${encodeURIComponent(item.desc ?? "")}`
                  )
                }
              >
                <Image source={item.img || PLACEHOLDER} style={s.placeImage} resizeMode="cover" />
                <View style={s.placeContent}>
                  <Text style={s.placeName}>{item.name}</Text>
                  {!!item.desc && (
                    <Text style={s.placeDesc} numberOfLines={2}>
                      {item.desc}
                    </Text>
                  )}
                  <View style={s.placeMeta}>
                    <Text style={s.placeMetaText}>Tap to explore details</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Plan your trip</Text>
            <Text style={s.sectionSubtitle}>Quick access to everything you need.</Text>
          </View>

          <View style={s.actions}>
            {city.events && city.events.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.9}
                style={s.actionCard}
                onPress={() => router.push(`/city/${slug}/events?cityName=${encodeURIComponent(city.name)}`)}
              >
                <LinearGradient colors={["#4338ca", "#2563eb"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.actionGradient}>
                  <Text style={s.actionEmoji}>🎉</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.actionTitle}>See upcoming events</Text>
                    <Text style={s.actionSubtitle}>Find experiences happening while you’re in town.</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              style={s.actionCard}
              onPress={() =>
                router.push(`/city/${slug}/transport?cityName=${encodeURIComponent(city.name)}`)
              }
            >
              <LinearGradient colors={["#0891b2", "#0ea5e9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.actionGradient}>
                <Text style={s.actionEmoji}>🚍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.actionTitle}>Navigate the city</Text>
                  <Text style={s.actionSubtitle}>Transit tips and ways to get around with ease.</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={s.actionCard}
              onPress={() =>
                router.push({
                  pathname: "/city/[cityId]/book",
                  params: {
                    cityId: slug,
                    hotel: "Sample Hotel",
                    city: city.name,
                  },
                })
              }
            >
              <LinearGradient colors={["#d946ef", "#ec4899"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.actionGradient}>
                <Text style={s.actionEmoji}>🏨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.actionTitle}>Book a stay</Text>
                  <Text style={s.actionSubtitle}>Reserve hand-picked hotels in just a few taps.</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={s.actionCard}
              onPress={() => router.push(`/city/${slug}/bookings`)}
            >
              <LinearGradient colors={["#14b8a6", "#22c55e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.actionGradient}>
                <Text style={s.actionEmoji}>📖</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.actionTitle}>View your bookings</Text>
                  <Text style={s.actionSubtitle}>Keep tabs on every reservation in one place.</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 80 },
  hero: {
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
    overflow: "hidden",
    marginBottom: 28,
  },
  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    backgroundColor: "#38bdf8",
    opacity: 0.18,
    borderRadius: 160,
    right: -80,
    top: -120,
  },
  heroEyebrow: { color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, fontSize: 12, marginBottom: 10 },
  heroTitle: { fontSize: 34, fontWeight: "800", color: "#f8fafc" },
  heroSubtitle: { fontSize: 18, color: "#cbd5f5", marginTop: 6 },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.35)",
    marginTop: 18,
  },
  heroBadgeText: { color: "#bfdbfe", fontSize: 13, fontWeight: "600" },
  mapShell: {
    borderRadius: 24,
    overflow: "hidden",
    height: 220,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.25)",
    marginBottom: 28,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
  },
  map: { flex: 1 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: "#f1f5f9" },
  sectionSubtitle: { color: "#94a3b8", marginTop: 6, lineHeight: 20 },
  places: { gap: 16, marginBottom: 32 },
  placeCard: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
    overflow: "hidden",
  },
  placeImage: { width: "100%", height: 190 },
  placeContent: { padding: 18, gap: 10 },
  placeName: { fontSize: 20, fontWeight: "700", color: "#f8fafc" },
  placeDesc: { color: "#cbd5e1", lineHeight: 20 },
  placeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  placeMetaText: { color: "#60a5fa", fontWeight: "600", fontSize: 13, letterSpacing: 0.2 },
  actions: { gap: 16, marginBottom: 24 },
  actionCard: { borderRadius: 24, overflow: "hidden" },
  actionGradient: {
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  actionEmoji: { fontSize: 28 },
  actionTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  actionSubtitle: { color: "#e2e8f0", opacity: 0.86, lineHeight: 18 },
});
