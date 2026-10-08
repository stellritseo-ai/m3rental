import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

export interface CustomerReviewDoc {
  id: string;
  author: string;
  company?: string;
  email: string;
  vehicleSlug: string;
  vehicleName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  status: "published" | "pending" | "hidden";
  verifiedRenter: boolean;
  adminReply?: string;
}

const SEED_REVIEWS: CustomerReviewDoc[] = [
  {
    id: "rev-1",
    author: "Carlos Mendoza",
    company: "Mendoza General Contracting",
    email: "carlos.m@houstonbuild.com",
    vehicleSlug: "2008-honda-ridgeline-midsize-pickup",
    vehicleName: "2008 Honda Ridgeline Midsize Pickup Truck",
    rating: 5,
    date: "2026-10-04",
    title: "Bed trunk is a game changer for tools & Houston weather",
    comment:
      "Rented the Ridgeline for a three-day remodel job in Southwest Houston. The lockable in-bed trunk kept all my Milwaukee power tools bone dry during an afternoon downpour. Clean truck, easy contactless pick-up.",
    status: "published",
    verifiedRenter: true,
  },
  {
    id: "rev-2",
    author: "David Gutierrez",
    company: "Lone Star Excavation",
    email: "david@lonestarexcavation.com",
    vehicleSlug: "heavy-equipment-tractor-backhoe-loader",
    vehicleName: "Tractor / Backhoe Loader",
    rating: 5,
    date: "2026-09-28",
    title: "Heavy hydraulics handled sticky Sugar Land gumbo clay effortlessly",
    comment:
      "Delivered on time directly to our jobsite on Highway 6. Machine had full diesel tank, clean grease fittings, and the 24-inch trenching bucket made quick work of our drainage install.",
    status: "published",
    verifiedRenter: true,
  },
  {
    id: "rev-3",
    author: "Rachel Sterling",
    company: "Sterling Events Group",
    email: "rachel@sterlingevents.com",
    vehicleSlug: "ford-e-series-passenger-shuttle-bus",
    vehicleName: "Ford E-Series Shuttle Bus",
    rating: 5,
    date: "2026-09-18",
    title: "Air conditioning blew icy cold for 14 VIP conference passengers",
    comment:
      "Houston humidity in September is brutal, but this shuttle's dual AC kept everyone comfortable between Bush Intercontinental and the hotel. Driver was punctual and very professional.",
    status: "published",
    verifiedRenter: true,
  },
];

// ── 1. Fetch Reviews from Database ────────────────────────────────────────
export const getReviewsDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ status: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: true, reviews: SEED_REVIEWS, source: "fallback" };
      }

      const col = db.collection<CustomerReviewDoc>("reviews");
      const count = await col.countDocuments();

      if (count === 0) {
        await col.insertMany(SEED_REVIEWS);
        console.log("[DB] Seeded initial reviews into MongoDB reviews collection");
      }

      const query: Record<string, any> = {};
      if (data?.status && data.status !== "all") {
        query["status"] = data.status;
      }

      const raw = await col.find(query).sort({ date: -1 }).toArray();
      const formatted: CustomerReviewDoc[] = raw.map((item) => {
        const { _id, ...rest } = item as any;
        return rest as CustomerReviewDoc;
      });

      return { success: true, reviews: formatted, source: "mongodb" };
    } catch (err: any) {
      console.error("[DB] Error fetching reviews:", err);
      return { success: false, error: err.message, reviews: SEED_REVIEWS, source: "fallback" };
    }
  });

// ── 2. Update Review Status or Admin Reply ────────────────────────────────
export const updateReviewDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(["published", "pending", "hidden"]).optional(),
      adminReply: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { id, ...updates } = data;
    try {
      const db = await connectDB();
      if (db) {
        await db.collection("reviews").updateOne(
          { id },
          { $set: updates }
        );
        console.log(`[DB] Updated review ${id} in MongoDB`);
      }
    } catch (err: any) {
      console.warn("[DB] Error updating review in MongoDB:", err);
    }
    return { success: true, id, updates };
  });

// ── 3. Delete Review ──────────────────────────────────────────────────────
export const deleteReviewDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (db) {
        await db.collection("reviews").deleteOne({ id: data.id });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
