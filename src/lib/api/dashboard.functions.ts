import { createServerFn } from "@tanstack/react-start";
import { connectDB } from "../db";
import { categories } from "@/data/equipment";
import { BookingDoc } from "./bookings.functions";
import { RentalQuoteDoc } from "./quotes.functions";
import { ManagedEquipmentDoc } from "./equipment.functions";

export interface DashboardMetricsDoc {
  totalRevenue: number;
  activeRentalsCount: number;
  pendingVerificationsCount: number;
  openQuotesCount: number;
  totalFleetCount: number;
  recentBookings: BookingDoc[];
  recentQuotes: RentalQuoteDoc[];
  categoryDistribution: Array<{ name: string; count: number; fill: string }>;
  trendData7D: Array<{ label: string; revenue: number; bookings: number; contractors: number }>;
  trendData30D: Array<{ label: string; revenue: number; bookings: number; contractors: number }>;
  dbStatus: {
    connected: boolean;
    cluster: string;
    database: string;
  };
}

const CLUSTER = "m3rental.1hwn1am.mongodb.net";
const DATABASE = "m3_rental";
const CATEGORY_COLORS = [
  "#0040DD", "#16A34A", "#F59E0B", "#7414CA", "#0284C7",
  "#DC2626", "#0891B2", "#CA8A04", "#9333EA", "#475569",
  "#EA580C", "#059669", "#DB2777", "#4F46E5", "#65A30D",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type TrendPoint = { label: string; revenue: number; bookings: number; contractors: number };

/** Honest empty state (all zeros) shown only when the database cannot be reached — never fake numbers. */
function emptyMetrics(connected: boolean): DashboardMetricsDoc {
  return {
    totalRevenue: 0,
    activeRentalsCount: 0,
    pendingVerificationsCount: 0,
    openQuotesCount: 0,
    totalFleetCount: 0,
    recentBookings: [],
    recentQuotes: [],
    categoryDistribution: [],
    trendData7D: DAY_LABELS.map((label) => ({ label, revenue: 0, bookings: 0, contractors: 0 })),
    trendData30D: [1, 2, 3, 4].map((w) => ({ label: `Week ${w}`, revenue: 0, bookings: 0, contractors: 0 })),
    dbStatus: { connected, cluster: CLUSTER, database: DATABASE },
  };
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Aggregates real bookings into chart buckets. Revenue counts only approved / confirmed bookings. */
function buildTrend(
  bookings: BookingDoc[],
  buckets: { label: string; from: Date; to: Date }[]
): TrendPoint[] {
  return buckets.map(({ label, from, to }) => {
    const inRange = bookings.filter((b) => {
      const t = new Date(b.createdAt).getTime();
      return t >= from.getTime() && t < to.getTime();
    });
    const earning = inRange.filter((b) => b.paymentStatus === "approved" || b.bookingStatus === "confirmed");
    return {
      label,
      revenue: earning.reduce((s, b) => s + (b.totalAmount || 0), 0),
      bookings: inRange.length,
      contractors: new Set(inRange.map((b) => b.customer?.email?.toLowerCase()).filter(Boolean)).size,
    };
  });
}

export const getDashboardOverviewDb = createServerFn({ method: "POST" })
  .handler(async (): Promise<{ success: boolean; data: DashboardMetricsDoc }> => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: true, data: emptyMetrics(false) };
      }

      const [allBookings, allQuotes, allEquipment] = await Promise.all([
        db.collection<BookingDoc>("bookings").find({}).sort({ createdAt: -1 }).toArray(),
        db.collection<RentalQuoteDoc>("quotes").find({}).sort({ createdAt: -1 }).toArray(),
        db.collection<ManagedEquipmentDoc>("equipment").find({}, { projection: { category: 1 } }).toArray(),
      ]);

      // ── Real KPIs ──
      let totalRevenue = 0;
      let pendingVerificationsCount = 0;
      let activeRentalsCount = 0;
      const todayStr = new Date().toISOString().slice(0, 10);

      allBookings.forEach((b) => {
        if (b.paymentStatus === "approved" || b.bookingStatus === "confirmed") {
          totalRevenue += b.totalAmount || 0;
        }
        if (b.paymentStatus === "verification_pending" && b.bookingStatus !== "cancelled") {
          pendingVerificationsCount += 1;
        }
        if (b.bookingStatus === "confirmed" && b.pickupDate <= todayStr && b.returnDate >= todayStr) {
          activeRentalsCount += 1;
        }
      });

      const openQuotesCount = allQuotes.filter((q) => q.status === "new" || q.status === "quoted").length;

      const strip = <T,>(docs: T[]) => docs.map((d) => {
        const { _id, ...rest } = d as any;
        return rest as T;
      });

      // ── Category distribution straight from the equipment collection ──
      const catCount: Record<string, number> = {};
      allEquipment.forEach((eq) => {
        const cat = eq.category || "specialty-equipment";
        catCount[cat] = (catCount[cat] || 0) + 1;
      });
      const categoryDistribution = categories
        .filter((c) => (catCount[c.id] || 0) > 0)
        .map((c, i) => ({
          name: c.label,
          count: catCount[c.id] || 0,
          fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length] as string,
        }))
        .sort((a, b) => b.count - a.count);

      // ── Real trends ──
      const today = startOfDay(new Date());
      const day = 86_400_000;

      const buckets7 = Array.from({ length: 7 }, (_, i) => {
        const from = new Date(today.getTime() - (6 - i) * day);
        return { label: DAY_LABELS[from.getDay()] as string, from, to: new Date(from.getTime() + day) };
      });
      const buckets30 = Array.from({ length: 4 }, (_, i) => {
        const to = new Date(today.getTime() + day - (3 - i) * 7 * day);
        return { label: `Week ${i + 1}`, from: new Date(to.getTime() - 7 * day), to };
      });

      return {
        success: true,
        data: {
          totalRevenue,
          activeRentalsCount,
          pendingVerificationsCount,
          openQuotesCount,
          totalFleetCount: allEquipment.length,
          recentBookings: strip(allBookings.slice(0, 8)),
          recentQuotes: strip(allQuotes.slice(0, 6)),
          categoryDistribution,
          trendData7D: buildTrend(allBookings, buckets7),
          trendData30D: buildTrend(allBookings, buckets30),
          dbStatus: { connected: true, cluster: CLUSTER, database: DATABASE },
        },
      };
    } catch (err: any) {
      console.error("[DB] Error generating dashboard overview:", err);
      return { success: true, data: emptyMetrics(false) };
    }
  });
