import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import type { Equipment } from "@/data/equipment";
import { EXCEL_FLEET_SEED as defaultFleet } from "../excel-seed.server";
import {
  CLOUDINARY_FLEET_FOLDER,
  deleteFromCloudinary,
  isCloudinaryUrl,
  isDataUrl,
  uploadToCloudinary,
} from "../cloudinary.server";

/** Deletes a Cloudinary image only when no other product still uses it. */
async function cleanupUnusedImage(db: import("mongodb").Db, url: string | undefined) {
  if (!url || !isCloudinaryUrl(url)) return;
  const stillUsed = await db.collection("equipment").countDocuments({ image: url });
  if (stillUsed === 0) await deleteFromCloudinary(url);
}

/** Converts a pasted/selected base64 image into a permanent Cloudinary URL. */
async function resolveImage(image: string | undefined): Promise<string | undefined> {
  if (image && isDataUrl(image)) {
    const uploaded = await uploadToCloudinary(image, CLOUDINARY_FLEET_FOLDER);
    return uploaded.url;
  }
  return image;
}

export type ManagedEquipmentDoc = Omit<Equipment, "status"> & {
  status: "available" | "booked" | "maintenance";
  internalNotes?: string | null | undefined;
  updatedAt?: string | undefined;
  _id?: any;
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
        return { success: false, error: "Database not connected", equipment: [], source: "fallback" };
      }

      const equipmentCol = db.collection<ManagedEquipmentDoc>("equipment");

      const query: Record<string, any> = {};
      if (data?.category && data.category !== "all") {
        query["category"] = data.category;
      }

      const rawItems = await equipmentCol.find(query).sort({ id: 1 }).toArray();
      const formatted: ManagedEquipmentDoc[] = rawItems.map((item) => {
        const { _id, ...rest } = item as any;
        return rest as ManagedEquipmentDoc;
      });

      return { success: true, equipment: formatted, source: "mongodb" };
    } catch (err: any) {
      console.error("[DB] Error fetching equipment:", err);
      return { success: false, error: err.message, equipment: [], source: "fallback" };
    }
  });

// ── 2. Update Equipment Details, Pricing, Status & Image ─────────────────
export const updateEquipmentDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().nullable().optional(),
      slug: z.string(),
      name: z.string().optional(),
      category: z.string().optional(),
      type: z.string().optional(),
      dayRate: z.number().optional(),
      monthRate: z.number().nullable().optional(),
      pricingUnit: z.string().nullable().optional(),
      status: z.enum(["available", "booked", "maintenance"]).optional(),
      featured: z.boolean().optional(),
      image: z.string().optional(),
      color: z.string().nullable().optional(),
      year: z.string().nullable().optional(),
      summary: z.string().optional(),
      features: z.array(z.string()).optional(),
      specs: z.string().nullable().optional(),
      operator: z.string().optional(),
      operatorIncluded: z.boolean().optional(),
      operatorService: z.string().nullable().optional(),
      internalNotes: z.string().nullable().optional(),
      vin: z.string().nullable().optional(),
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
      if (!db) {
        return { success: false, persisted: false, error: "Database is not connected.", slug, updates: updatePayload };
      }

      const equipmentCol = db.collection<ManagedEquipmentDoc>("equipment");
      const filter = {
        $or: [
          { slug },
          { slug: slug.toLowerCase() },
          ...(id ? [{ id }, { id: id.toUpperCase() }, { id: id.toLowerCase() }] : []),
        ],
      };

      // Image sync: a new/replaced image is uploaded to Cloudinary and only its URL is stored in MongoDB.
      let previousImage: string | undefined;
      if (typeof updatePayload["image"] === "string") {
        const existing = await equipmentCol.findOne(filter, { projection: { image: 1 } });
        previousImage = existing?.image;
        updatePayload["image"] = await resolveImage(updatePayload["image"]);
      }

      const result = await equipmentCol.updateOne(filter, { $set: updatePayload }, { upsert: false });
      console.log(`[DB] Updated equipment ${slug} in MongoDB (matched: ${result.matchedCount}, modified: ${result.modifiedCount})`);

      if (result.matchedCount === 0) {
        await equipmentCol.updateOne(
          { slug },
          { $set: { ...updatePayload, slug, ...(id ? { id } : {}) } },
          { upsert: true }
        );
        console.log(`[DB] Upserted equipment ${slug} into MongoDB`);
      }

      // Remove the replaced Cloudinary asset once nothing references it any more
      if (previousImage && updatePayload["image"] && previousImage !== updatePayload["image"]) {
        await cleanupUnusedImage(db, previousImage);
      }

      return {
        success: true,
        persisted: true,
        slug,
        image: updatePayload["image"] as string | undefined,
        updates: updatePayload,
      };
    } catch (err: any) {
      console.error("[DB] Error updating equipment in MongoDB:", err);
      return { success: false, persisted: false, error: err.message as string, slug, updates: updatePayload };
    }
  });

// ── 3. Create New Equipment Product ──────────────────────────────────────
export const createEquipmentDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().nullable().optional(),
      slug: z.string(),
      name: z.string(),
      year: z.string().nullable().optional(),
      category: z.string(),
      type: z.string(),
      color: z.string().nullable().optional(),
      summary: z.string(),
      features: z.array(z.string()),
      dayRate: z.number(),
      monthRate: z.number().nullable().optional(),
      pricingUnit: z.string().nullable().optional(),
      operator: z.enum(["self", "operator", "driver", "driver-operator"]),
      operatorIncluded: z.boolean().optional(),
      operatorService: z.string().nullable().optional(),
      specs: z.string().nullable().optional(),
      featured: z.boolean().optional(),
      image: z.string(),
      status: z.enum(["available", "booked", "maintenance"]),
      vin: z.string().nullable().optional(),
      internalNotes: z.string().nullable().optional(),
    })
  )
  .handler(async ({ data }) => {
    let imageUrl = data.image;
    try {
      imageUrl = (await resolveImage(data.image)) || data.image;
    } catch (err: any) {
      return { success: false, persisted: false, error: `Image upload failed: ${err.message}` } as {
        success: boolean;
        persisted: boolean;
        error?: string;
        equipment?: ManagedEquipmentDoc;
      };
    }

    const doc: ManagedEquipmentDoc = {
      slug: data.slug,
      name: data.name,
      category: data.category as any,
      type: data.type,
      summary: data.summary,
      features: data.features,
      dayRate: data.dayRate,
      operator: data.operator,
      image: imageUrl,
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
      if (!db) {
        return { success: false, persisted: false, error: "Database is not connected.", equipment: doc };
      }
      await db.collection("equipment").insertOne(doc as any);
      console.log(`[DB] Added new equipment ${data.slug} to MongoDB`);
      const { _id, ...clean } = doc as any;
      return { success: true, persisted: true, equipment: clean as ManagedEquipmentDoc };
    } catch (err: any) {
      const duplicate = err?.code === 11000;
      console.warn("[DB] Error creating equipment in MongoDB:", err);
      return {
        success: false,
        persisted: false,
        error: duplicate ? "A product with this ID or slug already exists." : (err.message as string),
        equipment: doc,
      };
    }
  });

// ── 4. Delete Equipment Product ──────────────────────────────────────────
export const deleteEquipmentDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (db) {
        const col = db.collection("equipment");
        const doc = await col.findOne({ slug: data.slug }, { projection: { image: 1 } });
        await col.deleteOne({ slug: data.slug });
        console.log(`[DB] Deleted equipment ${data.slug} from MongoDB`);
        await cleanupUnusedImage(db, doc?.["image"]);
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

