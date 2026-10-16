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

const SEED_REVIEWS: CustomerReviewDoc[] = [];

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

// ── 1b. Create Review ─────────────────────────────────────────────────────
export const createReviewDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      author: z.string().min(1),
      company: z.string().optional(),
      email: z.string(),
      vehicleSlug: z.string(),
      vehicleName: z.string(),
      rating: z.number().min(1).max(5),
      title: z.string().min(1),
      comment: z.string().min(1),
      status: z.enum(["published", "pending", "hidden"]).optional(),
      verifiedRenter: z.boolean().optional(),
    })
  )
  .handler(async ({ data }) => {
    const review: CustomerReviewDoc = {
      id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      author: data.author,
      email: data.email,
      vehicleSlug: data.vehicleSlug,
      vehicleName: data.vehicleName,
      rating: data.rating,
      date: new Date().toISOString().slice(0, 10),
      title: data.title,
      comment: data.comment,
      status: data.status ?? "published",
      verifiedRenter: data.verifiedRenter ?? true,
      ...(data.company ? { company: data.company } : {}),
    };
    try {
      const db = await connectDB();
      if (!db) return { success: false, persisted: false, error: "Database unavailable", review };
      await db.collection("reviews").insertOne({ ...review });
      return { success: true, persisted: true, review };
    } catch (err: any) {
      console.error("[DB] Error creating review:", err);
      return { success: false, persisted: false, error: err.message as string, review };
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
      if (!db) return { success: false, persisted: false, id, updates, error: "Database unavailable" };
      const r = await db.collection("reviews").updateOne({ id }, { $set: updates });
      console.log(`[DB] Updated review ${id} in MongoDB`);
      return { success: true, persisted: r.matchedCount > 0, id, updates };
    } catch (err: any) {
      console.warn("[DB] Error updating review in MongoDB:", err);
      return { success: false, persisted: false, id, updates, error: err.message as string };
    }
  });

// ── 3. Delete Review ──────────────────────────────────────────────────────
export const deleteReviewDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable" };
      await db.collection("reviews").deleteOne({ id: data.id });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message as string };
    }
  });
