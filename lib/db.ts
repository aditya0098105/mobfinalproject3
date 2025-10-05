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

  } catch (error) {
    console.log("❌ DB init error:", error);
  }
}
