import type { Db, MongoClient } from "mongodb";
import { getEnv } from "./env.server";

const DB_NAME = "m3_rental";

async function getMongoUri(): Promise<string> {
  if (typeof window !== "undefined") return "";
  // No hard-coded credentials: MONGODB_URI must come from the environment (.env locally, Vercel env in production).
  return (await getEnv("MONGODB_URI")) || (await getEnv("DATABASE_URL")) || "";
}

let client: MongoClient | null = null;
let dbConnection: Db | null = null;
let connecting: Promise<Db | null> | null = null;

async function openConnection(): Promise<Db | null> {
  // Configure high-reliability public DNS resolvers for MongoDB Atlas SRV lookup in Node environments
  try {
    const dns = await import("node:dns");
    if (typeof dns?.setServers === "function") {
      dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);
    }
  } catch {}

  const uri = await getMongoUri();
  if (!uri) {
    console.warn("[DB] MONGODB_URI environment variable is not defined.");
    return null;
  }

  try {
    const { MongoClient: MongoCls } = await import("mongodb");
    client = new MongoCls(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    await client.connect();
    dbConnection = client.db(DB_NAME);
    console.log(`[DB] Successfully connected to MongoDB Database (${DB_NAME})`);

    // Create every collection + index and seed the product catalog (once per server process)
    const { ensureDatabaseReady } = await import("./db-schema");
    await ensureDatabaseReady(dbConnection);

    return dbConnection;
  } catch (err) {
    console.warn("[DB] MongoDB connection failed or timed out:", err);
    try {
      await client?.close();
    } catch {}
    client = null;
    dbConnection = null;
    return null;
  }
}

/**
 * Connects to MongoDB and returns the Db instance.
 * Server-only; returns null in browser or if unavailable.
 * Concurrent callers share one connection attempt (no connect/seed races).
 */
export async function connectDB(): Promise<Db | null> {
  if (typeof window !== "undefined") {
    return null;
  }

  if (dbConnection) {
    return dbConnection;
  }

  if (!connecting) {
    connecting = openConnection().finally(() => {
      connecting = null;
    });
  }
  return connecting;
}

/**
 * Returns the underlying MongoClient instance.
 */
export function getClient(): MongoClient | null {
  return client;
}
