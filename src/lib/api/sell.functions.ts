import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { verifyAdminSession } from "./auth.functions";
import {
  CLOUDINARY_SELL_FOLDER,
  deleteFromCloudinary,
  isCloudinaryUrl,
  isDataUrl,
  uploadToCloudinary,
} from "../cloudinary.server";
import {
  CONTACT_METHODS,
  MAX_SELL_IMAGES,
  SELL_CONDITIONS,
  SELL_STATUSES,
  type SellListingDoc,
} from "../sell-shared";

export type { SellListingDoc } from "../sell-shared";

const COLLECTION = "sell_listings";

async function isAdmin(token: string | undefined): Promise<boolean> {
  try {
    const res = await verifyAdminSession({ data: { token } });
    return Boolean(res?.valid);
  } catch {
    return false;
  }
}

const optionalText = (max: number) => z.string().trim().max(max).optional();

// ── 1. Public: submit equipment for sale ─────────────────────────────────
export const createSellListingDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      title: z.string().trim().min(3).max(140),
      category: z.string().trim().min(1).max(60),
      make: optionalText(60),
      model: optionalText(60),
      year: optionalText(10),
      condition: z.enum(SELL_CONDITIONS),
      usage: optionalText(60),
      serialNumber: optionalText(60),
      location: z.string().trim().min(2).max(120),
      description: z.string().trim().min(20).max(4000),
      askingPrice: z.number().positive().max(100_000_000),
      negotiable: z.boolean(),
      images: z.array(z.string()).min(1).max(MAX_SELL_IMAGES),
      seller: z.object({
        name: z.string().trim().min(2).max(100),
        phone: z.string().trim().min(7).max(30),
        email: z.string().trim().email().max(160),
        company: optionalText(120),
        preferredContact: z.enum(CONTACT_METHODS),
        bestTime: optionalText(60),
      }),
      // Honeypot — real visitors never fill this hidden field.
      website: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    if (data.website) {
      // Silently accept bots without storing anything.
      return { success: true as const, id: "SELL-RECEIVED" };
    }

    if (!data.images.every(isDataUrl)) {
      return { success: false as const, error: "Photos must be JPG, PNG or WEBP images." };
    }

    const db = await connectDB();
    if (!db) {
      return {
        success: false as const,
        error: "Our system is temporarily unavailable. Please call us or try again shortly.",
      };
    }

    // Upload every photo to Cloudinary first — only permanent URLs are stored in MongoDB.
    let imageUrls: string[];
    try {
      const uploads = await Promise.all(
        data.images.map((img) => uploadToCloudinary(img, CLOUDINARY_SELL_FOLDER))
      );
      imageUrls = uploads.map((u) => u.url);
    } catch (err: any) {
      console.error("[SELL] Photo upload failed:", err);
      return {
        success: false as const,
        error: "We couldn't upload your photos. Please try smaller images or fewer photos.",
      };
    }

    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, "");
    const id = `SELL-${datePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const listing: SellListingDoc = {
      id,
      title: data.title,
      category: data.category,
      condition: data.condition,
      location: data.location,
      description: data.description,
      askingPrice: Math.round(data.askingPrice * 100) / 100,
      negotiable: data.negotiable,
      images: imageUrls,
      seller: {
        name: data.seller.name,
        phone: data.seller.phone,
        email: data.seller.email.toLowerCase(),
        preferredContact: data.seller.preferredContact,
        ...(data.seller.company ? { company: data.seller.company } : {}),
        ...(data.seller.bestTime ? { bestTime: data.seller.bestTime } : {}),
      },
      status: "new",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      ...(data.make ? { make: data.make } : {}),
      ...(data.model ? { model: data.model } : {}),
      ...(data.year ? { year: data.year } : {}),
      ...(data.usage ? { usage: data.usage } : {}),
      ...(data.serialNumber ? { serialNumber: data.serialNumber } : {}),
    };

    try {
      await db.collection(COLLECTION).insertOne({ ...listing });
      await db.collection("notifications").insertOne({
        id: `notif-${Date.now()}`,
        title: `New Sell Offer #${id}`,
        message: `${listing.seller.name} wants to sell "${listing.title}" for $${listing.askingPrice.toLocaleString()}.`,
        type: "system",
        link: "/dashboard/sell-requests",
        read: false,
        createdAt: now.toISOString(),
      });
      console.log(`[SELL] Stored listing ${id} with ${imageUrls.length} photos`);
    } catch (err: any) {
      console.error("[SELL] Failed to store listing:", err);
      await Promise.all(imageUrls.map((u) => deleteFromCloudinary(u)));
      return { success: false as const, error: "We couldn't save your listing. Please try again." };
    }

    return { success: true as const, id };
  });

// ── 2. Admin: list submissions ───────────────────────────────────────────
export const getSellListingsDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().optional() }))
  .handler(async ({ data }) => {
    if (!(await isAdmin(data.token))) {
      return { success: false as const, error: "Unauthorized", listings: [] as SellListingDoc[] };
    }
    try {
      const db = await connectDB();
      if (!db) {
        return { success: false as const, error: "Database unavailable", listings: [] as SellListingDoc[] };
      }
      const raw = await db.collection(COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
      const listings = raw.map(({ _id, ...rest }) => rest as unknown as SellListingDoc);
      return { success: true as const, listings };
    } catch (err: any) {
      console.error("[SELL] Error fetching listings:", err);
      return { success: false as const, error: err.message as string, listings: [] as SellListingDoc[] };
    }
  });

// ── 3. Admin: update status / offer / notes ──────────────────────────────
export const updateSellListingDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().optional(),
      id: z.string(),
      status: z.enum(SELL_STATUSES).optional(),
      offerAmount: z.number().nonnegative().nullable().optional(),
      adminNotes: z.string().max(4000).optional(),
    })
  )
  .handler(async ({ data }) => {
    if (!(await isAdmin(data.token))) return { success: false as const, error: "Unauthorized" };

    const $set: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    const $unset: Record<string, ""> = {};
    if (data.status) $set["status"] = data.status;
    if (data.adminNotes !== undefined) $set["adminNotes"] = data.adminNotes;
    if (data.offerAmount === null) $unset["offerAmount"] = "";
    else if (typeof data.offerAmount === "number") $set["offerAmount"] = data.offerAmount;

    try {
      const db = await connectDB();
      if (!db) return { success: false as const, error: "Database unavailable" };
      const res = await db
        .collection(COLLECTION)
        .updateOne({ id: data.id }, Object.keys($unset).length ? { $set, $unset } : { $set });
      if (res.matchedCount === 0) return { success: false as const, error: "Listing not found" };
      return { success: true as const };
    } catch (err: any) {
      return { success: false as const, error: err.message as string };
    }
  });

// ── 4. Admin: delete submission (and its Cloudinary photos) ──────────────
export const deleteSellListingDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().optional(), id: z.string() }))
  .handler(async ({ data }) => {
    if (!(await isAdmin(data.token))) return { success: false as const, error: "Unauthorized" };
    try {
      const db = await connectDB();
      if (!db) return { success: false as const, error: "Database unavailable" };
      const doc = await db.collection(COLLECTION).findOneAndDelete({ id: data.id });
      const images: unknown[] = (doc as any)?.images ?? [];
      await Promise.all(images.filter(isCloudinaryUrl).map((u) => deleteFromCloudinary(u)));
      return { success: true as const };
    } catch (err: any) {
      return { success: false as const, error: err.message as string };
    }
  });
