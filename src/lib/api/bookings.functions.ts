import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

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
    })
  )
  .handler(async ({ data }) => {
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const bookingId = `M3-${datePrefix}-${randomSuffix}`;

    const newBooking: BookingDoc = {
      id: bookingId,
      vehicleSlug: data.vehicleSlug,
      vehicleName: data.vehicleName,
      vehicleImage: data.vehicleImage,
      dailyRate: data.dailyRate,
      customer: {
        fullName: data.customer.fullName,
        phone: data.customer.phone,
        email: data.customer.email,
        address: data.customer.address,
        ...(data.customer.notes ? { notes: data.customer.notes } : {}),
      },
      pickupDate: data.pickupDate,
      returnDate: data.returnDate,
      rentalDays: data.rentalDays,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      paymentScreenshot: data.paymentScreenshot,
      bookingStatus: "pending",
      paymentStatus: "verification_pending",
      createdAt: now.toISOString(),
    };

    try {
      const db = await connectDB();
      if (db) {
        const bookingsCol = db.collection<BookingDoc>("bookings");
        await bookingsCol.insertOne(newBooking);

        // Also create notification
        await db.collection("notifications").insertOne({
          id: `notif-${Date.now()}`,
          title: `New Rental Booking #${bookingId}`,
          message: `${data.customer.fullName} reserved ${data.vehicleName} for ${data.rentalDays} days ($${data.totalAmount}). Payment verification needed.`,
          type: "booking",
          link: "/dashboard/bookings",
          read: false,
          createdAt: now.toISOString(),
        });

        // Upsert customer in customers collection
        await db.collection("customers").updateOne(
          { email: data.customer.email.toLowerCase().trim() },
          {
            $set: {
              name: data.customer.fullName,
              phone: data.customer.phone,
              email: data.customer.email.toLowerCase().trim(),
              address: data.customer.address,
              lastRentalAt: now.toISOString(),
              status: "active",
            },
            $inc: { totalBookings: 1, totalSpent: data.totalAmount },
            $push: {
              bookingIds: bookingId,
              vehicleHistory: data.vehicleName,
            } as any,
            $setOnInsert: {
              createdAt: now.toISOString(),
              verified: false,
            },
          },
          { upsert: true }
        );

        console.log(`[DB] Created booking ${bookingId} in MongoDB`);
      }
    } catch (err: any) {
      console.warn("[DB] Could not persist booking directly to MongoDB:", err);
    }

    return { success: true, booking: newBooking };
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
