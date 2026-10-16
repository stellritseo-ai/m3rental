import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";

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

async function run() {
  const uri = process.argv[2] || getMongoUri();
  if (!uri) {
    console.error("❌ No MONGODB_URI found");
    process.exit(1);
  }

  const jsonPath = path.join(process.cwd(), "scripts", "parsed_equipment.json");
  const products = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log(`📦 Loaded ${products.length} products parsed from M3_Rental.xlsx`);

  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");

    const db = client.db("m3_rental");
    const col = db.collection("equipment");

    // 1. Remove all current products from database
    const delRes = await col.deleteMany({});
    console.log(`🗑️ Removed ${delRes.deletedCount} old products from MongoDB 'equipment' collection.`);

    // 2. Insert fresh products from Excel
    const insRes = await col.insertMany(products);
    console.log(`🎉 Inserted ${insRes.insertedCount} new products directly from Excel into MongoDB!`);

    // 3. Ensure indexes
    await col.createIndex({ slug: 1 }, { unique: true }).catch(() => {});
    await col.createIndex({ id: 1 }, { unique: true }).catch(() => {});
    await col.createIndex({ category: 1 }).catch(() => {});

    // 4. Verify count
    const totalCount = await col.countDocuments();
    console.log(`\n📊 Total products now in MongoDB 'equipment' collection: ${totalCount}`);

    // Print all 47 products
    const all = await col.find({}).sort({ id: 1 }).toArray();
    console.log("\nComplete list of all 47 products in MongoDB:");
    all.forEach((p, idx) => {
      console.log(`  ${String(idx + 1).padStart(2)}. [${p.id}] ${p.name} — $${p.dayRate} (${p.category})`);
    });

    await client.close();
    console.log("\n✅ All products successfully updated from Excel in MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error reseeding MongoDB:", err);
    await client.close().catch(() => {});
    process.exit(1);
  }
}

run();
