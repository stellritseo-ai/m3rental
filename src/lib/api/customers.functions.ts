import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

export interface CustomerDoc {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address?: string;
  driversLicense?: string;
  totalBookings: number;
  totalQuotes: number;
  totalSpent: number;
  firstSeen: string;
  lastActive: string;
  bookingIds: string[];
  vehicleHistory: string[];
  status: "verified" | "active" | "inquiry_only";
  notes?: string;
}

const SEED_CUSTOMERS: CustomerDoc[] = [
  {
    id: "cust-1",
    name: "Carlos Mendoza",
    company: "Mendoza General Contracting",
    email: "carlos.mendoza@houstonbuild.com",
    phone: "(281) 555-0192",
    address: "8421 Bellaire Blvd, Houston, TX 77036",
    driversLicense: "TX-DL-9823101",
    totalBookings: 3,
    totalQuotes: 1,
    totalSpent: 450,
    firstSeen: "2026-08-14T09:00:00.000Z",
    lastActive: "2026-10-05T09:00:00.000Z",
    bookingIds: ["M3-20261005-044", "M3-20260912-019"],
    vehicleHistory: ["2008 Honda Ridgeline Midsize Pickup Truck"],
    status: "verified",
    notes: "Top contractor client in Southwest Houston. Clean returns, fast Zelle payments.",
  },
  {
    id: "cust-2",
    name: "Marcus Vance",
    company: "Vance Roofing & Exteriors",
    email: "marcus.vance@vanceroofing.com",
    phone: "(832) 555-0199",
    address: "1024 Westheimer Rd, Houston, TX 77006",
    driversLicense: "TX-DL-4481920",
    totalBookings: 1,
    totalQuotes: 2,
    totalSpent: 200,
    firstSeen: "2026-09-20T11:00:00.000Z",
    lastActive: "2026-10-07T14:20:00.000Z",
    bookingIds: ["M3-20261007-001"],
    vehicleHistory: ["2008 Honda Ridgeline Midsize Pickup Truck"],
    status: "active",
    notes: "Has pending payment verification for current rental.",
  },
  {
    id: "cust-3",
    name: "Sarah Jenkins",
    company: "Cypress HOA Grounds Maintenance",
    email: "sjenkins@cypresslandscaping.com",
    phone: "(713) 555-0142",
    address: "14220 Spring Cypress Rd, Cypress, TX 77429",
    driversLicense: "TX-DL-7719283",
    totalBookings: 2,
    totalQuotes: 0,
    totalSpent: 315,
    firstSeen: "2026-09-01T08:00:00.000Z",
    lastActive: "2026-10-06T10:15:00.000Z",
    bookingIds: ["M3-20261006-089"],
    vehicleHistory: ["14ft Tandem Axle Utility Trailer"],
    status: "verified",
    notes: "Rents utility trailers for Cypress commercial properties.",
  },
  {
    id: "cust-4",
    name: "David Gutierrez",
    company: "Lone Star Excavation LLC",
    email: "david@lonestarexcavation.com",
    phone: "(713) 555-0143",
    address: "Sugar Land, TX (US-59 corridor)",
    totalBookings: 0,
    totalQuotes: 1,
    totalSpent: 0,
    firstSeen: "2026-10-07T08:15:00.000Z",
    lastActive: "2026-10-07T08:15:00.000Z",
    bookingIds: [],
    vehicleHistory: ["Tractor / Backhoe Loader"],
    status: "inquiry_only",
    notes: "Requested quote for 2-week backhoe commercial trenching project.",
  },
];

// ── 1. Fetch Customers from Database ──────────────────────────────────────
export const getCustomersDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ search: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: true, customers: [], source: "fallback" };
      }

      const col = db.collection<CustomerDoc>("customers");

      let query: Record<string, any> = {};
      if (data?.search && data.search.trim()) {
        const q = data.search.trim();
        query = {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { phone: { $regex: q, $options: "i" } },
            { company: { $regex: q, $options: "i" } },
          ],
        };
      }

      const raw = await col.find(query).sort({ lastActive: -1 }).toArray();
      const formatted: CustomerDoc[] = raw.map((item) => {
        const { _id, ...rest } = item as any;
        return rest as CustomerDoc;
      });

      return { success: true, customers: formatted, source: "mongodb" };
    } catch (err: any) {
      console.error("[DB] Error fetching customers:", err);
      return { success: false, error: err.message, customers: [], source: "fallback" };
    }
  });

// ── 2. Update Customer Notes & Status ────────────────────────────────────
export const updateCustomerDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(["verified", "active", "inquiry_only"]).optional(),
      notes: z.string().optional(),
      company: z.string().optional(),
      phone: z.string().optional(),
      driversLicense: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { id, ...updates } = data;
    try {
      const db = await connectDB();
      if (db) {
        await db.collection("customers").updateOne(
          { id },
          { $set: updates }
        );
        console.log(`[DB] Updated customer ${id} in MongoDB`);
      }
    } catch (err: any) {
      console.warn("[DB] Error updating customer in MongoDB:", err);
    }
    return { success: true, id, updates };
  });

// ── 3. Delete Customer from Database ─────────────────────────────────────
export const deleteCustomerDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      email: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (db) {
        const col = db.collection("customers");
        const orConditions: any[] = [{ id: data.id }];
        if (data.email) {
          orConditions.push({ email: data.email });
          orConditions.push({ email: data.email.toLowerCase().trim() });
        }

        const deleteResult = await col.deleteOne({ $or: orConditions });

        // Record audit log
        await db.collection("admin_audit_logs").insertOne({
          event: "CUSTOMER_DELETED",
          customerId: data.id,
          email: data.email,
          timestamp: new Date(),
          deletedCount: deleteResult.deletedCount,
        });

        console.log(`[DB] Deleted customer ${data.id} (${data.email}) from MongoDB, count: ${deleteResult.deletedCount}`);
      }
      return { success: true };
    } catch (err: any) {
      console.error("[DB] Error deleting customer from MongoDB:", err);
      return { success: false, error: err.message };
    }
  });

