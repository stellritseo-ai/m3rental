import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

export interface DispatchMessageDoc {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  company?: string | undefined;
  subject: string;
  preview: string;
  thread: {
    sender: "client" | "dispatch";
    text: string;
    timestamp: string;
  }[];
  date: string;
  unread: boolean;
  starred: boolean;
  tag: "General Inquire" | "Fleet Booking" | "Jobsite Delivery" | "Commercial Bid";
}
const SEED_MESSAGES: DispatchMessageDoc[] = [];

// ── 1. Fetch Messages from Database ───────────────────────────────────────
export const getMessagesDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ filter: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: true, messages: [], source: "fallback" };
      }

      const col = db.collection<DispatchMessageDoc>("messages");

      // Auto-purge any legacy dummy seed IDs from the collection
      await col.deleteMany({
        id: { $in: ["msg-1", "msg-2", "msg-3", "msg-101", "msg-102", "msg-103"] },
      }).catch(() => {});

      const query: Record<string, any> = {
        id: { $nin: ["msg-1", "msg-2", "msg-3", "msg-101", "msg-102", "msg-103"] },
      };
      if (data?.filter === "unread") query["unread"] = true;
      if (data?.filter === "starred") query["starred"] = true;

      const raw = await col.find(query).sort({ date: -1 }).toArray();
      const formatted: DispatchMessageDoc[] = raw.map((item) => {
        const { _id, ...rest } = item as any;
        return rest as DispatchMessageDoc;
      });

      return { success: true, messages: formatted, source: "mongodb" };
    } catch (err: any) {
      console.error("[DB] Error fetching messages:", err);
      return { success: false, error: err.message, messages: [], source: "fallback" };
    }
  });

// ── 2. Update Message (Read, Star, Reply) ─────────────────────────────────
export const updateMessageDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      unread: z.boolean().optional(),
      starred: z.boolean().optional(),
      replyText: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const now = new Date().toISOString();
    const updates: Record<string, any> = {};

    if (data.unread !== undefined) updates["unread"] = data.unread;
    if (data.starred !== undefined) updates["starred"] = data.starred;

    try {
      const db = await connectDB();
      if (db) {
        const col = db.collection<DispatchMessageDoc>("messages");
        if (data.replyText) {
          await col.updateOne(
            { id: data.id },
            {
              $set: { ...updates, date: now },
              $push: {
                thread: {
                  sender: "dispatch",
                  text: data.replyText,
                  timestamp: now,
                },
              } as any,
            }
          );
        } else {
          await col.updateOne({ id: data.id }, { $set: updates });
        }
        console.log(`[DB] Updated message ${data.id} in MongoDB`);
      }
    } catch (err: any) {
      console.warn("[DB] Error updating message in MongoDB:", err);
    }

    return { success: true, id: data.id, updates };
  });

// ── 3. Create Inbound Message (Contact Form) ─────────────────────────────
export const createMessageDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      senderName: z.string(),
      senderEmail: z.string(),
      senderPhone: z.string(),
      company: z.string().optional(),
      subject: z.string(),
      message: z.string(),
      tag: z.enum(["General Inquire", "Fleet Booking", "Jobsite Delivery", "Commercial Bid"]).optional(),
    })
  )
  .handler(async ({ data }) => {
    const now = new Date().toISOString();
    const id = `msg-${Date.now()}`;
    const newMsg: DispatchMessageDoc = {
      id,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      senderPhone: data.senderPhone,
      subject: data.subject,
      preview: data.message.slice(0, 100) + (data.message.length > 100 ? "..." : ""),
      thread: [
        {
          sender: "client",
          text: data.message,
          timestamp: now,
        },
      ],
      date: now,
      unread: true,
      starred: false,
      tag: data.tag || "General Inquire",
      ...(data.company ? { company: data.company } : {}),
    };

    try {
      const db = await connectDB();
      if (db) {
        await db.collection("messages").insertOne(newMsg as any);
        await db.collection("notifications").insertOne({
          id: `notif-${Date.now()}`,
          title: `New Message from ${data.senderName}`,
          message: `${data.subject}: ${newMsg.preview}`,
          type: "system",
          link: "/dashboard/inbox",
          read: false,
          createdAt: now,
        });
        console.log(`[DB] Created message ${id} in MongoDB`);
      }
    } catch (err: any) {
      console.warn("[DB] Error creating message in MongoDB:", err);
    }

    return { success: true, message: newMsg };
  });

// ── 4. Delete Message ────────────────────────────────────────────────────
export const deleteMessageDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (db) {
        await db.collection("messages").deleteOne({ id: data.id });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

// ── 5. Purge All Messages (Admin clear all test messages) ───────────────
export const purgeAllMessagesDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (db) {
        const res = await db.collection("messages").deleteMany({});
        console.log(`[DB] Purged all messages from MongoDB, count: ${res.deletedCount}`);
      }
      return { success: true };
    } catch (err: any) {
      console.error("[DB] Error purging all messages:", err);
      return { success: false, error: err.message };
    }
  });
