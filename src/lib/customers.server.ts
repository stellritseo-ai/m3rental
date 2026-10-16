import type { Db } from "mongodb";

type UpsertInput = {
  kind: "booking" | "quote";
  name: string;
  email: string;
  phone: string;
  company?: string | undefined;
  address?: string | undefined;
  bookingId?: string | undefined;
  itemName?: string | undefined; // vehicle booked or equipment requested
  amount?: number | undefined;
};

/**
 * Creates or updates a customer ("user") record using the exact shape the dashboard Customers page reads:
 * id, name, company, email, phone, address, totalBookings, totalQuotes, totalSpent,
 * firstSeen, lastActive, bookingIds, vehicleHistory, status.
 */
export async function upsertCustomer(db: Db, input: UpsertInput): Promise<void> {
  const email = input.email.toLowerCase().trim();
  if (!email) return;
  const now = new Date().toISOString();
  const customers = db.collection("customers");

  const update: Record<string, any> = {
    $set: {
      name: input.name,
      phone: input.phone,
      lastActive: now,
      ...(input.company ? { company: input.company } : {}),
      ...(input.address ? { address: input.address } : {}),
    },
    $setOnInsert: {
      id: `cust-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      email,
      firstSeen: now,
      status: input.kind === "booking" ? "active" : "inquiry_only",
      notes: "",
    },
    $inc: {
      totalBookings: input.kind === "booking" ? 1 : 0,
      totalQuotes: input.kind === "quote" ? 1 : 0,
      totalSpent: input.kind === "booking" ? input.amount || 0 : 0,
    },
  };

  const addToSet: Record<string, string> = {};
  if (input.bookingId) addToSet["bookingIds"] = input.bookingId;
  if (input.itemName) addToSet["vehicleHistory"] = input.itemName;
  if (Object.keys(addToSet).length > 0) update["$addToSet"] = addToSet;

  await customers.updateOne({ email }, update, { upsert: true });

  // A quote-only contact becomes an active customer as soon as they book
  if (input.kind === "booking") {
    await customers.updateOne({ email, status: "inquiry_only" }, { $set: { status: "active" } });
  }
}
