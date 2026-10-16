import type { Db } from "mongodb";
import { EXCEL_FLEET_SEED as defaultFleet } from "./excel-seed.server";
import { getEnv } from "./env.server";

/**
 * Every collection the app uses. They are all created up-front so they are visible
 * in MongoDB Atlas immediately (MongoDB otherwise only creates a collection on first write).
 */
export const COLLECTIONS = [
  "equipment", // products / fleet
  "bookings", // rental orders
  "quotes", // quote requests (RFQ)
  "customers", // customers / users who booked or requested
  "notifications", // dashboard notifications
  "messages", // contact form inbox
  "reviews", // customer reviews
  "sell_listings", // equipment that visitors want to sell to M3
  "payment_settings", // Zelle / CashApp settings + QR codes
  "blog_posts", // articles and news
  "admin_users", // admin accounts
  "admin_sessions", // admin login sessions
  "admin_lockouts", // brute-force protection
  "admin_audit_logs", // audit trail
] as const;

let readyPromise: Promise<void> | null = null;

async function safeIndex(db: Db, collection: string, spec: Record<string, 1 | -1>, options: Record<string, unknown> = {}) {
  try {
    await db.collection(collection).createIndex(spec, options);
  } catch (err: any) {
    console.warn(`[DB] Index on ${collection} ${JSON.stringify(spec)} skipped: ${err?.message}`);
  }
}

/** Idempotent product seed: upserts by id, so concurrent callers can never duplicate or wipe data. */
export async function seedEquipmentIfEmpty(db: Db): Promise<number> {
  const col = db.collection("equipment");
  if ((await col.estimatedDocumentCount()) > 0) return 0;

  const now = new Date().toISOString();
  const ops = defaultFleet.map((eq, i) => ({
    updateOne: {
      filter: { id: eq.id },
      update: {
        $setOnInsert: {
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
  console.log(`[DB] Seeded ${res.upsertedCount} products from the M3 Excel catalog into "equipment"`);
  return res.upsertedCount;
}

async function backfillCustomers(db: Db) {
  const legacy = await db
    .collection("customers")
    .find({ $or: [{ id: { $exists: false } }, { firstSeen: { $exists: false } }, { lastActive: { $exists: false } }] })
    .toArray();
  if (legacy.length === 0) return;
  const now = new Date().toISOString();
  await db.collection("customers").bulkWrite(
    legacy.map((c: any, i) => ({
      updateOne: {
        filter: { _id: c._id },
        update: {
          $set: {
            id: c.id || `cust-${Date.now()}-${i}`,
            firstSeen: c.firstSeen || c.createdAt || now,
            lastActive: c.lastActive || c.lastRentalAt || c.createdAt || now,
            totalBookings: c.totalBookings ?? 0,
            totalQuotes: c.totalQuotes ?? 0,
            totalSpent: c.totalSpent ?? 0,
            bookingIds: c.bookingIds ?? [],
            vehicleHistory: c.vehicleHistory ?? [],
          },
        },
      },
    }))
  );
  console.log(`[DB] Backfilled ${legacy.length} legacy customer records`);
}

async function seedAdminUser(db: Db) {
  const username = ((await getEnv("ADMIN_USERNAME")) || "admin").toLowerCase();
  await db.collection("admin_users").updateOne(
    { username },
    { $setOnInsert: { username, role: "superadmin", isActive: true, createdAt: new Date() } },
    { upsert: true }
  );
}

async function provision(db: Db) {
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));
  for (const name of COLLECTIONS) {
    if (!existing.has(name)) {
      try {
        await db.createCollection(name);
        console.log(`[DB] Created collection "${name}"`);
      } catch (err: any) {
        // 48 = NamespaceExists (another request created it first)
        if (err?.code !== 48) console.warn(`[DB] Could not create collection ${name}:`, err?.message);
      }
    }
  }

  await Promise.all([
    safeIndex(db, "equipment", { slug: 1 }, { unique: true }),
    safeIndex(db, "equipment", { id: 1 }, { unique: true, partialFilterExpression: { id: { $type: "string" } } }),
    safeIndex(db, "equipment", { category: 1 }),
    safeIndex(db, "bookings", { id: 1 }, { unique: true }),
    safeIndex(db, "bookings", { vehicleSlug: 1, pickupDate: 1, returnDate: 1 }),
    safeIndex(db, "bookings", { bookingStatus: 1, createdAt: -1 }),
    safeIndex(db, "quotes", { id: 1 }, { unique: true }),
    safeIndex(db, "quotes", { status: 1, createdAt: -1 }),
    safeIndex(db, "customers", { email: 1 }, { unique: true, partialFilterExpression: { email: { $type: "string" } } }),
    safeIndex(db, "customers", { id: 1 }),
    safeIndex(db, "notifications", { id: 1 }, { unique: true }),
    safeIndex(db, "notifications", { createdAt: -1 }),
    safeIndex(db, "messages", { id: 1 }, { unique: true }),
    safeIndex(db, "reviews", { id: 1 }, { unique: true }),
    safeIndex(db, "sell_listings", { id: 1 }, { unique: true }),
    safeIndex(db, "sell_listings", { status: 1, createdAt: -1 }),
    safeIndex(db, "payment_settings", { id: 1 }, { unique: true }),
    safeIndex(db, "admin_users", { username: 1 }, { unique: true }),
    safeIndex(db, "admin_sessions", { tokenHash: 1 }, { unique: true }),
    safeIndex(db, "admin_sessions", { expiresAt: 1 }, { expireAfterSeconds: 0 }),
    safeIndex(db, "admin_lockouts", { username: 1 }, { unique: true }),
    safeIndex(db, "admin_audit_logs", { timestamp: -1 }),
    safeIndex(db, "blog_posts", { slug: 1 }, { unique: true }),
    safeIndex(db, "blog_posts", { id: 1 }, { unique: true }),
    safeIndex(db, "blog_posts", { status: 1, publishedAt: -1 }),
    safeIndex(db, "blog_posts", { category: 1 }),
  ]);

  await seedEquipmentIfEmpty(db);
  await seedBlogIfEmpty(db).catch((e) => console.warn("[DB] Blog seed skipped:", e?.message));
  await backfillCustomers(db).catch((e) => console.warn("[DB] Customer backfill skipped:", e?.message));
  await seedAdminUser(db).catch((e) => console.warn("[DB] Admin user seed skipped:", e?.message));
}

export async function seedBlogIfEmpty(db: Db): Promise<number> {
  const col = db.collection("blog_posts");
  if ((await col.estimatedDocumentCount()) > 0) return 0;

  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

  const initialPosts = [
    {
      id: "blog-seed-001",
      slug: "maximizing-jobsite-efficiency-houston-equipment-rental",
      title: "Maximizing Jobsite Efficiency: Why Houston Contractors Choose Direct Equipment Rental Over Ownership",
      excerpt:
        "From Tier-4 emissions compliance to eliminating idle capital depreciation, discover why commercial rental fleets outperform equipment ownership in the Greater Houston industrial corridor.",
      content: `## The Modern Economics of Heavy Fleet Management

Across Houston, Pasadena, and the Gulf Coast petrochemical corridors, commercial general contractors are re-evaluating capital allocation. Maintaining an owned fleet of 50-ton cranes, 30-ton excavators, and heavy-duty lowboy trailers carries hidden balance-sheet drains: depreciation, scheduled 250-hour oil and hydraulic filter servicing, certified storage yards, and dedicated transport insurance.

### 1. Capital Agility in Volatile Market Cycles
When bidding on multi-million-dollar civil infrastructure or refinery turnaround contracts, liquidity is king. Long-term equipment financing ties up bonding capacity that could otherwise back higher-margin engineering bids.

> **Key Takeaway:** "Renting project-specific equipment shifts heavy capital expenditures (CapEx) directly into predictable project operating expenses (OpEx), instantly tax-deductible against job milestones."

### 2. Guaranteed Tier-4 Final Compliance & Minimal Downtime
Strict EPA emissions thresholds and plant safety regulations require modern diesel particulate filters (DPF) and selective catalytic reduction (SCR) systems. M3 Rental continuously updates its fleet to guarantee:
* Zero downtime from obsolete hydraulic components
* 100% pre-delivery telemetry and load testing
* 24/7 on-call field mechanics ready to dispatch across Harris and surrounding counties

### 3. Sizing the Rig to the Task, Not the Yard
Contractors with owned equipment often force a 20-ton excavator onto an excavation trench requiring a compact 10-ton tail-swing unit—wasting fuel and risking trench collapses. Turnkey rental empowers project managers to match exact tonnage and reach specifications on demand.

Ready to optimize your upcoming jobsite run-rate? Review the [M3 Houston Fleet Catalog](/equipment) or request immediate dispatch assistance from our dispatch coordinators.`,
      coverImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18f156d?auto=format&fit=crop&w=1600&q=80",
      category: "Contractor Guides",
      tags: ["Houston Construction", "Fleet Management", "Cost Efficiency", "Heavy Equipment"],
      author: {
        name: "Marcus Vance",
        role: "M3 Fleet Operations Director",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      },
      readTime: "5 min read",
      status: "published",
      featured: true,
      views: 312,
      publishedAt: daysAgo(2),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: "blog-seed-002",
      slug: "osha-heavy-machinery-safety-checklist-gulf-coast",
      title: "OSHA & Heavy Machinery Safety Checklist for Gulf Coast Petrochemical & Commercial Sites",
      excerpt:
        "A comprehensive operational protocol to keep your operators safe, certified, and 100% compliant across Texas industrial civil infrastructure projects.",
      content: `## Zero Incidents: The Golden Standard for Heavy Plant Work

In Texas civil engineering and petrochemical facilities, a single jobsite safety violation can trigger immediate OSHA stop-work orders, steep fines, and project delays. Operating excavators, boom lifts, and heavy mobile cranes demands rigorous daily protocols.

### Essential Daily Walk-Around Inspection Points
Before engaging the ignition, certified operators must walk a full 360-degree perimeter around the equipment:

1. **Hydraulic Lines & Fittings:** Check for weeping fluid or micro-cracks on high-pressure boom cylinders.
2. **Track Tension & Ground Engagement Tools:** Verify tooth pins on excavator buckets and track sag tolerance.
3. **Emergency Disconnects & Horns:** Test backup alarms, rotating beacons, and cabin emergency shutoffs.
4. **Counterweight Clearances:** Ensure barricades prevent personnel from entering the swing radius pinch points.

### Heat & Gulf Coast Atmospheric Considerations
Houston humidity accelerates corrosion on exposed pin points and hydraulic seals. During triple-digit summer heat, engine cooling systems must be monitored continuously to prevent hydraulic cavitation and radiator boiling.

> **Safety Reminder:** Never bypass OEM roll-over protective structures (ROPS) or falling object protective structures (FOPS). All M3 Rental machines undergo verified 42-point pre-dispatch safety certifications before rolling onto your jobsite.`,
      coverImage: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1600&q=80",
      category: "Jobsite Safety",
      tags: ["OSHA Compliance", "Jobsite Safety", "Excavator Inspections", "Texas Industrial"],
      author: {
        name: "Elena Rodriguez",
        role: "Senior Safety Compliance Specialist",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
      },
      readTime: "7 min read",
      status: "published",
      featured: false,
      views: 224,
      publishedAt: daysAgo(5),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
    {
      id: "blog-seed-003",
      slug: "heavy-hauling-logistics-choosing-right-trailer-crane",
      title: "Navigating Heavy Hauling & Logistics: Choosing the Right Trailer & Crane for Mega-Loads",
      excerpt:
        "Lowboys, step decks, and rough terrain cranes: how M3 Rental ensures punctual site delivery, precise rigging, and zero project downtime across Texas.",
      content: `## Precision Hauling Across the Texas Highway Network

Transporting multi-ton industrial machinery through the I-10, I-610, and Beltway 8 interchange requires meticulous planning. Weight distributions, axle spacing, Texas Department of Motor Vehicles (TxDMV) oversize/overweight permits, and bridge vertical clearances dictate the transport equation.

### Selecting Your Transport Rig
* **RGN (Removable Gooseneck) Lowboy Trailers:** The industry standard for heavy crawler excavators, bulldozers, and wheel loaders. Allows equipment to be driven directly onto the deck from the front.
* **Step Deck / Drop Deck Trailers:** Ideal for tall industrial generators, compressors, and reach forklifts that exceed standard 8.5-foot flatbed height restrictions.
* **Double-Drop Deck Trailers:** For ultra-tall components requiring minimum ground clearance to clear Houston overhead power and traffic lines.

### Punctual Delivery & Staging Services
M3 Rental coordinates direct-to-site delivery with fully insured commercial operators. Whether you need machinery delivered at 5:00 AM before city curfew or staged over a weekend, our Houston logistics team guarantees seamless turnaround.`,
      coverImage: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=80",
      category: "Fleet Logistics",
      tags: ["Heavy Hauling", "Lowboy Trailers", "Rigging", "Gulf Coast Logistics"],
      author: {
        name: "David Sterling",
        role: "Logistics Lead",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      },
      readTime: "6 min read",
      status: "published",
      featured: false,
      views: 187,
      publishedAt: daysAgo(9),
      createdAt: daysAgo(9),
      updatedAt: daysAgo(9),
    },
  ];

  const ops = initialPosts.map((post) => ({
    updateOne: {
      filter: { slug: post.slug },
      update: { $setOnInsert: post },
      upsert: true,
    },
  }));

  const res = await col.bulkWrite(ops, { ordered: false });
  console.log(`[DB] Seeded ${res.upsertedCount} default articles into "blog_posts"`);
  return res.upsertedCount;
}

/** Runs once per server process (cached promise) — creates collections, indexes and seeds products. */
export function ensureDatabaseReady(db: Db): Promise<void> {
  if (!readyPromise) {
    readyPromise = provision(db).catch((err) => {
      console.error("[DB] Provisioning failed:", err);
      readyPromise = null; // allow retry on next request
    });
  }
  return readyPromise;
}
