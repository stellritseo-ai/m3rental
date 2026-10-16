import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

export interface DashboardNotificationDoc {
  id: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "quote" | "system";
  link?: string;
  read: boolean;
  createdAt: string;
}

const SEED_NOTIFS: DashboardNotificationDoc[] = [];

// ── 1. Fetch Notifications from Database ──────────────────────────────────
export const getNotificationsDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: true, notifications: SEED_NOTIFS, source: "fallback" };
      }

      const col = db.collection<DashboardNotificationDoc>("notifications");

      const raw = await col.find({}).sort({ createdAt: -1 }).limit(50).toArray();
      const formatted: DashboardNotificationDoc[] = raw.map((item) => {
        const { _id, ...rest } = item as any;
        return rest as DashboardNotificationDoc;
      });

      return { success: true, notifications: formatted, source: "mongodb" };
    } catch (err: any) {
      console.error("[DB] Error fetching notifications:", err);
      return { success: false, error: err.message, notifications: SEED_NOTIFS, source: "fallback" };
    }
  });

// ── 2. Mark Notification as Read ──────────────────────────────────────────
export const markNotificationReadDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (db) {
        await db.collection("notifications").updateOne(
          { id: data.id },
          { $set: { read: true } }
        );
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

// ── 3. Mark All Notifications as Read ────────────────────────────────────
export const markAllNotificationsReadDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (db) {
        await db.collection("notifications").updateMany(
          {},
          { $set: { read: true } }
        );
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
