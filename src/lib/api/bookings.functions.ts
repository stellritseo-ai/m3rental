import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { CLOUDINARY_PROOF_FOLDER, isDataUrl, uploadToCloudinary } from "../cloudinary.server";
import { upsertCustomer } from "../customers.server";

export type PaymentMethod = "zelle" | "cashapp" | "cash";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "verification_pending" | "approved" | "rejected";

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  notes?: string | undefined;
}

export interface BookingDoc {
  id: string; // e.g. M3-20261007-001
  vehicleSlug: string;
  vehicleName: string;
  vehicleImage: string;
  dailyRate: number;
  customer: CustomerInfo;
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  rentalDays: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentScreenshot: string; // Data URL or Image URL
  governmentId?: string | undefined; // Data URL or Image URL
  operationMode?: "self" | "operator" | undefined;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string; // ISO string
  reviewedAt?: string | undefined;
  adminNotes?: string | undefined;
}

const SEED_BOOKINGS: BookingDoc[] = [
  {
    id: "M3-20261007-001",
    vehicleSlug: "2008-honda-ridgeline-midsize-pickup",
    vehicleName: "2008 Honda Ridgeline Midsize Pickup Truck",
    vehicleImage: "/src/assets/eq-midsize-pickup.jpg",
    dailyRate: 50,
    customer: {
      fullName: "Marcus Vance",
      phone: "(832) 555-0199",
      email: "marcus.vance@vanceroofing.com",
      address: "1024 Westheimer Rd, Houston, TX 77006",
      notes: "Commercial ladder hauling and shingles transport across Inner Loop.",
    },
    pickupDate: "2026-10-08",
    returnDate: "2026-10-12",
    rentalDays: 4,
    totalAmount: 200,
    paymentMethod: "zelle",
    paymentScreenshot: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%237414CA'/><text x='50' y='55' fill='white' text-anchor='middle'>Zelle</text></svg>",
    bookingStatus: "pending",
    paymentStatus: "verification_pending",
    createdAt: "2026-10-07T14:20:00.000Z",
  },
  {
    id: "M3-20261006-089",
    vehicleSlug: "utility-cargo-trailer-14ft",
    vehicleName: "14ft Tandem Axle Utility Trailer",
    vehicleImage: "/src/assets/eq-cargo-trailer.jpg",
    dailyRate: 45,
    customer: {
      fullName: "Sarah Jenkins",
      phone: "(713) 555-0142",
      email: "sjenkins@cypresslandscaping.com",
      address: "14220 Spring Cypress Rd, Cypress, TX 77429",
      notes: "Mower transport for commercial HOA grounds maintenance.",
    },
    pickupDate: "2026-10-06",
    returnDate: "2026-10-09",
    rentalDays: 3,
    totalAmount: 135,
    paymentMethod: "cashapp",
    paymentScreenshot: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%2300D632'/><text x='50' y='55' fill='white' text-anchor='middle'>CashApp</text></svg>",
    bookingStatus: "confirmed",
    paymentStatus: "approved",
    createdAt: "2026-10-06T10:15:00.000Z",
    reviewedAt: "2026-10-06T11:00:00.000Z",
    adminNotes: "CashApp verified. Code texted to customer for yard gate.",
  },
  {
    id: "M3-20261005-044",
    vehicleSlug: "2008-honda-ridgeline-midsize-pickup",
    vehicleName: "2008 Honda Ridgeline Midsize Pickup Truck",
    vehicleImage: "/src/assets/eq-midsize-pickup.jpg",
    dailyRate: 50,
    customer: {
      fullName: "Carlos Mendoza",
      phone: "(281) 555-0192",
      email: "carlos.mendoza@houstonbuild.com",
      address: "8421 Bellaire Blvd, Houston, TX 77036",
      notes: "Jobsite material run across Southwest Houston.",
    },
    pickupDate: "2026-10-02",
    returnDate: "2026-10-05",
    rentalDays: 3,
    totalAmount: 150,
    paymentMethod: "zelle",
    paymentScreenshot: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%230040DD'/><text x='50' y='55' fill='white' text-anchor='middle'>Receipt</text></svg>",
    bookingStatus: "confirmed",
    paymentStatus: "approved",
    createdAt: "2026-10-02T08:30:00.000Z",
    reviewedAt: "2026-10-02T09:00:00.000Z",
    adminNotes: "Vehicle returned clean on time. Full deposit released.",
  },
];

// ── 1. Fetch All Bookings from Database ──────────────────────────────────
export const getBookingsDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ status: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: true, bookings: [], source: "fallback" };
      }

      const bookingsCol = db.collection<BookingDoc>("bookings");

      const query: Record<string, any> = {};
      if (data?.status && data.status !== "all") {
        query["bookingStatus"] = data.status;
      }

      const rawBookings = await bookingsCol.find(query).sort({ createdAt: -1 }).toArray();

      const formatted: BookingDoc[] = rawBookings.map((b) => {
        const { _id, ...rest } = b as any;
        return rest as BookingDoc;
      });

      return { success: true, bookings: formatted, source: "mongodb" };
    } catch (err: any) {
      console.error("[DB] Error fetching bookings:", err);
      return { success: false, error: err.message, bookings: [], source: "fallback" };
    }
  });

// ── 2. Create New Booking in Database ────────────────────────────────────
export const createBookingDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().regex(/^M3-\d{8}-\d{3}$/).optional(),
      vehicleSlug: z.string(),
      vehicleName: z.string(),
      vehicleImage: z.string(),
      dailyRate: z.number(),
      customer: z.object({
        fullName: z.string(),
        phone: z.string(),
        email: z.string(),
        address: z.string(),
        notes: z.string().optional(),
      }),
      pickupDate: z.string(),
      returnDate: z.string(),
      rentalDays: z.number(),
      totalAmount: z.number(),
      paymentMethod: z.enum(["zelle", "cashapp", "cash"]),
      paymentScreenshot: z.string(),
      governmentId: z.string().optional(),
      operationMode: z.enum(["self", "operator"]).optional(),
    })
  )
  .handler(async ({ data }) => {
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    // Keep the ID the customer already saw on the confirmation screen
    const bookingId = data.id || `M3-${datePrefix}-${randomSuffix}`;

    const db = await connectDB();
    if (!db) {
      return { success: false, persisted: false, error: "Database is not connected." };
    }

    try {
      const bookingsCol = db.collection<BookingDoc>("bookings");

      // Idempotent: retrying the same booking never creates a duplicate
      const already = await bookingsCol.findOne({ id: bookingId });
      if (already) {
        const { _id, ...rest } = already as any;
        return { success: true, persisted: true, booking: rest as BookingDoc };
      }

      // Server-side double-booking protection (the browser check can be stale)
      const conflict = await bookingsCol.findOne({
        vehicleSlug: data.vehicleSlug,
        bookingStatus: { $ne: "cancelled" },
        pickupDate: { $lte: data.returnDate },
        returnDate: { $gte: data.pickupDate },
      });
      if (conflict) {
        return {
          success: false,
          persisted: false,
          conflict: true,
          error: `These dates overlap an existing reservation (${conflict.pickupDate} to ${conflict.returnDate}).`,
        };
      }

      // Authoritative pricing: use the rate stored in the database, not the browser value
      const eq = await db.collection("equipment").findOne({ slug: data.vehicleSlug }, { projection: { dayRate: 1 } });
      const dailyRate = typeof eq?.["dayRate"] === "number" ? (eq["dayRate"] as number) : data.dailyRate;
      const ms = new Date(data.returnDate).getTime() - new Date(data.pickupDate).getTime();
      const rentalDays = Math.max(1, Math.round(ms / 86_400_000) || 1);
      const totalAmount = rentalDays * dailyRate;

      // Payment proof screenshot → Cloudinary (MongoDB stores only the URL)
      let paymentScreenshot = data.paymentScreenshot;
      if (isDataUrl(paymentScreenshot)) {
        try {
          paymentScreenshot = (await uploadToCloudinary(paymentScreenshot, CLOUDINARY_PROOF_FOLDER)).url;
        } catch (err) {
          console.warn("[CLOUDINARY] Payment proof upload failed, keeping inline image:", err);
        }
      }

      // Government ID → Cloudinary
      let governmentId = data.governmentId;
      if (governmentId && isDataUrl(governmentId)) {
        try {
          governmentId = (await uploadToCloudinary(governmentId, CLOUDINARY_PROOF_FOLDER)).url;
        } catch (err) {
          console.warn("[CLOUDINARY] Government ID upload failed, keeping inline image:", err);
        }
      }

      const newBooking: BookingDoc = {
        id: bookingId,
        vehicleSlug: data.vehicleSlug,
        vehicleName: data.vehicleName,
        vehicleImage: data.vehicleImage,
        dailyRate,
        customer: {
          fullName: data.customer.fullName,
          phone: data.customer.phone,
          email: data.customer.email,
          address: data.customer.address,
          ...(data.customer.notes ? { notes: data.customer.notes } : {}),
        },
        pickupDate: data.pickupDate,
        returnDate: data.returnDate,
        rentalDays,
        totalAmount,
        paymentMethod: data.paymentMethod,
        paymentScreenshot,
        governmentId: governmentId || undefined,
        operationMode: data.operationMode || "self",
        bookingStatus: "pending",
        paymentStatus: "verification_pending",
        createdAt: now.toISOString(),
      };

      await bookingsCol.insertOne(newBooking);

      await db.collection("notifications").insertOne({
        id: `notif-${Date.now()}-${randomSuffix}`,
        title: `New Rental Booking #${bookingId}`,
        message: `${data.customer.fullName} reserved ${data.vehicleName} for ${rentalDays} days ($${totalAmount}) [${data.operationMode === "operator" ? "With Operator" : "Self-Operated"}]. Payment verification needed.`,
        type: "booking",
        link: "/dashboard/bookings",
        read: false,
        createdAt: now.toISOString(),
      });

      await upsertCustomer(db, {
        kind: "booking",
        name: data.customer.fullName,
        email: data.customer.email,
        phone: data.customer.phone,
        address: data.customer.address,
        bookingId,
        itemName: data.vehicleName,
        amount: totalAmount,
      });

      console.log(`[DB] Created booking ${bookingId} in MongoDB`);
      return { success: true, persisted: true, booking: newBooking };
    } catch (err: any) {
      console.error("[DB] Could not persist booking to MongoDB:", err);
      return { success: false, persisted: false, error: err.message as string };
    }
  });

// ── 3. Update Booking Payment & Status ───────────────────────────────────
export const updateBookingStatusDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      bookingId: z.string(),
      action: z.enum(["approve", "reject", "cancel", "notes"]),
      adminNotes: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const now = new Date().toISOString();
    let updates: Partial<BookingDoc> = {};

    if (data.action === "approve") {
      updates = {
        bookingStatus: "confirmed",
        paymentStatus: "approved",
        reviewedAt: now,
        ...(data.adminNotes ? { adminNotes: data.adminNotes } : {}),
      };
    } else if (data.action === "reject") {
      updates = {
        bookingStatus: "cancelled",
        paymentStatus: "rejected",
        reviewedAt: now,
        ...(data.adminNotes ? { adminNotes: data.adminNotes } : {}),
      };
    } else if (data.action === "cancel") {
      updates = {
        bookingStatus: "cancelled",
        reviewedAt: now,
        ...(data.adminNotes ? { adminNotes: data.adminNotes } : {}),
      };
    } else if (data.action === "notes") {
      if (data.adminNotes) updates.adminNotes = data.adminNotes;
    }

    try {
      const db = await connectDB();
      if (db) {
        const cleanId = data.bookingId.replace(/^#/, "");
        const bookingsCol = db.collection<BookingDoc>("bookings");
        const result = await bookingsCol.findOneAndUpdate(
          {
            $or: [
              { id: data.bookingId },
              { id: cleanId },
              { id: `#${cleanId}` },
            ],
          },
          { $set: updates },
          { returnDocument: "after" }
        );

        // Record audit
        await db.collection("admin_audit_logs").insertOne({
          event: `BOOKING_${data.action.toUpperCase()}`,
          bookingId: data.bookingId,
          timestamp: new Date(),
          notes: data.adminNotes,
        });

        const updatedDoc = result ? ((result as any).value || result) : null;
        return { success: true, booking: updatedDoc };
      }
    } catch (err: any) {
      console.warn("[DB] Error updating booking status in MongoDB:", err);
    }

    return { success: true, updates };
  });

// ── 4. Delete Booking ────────────────────────────────────────────────────
export const deleteBookingDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ bookingId: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (db) {
        const cleanId = data.bookingId.replace(/^#/, "");
        const bookingsCol = db.collection("bookings");
        const deleteResult = await bookingsCol.deleteMany({
          $or: [
            { id: data.bookingId },
            { id: cleanId },
            { id: `#${cleanId}` },
          ],
        });

        // Record audit
        await db.collection("admin_audit_logs").insertOne({
          event: "BOOKING_DELETED",
          bookingId: data.bookingId,
          timestamp: new Date(),
          deletedCount: deleteResult.deletedCount,
        });

        console.log(`[DB] Deleted booking ${data.bookingId} from MongoDB, count: ${deleteResult.deletedCount}`);
      }
      return { success: true };
    } catch (err: any) {
      console.error("[DB] Error deleting booking from MongoDB:", err);
      return { success: false, error: err.message };
    }
  });

// ── 5. Purge All Bookings (Admin clear all test data) ────────────────────
export const purgeAllBookingsDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (db) {
        const bookingsCol = db.collection("bookings");
        const res = await bookingsCol.deleteMany({});
        console.log(`[DB] Purged all bookings from MongoDB, count: ${res.deletedCount}`);
      }
      return { success: true };
    } catch (err: any) {
      console.error("[DB] Error purging all bookings:", err);
      return { success: false, error: err.message };
    }
  });
