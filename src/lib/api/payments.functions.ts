import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

export interface PaymentSettingsDoc {
  id: string; // "default"
  zelle: {
    accountName: string;
    accountEmailOrPhone: string;
    qrCodeUrl: string;
    instructions: string;
  };
  cashapp: {
    cashtag: string;
    accountName: string;
    qrCodeUrl: string;
    instructions: string;
  };
  updatedAt: string;
}

const DEFAULT_PAYMENT_SETTINGS: PaymentSettingsDoc = {
  id: "default",
  zelle: {
    accountName: "M3 Rental LLC",
    accountEmailOrPhone: "m3.wvalverse@gmail.com",
    qrCodeUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' fill='%237414CA'/><text x='60' y='65' fill='white' text-anchor='middle'>Zelle</text></svg>",
    instructions:
      "Open your banking app, navigate to Zelle, scan this QR code or send to m3.wvalverse@gmail.com. Include your Full Name and Vehicle in the memo.",
  },
  cashapp: {
    cashtag: "$M3RentalHouston",
    accountName: "M3 Rental Houston",
    qrCodeUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' fill='%2300D632'/><text x='60' y='65' fill='white' text-anchor='middle'>CashApp</text></svg>",
    instructions:
      "Open Cash App, scan this QR code or send to $M3RentalHouston. Ensure the amount matches your exact booking total.",
  },
  updatedAt: new Date().toISOString(),
};

// ── 1. Fetch Payment Settings from Database ──────────────────────────────
export const getPaymentSettingsDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: true, settings: DEFAULT_PAYMENT_SETTINGS, source: "fallback" };
      }

      const col = db.collection<PaymentSettingsDoc>("payment_settings");
      let doc = await col.findOne({ id: "default" });

      if (!doc) {
        await col.insertOne(DEFAULT_PAYMENT_SETTINGS);
        console.log("[DB] Initialized payment settings in MongoDB");
      }

      const effectiveDoc = (await col.findOne({ id: "default" })) || DEFAULT_PAYMENT_SETTINGS;
      const { _id, ...rest } = effectiveDoc as any;
      return { success: true, settings: rest as PaymentSettingsDoc, source: "mongodb" };
    } catch (err: any) {
      console.error("[DB] Error fetching payment settings:", err);
      return { success: false, error: err.message, settings: DEFAULT_PAYMENT_SETTINGS, source: "fallback" };
    }
  });

// ── 2. Update Payment Settings in Database ────────────────────────────────
export const updatePaymentSettingsDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      zelle: z.object({
        accountName: z.string(),
        accountEmailOrPhone: z.string(),
        qrCodeUrl: z.string(),
        instructions: z.string(),
      }),
      cashapp: z.object({
        cashtag: z.string(),
        accountName: z.string(),
        qrCodeUrl: z.string(),
        instructions: z.string(),
      }),
    })
  )
  .handler(async ({ data }) => {
    const updatedAt = new Date().toISOString();
    const payload: PaymentSettingsDoc = {
      id: "default",
      zelle: data.zelle,
      cashapp: data.cashapp,
      updatedAt,
    };

    try {
      const db = await connectDB();
      if (db) {
        await db.collection("payment_settings").updateOne(
          { id: "default" },
          { $set: payload },
          { upsert: true }
        );
        console.log("[DB] Updated payment settings in MongoDB");
      }
    } catch (err: any) {
      console.warn("[DB] Error updating payment settings in MongoDB:", err);
    }

    return { success: true, settings: payload };
  });
