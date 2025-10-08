import { openDatabaseSync } from "expo-sqlite";

export const db = openDatabaseSync("cityhop.db");

export async function initDB() {
  try {


    // ✅ Bookings table (important!)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_name TEXT,
        city TEXT,
        customer_name TEXT,
        customer_address TEXT,
        start_date TEXT,
        end_date TEXT
      );
    `);
    console.log("✅ Bookings table created successfully");

    // ✅ Itinerary planner table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS itineraries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        destination TEXT,
        start_date TEXT,
        end_date TEXT,
        experiences TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Itineraries table ready");

  } catch (error) {
    console.log("❌ DB init error:", error);
  }
}
