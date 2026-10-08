import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { equipment as defaultFleet, Equipment } from "@/data/equipment";

export type ManagedEquipmentDoc = Omit<Equipment, "year" | "color" | "monthRate" | "featured"> & {
  id?: string | undefined;
  year?: string | undefined;
  color?: string | undefined;
  monthRate?: number | undefined;
  pricingUnit?: string | undefined;
  operatorService?: string | undefined;
  specs?: string | undefined;
  featured?: boolean | undefined;
  status: "available" | "booked" | "maintenance";
  vin?: string | undefined;
  internalNotes?: string | undefined;
  updatedAt?: string | undefined;
};

import {
  KNOWN_DUPLICATE_SLUG_PAIRS,
  areItemsDuplicate,
  deduplicateFleet,
} from "../fleet-utils";

export {
  KNOWN_DUPLICATE_SLUG_PAIRS,
  areItemsDuplicate,
  deduplicateFleet,
};

// ── 1. Fetch Managed Fleet from Database ─────────────────────────────────
export const getEquipmentDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ category: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        const { kept } = deduplicateFleet(defaultFleet);
        const fallback = kept.map((eq) => ({
          ...eq,
          status: (eq.status || "available") as "available" | "booked" | "maintenance",
        }));
        return { success: true, equipment: fallback, source: "fallback" };
      }

      const equipmentCol = db.collection<ManagedEquipmentDoc>("equipment");
      const count = await equipmentCol.countDocuments();

      // Only seed if collection is completely empty
      if (count === 0) {
        const seedData: ManagedEquipmentDoc[] = defaultFleet.map((eq, i) => ({
          ...eq,
          status: (eq.status || (i === 1 ? "booked" : i === 6 ? "maintenance" : "available")) as "available" | "booked" | "maintenance",
          vin: eq.vin || `1HGCR${1000 + i}8A00${200 + i}`,
          updatedAt: new Date().toISOString(),
        }));
        await equipmentCol.insertMany(seedData);
        console.log(`[DB] Seeded all ${seedData.length} real products from M3 Excel into MongoDB equipment collection`);
      }

      const query: Record<string, any> = {};
      if (data?.category && data.category !== "all") {
        query["category"] = data.category;
      }

      const rawItems = await equipmentCol.find(query).toArray();
      const formatted: ManagedEquipmentDoc[] = rawItems.map((item) => {
        const { _id, ...rest } = item as any;
        return rest as ManagedEquipmentDoc;
      });

      return { success: true, equipment: formatted, source: "mongodb" };
    } catch (err: any) {
      console.error("[DB] Error fetching equipment:", err);
      const { kept } = deduplicateFleet(defaultFleet);
      const fallback = kept.map((eq) => ({
        ...eq,
        status: (eq.status || "available") as "available" | "booked" | "maintenance",
      }));
      return { success: false, error: err.message, equipment: fallback, source: "fallback" };
    }
  });

// ── 2. Update Equipment Details, Pricing, Status & Image ─────────────────
export const updateEquipmentDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().optional(),
      slug: z.string(),
      name: z.string().optional(),
      category: z.string().optional(),
      type: z.string().optional(),
      dayRate: z.number().optional(),
      monthRate: z.number().optional(),
      pricingUnit: z.string().optional(),
      status: z.enum(["available", "booked", "maintenance"]).optional(),
      featured: z.boolean().optional(),
      image: z.string().optional(),
      color: z.string().optional(),
      year: z.string().optional(),
      summary: z.string().optional(),
      features: z.array(z.string()).optional(),
      specs: z.string().optional(),
      operator: z.string().optional(),
      operatorIncluded: z.boolean().optional(),
      operatorService: z.string().optional(),
      internalNotes: z.string().optional(),
      vin: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { slug, id, ...fieldsToUpdate } = data;
    const updatePayload: Record<string, any> = {
      ...fieldsToUpdate,
      updatedAt: new Date().toISOString(),
    };

    try {
      const db = await connectDB();
      if (db) {
        const equipmentCol = db.collection<ManagedEquipmentDoc>("equipment");
        const filter = {
          $or: [
            { slug },
            { slug: slug.toLowerCase() },
            ...(id ? [{ id }, { id: id.toUpperCase() }, { id: id.toLowerCase() }] : []),
          ],
        };
        const result = await equipmentCol.updateOne(
          filter,
          { $set: updatePayload },
          { upsert: false }
        );
        console.log(`[DB] Updated equipment ${slug} in MongoDB (matched: ${result.matchedCount}, modified: ${result.modifiedCount})`);

        if (result.matchedCount === 0) {
          await equipmentCol.updateOne(
            { slug },
            { $set: { ...updatePayload, slug, ...(id ? { id } : {}) } },
            { upsert: true }
          );
          console.log(`[DB] Upserted equipment ${slug} into MongoDB`);
        }
      }
    } catch (err: any) {
      console.warn("[DB] Error updating equipment in MongoDB:", err);
    }

    return { success: true, slug, updates: updatePayload };
  });

// ── 3. Create New Equipment Product ──────────────────────────────────────
export const createEquipmentDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().optional(),
      slug: z.string(),
      name: z.string(),
      year: z.string().optional(),
      category: z.string(),
      type: z.string(),
      color: z.string().optional(),
      summary: z.string(),
      features: z.array(z.string()),
      dayRate: z.number(),
      monthRate: z.number().optional(),
      pricingUnit: z.string().optional(),
      operator: z.enum(["self", "operator", "driver", "driver-operator"]),
      operatorIncluded: z.boolean().optional(),
      operatorService: z.string().optional(),
      specs: z.string().optional(),
      featured: z.boolean().optional(),
      image: z.string(),
      status: z.enum(["available", "booked", "maintenance"]),
      vin: z.string().optional(),
      internalNotes: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const doc: ManagedEquipmentDoc = {
      slug: data.slug,
      name: data.name,
      category: data.category as any,
      type: data.type,
      summary: data.summary,
      features: data.features,
      dayRate: data.dayRate,
      operator: data.operator,
      image: data.image,
      status: data.status,
      updatedAt: new Date().toISOString(),
      ...(data.id ? { id: data.id } : {}),
      ...(data.year ? { year: data.year } : {}),
      ...(data.color ? { color: data.color } : {}),
      ...(typeof data.monthRate === "number" ? { monthRate: data.monthRate } : {}),
      ...(data.pricingUnit ? { pricingUnit: data.pricingUnit } : {}),
      ...(data.operatorIncluded !== undefined ? { operatorIncluded: data.operatorIncluded } : {}),
      ...(data.operatorService ? { operatorService: data.operatorService } : {}),
      ...(data.specs ? { specs: data.specs } : {}),
      ...(typeof data.featured === "boolean" ? { featured: data.featured } : {}),
      ...(data.vin ? { vin: data.vin } : {}),
      ...(data.internalNotes ? { internalNotes: data.internalNotes } : {}),
    };

    try {
      const db = await connectDB();
      if (db) {
        await db.collection("equipment").insertOne(doc as any);
        console.log(`[DB] Added new equipment ${data.slug} to MongoDB`);
      }
    } catch (err: any) {
      console.warn("[DB] Error creating equipment in MongoDB:", err);
    }

    return { success: true, equipment: doc };
  });

// ── 4. Delete Equipment Product ──────────────────────────────────────────
export const deleteEquipmentDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (db) {
        await db.collection("equipment").deleteOne({ slug: data.slug });
        console.log(`[DB] Deleted equipment ${data.slug} from MongoDB`);
      }
      return { success: true, slug: data.slug };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

// ── 5. Re-Sync / Reset All Products Directly from Excel Catalog ──────────
// ── 5. Re-Sync / Reset All Products Directly from Excel Catalog ──────────
export const resetFleetToExcelDb = createServerFn({ method: "POST" })
  .handler(async () => {
    const seedData: ManagedEquipmentDoc[] = defaultFleet.map((eq, i) => ({
      ...eq,
      status: (eq.status || (i === 1 ? "booked" : i === 6 ? "maintenance" : "available")) as "available" | "booked" | "maintenance",
      vin: eq.vin || `1HGCR${1000 + i}8A00${200 + i}`,
      updatedAt: new Date().toISOString(),
    }));

    try {
      const db = await connectDB();
      if (db) {
        const col = db.collection<ManagedEquipmentDoc>("equipment");
        await col.deleteMany({});
        await col.insertMany(seedData);
        console.log(`[DB] Successfully re-synced all ${seedData.length} products from Excel to MongoDB`);
      }
      return { success: true, count: seedData.length, equipment: seedData };
    } catch (err: any) {
      console.error("[DB] Failed to re-sync Excel products:", err);
      return { success: true, count: seedData.length, equipment: seedData };
    }
  });

// ── 6. Delete Multiple Equipment Products in One Click ───────────────────
export const deleteMultipleEquipmentDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ slugs: z.array(z.string()) }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (db) {
        const res = await db.collection("equipment").deleteMany({
          slug: { $in: data.slugs },
        });
        console.log(`[DB] Bulk deleted ${res.deletedCount} equipment items from MongoDB`);
        return { success: true, count: res.deletedCount, slugs: data.slugs };
      }
      return { success: true, count: data.slugs.length, slugs: data.slugs };
    } catch (err: any) {
      console.error("[DB] Failed to bulk delete equipment:", err);
      return { success: false, error: err.message };
    }
  });

// ── 7. Deduplicate Fleet in MongoDB Database ─────────────────────────────
export const deduplicateFleetDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (db) {
        const col = db.collection<ManagedEquipmentDoc>("equipment");
        const count = await col.countDocuments();
        if (count === 0) {
          const seedData: ManagedEquipmentDoc[] = defaultFleet.map((eq, i) => ({
            ...eq,
            status: (eq.status || (i === 1 ? "booked" : i === 6 ? "maintenance" : "available")) as "available" | "booked" | "maintenance",
            vin: eq.vin || `1HGCR${1000 + i}8A00${200 + i}`,
            updatedAt: new Date().toISOString(),
          }));
          await col.insertMany(seedData);
          return {
            success: true,
            removedCount: 0,
            removedSlugs: [],
            equipment: seedData,
            source: "mongodb",
          };
        }

        const rawItems = await col.find({}).toArray();
        const formatted = rawItems.map((item) => {
          const { _id, ...rest } = item as any;
          return rest as ManagedEquipmentDoc;
        });

        const { kept, removedSlugs } = deduplicateFleet<ManagedEquipmentDoc>(formatted);

        let deletedCount = 0;
        if (removedSlugs.length > 0) {
          const res = await col.deleteMany({ slug: { $in: removedSlugs } });
          deletedCount = res.deletedCount;
          console.log(`[DB] Successfully removed ${deletedCount} duplicate products from MongoDB`);
        }

        return {
          success: true,
          removedCount: deletedCount || removedSlugs.length,
          removedSlugs,
          equipment: kept,
          source: "mongodb",
        };
      }

      const { kept, removedSlugs } = deduplicateFleet(defaultFleet);
      return {
        success: true,
        removedCount: removedSlugs.length,
        removedSlugs,
        equipment: kept,
        source: "fallback",
      };
    } catch (err: any) {
      console.error("[DB] Deduplication error:", err);
      return { success: false, error: err.message, equipment: defaultFleet };
    }
  });

