import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { upsertCustomer } from "../customers.server";

export type QuoteStatus = "new" | "quoted" | "confirmed" | "declined";

export interface RentalQuoteDoc {
  id: string;
  customerName: string;
  companyName?: string | undefined;
  phone: string;
  email: string;
  equipmentRequested: string;
  rentalDuration: string;
  jobsiteLocation: string;
  operatorRequired: boolean;
  notes?: string | undefined;
  status: QuoteStatus;
  quotedAmount?: number | undefined;
  adminNotes?: string | undefined;
  createdAt: string;
  updatedAt?: string | undefined;
}

const SEED_QUOTES: RentalQuoteDoc[] = [];

// ── 1. Fetch Quotes from Database ─────────────────────────────────────────
export const getQuotesDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ status: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: true, quotes: SEED_QUOTES, source: "fallback" };
      }

      const quotesCol = db.collection<RentalQuoteDoc>("quotes");

      const query: Record<string, any> = {};
      if (data?.status && data.status !== "all") {
        query["status"] = data.status;
      }

      const raw = await quotesCol.find(query).sort({ createdAt: -1 }).toArray();
      const formatted: RentalQuoteDoc[] = raw.map((item) => {
        const { _id, ...rest } = item as any;
        return rest as RentalQuoteDoc;
      });

      return { success: true, quotes: formatted, source: "mongodb" };
    } catch (err: any) {
      console.error("[DB] Error fetching quotes:", err);
      return { success: false, error: err.message, quotes: SEED_QUOTES, source: "fallback" };
    }
  });

// ── 2. Create Quote Request (from Public or Dashboard) ────────────────────
export const createQuoteDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      customerName: z.string(),
      companyName: z.string().optional(),
      phone: z.string(),
      email: z.string(),
      equipmentRequested: z.string(),
      rentalDuration: z.string(),
      jobsiteLocation: z.string(),
      operatorRequired: z.boolean(),
      notes: z.string().optional(),
      quotedAmount: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const quoteId = `REQ-${datePrefix}-${randomSuffix}`;

    const newQuote: RentalQuoteDoc = {
      id: quoteId,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      equipmentRequested: data.equipmentRequested,
      rentalDuration: data.rentalDuration,
      jobsiteLocation: data.jobsiteLocation,
      operatorRequired: data.operatorRequired,
      status: "new",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      ...(data.companyName ? { companyName: data.companyName } : {}),
      ...(data.notes ? { notes: data.notes } : {}),
      ...(typeof data.quotedAmount === "number" ? { quotedAmount: data.quotedAmount } : {}),
    };

    try {
      const db = await connectDB();
      if (db) {
        await db.collection("quotes").insertOne(newQuote as any);

        // Add notification
        await db.collection("notifications").insertOne({
          id: `notif-${Date.now()}`,
          title: `New RFQ Quote #${quoteId}`,
          message: `${data.customerName} requested quote for ${data.equipmentRequested} (${data.rentalDuration}).`,
          type: "quote",
          link: "/dashboard/quotes",
          read: false,
          createdAt: now.toISOString(),
        });

        // Upsert customer (shared helper → consistent id/firstSeen/lastActive fields)
        await upsertCustomer(db, {
          kind: "quote",
          name: data.customerName,
          email: data.email,
          phone: data.phone,
          company: data.companyName,
          itemName: data.equipmentRequested,
        });

        console.log(`[DB] Created quote ${quoteId} in MongoDB`);
      }
    } catch (err: any) {
      console.warn("[DB] Error saving quote to MongoDB:", err);
    }

    return { success: true, quote: newQuote };
  });

// ── 3. Update Quote Status & Quoted Amount ────────────────────────────────
export const updateQuoteDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      quoteId: z.string(),
      status: z.enum(["new", "quoted", "confirmed", "declined"]),
      quotedAmount: z.number().optional(),
      adminNotes: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const now = new Date().toISOString();
    const updates: Record<string, any> = {
      status: data.status,
      updatedAt: now,
    };
    if (data.quotedAmount !== undefined) updates["quotedAmount"] = data.quotedAmount;
    if (data.adminNotes !== undefined) updates["adminNotes"] = data.adminNotes;

    try {
      const db = await connectDB();
      if (db) {
        await db.collection("quotes").updateOne(
          { id: data.quoteId },
          { $set: updates }
        );
        console.log(`[DB] Updated quote ${data.quoteId} in MongoDB`);
      }
    } catch (err: any) {
      console.warn("[DB] Error updating quote in MongoDB:", err);
    }

    return { success: true, quoteId: data.quoteId, updates };
  });

// ── 4. Delete Quote ──────────────────────────────────────────────────────
export const deleteQuoteDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ quoteId: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (db) {
        await db.collection("quotes").deleteOne({ id: data.quoteId });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
