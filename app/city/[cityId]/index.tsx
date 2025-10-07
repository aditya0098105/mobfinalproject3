// app/city/[cityId]/index.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Image, ImageBackground, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  price: string;
  rating: number;
  signature: string;
  img?: any;
};
type CityData = { name: string; country: string; places: Place[]; events?: Event[]; restaurants?: Restaurant[] };





// ✅ fallback image
const PLACEHOLDER = { uri: "https://picsum.photos/640/360?cityhop" };
const RESTAURANT_PLACEHOLDER = { uri: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800" };

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
    restaurants: [
      {
        id: "dishoom",
        name: "Dishoom Covent Garden",
        cuisine: "Bombay comfort food",
        price: "££",
        rating: 4.7,
        signature: "Black daal slow-cooked for 24 hours",
        img: { uri: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=800" },
      },
      {
        id: "padella",
        name: "Padella",
        cuisine: "Handmade pasta",
        price: "££",
        rating: 4.8,
        signature: "Pappardelle with eight-hour beef shin ragu",
        img: { uri: "https://images.unsplash.com/photo-1604908177073-b2c25d4e1b8c?q=80&w=800" },
      },
      {
        id: "sketch",
        name: "Sketch Lecture Room & Library",
        cuisine: "Modern French fine dining",
        price: "££££",
        rating: 4.6,
        signature: "Six-course tasting menu in Wes Anderson interiors",
        img: { uri: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800" },
      },
      {
        id: "borough",
        name: "Borough Market Tapas",
        cuisine: "Seasonal small plates",
        price: "££",
        rating: 4.5,
        signature: "Charred octopus with smoked paprika aioli",
        img: { uri: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=800" },
      },
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
    restaurants: [
      {
        id: "elevenmadison",
        name: "Eleven Madison Park",
        cuisine: "Plant-based fine dining",
        price: "$$$",
        rating: 4.9,
        signature: "Seasonal tasting menu in Art Deco grandeur",
        img: { uri: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800" },
      },
      {
        id: "joe",
        name: "Joe's Pizza",
        cuisine: "NY slice shop",
        price: "$",
        rating: 4.6,
        signature: "Classic foldable pepperoni slice",
        img: { uri: "https://images.unsplash.com/photo-1571987502227-0f9be64d0a43?q=80&w=800" },
      },
      {
        id: "los_tacos",
        name: "Los Tacos No.1",
        cuisine: "Mexican street food",
        price: "$$",
        rating: 4.8,
        signature: "Adobada tacos fresh off the plancha",
        img: { uri: "https://images.unsplash.com/photo-1608032360609-83d707b27bff?q=80&w=800" },
      },
      {
        id: "momofuku",
        name: "Momofuku Noodle Bar",
        cuisine: "Modern Asian",
        price: "$$",
        rating: 4.5,
        signature: "Pork belly buns with hoisin glaze",
        img: { uri: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800" },
      },
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
    restaurants: [
      {
        id: "hiakai",
        name: "Hiakai",
        cuisine: "Modern Māori",
        price: "$$$",
        rating: 4.9,
        signature: "Tasting menu celebrating native ingredients",
        img: { uri: "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?q=80&w=800" },
      },
      {
        id: "fidel",
        name: "Fidel's Cafe",
        cuisine: "Kiwi brunch",
        price: "$$",
        rating: 4.5,
        signature: "Cuban-style eggs with house-made hash",
        img: { uri: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800" },
      },
      {
        id: "egmont",
        name: "Egmont St. Eatery",
        cuisine: "Seasonal bistro",
        price: "$$$",
        rating: 4.7,
        signature: "Harissa lamb shoulder with kumara",
        img: { uri: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=800" },
      },
      {
        id: "orleans",
        name: "Orleans",
        cuisine: "Southern comfort",
        price: "$$",
        rating: 4.4,
        signature: "Buttermilk fried chicken and waffles",
        img: { uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800" },
      },
    ],
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
    restaurants: [
      {
        id: "le_cinq",
        name: "Le Cinq",
        cuisine: "Haute French",
        price: "€€€€",
        rating: 4.9,
        signature: "Blue lobster with citrus beurre blanc",
        img: { uri: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800" },
      },
      {
        id: "septime",
        name: "Septime",
        cuisine: "Modern bistronomie",
        price: "€€€",
        rating: 4.7,
        signature: "Seasonal tasting with natural wine pairing",
        img: { uri: "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?q=80&w=800" },
      },
      {
        id: "breizh",
        name: "Breizh Café",
        cuisine: "Breton crêperie",
        price: "€€",
        rating: 4.6,
        signature: "Buckwheat galette with salted caramel butter",
        img: { uri: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800" },
      },
      {
        id: "pinkmamma",
        name: "Pink Mamma",
        cuisine: "Rustic Italian",
        price: "€€",
        rating: 4.5,
        signature: "Truffle pasta served in a wheel of pecorino",
        img: { uri: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=800" },
      },
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
    restaurants: [
      {
        id: "bar_palladio",
        name: "Bar Palladio",
        cuisine: "Rajput-European fusion",
        price: "₹₹₹",
        rating: 4.7,
        signature: "Saffron paneer tikka with pistachio pesto",
        img: { uri: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800" },
      },
      {
        id: "chokhi",
        name: "Chokhi Dhani",
        cuisine: "Traditional Rajasthani thali",
        price: "₹₹",
        rating: 4.6,
        signature: "Royal thali with 20+ local delicacies",
        img: { uri: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=800" },
      },
      {
        id: "tapri",
        name: "Tapri Central",
        cuisine: "Chai & street bites",
        price: "₹₹",
        rating: 4.5,
        signature: "Masala chai with ajwain-khari biscuits",
        img: { uri: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=800" },
      },
      {
        id: "suvarna",
        name: "Suvarna Mahal",
        cuisine: "Royal Indian",
        price: "₹₹₹₹",
        rating: 4.8,
        signature: "Laal maas slow-cooked with Mathania chilies",
        img: { uri: "https://images.unsplash.com/photo-1589308078053-169825f15602?q=80&w=800" },
      },
    ],
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
    restaurants: [
      {
        id: "orange_roots",
        name: "Orange Roots",
        cuisine: "Khasi vegetarian",
        price: "₹₹",
        rating: 4.6,
        signature: "Bamboo shoot curry with smoked chili",
        img: { uri: "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?q=80&w=800" },
      },
      {
        id: "nok_a",
        name: "Nok-a Restaurant",
        cuisine: "North-eastern grill",
        price: "₹₹",
        rating: 4.5,
        signature: "Smoked pork with fern shoots",
        img: { uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800" },
      },
      {
        id: "sohra_plaza",
        name: "Sohra Plaza",
        cuisine: "Multi-cuisine",
        price: "₹₹",
        rating: 4.3,
        signature: "Jadoh rice bowls with spicy chutneys",
        img: { uri: "https://images.unsplash.com/photo-1604908554200-0e327610e23b?q=80&w=800" },
      },
      {
        id: "cafe_cherrapunjee",
        name: "Cafe Cherrapunjee",
        cuisine: "Coffee & bakes",
        price: "₹₹",
        rating: 4.4,
        signature: "Cloud cheesecake with passionfruit glaze",
        img: { uri: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?q=80&w=800" },
      },
    ],
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
    restaurants: [
      {
        id: "osteria_francescana",
        name: "Osteria Francescana",
        cuisine: "Avant-garde Italian",
        price: "€€€€",
        rating: 4.9,
        signature: "Five ages of Parmigiano Reggiano",
        img: { uri: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=800" },
      },
      {
        id: "la_giostra",
        name: "La Giostra",
        cuisine: "Tuscan trattoria",
        price: "€€€",
        rating: 4.7,
        signature: "Pappardelle al cinghiale with wild boar ragù",
        img: { uri: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800" },
      },
      {
        id: "mercato_centrale",
        name: "Mercato Centrale",
        cuisine: "Gourmet food hall",
        price: "€€",
        rating: 4.6,
        signature: "Porchetta panini with salsa verde",
        img: { uri: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=800" },
      },
      {
        id: "enoteca_pinchiorri",
        name: "Enoteca Pinchiorri",
        cuisine: "Fine dining",
        price: "€€€€",
        rating: 4.8,
        signature: "Wine-paired tasting featuring Tuscan truffles",
        img: { uri: "https://images.unsplash.com/photo-1541542684-4a8e77b1015f?q=80&w=800" },
      },
    ],
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
    restaurants: [
      {
        id: "haus_hiltl",
        name: "Haus Hiltl",
        cuisine: "Plant-based buffet",
        price: "CHF CHF",
        rating: 4.6,
        signature: "Endless vegetarian buffet since 1898",
        img: { uri: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=800" },
      },
      {
        id: "kronenhalle",
        name: "Restaurant Kronenhalle",
        cuisine: "Swiss classics",
        price: "CHF CHF CHF",
        rating: 4.7,
        signature: "Zürcher Geschnetzeltes with rösti",
        img: { uri: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800" },
      },
      {
        id: "alpenrose",
        name: "Alpenrose",
        cuisine: "Alpine tavern",
        price: "CHF CHF",
        rating: 4.5,
        signature: "Fondue moitié-moitié with mountain cheese",
        img: { uri: "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?q=80&w=800" },
      },
      {
        id: "laSalle",
        name: "LaSalle",
        cuisine: "Contemporary European",
        price: "CHF CHF CHF",
        rating: 4.4,
        signature: "Charred octopus with saffron risotto",
        img: { uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800" },
      },
    ],
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
    events: [
      {
        id: "trek",
        title: "Himalayan Adventure Festival",
        date: "2025-06-20",
        desc: "Celebration of trekking, climbing, and outdoor life.",
      },
      {
        id: "spiti",
        title: "Spiti Tribal Fair",
        date: "2025-09-05",
        desc: "Showcasing culture and traditions of Spiti Valley.",
      },
    ],
    restaurants: [
      {
        id: "cafe_1947",
        name: "Cafe 1947",
        cuisine: "Italian & Himalayan",
        price: "₹₹",
        rating: 4.5,
        signature: "Trout amritsari with herbed butter",
        img: { uri: "https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=800" },
      },
      {
        id: "rice_bowl",
        name: "The Rice Bowl",
        cuisine: "Tibetan & Chinese",
        price: "₹₹",
        rating: 4.4,
        signature: "Thenthuk noodles with yak butter",
        img: { uri: "https://images.unsplash.com/photo-1447078806655-40579c2520d6?q=80&w=800" },
      },
      {
        id: "moonpeak",
        name: "Moonpeak Espresso",
        cuisine: "Cafe fare",
        price: "₹₹",
        rating: 4.6,
        signature: "Himalayan honey cake with coffee",
        img: { uri: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800" },
      },
      {
        id: "yak_farm",
        name: "The Yak Farm",
        cuisine: "Farm-to-table",
        price: "₹₹₹",
        rating: 4.7,
        signature: "Slow-braised yak momos with chili oil",
        img: { uri: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=800" },
      },
    ],
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
    restaurants: [
      {
        id: "sushi_saito",
        name: "Sushi Saito",
        cuisine: "Edomae sushi",
        price: "¥¥¥¥",
        rating: 4.9,
        signature: "Omakase nigiri at a six-seat counter",
        img: { uri: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=800" },
      },
      {
        id: "ichiran",
        name: "Ichiran Shibuya",
        cuisine: "Tonkotsu ramen",
        price: "¥¥",
        rating: 4.5,
        signature: "Customizable solo-booth ramen experience",
        img: { uri: "https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=800" },
      },
      {
        id: "afuri",
        name: "Afuri Ebisu",
        cuisine: "Yuzu ramen",
        price: "¥¥",
        rating: 4.6,
        signature: "Yuzu shio ramen with citrus aroma",
        img: { uri: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=800" },
      },
      {
        id: "gyukatsu",
        name: "Gyukatsu Motomura",
        cuisine: "Beef katsu",
        price: "¥¥",
        rating: 4.7,
        signature: "Crisp gyukatsu finished on a personal grill",
        img: { uri: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800" },
      },
    ],
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
  const restaurants = city?.restaurants ?? [];

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

          {restaurants.length > 0 && (
            <>
              <View style={[s.sectionHeader, { marginTop: 8 }]}>
                <Text style={s.sectionTitle}>Savor the city</Text>
                <Text style={s.sectionSubtitle}>
                  Reserve a table at buzz-worthy kitchens curated for unforgettable nights out.
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.restaurantsScroll}
              >
                {restaurants.map((spot) => (
                  <View key={spot.id} style={s.restaurantCard}>
                    <ImageBackground
                      source={spot.img || RESTAURANT_PLACEHOLDER}
                      style={s.restaurantImage}
                      imageStyle={s.restaurantImageRadius}
                    >
                      <LinearGradient
                        colors={["rgba(15, 23, 42, 0.05)", "rgba(15, 23, 42, 0.95)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={s.restaurantOverlay}
                      >
                        <View style={s.restaurantTopRow}>
                          <Text style={s.restaurantBadge}>{spot.price}</Text>
                        </View>
                        <View style={s.restaurantDetails}>
                          <Text style={s.restaurantName}>{spot.name}</Text>
                          <Text style={s.restaurantCuisine}>{spot.cuisine}</Text>
                          <View style={s.restaurantMeta}>
                            <Text style={s.restaurantRating}>⭐ {spot.rating.toFixed(1)}</Text>
                            <Text style={s.restaurantDivider}>•</Text>
                            <Text style={s.restaurantSignature} numberOfLines={2}>
                              {spot.signature}
                            </Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

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
  restaurantsScroll: { paddingBottom: 6, paddingRight: 12, gap: 16 },
  restaurantCard: {
    width: 260,
    marginRight: 16,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    backgroundColor: "rgba(15, 23, 42, 0.68)",
  },
  restaurantImage: { width: "100%", height: 220 },
  restaurantImageRadius: { borderRadius: 28 },
  restaurantOverlay: { flex: 1, justifyContent: "space-between", padding: 18 },
  restaurantTopRow: { flexDirection: "row", justifyContent: "flex-end" },
  restaurantBadge: {
    backgroundColor: "rgba(15, 118, 110, 0.7)",
    color: "#ccfbf1",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
  restaurantDetails: { gap: 4 },
  restaurantName: { fontSize: 20, fontWeight: "700", color: "#f8fafc" },
  restaurantCuisine: { color: "#dbeafe", fontSize: 14 },
  restaurantMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" },
  restaurantRating: { color: "#facc15", fontWeight: "700" },
  restaurantDivider: { color: "rgba(226, 232, 240, 0.75)", fontWeight: "700" },
  restaurantSignature: { color: "#e2e8f0", flex: 1, flexWrap: "wrap", lineHeight: 18 },
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
