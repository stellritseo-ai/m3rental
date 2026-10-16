import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";

// 1. Read .env file to get MONGODB_URI
function getMongoUri() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("MONGODB_URI=")) {
        return trimmed.replace(/^MONGODB_URI=/, "").replace(/^["']|["']$/g, "").trim();
      }
    }
  }
  return process.env.MONGODB_URI || "";
}

const COLLECTIONS = [
  "equipment",
  "bookings",
  "quotes",
  "customers",
  "notifications",
  "messages",
  "reviews",
  "payment_settings",
  "admin_users",
  "admin_sessions",
  "admin_lockouts",
  "admin_audit_logs",
];

async function run() {
  const uri = process.argv[2] || getMongoUri();
  if (!uri) {
    console.error("❌ No MONGODB_URI found in .env or passed as argument.");
    console.error("Usage: node scripts/seed_equipment.mjs [MONGODB_URI]");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  console.log(`URI: ${uri.replace(/:([^@]+)@/, ":****@")}`);

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");

    const db = client.db("m3_rental");

    // 1. Provision all 12 collections
    const existingCols = new Set(
      (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name)
    );
    for (const name of COLLECTIONS) {
      if (!existingCols.has(name)) {
        try {
          await db.createCollection(name);
          console.log(`📁 Created collection: "${name}"`);
        } catch (e) {
          if (e.code !== 48) console.warn(`Could not create ${name}:`, e.message);
        }
      }
    }

    // 2. Load all 47 products parsed from M3_Rental.xlsx
    const jsonPath = path.join(process.cwd(), "scripts", "parsed_equipment.json");
    const equipment = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    console.log(`\n📦 Loaded ${equipment.length} products parsed directly from M3_Rental.xlsx.`);

    const col = db.collection("equipment");
    const countBefore = await col.countDocuments();
    console.log(`Current equipment count in DB: ${countBefore}`);

    // Upsert all products by id to ensure exactly 47 products
    const now = new Date().toISOString();
    const ops = equipment.map((eq, i) => ({
      updateOne: {
        filter: { id: eq.id },
        update: {
          $set: {
            ...eq,
            status: eq.status || (i === 1 ? "booked" : i === 6 ? "maintenance" : "available"),
            vin: eq.vin || `1HGCR${1000 + i}8A00${200 + i}`,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    }));

    const res = await col.bulkWrite(ops, { ordered: false });
    const finalCount = await col.countDocuments();
    console.log(`✅ Upserted ${res.upsertedCount + res.modifiedCount} products. Total products now in database: ${finalCount}`);

    // 3. Initialize default payment settings if missing
    const payCol = db.collection("payment_settings");
    const existingPay = await payCol.findOne({ id: "default" });
    if (!existingPay) {
      await payCol.insertOne({
        id: "default",
        zelle: {
          accountName: "M3 Rental LLC",
          accountEmailOrPhone: "m3.wvalverse@gmail.com",
          qrCodeUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' fill='%237414CA'/><text x='60' y='65' fill='white' text-anchor='middle'>Zelle</text></svg>",
          instructions: "Open your banking app, navigate to Zelle, scan this QR code or send to m3.wvalverse@gmail.com. Include your Full Name and Vehicle in the memo.",
        },
        cashapp: {
          cashtag: "$M3RentalHouston",
          accountName: "M3 Rental Houston",
          qrCodeUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' fill='%2300D632'/><text x='60' y='65' fill='white' text-anchor='middle'>CashApp</text></svg>",
          instructions: "Open Cash App, scan this QR code or send to $M3RentalHouston. Ensure the amount matches your exact booking total.",
        },
        updatedAt: now,
      });
      console.log('✅ Initialized default payment settings in "payment_settings" collection');
    }

    // 4. Initialize admin user if missing
    const adminCol = db.collection("admin_users");
    await adminCol.updateOne(
      { username: "admin" },
      { $setOnInsert: { username: "admin", role: "superadmin", isActive: true, createdAt: new Date() } },
      { upsert: true }
    );
    console.log('✅ Verified admin account in "admin_users" collection');

    // 5. Ensure indexes
    await col.createIndex({ slug: 1 }, { unique: true }).catch(() => {});
    await col.createIndex({ id: 1 }, { unique: true, partialFilterExpression: { id: { $type: "string" } } }).catch(() => {});
    await db.collection("bookings").createIndex({ id: 1 }, { unique: true }).catch(() => {});
    await db.collection("quotes").createIndex({ id: 1 }, { unique: true }).catch(() => {});
    await db.collection("customers").createIndex({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: "string" } } }).catch(() => {});
    await db.collection("notifications").createIndex({ id: 1 }, { unique: true }).catch(() => {});
    await db.collection("messages").createIndex({ id: 1 }, { unique: true }).catch(() => {});
    await db.collection("reviews").createIndex({ id: 1 }, { unique: true }).catch(() => {});
    console.log("✅ Created unique database indexes for all collections");

    // 6. Summary of database collections
    console.log("\n📊 MongoDB Atlas Database Status (m3_rental):");
    for (const name of COLLECTIONS) {
      const c = await db.collection(name).countDocuments();
      console.log(`   - ${name.padEnd(18)} : ${c} documents`);
    }

    await client.close();
    console.log("\n🎉 Database fully initialized and ready!");
    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    await client.close().catch(() => {});
    process.exit(1);
  }
}

run();

