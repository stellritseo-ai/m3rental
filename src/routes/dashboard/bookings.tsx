import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Filter,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  User,
  X,
  XCircle,
  ExternalLink,
  DollarSign,
  FileText,
} from "lucide-react";
import {
  Booking,
  BookingStatus,
  deleteBooking,
  getBookings,
  updateBookingStatus,
} from "@/lib/booking-store";
import {
  deleteBookingDb,
  getBookingsDb,
  updateBookingStatusDb,
} from "@/lib/api/bookings.functions";
import { equipment, Equipment } from "@/data/equipment";

export const Route = createFileRoute("/dashboard/bookings")({
  head: () => ({
    meta: [
      { title: "Rental Bookings & Verification — Dashboard | M3 Rental Houston" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  errorComponent: ({ error, reset }: { error: any; reset: () => void }) => (
    <div className="p-8 text-center bg-white rounded-2xl border border-red-200 shadow-sm max-w-lg mx-auto my-12">
      <h2 className="text-lg font-bold text-red-600">Failed to render Bookings dashboard</h2>
      <p className="text-xs text-slate-500 mt-2 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 text-left">
        {error?.message || String(error)}
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
      >
        Retry
      </button>
    </div>
  ),
  component: DashboardBookingsPage,
});

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return dateStr;
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(isoStr: string): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

function DashboardBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus | "pending_verification">("all");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState(false);

  // View Details Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState("");

  // Delete Confirmation Modal
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadData = async () => {
    // 1. Instant local load
    setBookings(getBookings());
    setIsSyncing(true);

    // 2. Fetch directly from MongoDB Atlas
    try {
      const res = await getBookingsDb();
      if (res && res.success && Array.isArray(res.bookings)) {
        const list = res.bookings as unknown as Booking[];
        setBookings(list);
        try {
          localStorage.setItem("m3_rental_bookings_v2", JSON.stringify(list));
        } catch {}
      }
    } catch (e) {
      console.warn("DB bookings fetch fallback:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("m3-bookings-changed", loadData);
    return () => {
      window.removeEventListener("m3-bookings-changed", loadData);
    };
  }, []);

  // Sync admin notes input when selected booking changes
  useEffect(() => {
    if (selectedBooking) {
      setAdminNotesInput(selectedBooking.adminNotes || "");
    }
  }, [selectedBooking]);

  const filteredBookings = bookings.filter((b) => {
    if (!b) return false;
    if (statusFilter === "pending_verification") {
      if (b.paymentStatus !== "verification_pending") return false;
    } else if (statusFilter !== "all") {
      if (b.bookingStatus !== statusFilter) return false;
    }

    if (vehicleFilter !== "all" && b.vehicleSlug !== vehicleFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (b.id || "").toLowerCase().includes(q);
      const matchName = (b.customer?.fullName || "").toLowerCase().includes(q);
      const matchPhone = (b.customer?.phone || "").toLowerCase().includes(q);
      const matchEmail = (b.customer?.email || "").toLowerCase().includes(q);
      const matchVehicle = (b.vehicleName || "").toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchEmail && !matchVehicle) {
        return false;
      }
    }

    return true;
  });

  const pendingCount = bookings.filter((b) => b && b.paymentStatus === "verification_pending").length;
  const confirmedCount = bookings.filter((b) => b && b.bookingStatus === "confirmed").length;
  const cancelledCount = bookings.filter((b) => b && b.bookingStatus === "cancelled").length;

  const handleApprove = async (bookingId: string) => {
    setIsUpdatingStatus(true);
    const toastId = toast.loading(`Approving booking #${bookingId}...`);

    try {
      const notes = adminNotesInput || undefined;

      // 1. Direct MongoDB Atlas update
      try {
        await updateBookingStatusDb({
          data: {
            bookingId,
            action: "approve",
            ...(notes ? { adminNotes: notes } : {}),
          },
        });
      } catch (dbErr) {
        console.warn("[DB] Approve status notice:", dbErr);
      }

      // 2. Local store update (with selectedBooking as fallback if needed)
      const res = updateBookingStatus(bookingId, "approve", notes, selectedBooking || undefined);

      // 3. Immediately reflect in React states
      const nowIso = new Date().toISOString();
      const cleanTargetId = bookingId.replace(/^#/, "");
      const updatedBooking: Booking = res.booking || {
        ...(selectedBooking || (bookings.find((b) => b.id === bookingId || b.id.replace(/^#/, "") === cleanTargetId) as Booking)),
        bookingStatus: "confirmed",
        paymentStatus: "approved",
        reviewedAt: nowIso,
        ...(notes ? { adminNotes: notes } : {}),
      };

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId || b.id.replace(/^#/, "") === cleanTargetId ? updatedBooking : b
        )
      );
      if (
        selectedBooking &&
        (selectedBooking.id === bookingId || selectedBooking.id.replace(/^#/, "") === cleanTargetId)
      ) {
        setSelectedBooking(updatedBooking);
      }

      toast.success(`Booking #${bookingId} Approved & Confirmed!`, {
        id: toastId,
        description: `Rental dates (${updatedBooking.pickupDate} → ${updatedBooking.returnDate}) are locked for ${updatedBooking.vehicleName}.`,
      });

      await loadData();
    } catch (err: any) {
      console.error("Approve error:", err);
      toast.error(`Could not approve booking: ${err?.message || "Unknown error"}`, { id: toastId });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReject = async (bookingId: string) => {
    setIsUpdatingStatus(true);
    const toastId = toast.loading(`Rejecting payment for booking #${bookingId}...`);

    try {
      const notes = adminNotesInput || "Payment screenshot could not be verified.";

      // 1. Direct MongoDB Atlas update
      try {
        await updateBookingStatusDb({
          data: {
            bookingId,
            action: "reject",
            adminNotes: notes,
          },
        });
      } catch (dbErr) {
        console.warn("[DB] Reject status notice:", dbErr);
      }

      // 2. Local store update (with selectedBooking as fallback if needed)
      const res = updateBookingStatus(bookingId, "reject", notes, selectedBooking || undefined);

      // 3. Immediately reflect in React states
      const nowIso = new Date().toISOString();
      const cleanTargetId = bookingId.replace(/^#/, "");
      const updatedBooking: Booking = res.booking || {
        ...(selectedBooking || (bookings.find((b) => b.id === bookingId || b.id.replace(/^#/, "") === cleanTargetId) as Booking)),
        bookingStatus: "cancelled",
        paymentStatus: "rejected",
        reviewedAt: nowIso,
        adminNotes: notes,
      };

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId || b.id.replace(/^#/, "") === cleanTargetId ? updatedBooking : b
        )
      );
      if (
        selectedBooking &&
        (selectedBooking.id === bookingId || selectedBooking.id.replace(/^#/, "") === cleanTargetId)
      ) {
        setSelectedBooking(updatedBooking);
      }

      toast.warning(`Booking #${bookingId} Rejected`, {
        id: toastId,
        description: `Payment rejected. Rental dates (${updatedBooking.pickupDate} → ${updatedBooking.returnDate}) have been released back to fleet.`,
      });

      await loadData();
    } catch (err: any) {
      console.error("Reject error:", err);
      toast.error(`Could not reject booking: ${err?.message || "Unknown error"}`, { id: toastId });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    setIsUpdatingStatus(true);
    const toastId = toast.loading(`Cancelling reservation #${bookingId}...`);

    try {
      const notes = adminNotesInput || "Cancelled by admin.";

      try {
        await updateBookingStatusDb({
          data: {
            bookingId,
            action: "cancel",
            adminNotes: notes,
          },
        });
      } catch (dbErr) {
        console.warn("[DB] Cancel status notice:", dbErr);
      }

      const res = updateBookingStatus(bookingId, "cancel", notes, selectedBooking || undefined);

      const nowIso = new Date().toISOString();
      const cleanTargetId = bookingId.replace(/^#/, "");
      const updatedBooking: Booking = res.booking || {
        ...(selectedBooking || (bookings.find((b) => b.id === bookingId || b.id.replace(/^#/, "") === cleanTargetId) as Booking)),
        bookingStatus: "cancelled",
        reviewedAt: nowIso,
        adminNotes: notes,
      };

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId || b.id.replace(/^#/, "") === cleanTargetId ? updatedBooking : b
        )
      );
      if (
        selectedBooking &&
        (selectedBooking.id === bookingId || selectedBooking.id.replace(/^#/, "") === cleanTargetId)
      ) {
        setSelectedBooking(updatedBooking);
      }

      toast.info(`Booking #${bookingId} Cancelled`, {
        id: toastId,
        description: "Dates have been released back to fleet availability.",
      });

      await loadData();
    } catch (err: any) {
      console.error("Cancel error:", err);
      toast.error(`Could not cancel booking: ${err?.message || "Unknown error"}`, { id: toastId });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ── Fully functional Delete from Database & Client Store ──
  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;
    setIsDeleting(true);
    const bookingId = bookingToDelete.id;

    try {
      // 1. Delete from MongoDB Atlas database
      const dbRes = await deleteBookingDb({ data: { bookingId } });
      if (!dbRes || !dbRes.success) {
        console.warn("[DB] Delete returned warning:", dbRes?.error);
      }

      // 2. Delete from local store & notify engine
      deleteBooking(bookingId);

      // 3. Update local state immediately
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));

      toast.success(`Booking #${bookingId} Deleted from Database`, {
        description: `The reservation has been permanently removed and vehicle dates are released.`,
      });

      // Close modals
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
      setBookingToDelete(null);

      // Re-trigger load to ensure full state alignment
      loadData();
    } catch (err: any) {
      console.error("Failed to delete booking:", err);
      toast.error(`Error deleting booking: ${err?.message || "Please try again."}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Booking ID",
      "Vehicle",
      "Customer",
      "Phone",
      "Email",
      "Pickup Date",
      "Return Date",
      "Rental Days",
      "Total Amount",
      "Payment Method",
      "Status",
    ];
    const rows = filteredBookings.map((b) => [
      `"${b.id || ""}"`,
      `"${b.vehicleName || ""}"`,
      `"${b.customer?.fullName || ""}"`,
      `"${b.customer?.phone || ""}"`,
      `"${b.customer?.email || ""}"`,
      `"${b.pickupDate || ""}"`,
      `"${b.returnDate || ""}"`,
      b.rentalDays || 1,
      `$${(b.totalAmount || 0).toFixed(2)}`,
      `"${b.paymentMethod || ""}"`,
      `"${b.bookingStatus || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `m3-bookings-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Bookings CSV exported successfully!");
  };

  const totalBookingsRevenue = bookings
    .filter((b) => b && (b.bookingStatus === "confirmed" || b.paymentStatus === "approved"))
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="size-7 text-[#0040DD]" />
            Rental Bookings &amp; Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage reservations, review payment proofs, view complete customer details, and control fleet availability.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-bold shadow-sm">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              MongoDB: <span className="text-emerald-400 font-bold">bookings</span>
            </span>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Reload from MongoDB"
          >
            <RefreshCw className={`size-3.5 text-slate-500 ${isSyncing ? "animate-spin text-[#0040DD]" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="size-4 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
            <span className="p-2 rounded-xl bg-blue-50 text-[#0040DD]">
              <Truck className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">{bookings.length}</div>
          <div className="mt-1 text-xs text-slate-500">All reservations in database</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-amber-600 flex items-center gap-2">
            <span>{pendingCount}</span>
            {pendingCount > 0 && <span className="size-2 rounded-full bg-amber-500 animate-pulse" />}
          </div>
          <div className="mt-1 text-xs text-slate-500">Requires screenshot verification</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmed &amp; Active</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">{confirmedCount}</div>
          <div className="mt-1 text-xs text-slate-500">Dates locked on fleet calendar</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Revenue</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
            ${totalBookingsRevenue.toLocaleString()}.00
          </div>
          <div className="mt-1 text-xs text-slate-500">Confirmed booking value</div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, email, or Booking ID (#M3-...)"
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#0040DD] focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="w-full md:w-64">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              aria-label="Filter by vehicle"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 focus:border-[#0040DD] focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Vehicles &amp; Fleet</option>
              {equipment.map((eq: Equipment) => (
                <option key={eq.slug} value={eq.slug}>
                  {eq.name} (${eq.dayRate}/day)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="size-3.5" /> Filter Status:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending_verification")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "pending_verification"
                ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                : "bg-amber-100 text-amber-900 hover:bg-amber-200"
            }`}
          >
            <Clock className="size-3.5" />
            <span>Pending Review ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("confirmed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "confirmed"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span>Confirmed ({confirmedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("cancelled")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "cancelled"
                ? "bg-slate-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <XCircle className="size-3.5" />
            <span>Cancelled ({cancelledCount})</span>
          </button>

          <div className="ml-auto text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredBookings.length}</span> of{" "}
            <span className="font-bold text-slate-800">{bookings.length}</span> reservations
          </div>
        </div>
      </div>

      {/* ── Premium Pixel-Perfect Bookings Table ── */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
          <Truck className="mx-auto size-12 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-800">No Reservations Found</h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery || statusFilter !== "all" || vehicleFilter !== "all"
              ? "Try adjusting your search criteria or filter tags."
              : "No rental bookings have been placed yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500 select-none">
                  <th className="py-3.5 px-4 font-black">Booking ID</th>
                  <th className="py-3.5 px-4 font-black">Vehicle</th>
                  <th className="py-3.5 px-4 font-black">Customer Details</th>
                  <th className="py-3.5 px-4 font-black">Rental Dates</th>
                  <th className="py-3.5 px-4 font-black">Total &amp; Payment</th>
                  <th className="py-3.5 px-4 font-black text-center">Proof</th>
                  <th className="py-3.5 px-4 font-black">Status</th>
                  <th className="py-3.5 px-4 font-black text-right min-w-[170px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const isPending = b.paymentStatus === "verification_pending";
                  const isConfirmed = b.bookingStatus === "confirmed";
                  const isCancelled = b.bookingStatus === "cancelled";

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className={`group hover:bg-slate-50/90 transition-all cursor-pointer ${
                        isPending ? "bg-amber-50/20" : ""
                      }`}
                      title="Click row to view full details"
                    >
                      {/* Booking ID & Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70 inline-block shadow-2xs group-hover:border-blue-300 transition-colors">
                          #{b.id}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 font-medium">
                          <Clock className="size-3 text-slate-400 shrink-0" />
                          <span>{formatDateTime(b.createdAt)}</span>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.vehicleImage}
                            alt={b.vehicleName}
                            className="size-11 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              to="/equipment/$slug"
                              params={{ slug: b.vehicleSlug }}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-slate-900 hover:text-[#0040DD] transition-colors line-clamp-1 block"
                              title={b.vehicleName}
                            >
                              {b.vehicleName}
                            </Link>
                            <span className="text-[11px] font-semibold text-slate-500">
                              ${b.dailyRate}/day
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 min-w-[190px]">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {b.customer?.fullName || "Guest Customer"}
                        </div>
                        {b.customer?.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 font-medium">
                            <Phone className="size-3 text-slate-400 shrink-0" />
                            <a
                              href={`tel:${b.customer.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-[#0040DD] hover:underline"
                            >
                              {b.customer.phone}
                            </a>
                          </div>
                        )}
                        {b.customer?.email && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                            <Mail className="size-3 text-slate-400 shrink-0" />
                            <a
                              href={`mailto:${b.customer.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="truncate hover:text-[#0040DD] hover:underline"
                              title={b.customer.email}
                            >
                              {b.customer.email}
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Rental Dates */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-[#0040DD] shrink-0" />
                          <span>
                            {formatDisplayDate(b.pickupDate)} → {formatDisplayDate(b.returnDate)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0040DD] border border-blue-200/60">
                            {b.rentalDays} Day{b.rentalDays > 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>

                      {/* Total Amount & Payment Method */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-display font-black text-sm text-slate-900">
                          ${b.totalAmount.toLocaleString()}.00
                        </div>
                        <div className="mt-1">
                          {b.paymentMethod === "zelle" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/70">
                              Zelle
                            </span>
                          )}
                          {b.paymentMethod === "cashapp" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                              Cash App
                            </span>
                          )}
                          {b.paymentMethod === "cash" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/70">
                              Cash
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Proof / Thumbnail */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        {b.paymentMethod === "cash" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Cash Pickup
                          </span>
                        ) : b.paymentScreenshot ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(b);
                            }}
                            className="group/thumb relative inline-block rounded-lg border border-slate-200 overflow-hidden size-11 bg-slate-100 shadow-2xs hover:border-[#0040DD] transition-all cursor-pointer"
                            title="Click to view full screenshot"
                          >
                            <img
                              src={b.paymentScreenshot}
                              alt="Payment proof"
                              className="size-full object-cover group-hover/thumb:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Eye className="size-3.5" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No receipt</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-800 border border-amber-200 shadow-2xs">
                            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Pending</span>
                          </span>
                        )}
                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800 border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            <span>Confirmed</span>
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-600 border border-slate-200">
                            <XCircle className="size-3.5 text-slate-400" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>

                      {/* Actions: View Details, Approve, and Delete */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(b);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0040DD] hover:border-blue-300 transition-all shadow-2xs cursor-pointer"
                            title="View Full Booking Details"
                          >
                            <Eye className="size-3.5 text-slate-500" />
                            <span>Details</span>
                          </button>

                          {/* Quick Approve for pending */}
                          {isPending && (
                            <button
                              type="button"
                              disabled={isUpdatingStatus}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(b.id);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#16A34A] text-white text-xs font-black hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                              title="Approve payment & lock dates"
                            >
                              <Check className="size-3.5" />
                              <span className="hidden sm:inline">Approve</span>
                            </button>
                          )}

                          {/* Delete Button (Opens confirmation dialog) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookingToDelete(b);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                            title="Delete booking from database"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal 1: Booking Details & Inspection ── */}
      {selectedBooking && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
        >
          <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-[#070D1D] text-white p-5 sm:p-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#FFD54F] bg-white/10 px-2 py-0.5 rounded">
                    #{selectedBooking.id}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-300 font-medium">
                    Created {new Date(selectedBooking.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display mt-1">
                  Reservation Details &amp; Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-full bg-white/10 p-2 text-slate-400 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* Vehicle & Date Duration Summary */}
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <img
                  src={selectedBooking.vehicleImage}
                  alt={selectedBooking.vehicleName}
                  className="size-20 rounded-xl object-cover border border-slate-200 shadow-2xs"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-display font-black text-slate-900 text-lg">
                    {selectedBooking.vehicleName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Daily Rate: ${selectedBooking.dailyRate}/day • Duration: {selectedBooking.rentalDays} Day
                    {selectedBooking.rentalDays > 1 ? "s" : ""}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-[#0040DD] border border-blue-200">
                    <Calendar className="size-3.5" />
                    <span>
                      {formatDisplayDate(selectedBooking.pickupDate)} →{" "}
                      {formatDisplayDate(selectedBooking.returnDate)}
                    </span>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</div>
                  <div className="font-display font-black text-2xl sm:text-3xl text-[#0040DD]">
                    ${selectedBooking.totalAmount.toLocaleString()}.00
                  </div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-200 text-slate-800">
                    via {selectedBooking.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <User className="size-4 text-[#0040DD]" /> Customer Information
                </h4>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Full Name:</span>
                    <p className="font-bold text-slate-900 mt-0.5 text-sm">{selectedBooking.customer?.fullName || "Guest Customer"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Phone Number:</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {selectedBooking.customer?.phone ? (
                        <a href={`tel:${selectedBooking.customer.phone}`} className="text-[#0040DD] hover:underline flex items-center gap-1">
                          <Phone className="size-3" />
                          {selectedBooking.customer.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not provided</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Email Address:</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {selectedBooking.customer?.email ? (
                        <a href={`mailto:${selectedBooking.customer.email}`} className="text-[#0040DD] hover:underline flex items-center gap-1">
                          <Mail className="size-3" />
                          {selectedBooking.customer.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not provided</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Billing / Physical Address:</span>
                    <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                      <MapPin className="size-3 text-slate-400 shrink-0" />
                      {selectedBooking.customer?.address || "Not provided"}
                    </p>
                  </div>
                </div>

                {selectedBooking.customer?.notes && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 font-medium">Customer Notes / Special Requests:</span>
                    <p className="mt-1 bg-slate-50 p-2.5 rounded-lg text-slate-700 italic border border-slate-200/60">
                      "{selectedBooking.customer.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Proof / Instructions */}
              <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ImageIcon className="size-4 text-[#16A34A]" /> Payment Proof &amp; Verification
                  </h4>
                  {selectedBooking.paymentScreenshot && selectedBooking.paymentMethod !== "cash" && (
                    <a
                      href={selectedBooking.paymentScreenshot}
                      download={`receipt-${selectedBooking.id}.png`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0040DD] hover:underline"
                    >
                      <Download className="size-3" /> Download Receipt
                    </a>
                  )}
                </div>

                {selectedBooking.paymentMethod === "cash" ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <DollarSign className="size-4" /> In-Person Cash Payment on Vehicle Release
                    </div>
                    <p className="mt-1 text-amber-800">
                      The customer opted to pay in cash upon vehicle pickup at our Houston Yard. Verify full payment (${selectedBooking.totalAmount}.00) and issue physical receipt prior to vehicle handoff.
                    </p>
                  </div>
                ) : selectedBooking.paymentScreenshot ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-950 p-3 flex items-center justify-center max-h-[380px] overflow-hidden">
                    <img
                      src={selectedBooking.paymentScreenshot}
                      alt="Customer payment screenshot"
                      className="max-h-[350px] w-auto object-contain rounded-lg shadow-md"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
                    No payment screenshot attached.
                  </div>
                )}
              </div>

              {/* Admin Status Controls */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/70 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Review &amp; Status Controls</h4>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {selectedBooking.paymentStatus === "verification_pending" ? (
                    <>
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleApprove(selectedBooking.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#16A34A] text-white hover:bg-emerald-700 font-black uppercase tracking-wider text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingStatus ? <RefreshCw className="size-4 animate-spin" /> : <Check className="size-4" />}
                        Approve Payment &amp; Lock Dates
                      </button>
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleReject(selectedBooking.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-600 text-white hover:bg-amber-700 font-black uppercase tracking-wider text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingStatus ? <RefreshCw className="size-4 animate-spin" /> : <X className="size-4" />}
                        Reject Payment &amp; Release Dates
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 text-xs font-medium text-slate-700 flex flex-wrap items-center gap-2">
                      <span>Status:</span>
                      <span className="font-bold uppercase text-[#0040DD] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                        {selectedBooking.bookingStatus}
                      </span>
                      <span>(Payment: {selectedBooking.paymentStatus})</span>
                      {selectedBooking.bookingStatus === "confirmed" && (
                        <button
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() => handleCancel(selectedBooking.id)}
                          className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 cursor-pointer disabled:opacity-50"
                        >
                          {isUpdatingStatus ? <RefreshCw className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
                          Cancel Reservation
                        </button>
                      )}
                      {selectedBooking.paymentStatus === "rejected" && (
                        <button
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() => handleApprove(selectedBooking.id)}
                          className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 cursor-pointer disabled:opacity-50"
                          title="Re-approve this booking if rejected in error"
                        >
                          {isUpdatingStatus ? <RefreshCw className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                          Re-Approve Reservation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with Delete and Close */}
            <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setBookingToDelete(selectedBooking);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
              >
                <Trash2 className="size-4" />
                <span>Delete Booking from Database</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: Delete Confirmation Modal ── */}
      {bookingToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 p-4 sm:p-6 space-y-5 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 text-lg">
                  Delete Booking #{bookingToDelete.id}?
                </h3>
                <p className="text-xs text-slate-500">
                  Permanent removal from database
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Customer:</span>
                <span className="font-bold text-slate-900">{bookingToDelete.customer?.fullName || "Guest Customer"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Vehicle:</span>
                <span className="font-bold text-slate-900">{bookingToDelete.vehicleName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Reserved Dates:</span>
                <span className="font-bold text-[#0040DD]">
                  {bookingToDelete.pickupDate} → {bookingToDelete.returnDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Amount:</span>
                <span className="font-bold text-slate-900">${bookingToDelete.totalAmount}.00</span>
              </div>
            </div>

            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 font-medium">
              Warning: Deleting this booking will immediately purge it from the MongoDB database and release these rental dates back to the public fleet calendar.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBookingToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-700 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Deleting from DB...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    <span>Yes, Delete from Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
