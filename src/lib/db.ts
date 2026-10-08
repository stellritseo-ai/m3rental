import type { Db, MongoClient } from "mongodb";

const FALLBACK_MONGODB_URI =
  "mongodb+srv://m3rental:2OLdlmN2i634eWLu@m3rental.1hwn1am.mongodb.net/?retryWrites=true&w=majority&appName=m3rental";

function getMongoUri(): string {
  if (typeof window !== "undefined") return "";

  const globalProc = (
    globalThis as unknown as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process;

  const uri =
    process.env["MONGODB_URI"] ||
    process.env["DATABASE_URL"] ||
    globalProc?.env?.["MONGODB_URI"] ||
    globalProc?.env?.["DATABASE_URL"];

  if (typeof uri === "string" && uri.trim()) {
    return uri.trim();
  }

  return FALLBACK_MONGODB_URI;
}

let client: MongoClient | null = null;
let dbConnection: Db | null = null;

/**
 * Connects to MongoDB and returns the Db instance.
 * Server-only; returns null in browser or if unavailable.
 */
export async function connectDB(): Promise<Db | null> {
  if (typeof window !== "undefined") {
    return null;
  }

  if (dbConnection) {
    return dbConnection;
  }

  // Configure high-reliability public DNS resolvers for MongoDB Atlas SRV lookup in Node environments
  try {
    const dns = await import("node:dns");
    if (typeof dns?.setServers === "function") {
      dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);
    }
  } catch {}

  const uri = getMongoUri();
  if (!uri) {
    console.warn("[DB] MONGODB_URI environment variable is not defined.");
    return null;
  }

  try {
    if (!client) {
      const { MongoClient: MongoCls } = await import("mongodb");
      client = new MongoCls(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
      });
    }
    await client.connect();
    // Use m3_rental database or default DB
    dbConnection = client.db("m3_rental");
    console.log("[DB] Successfully connected to MongoDB Database (m3_rental)");
    return dbConnection;
  } catch (err) {
    console.warn("[DB] MongoDB connection failed or timed out:", err);
    client = null;
    dbConnection = null;
    return null;
  }
}

/**
 * Returns the underlying MongoClient instance.
 */
export function getClient(): MongoClient | null {
  return client;
}
