import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Gauge,
  Handshake,
  Hash,
  Image as ImageIcon,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  User,
  Wrench,
  X,
  XCircle,
  ZoomIn,
} from "lucide-react";
import {
  deleteSellListingDb,
  getSellListingsDb,
  updateSellListingDb,
} from "@/lib/api/sell.functions";
import {
  CONDITION_META,
  CONTACT_LABEL,
  SELL_STATUSES,
  STATUS_META,
  type SellCondition,
  type SellListingDoc,
  type SellStatus,
} from "@/lib/sell-shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/sell-requests")({
  head: () => ({
    meta: [
      { title: "Sell Inquiries & Acquisitions — Dashboard | M3 Rental Houston" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardSellRequestsPage,
});

function timeAgo(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return dateStr;
  }
}

function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("m3_admin_session_token") || undefined;
}

function DashboardSellRequestsPage() {
  const [listings, setListings] = useState<SellListingDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Inspection modal
  const [selectedListing, setSelectedListing] = useState<SellListingDoc | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Edit / Deal fixing state
  const [editStatus, setEditStatus] = useState<SellStatus>("new");
  const [editOffer, setEditOffer] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [isSavingDeal, setIsSavingDeal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lightbox
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const fetchListings = async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const token = getToken();
      const res = await getSellListingsDb({ data: { token } });
      if (res && res.success && Array.isArray(res.listings)) {
        setListings(res.listings);
        if (showToast) {
          toast.success("Sell offers refreshed from MongoDB Atlas", {
            description: `${res.listings.length} total equipment offers loaded.`,
          });
        }
      } else if (res && !res.success) {
        toast.error(res.error || "Failed to load sell requests.");
      }
    } catch (err: any) {
      console.error("[Dashboard] Sell listings fetch error:", err);
      toast.error("Could not connect to database.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // When selecting a listing to review, prepopulate deal editing fields
  const handleOpenReview = (item: SellListingDoc) => {
    setSelectedListing(item);
    setActiveImageIndex(0);
    setEditStatus(item.status);
    setEditOffer(item.offerAmount !== undefined ? String(item.offerAmount) : "");
    setEditNotes(item.adminNotes || "");
  };

  const handleSaveDeal = async () => {
    if (!selectedListing) return;
    setIsSavingDeal(true);
    try {
      const token = getToken();
      const offerNum = editOffer.trim() === "" ? null : Number(editOffer.replace(/,/g, ""));
      const res = await updateSellListingDb({
        data: {
          token,
          id: selectedListing.id,
          status: editStatus,
          offerAmount: offerNum,
          adminNotes: editNotes.trim(),
        },
      });

      if (res && res.success) {
        toast.success(`Deal status updated to "${STATUS_META[editStatus].label}"`, {
          description: `Offer: ${offerNum ? `$${offerNum.toLocaleString()}` : "Not set"}`,
        });

        // Update local state
        const updated = listings.map((l) =>
          l.id === selectedListing.id
            ? {
                ...l,
                status: editStatus,
                offerAmount: offerNum === null ? undefined : offerNum,
                adminNotes: editNotes.trim(),
                updatedAt: new Date().toISOString(),
              }
            : l,
        );
        setListings(updated);
        setSelectedListing((prev) =>
          prev
            ? {
                ...prev,
                status: editStatus,
                offerAmount: offerNum === null ? undefined : offerNum,
                adminNotes: editNotes.trim(),
                updatedAt: new Date().toISOString(),
              }
            : null,
        );
      } else {
        toast.error(res.error || "Failed to save deal changes.");
      }
    } catch (err) {
      toast.error("Network error while saving deal.");
    } finally {
      setIsSavingDeal(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sell inquiry? Uploaded photos will be removed.")) {
      return;
    }
    setIsDeleting(true);
    try {
      const token = getToken();
      const res = await deleteSellListingDb({ data: { token, id } });
      if (res && res.success) {
        toast.success("Listing deleted successfully.");
        setListings((prev) => prev.filter((l) => l.id !== id));
        if (selectedListing?.id === id) {
          setSelectedListing(null);
        }
      } else {
        toast.error(res.error || "Could not delete listing.");
      }
    } catch {
      toast.error("Failed to delete listing.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered listings
  const filtered = useMemo(() => {
    return listings.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (conditionFilter !== "all" && item.condition !== conditionFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.make || "").toLowerCase().includes(q) ||
          (item.model || "").toLowerCase().includes(q) ||
          (item.serialNumber || "").toLowerCase().includes(q) ||
          item.seller.name.toLowerCase().includes(q) ||
          item.seller.phone.toLowerCase().includes(q) ||
          item.seller.email.toLowerCase().includes(q) ||
          (item.seller.company || "").toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [listings, search, statusFilter, conditionFilter]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = listings.length;
    const newCount = listings.filter((l) => l.status === "new").length;
    const negotiatingCount = listings.filter(
      (l) => l.status === "contacted" || l.status === "negotiating",
    ).length;
    const closedCount = listings.filter(
      (l) => l.status === "accepted" || l.status === "purchased",
    ).length;
    const pipelineValue = listings
      .filter((l) => l.status !== "rejected")
      .reduce((acc, l) => acc + (l.askingPrice || 0), 0);

    return { total, newCount, negotiatingCount, closedCount, pipelineValue };
  }, [listings]);

  return (
    <div className="space-y-6 pb-12">
      {/* ── TOP BANNER: ACQUISITIONS CONSOLE HEADER ── */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#002a8f] text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0040DD]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#16A34A]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Handshake className="size-3.5 text-emerald-400" />
                Fleet Acquisitions &amp; Buys
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Direct Seller Submissions from /sell
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
              Equipment Purchase &amp; Deal Console
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Review equipment offered by Houston contractors, inspect photos, evaluate asking prices,
              and call or text sellers directly to negotiate and close purchases.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => fetchListings(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
              Sync Atlas
            </button>

            <Link
              to="/sell"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all"
            >
              <Tag className="size-3.5" />
              <span>Public Sell Page</span>
              <ExternalLink className="size-3 text-emerald-200" />
            </Link>
          </div>
        </div>

        {/* ── KPI METRICS CARDS ── */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="block text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Total Inquiries
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {stats.total}
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="block text-amber-300 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
              New / Unreviewed
            </span>
            <span className="text-2xl font-black text-amber-300 mt-1 block">
              {stats.newCount}
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="block text-blue-300 text-[11px] font-semibold uppercase tracking-wider">
              Under Negotiation
            </span>
            <span className="text-2xl font-black text-blue-300 mt-1 block">
              {stats.negotiatingCount}
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="block text-emerald-300 text-[11px] font-semibold uppercase tracking-wider">
              Deals Agreed / Bought
            </span>
            <span className="text-2xl font-black text-emerald-300 mt-1 block">
              {stats.closedCount}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <span className="block text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Pipeline Value
            </span>
            <span className="text-2xl font-black text-[#4ADE80] mt-1 block truncate">
              ${stats.pipelineValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, seller, make, phone, location..."
            className="w-full h-10 pl-9 pr-8 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0040DD] outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 text-xs font-semibold px-3 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-[#0040DD]"
          >
            <option value="all">All Statuses ({listings.length})</option>
            {SELL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label} (
                {listings.filter((l) => l.status === s).length})
              </option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="h-10 text-xs font-semibold px-3 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-[#0040DD]"
          >
            <option value="all">All Conditions</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="needs-repair">Needs Repair</option>
          </select>

          {/* View Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === "grid"
                  ? "bg-white text-[#0040DD] shadow-xs"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === "table"
                  ? "bg-white text-[#0040DD] shadow-xs"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* ── LISTINGS PRESENTATION ── */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="size-10 rounded-2xl border-3 border-[#0040DD] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Loading Equipment Offers from MongoDB Atlas...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-white space-y-3">
          <div className="size-12 rounded-2xl bg-blue-50 text-[#0040DD] flex items-center justify-center mx-auto">
            <Handshake className="size-6" />
          </div>
          <h3 className="font-display text-lg font-black text-slate-900">
            No Equipment Offers Found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {search || statusFilter !== "all" || conditionFilter !== "all"
              ? "No offers match your current search/filter criteria. Try clearing filters."
              : "No visitors have submitted equipment for sale yet. Once a seller submits on /sell, their equipment photos and details will appear here instantly."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const statusInfo = STATUS_META[item.status];
            const condInfo = CONDITION_META[item.condition];
            const cover = item.images[0] || "/placeholder.svg";

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-[#0040DD]/40 transition-all flex flex-col overflow-hidden group"
              >
                {/* Image Cover */}
                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                  <img
                    src={cover}
                    alt={item.title}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => handleOpenReview(item)}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md",
                        statusInfo.tone,
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", statusInfo.dot)} />
                      {statusInfo.label}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs">
                      <ImageIcon className="size-3" />
                      {item.images.length}
                    </span>
                  </div>

                  {/* Bottom Asking Price Overlay */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/75 backdrop-blur-md rounded-xl px-3 py-1.5 text-white">
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
                        Asking Price
                      </span>
                      <span className="text-base font-black text-[#4ADE80]">
                        ${item.askingPrice.toLocaleString()}
                      </span>
                    </div>

                    {item.negotiable ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        OBO / Negotiable
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        Firm
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 mb-1">
                      <span className="font-bold text-[#0040DD] uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span>{timeAgo(item.createdAt)}</span>
                    </div>

                    <h3
                      className="font-bold text-sm text-slate-900 line-clamp-2 cursor-pointer hover:text-[#0040DD] transition-colors leading-snug"
                      onClick={() => handleOpenReview(item)}
                    >
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                          condInfo.tone,
                        )}
                      >
                        {condInfo.label}
                      </span>

                      {item.year && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                          Year: {item.year}
                        </span>
                      )}

                      {item.usage && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 flex items-center gap-1">
                          <Gauge className="size-2.5 text-slate-400" />
                          {item.usage}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Seller Snapshot Card */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                        <User className="size-3.5 text-[#0040DD] shrink-0" />
                        {item.seller.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {CONTACT_LABEL[item.seller.preferredContact]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-600">
                      <a
                        href={`tel:${item.seller.phone}`}
                        className="hover:text-[#0040DD] flex items-center gap-1 font-semibold"
                      >
                        <Phone className="size-3 text-[#16A34A]" />
                        {item.seller.phone}
                      </a>
                      <a
                        href={`mailto:${item.seller.email}`}
                        className="hover:text-[#0040DD] flex items-center gap-1 truncate"
                      >
                        <Mail className="size-3 text-slate-400" />
                        {item.seller.email}
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReview(item)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0040DD] hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      <span>Review &amp; Fix Deal</span>
                    </button>

                    <a
                      href={`tel:${item.seller.phone}`}
                      title="Call Seller Directly"
                      className="size-9 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[#16A34A] flex items-center justify-center transition-colors shrink-0"
                    >
                      <Phone className="size-4" />
                    </a>

                    <a
                      href={`sms:${item.seller.phone}`}
                      title="Text Seller"
                      className="size-9 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-[#0040DD] flex items-center justify-center transition-colors shrink-0"
                    >
                      <MessageSquare className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="py-3.5 px-4">Equipment &amp; Photos</th>
                  <th className="py-3.5 px-4">Seller Details</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4 text-right">Asking Price</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const statusInfo = STATUS_META[item.status];
                  const condInfo = CONDITION_META[item.condition];
                  const cover = item.images[0] || "/placeholder.svg";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => handleOpenReview(item)}
                    >
                      {/* Equipment Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={cover}
                            alt=""
                            className="size-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-xs">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {item.category} • {item.images.length} photos
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Seller */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {item.seller.name}
                        </span>
                        <a
                          href={`tel:${item.seller.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-[#16A34A] font-semibold hover:underline block"
                        >
                          {item.seller.phone}
                        </a>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {item.location}
                      </td>

                      {/* Condition */}
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                            condInfo.tone,
                          )}
                        >
                          {condInfo.label}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        ${item.askingPrice.toLocaleString()}
                        {item.negotiable && (
                          <span className="block text-[9.5px] text-[#16A34A] font-bold">
                            Negotiable
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            statusInfo.tone,
                          )}
                        >
                          <span className={cn("size-1.5 rounded-full", statusInfo.dot)} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenReview(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#0040DD] hover:bg-blue-100 font-bold text-xs"
                          >
                            Review
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

      {/* ══════════════════════════════════════════════════════════════
          INSPECTION & DEAL-FIXING MODAL (POPUP DIALOG)
         ══════════════════════════════════════════════════════════════ */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0 cursor-pointer"
            onClick={() => setSelectedListing(null)}
          />

          <div className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 truncate pr-4">
                <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-[#4ADE80] shrink-0">
                  <Handshake className="size-5" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Ref #{selectedListing.id} • Submitted {timeAgo(selectedListing.createdAt)}
                  </span>
                  <h2 className="font-bold text-base sm:text-lg text-white truncate">
                    {selectedListing.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Photo Gallery & Thumbnail Selector */}
              <div className="space-y-3">
                {(() => {
                  const activePhoto =
                    selectedListing.images[activeImageIndex] ||
                    selectedListing.images[0] ||
                    "";
                  return (
                    <div className="relative aspect-[16/9] max-h-[360px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center group">
                      <img
                        src={activePhoto}
                        alt="Active equipment photo"
                        className="size-full object-contain cursor-zoom-in"
                        onClick={() => setZoomedImage(activePhoto || null)}
                      />

                      <button
                        type="button"
                        onClick={() => setZoomedImage(activePhoto || null)}
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <ZoomIn className="size-3.5" /> Fullscreen
                      </button>

                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-md">
                        Photo {activeImageIndex + 1} of {selectedListing.images.length}
                      </div>
                    </div>
                  );
                })()}

                {/* Thumbnail Strip */}
                {selectedListing.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedListing.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={cn(
                          "size-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer",
                          activeImageIndex === idx
                            ? "border-[#0040DD] ring-2 ring-[#0040DD]/30 scale-105"
                            : "border-slate-200 opacity-70 hover:opacity-100",
                        )}
                      >
                        <img src={img} alt="" className="size-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid: Equipment Specs + Seller Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Equipment Specs */}
                <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-white">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Truck className="size-4 text-[#0040DD]" /> Equipment Details
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Category
                      </span>
                      <span className="font-bold text-slate-800">
                        {selectedListing.category}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Condition
                      </span>
                      <span className="font-bold text-slate-800">
                        {CONDITION_META[selectedListing.condition].label}
                      </span>
                    </div>

                    {selectedListing.make && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Make
                        </span>
                        <span className="font-bold text-slate-800">
                          {selectedListing.make}
                        </span>
                      </div>
                    )}

                    {selectedListing.model && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Model
                        </span>
                        <span className="font-bold text-slate-800">
                          {selectedListing.model}
                        </span>
                      </div>
                    )}

                    {selectedListing.year && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Year
                        </span>
                        <span className="font-bold text-slate-800">
                          {selectedListing.year}
                        </span>
                      </div>
                    )}

                    {selectedListing.usage && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Hours / Mileage
                        </span>
                        <span className="font-bold text-slate-800">
                          {selectedListing.usage}
                        </span>
                      </div>
                    )}

                    <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Location
                        </span>
                        <span className="font-bold text-slate-800">
                          {selectedListing.location}
                        </span>
                      </div>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(selectedListing.location)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-[#0040DD] hover:underline inline-flex items-center gap-1"
                      >
                        <MapPin className="size-3" /> Map
                      </a>
                    </div>

                    {selectedListing.serialNumber && (
                      <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px]">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold font-sans">
                          VIN / Serial Number
                        </span>
                        <span className="font-bold text-slate-900 tracking-wider">
                          {selectedListing.serialNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Full Description */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Seller Description
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                      {selectedListing.description}
                    </p>
                  </div>
                </div>

                {/* Seller Contact & 1-Click Actions */}
                <div className="rounded-2xl border border-slate-200 p-4 space-y-4 bg-white flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <User className="size-4 text-[#16A34A]" /> Seller Profile
                    </h3>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">
                          {selectedListing.seller.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-[#0040DD] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Prefers: {CONTACT_LABEL[selectedListing.seller.preferredContact]}
                        </span>
                      </div>

                      {selectedListing.seller.company && (
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Building2 className="size-3 text-slate-400" />
                          {selectedListing.seller.company}
                        </p>
                      )}

                      {selectedListing.seller.bestTime && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="size-3 text-slate-400" />
                          Best Time: {selectedListing.seller.bestTime}
                        </p>
                      )}
                    </div>

                    {/* Direct Contact Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <a
                        href={`tel:${selectedListing.seller.phone}`}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors text-center"
                      >
                        <Phone className="size-5 mb-1 text-[#16A34A]" />
                        <span className="text-[11px] font-black">Call</span>
                        <span className="text-[9.5px] text-emerald-600 truncate max-w-full">
                          {selectedListing.seller.phone}
                        </span>
                      </a>

                      <a
                        href={`sms:${selectedListing.seller.phone}`}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors text-center"
                      >
                        <MessageSquare className="size-5 mb-1 text-[#0040DD]" />
                        <span className="text-[11px] font-black">Text SMS</span>
                        <span className="text-[9.5px] text-blue-600">Send Msg</span>
                      </a>

                      <a
                        href={`mailto:${selectedListing.seller.email}?subject=${encodeURIComponent(`M3 Rental Houston — Offer regarding your ${selectedListing.title}`)}`}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors text-center"
                      >
                        <Mail className="size-5 mb-1 text-purple-600" />
                        <span className="text-[11px] font-black">Email</span>
                        <span className="text-[9.5px] text-purple-600 truncate max-w-full">
                          {selectedListing.seller.email}
                        </span>
                      </a>
                    </div>
                  </div>

                  {/* Asking vs Counter Offer Summary */}
                  <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Seller's Asking Price:</span>
                      <span className="text-base font-black text-white">
                        ${selectedListing.askingPrice.toLocaleString()}
                        {selectedListing.negotiable && (
                          <span className="text-[10px] text-emerald-300 ml-1">
                            (OBO)
                          </span>
                        )}
                      </span>
                    </div>

                    {selectedListing.offerAmount ? (
                      <div className="flex items-center justify-between text-xs text-emerald-300 pt-2 border-t border-slate-700">
                        <span>M3 Counter-Offer:</span>
                        <span className="text-base font-black text-[#4ADE80]">
                          ${selectedListing.offerAmount.toLocaleString()}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* ── DEAL-FIXING & OWNER NEGOTIATION FORM ── */}
              <div className="rounded-2xl border-2 border-[#0040DD]/30 bg-blue-50/30 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Handshake className="size-4 text-[#0040DD]" />
                    Fix the Deal &amp; Acquisition Controls
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    Saves directly to MongoDB Atlas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Deal Status Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Deal Stage / Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as SellStatus)}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0040DD]"
                    >
                      {SELL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Negotiated Purchase / Counter-Offer */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      M3 Counter-Offer / Agreed Price (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editOffer}
                        onChange={(e) =>
                          setEditOffer(e.target.value.replace(/[^\d.]/g, ""))
                        }
                        placeholder={`e.g. ${Math.round(selectedListing.askingPrice * 0.85)}`}
                        className="w-full h-11 pl-8 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-900 outline-none focus:border-[#0040DD]"
                      />
                    </div>
                  </div>

                  {/* Private Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Private Inspection &amp; Deal Notes
                    </label>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="e.g. Called seller on Oct 16. Unit inspected at Houston yard. Engine runs clean, tires at 80%. Countered at $22,000 cash; seller agreed. Delivery scheduled for Friday."
                      className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-[#0040DD] leading-relaxed"
                    />
                  </div>
                </div>

                {/* Footer Controls inside Deal Box */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-blue-200/60">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDelete(selectedListing.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" /> Delete Inquiry
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedListing(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      disabled={isSavingDeal}
                      onClick={handleSaveDeal}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0040DD] hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSavingDeal ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      <span>Save Deal Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX FULLSCREEN IMAGE PREVIEW ── */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
          onClick={() => setZoomedImage(null)}
        >
          <button
            type="button"
            onClick={() => setZoomedImage(null)}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="size-6" />
          </button>
          <img
            src={zoomedImage}
            alt="Fullscreen equipment photo"
            className="max-w-full max-h-[92vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
