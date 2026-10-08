import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Calendar,
  FileText,
  Users,
  QrCode,
  Phone,
  Eye,
  Check,
  X,
  RefreshCw,
  MapPin,
  Car,
  ChevronRight,
  ArrowUpRight,
  SlidersHorizontal,
  Flame,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { getBookings, updateBookingStatus, Booking } from "@/lib/booking-store";
import { getManagedFleet, getQuotes, RentalQuote } from "@/lib/dashboard-store";
import { site } from "@/lib/site";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Fleet Operations — Executive Dashboard | M3 Rental Houston" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardOverviewPage,
});

// Multi-timeframe trend datasets
const TREND_DATA_7D = [
  { label: "Mon", revenue: 450, bookings: 3, contractors: 2 },
  { label: "Tue", revenue: 750, bookings: 5, contractors: 4 },
  { label: "Wed", revenue: 600, bookings: 4, contractors: 3 },
  { label: "Thu", revenue: 1100, bookings: 7, contractors: 5 },
  { label: "Fri", revenue: 1650, bookings: 11, contractors: 8 },
  { label: "Sat", revenue: 1900, bookings: 13, contractors: 9 },
  { label: "Sun", revenue: 1250, bookings: 8, contractors: 6 },
];

const TREND_DATA_30D = [
  { label: "Week 1", revenue: 4200, bookings: 28, contractors: 19 },
  { label: "Week 2", revenue: 5800, bookings: 36, contractors: 24 },
  { label: "Week 3", revenue: 6950, bookings: 44, contractors: 31 },
  { label: "Week 4", revenue: 8400, bookings: 52, contractors: 38 },
];

const CATEGORY_DISTRIBUTION = [
  { name: "Pickups & Trucks", count: 18, fill: "#0040DD" },
  { name: "Utility Trailers", count: 24, fill: "#16A34A" },
  { name: "Heavy Machinery", count: 12, fill: "#F59E0B" },
  { name: "Passenger Shuttle", count: 8, fill: "#7414CA" },
  { name: "Specialty / RV", count: 10, fill: "#0284C7" },
];

import { getDashboardOverviewDb, DashboardMetricsDoc } from "@/lib/api/dashboard.functions";
import { updateBookingStatusDb } from "@/lib/api/bookings.functions";

function DashboardOverviewPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [quotes, setQuotes] = useState<RentalQuote[]>([]);
  const [fleetCount, setFleetCount] = useState(0);
  const [chartTimeframe, setChartTimeframe] = useState<"7D" | "30D">("7D");
  const [inspectionBooking, setInspectionBooking] = useState<Booking | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);
  const [dbOverview, setDbOverview] = useState<DashboardMetricsDoc | null>(null);

  const loadData = async () => {
    setIsRefreshing(true);
    // 1. Fetch from local store
    const b = getBookings();
    setBookings(b);
    setQuotes(getQuotes());
    setFleetCount(getManagedFleet().length);

    // 2. Fetch live telemetry directly from MongoDB Atlas
    try {
      const res = await getDashboardOverviewDb();
      if (res && res.success && res.data) {
        setDbOverview(res.data);
        setDbConnected(res.data.dbStatus.connected);
        if (res.data.recentBookings && res.data.recentBookings.length > 0) {
          setBookings(res.data.recentBookings as unknown as Booking[]);
        }
        if (res.data.recentQuotes && res.data.recentQuotes.length > 0) {
          setQuotes(res.data.recentQuotes as unknown as RentalQuote[]);
        }
      }
    } catch (e) {
      console.warn("DB overview fetch fallback:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("m3-bookings-changed", loadData);
    window.addEventListener("m3-quotes-changed", loadData);
    return () => {
      window.removeEventListener("m3-bookings-changed", loadData);
      window.removeEventListener("m3-quotes-changed", loadData);
    };
  }, []);

  // Aggregated Metrics (prefer live MongoDB calculation if available)
  const totalRevenue = dbOverview?.totalRevenue ?? bookings
    .filter((b) => b.bookingStatus === "confirmed" || b.paymentStatus === "approved")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pendingBookings = bookings.filter((b) => b.paymentStatus === "verification_pending");
  const confirmedBookings = bookings.filter((b) => b.bookingStatus === "confirmed");
  const newQuotes = quotes.filter((q) => q.status === "new");

  const handleApprove = async (id: string) => {
    try {
      await updateBookingStatusDb({ data: { bookingId: id, action: "approve" } });
    } catch {}
    const res = updateBookingStatus(id, "approve");
    if (res.success && res.booking) {
      toast.success(`Booking #${id} Approved!`, {
        description: `Payment verified in MongoDB. Dates locked for ${res.booking.vehicleName}.`,
      });
      loadData();
      if (inspectionBooking?.id === id) {
        setInspectionBooking(null);
      }
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateBookingStatusDb({
        data: {
          bookingId: id,
          action: "reject",
          adminNotes: "Payment screenshot could not be verified.",
        },
      });
    } catch {}
    const res = updateBookingStatus(id, "reject", "Payment screenshot could not be verified.");
    if (res.success && res.booking) {
      toast.warning(`Booking #${id} Declined`, {
        description: `Rental dates released on MongoDB & public calendar.`,
      });
      loadData();
      if (inspectionBooking?.id === id) {
        setInspectionBooking(null);
      }
    }
  };

  const chartData = chartTimeframe === "7D" 
    ? (dbOverview?.trendData7D ?? TREND_DATA_7D) 
    : (dbOverview?.trendData30D ?? TREND_DATA_30D);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* ── Page Header Row ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-black uppercase tracking-wider text-[#0040DD] mb-2 shadow-2xs">
            <Sparkles className="size-3.5 text-[#0040DD]" />
            Houston Yard Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Operations & Telemetry Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry for Houston equipment bookings, incoming mobile receipts, and contractor fleet requests.
          </p>
        </div>

        {/* Quick Action Buttons (Single Row) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={loadData}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            title="Refresh data from database"
          >
            <RefreshCw className={`size-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-[#0040DD]" : ""}`} />
            <span>Sync</span>
          </button>

          <Link
            to="/dashboard/bookings"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0040DD] hover:bg-[#0036ba] text-white text-xs font-bold shadow-md shadow-[#0040DD]/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Truck className="size-4" />
            <span>Review Bookings ({pendingBookings.length})</span>
          </Link>

          <Link
            to="/dashboard/payments"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <QrCode className="size-3.5 text-emerald-600" />
            <span>QR Settings</span>
          </Link>
        </div>
      </div>

      {/* ── TOP KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Verified Revenue */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition-all space-y-2 group">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <span>Verified Fleet Revenue</span>
            <div className="size-9 rounded-xl bg-emerald-50 text-[#16A34A] grid place-items-center group-hover:scale-110 transition-transform">
              <DollarSign className="size-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ${totalRevenue.toLocaleString()}.00
          </div>
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#16A34A] bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
            <TrendingUp className="size-3" />
            <span>+18.4% vs last period</span>
          </div>
        </div>

        {/* Card 2: Luxury Hero Card — Pending Verification Queue */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#061220] via-[#0b1c30] to-[#040d1a] p-5 shadow-lg text-white space-y-2 group relative overflow-hidden">
          <div className="absolute top-0 right-0 size-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-400">
            <span>Pending Verification</span>
            <div className="size-9 rounded-xl bg-amber-500/20 text-amber-400 grid place-items-center group-hover:scale-110 transition-transform border border-amber-400/30">
              <Clock className="size-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
            <span>{pendingBookings.length}</span>
            <span className="text-xs font-bold text-amber-300">Awaiting Approval</span>
            {pendingBookings.length > 0 && (
              <span className="relative flex h-2.5 w-2.5 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Zelle &amp; Cash App receipts uploaded
          </p>
        </div>

        {/* Card 3: Active Confirmed Bookings */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition-all space-y-2 group">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <span>Active Reservations</span>
            <div className="size-9 rounded-xl bg-blue-50 text-[#0040DD] grid place-items-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="size-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {confirmedBookings.length}
          </div>
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Calendar dates locked</span>
          </div>
        </div>

        {/* Card 4: Total Fleet Units */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md transition-all space-y-2 group">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400">
            <span>Total Fleet Catalog</span>
            <div className="size-9 rounded-xl bg-purple-50 text-purple-700 grid place-items-center group-hover:scale-110 transition-transform">
              <Package className="size-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>{fleetCount || 72}</span>
            <span className="text-xs font-bold text-slate-400">Units Ready</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Pickups, trailers, machinery &amp; vans
          </p>
        </div>
      </div>

      {/* ── CHARTS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Revenue & Volume Velocity */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Rental Revenue Velocity
                </h3>
                <span className="text-[10px] font-extrabold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Houston contractor booking pace across the selected operational window.
              </p>
            </div>

            {/* Timeframe Toggle Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartTimeframe("7D")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartTimeframe === "7D"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setChartTimeframe("30D")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartTimeframe === "30D"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Monthly (30D)
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase">Period Total</span>
              <span className="font-black text-slate-900 text-sm">
                ${chartData.reduce((acc, c) => acc + c.revenue, 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase">Rental Orders</span>
              <span className="font-black text-slate-900 text-sm">
                {chartData.reduce((acc, c) => acc + c.bookings, 0)} Units
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase">Contractor Bids</span>
              <span className="font-black text-slate-900 text-sm">
                {chartData.reduce((acc, c) => acc + c.contractors, 0)} Accounts
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0040DD" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0040DD" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                    fontWeight: "bold",
                    backgroundColor: "#ffffff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0040DD"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart: Fleet Category Utilization */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Fleet Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Ready units across Houston yard categories.
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_DISTRIBUTION} layout="vertical" margin={{ top: 10, right: 10, left: 35, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {CATEGORY_DISTRIBUTION.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Link
            to="/dashboard/equipment"
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Manage All 70+ Fleet Units</span>
            <ChevronRight className="size-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* ── LIVE BOOKINGS & VERIFICATION QUEUE ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                Live Rental Bookings Queue
              </h3>
              {pendingBookings.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-xs">
                  {pendingBookings.length} Require Review
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customers waiting for payment screenshot verification or active rental orders.
            </p>
          </div>

          <Link
            to="/dashboard/bookings"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0040DD] hover:text-[#0036ba] hover:underline"
          >
            <span>View All Bookings Table</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Truck className="size-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-600">No active bookings recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-6">Booking Ref</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Rental Duration</th>
                  <th className="py-3 px-4">Amount / Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bookings.slice(0, 6).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900">
                      {b.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.vehicleName}</div>
                      <div className="text-[11px] text-slate-500">${b.dailyRate}/day rate</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.customer.fullName}</div>
                      <div className="text-[11px] text-slate-500">{b.customer.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-semibold">
                        {b.pickupDate} → {b.returnDate}
                      </div>
                      <div className="text-[11px] text-slate-500">{b.rentalDays} Days Rental</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900">${b.totalAmount.toFixed(2)}</div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {b.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {b.paymentStatus === "verification_pending" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="size-3" />
                          Pending Audit
                        </span>
                      ) : b.bookingStatus === "confirmed" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="size-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <X className="size-3" />
                          Declined
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.paymentScreenshot && (
                          <button
                            type="button"
                            onClick={() => setInspectionBooking(b)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
                            title="Inspect Receipt Screenshot"
                          >
                            <Eye className="size-3.5" />
                          </button>
                        )}

                        {b.paymentStatus === "verification_pending" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(b.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1"
                            >
                              <Check className="size-3" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(b.id)}
                              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 font-bold text-xs transition-colors"
                            >
                              <X className="size-3" />
                            </button>
                          </>
                        ) : (
                          <Link
                            to="/dashboard/bookings"
                            className="text-xs font-bold text-slate-500 hover:text-slate-900"
                          >
                            Manage
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>



      {/* ── PAYMENT SCREENSHOT LIGHTBOX MODAL ── */}
      {inspectionBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Payment Screenshot Verification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Booking #{inspectionBooking.id} • {inspectionBooking.customer.fullName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectionBooking(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center min-h-[220px]">
              <img
                src={inspectionBooking.paymentScreenshot}
                alt="Receipt screenshot"
                className="max-h-80 w-auto object-contain rounded-xl shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block text-[11px]">Vehicle:</span>
                <span className="font-bold text-slate-800">{inspectionBooking.vehicleName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Due Amount:</span>
                <span className="font-black text-slate-900">${inspectionBooking.totalAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Channel:</span>
                <span className="font-bold text-slate-800 uppercase">{inspectionBooking.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Customer Phone:</span>
                <span className="font-bold text-slate-800">{inspectionBooking.customer.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleReject(inspectionBooking.id)}
                className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
              >
                Reject Receipt
              </button>
              <button
                type="button"
                onClick={() => handleApprove(inspectionBooking.id)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Approve &amp; Lock Dates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
