// app/city/[cityId]/transport.tsx
import { useLocalSearchParams } from "expo-router";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TRANSPORT_DATA: Record<
  string,
  { city: string; modes: { icon: string; label: string }[]; desc: string; link: string }
> = {
  london: {
    city: "London",
    modes: [
      { icon: "🚇", label: "Underground (Tube)" },
      { icon: "🚌", label: "Buses" },
      { icon: "🚈", label: "Overground" },
      { icon: "🚊", label: "Trams" },
      { icon: "⛴️", label: "River Bus" },
      { icon: "🚴", label: "Cycling (Santander bikes)" },
    ],
    desc: "London has one of the most extensive transport systems. The Tube connects most areas, supported by red double-decker buses. Oyster card/contactless makes travel easy.",
    link: "https://tfl.gov.uk",
  },
  "new-york": {
    city: "New York",
    modes: [
      { icon: "🚇", label: "Subway" },
      { icon: "🚖", label: "Yellow Cabs" },
      { icon: "🚌", label: "Buses" },
      { icon: "⛴️", label: "Ferries" },
      { icon: "🚆", label: "PATH trains" },
    ],
    desc: "NYC is famous for its 24/7 subway network. Taxis and rideshares are everywhere. Ferries connect Staten Island and Manhattan.",
    link: "https://new.mta.info",
  },
  wellington: {
    city: "Wellington",
    modes: [
      { icon: "🚆", label: "Metlink Trains" },
      { icon: "🚌", label: "Metlink Buses" },
      { icon: "🚠", label: "Cable Car" },
      { icon: "⛴️", label: "Ferries" },
    ],
    desc: "Wellington’s compact size means buses and trains cover most areas. The red Cable Car is iconic for reaching Kelburn. Ferries cross the harbour.",
    link: "https://www.metlink.org.nz",
  },
  paris: {
    city: "Paris",
    modes: [
      { icon: "🚇", label: "Metro" },
      { icon: "🚆", label: "RER Trains" },
      { icon: "🚊", label: "Trams" },
      { icon: "🚌", label: "Buses" },
      { icon: "🚴", label: "Velib Bicycles" },
    ],
    desc: "Paris’ metro is dense and efficient. RER trains link suburbs, while trams and buses extend coverage. Velib bike-sharing is very popular.",
    link: "https://www.ratp.fr/en",
  },
  jaipur: {
    city: "Jaipur",
    modes: [
      { icon: "🚇", label: "Metro" },
      { icon: "🚌", label: "City Buses" },
      { icon: "🛺", label: "Auto-rickshaws" },
      { icon: "🚲", label: "Cycle Rickshaws" },
      { icon: "🚖", label: "Cabs" },
    ],
    desc: "Jaipur Metro connects key parts of the city. Autos and cycle-rickshaws are cheap and widely used. Buses run by Jaipur City Transport cover longer distances.",
    link: "https://transport.rajasthan.gov.in/rsrtc/",
  },
  cherrapunji: {
    city: "Cherrapunji",
    modes: [
      { icon: "🚙", label: "Shared Jeeps" },
      { icon: "🚕", label: "Private Taxis" },
      { icon: "🥾", label: "Walking Trails" },
    ],
    desc: "Being a hilly region, shared jeeps and private taxis are the main transport. Many scenic spots require short treks or walking trails.",
    link: "https://meghalayatourism.in",
  },
  tuscany: {
    city: "Tuscany",
    modes: [
      { icon: "🚆", label: "Regional Trains" },
      { icon: "🚌", label: "Buses" },
      { icon: "🚗", label: "Car Rentals" },
      { icon: "🚴", label: "Cycling" },
    ],
    desc: "Regional trains link Florence, Pisa, and Siena. Buses connect towns and villages. Many tourists rent cars for vineyards.",
    link: "https://www.trenitalia.com",
  },
  zurich: {
    city: "Zurich",
    modes: [
      { icon: "🚊", label: "Trams" },
      { icon: "🚆", label: "S-Bahn Trains" },
      { icon: "🚌", label: "Buses" },
      { icon: "⛴️", label: "Boats" },
      { icon: "🚴", label: "Cycling" },
    ],
    desc: "Zurich is known for its punctual trams and S-Bahn system. Boats on Lake Zurich are part of transport. Cycling is convenient with dedicated lanes.",
    link: "https://www.sbb.ch/en",
  },
  himalayas: {
    city: "Himalayas",
    modes: [
      { icon: "🚙", label: "Shared Jeeps" },
      { icon: "🚌", label: "Buses" },
      { icon: "🥾", label: "Trekking Routes" },
    ],
    desc: "Transport depends on region. In Himachal & Uttarakhand, buses and jeeps connect towns. Trekking routes are common for remote temples and valleys.",
    link: "https://www.hrtchp.com",
  },
  tokyo: {
    city: "Tokyo",
    modes: [
      { icon: "🚇", label: "Metro" },
      { icon: "🚆", label: "JR Trains" },
      { icon: "🚄", label: "Shinkansen (Bullet Train)" },
      { icon: "🚌", label: "Buses" },
      { icon: "🚖", label: "Taxis" },
    ],
    desc: "Tokyo has the world’s busiest metro and train systems. Shinkansen connects to other cities. Suica/Pasmo cards are used everywhere.",
    link: "https://www.japan-guide.com/e/e2017.html",
  },
};

export default function TransportScreen() {
  const { cityId } = useLocalSearchParams<{ cityId: string }>();
  const slug = cityId?.toLowerCase();
  const transport = slug ? TRANSPORT_DATA[slug] : null;

  if (!transport) {
    return (
      <View style={s.wrap}>
        <Text>No transport info available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.wrap}>
      <Text style={s.h1}>🚍 Transportation in {transport.city}</Text>
      <View style={s.divider} />
      <Text style={s.desc}>{transport.desc}</Text>

      <Text style={[s.h2, { marginTop: 20 }]}>Main Modes:</Text>
      {transport.modes.map((m, i) => (
        <View key={i} style={s.card}>
          <Text style={s.icon}>{m.icon}</Text>
          <Text style={s.mode}>{m.label}</Text>
        </View>
      ))}

      {/* 🌐 External Link */}
      <TouchableOpacity
        style={s.linkBtn}
        onPress={() => Linking.openURL(transport.link)}
      >
        <Text style={s.linkText}>🌐 More info on {transport.city} transport</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 8, color: "#222" },
  h2: { fontSize: 18, fontWeight: "600", marginBottom: 8, color: "#333" },
  desc: {
    fontSize: 15,
    opacity: 0.85,
    lineHeight: 22,
    fontStyle: "italic",
    color: "#444",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginBottom: 12,
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  icon: { fontSize: 20, marginRight: 10 },
  mode: { fontSize: 16, fontWeight: "600", color: "#333" },
  linkBtn: {
    marginTop: 25,
    padding: 14,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linkText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
