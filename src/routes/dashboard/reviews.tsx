import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Star,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  X,
  Filter,
  Car,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  Building,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews & Reputation — M3 Rental Houston Dashboard" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardReviewsPage,
});

export interface CustomerReview {
  id: string;
  author: string;
  company?: string;
  email: string;
  vehicleSlug: string;
  vehicleName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  status: "published" | "pending" | "hidden";
  verifiedRenter: boolean;
}

const STORAGE_KEY_REVIEWS = "m3_rental_reviews_v1";

const SEED_REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    author: "Carlos Mendoza",
    company: "Mendoza General Contracting",
    email: "carlos.m@houstonbuild.com",
    vehicleSlug: "2008-honda-ridgeline-midsize-pickup",
    vehicleName: "2008 Honda Ridgeline Midsize Pickup Truck",
    rating: 5,
    date: "2026-10-04",
    title: "Bed trunk is a game changer for tools & Houston weather",
    comment:
      "Rented the Ridgeline for a three-day remodel job in Southwest Houston. The lockable in-bed trunk kept all my Milwaukee power tools bone dry during an afternoon downpour. Clean truck, easy contactless pick-up.",
    status: "published",
    verifiedRenter: true,
  },
  {
    id: "rev-2",
    author: "Marcus Vance",
    company: "Vance Utility Lighting",
    email: "mvance@vanceelectric.net",
    vehicleSlug: "international-4300-bucket-truck",
    vehicleName: "International 4300 Heavy Bucket Truck",
    rating: 5,
    date: "2026-09-28",
    title: "Hydraulics inspected, delivered right to our jobsite on time",
    comment:
      "Dispatch was top notch. The bucket truck boom had fresh safety certs and operated smoothly on our 45ft commercial parking lot retrofit. Will definitely rent again next week.",
    status: "published",
    verifiedRenter: true,
  },
  {
    id: "rev-3",
    author: "Elena Rostova",
    company: "Lone Star Event Productions",
    email: "elena@lonestarevents.org",
    vehicleSlug: "24-passenger-commercial-shuttle-bus",
    vehicleName: "24-Passenger Commercial Shuttle Bus",
    rating: 5,
    date: "2026-09-20",
    title: "Cold dual AC and spotless interior for corporate group",
    comment:
      "Transferred 22 VIP executives from George Bush Intercontinental (IAH) to Downtown Houston. In 95-degree Texas heat, the air conditioning blew ice cold and the driver was thrilled with how smooth it handled.",
    status: "published",
    verifiedRenter: true,
  },
  {
    id: "rev-4",
    author: "Derrick Holbrook",
    company: "Holbrook Hauling & Dirt",
    email: "derrick@holbrookdirt.com",
    vehicleSlug: "2018-toyota-tundra-sr5-trd-off-road",
    vehicleName: "2018 Toyota Tundra SR5 TRD Off-Road CrewMax",
    rating: 5,
    date: "2026-09-12",
    title: "Solid 5.7L V8 tow capability for our equipment trailer",
    comment:
      "Needed a dependable tow rig while our primary dually was in the diesel shop. Hauled a 7,000-lb mini excavator across Beltway 8 with zero sweat. Reasonable daily rate too.",
    status: "published",
    verifiedRenter: true,
  },
];

function getStoredReviews(): CustomerReview[] {
  if (typeof window === "undefined") return SEED_REVIEWS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(SEED_REVIEWS));
      return SEED_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_REVIEWS;
  }
}

function saveStoredReviews(items: CustomerReview[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(items));
    window.dispatchEvent(new Event("m3-reviews-changed"));
  } catch (err) {
    console.error(err);
  }
}

import { getReviewsDb, updateReviewDb, deleteReviewDb } from "@/lib/api/reviews.functions";

function DashboardReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(getStoredReviews);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "pending" | "hidden">("all");
  const [isAddingModal, setIsAddingModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // New review form
  const [newAuthor, setNewAuthor] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newVehicleName, setNewVehicleName] = useState("2008 Honda Ridgeline Midsize Pickup Truck");
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");

  const loadData = async () => {
    setReviews(getStoredReviews());
    setIsSyncing(true);
    try {
      const res = await getReviewsDb();
      if (res && res.success && res.reviews && res.reviews.length > 0) {
        setReviews(res.reviews as unknown as CustomerReview[]);
        saveStoredReviews(res.reviews as unknown as CustomerReview[]);
      }
    } catch (e) {
      console.warn("DB reviews fetch fallback:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => setReviews(getStoredReviews());
    window.addEventListener("m3-reviews-changed", handleUpdate);
    return () => window.removeEventListener("m3-reviews-changed", handleUpdate);
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter !== "all" && r.rating !== ratingFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.author.toLowerCase().includes(q) ||
          (r.company || "").toLowerCase().includes(q) ||
          r.vehicleName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reviews, search, ratingFilter, statusFilter]);

  const toggleStatus = (id: string) => {
    let nextStatus: "published" | "hidden" = "published";
    const next = reviews.map((r) => {
      if (r.id !== id) return r;
      nextStatus = r.status === "published" ? "hidden" : "published";
      return { ...r, status: nextStatus };
    });
    setReviews(next);
    saveStoredReviews(next);
    updateReviewDb({ data: { id, status: nextStatus } }).catch(() => {});
    toast.success("Review visibility updated in MongoDB!");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this customer review?")) return;
    const next = reviews.filter((r) => r.id !== id);
    setReviews(next);
    saveStoredReviews(next);
    deleteReviewDb({ data: { id } }).catch(() => {});
    toast.success("Review deleted from MongoDB.");
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newTitle || !newComment) {
      toast.error("Please fill in author, title, and review comments.");
      return;
    }

    const created: CustomerReview = {
      id: `rev-${Date.now()}`,
      author: newAuthor,
      ...(newCompany ? { company: newCompany } : {}),
      email: newEmail || "client@houston.com",
      vehicleSlug: "2008-honda-ridgeline-midsize-pickup",
      vehicleName: newVehicleName,
      rating: newRating,
      date: new Date().toISOString().split("T")[0] ?? "2026-10-07",
      title: newTitle,
      comment: newComment,
      status: "published",
      verifiedRenter: true,
    };

    const next = [created, ...reviews];
    setReviews(next);
    saveStoredReviews(next);
    setIsAddingModal(false);

    // Reset form
    setNewAuthor("");
    setNewCompany("");
    setNewEmail("");
    setNewTitle("");
    setNewComment("");
    toast.success("Verified customer review added and published!");
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="space-y-6">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Star className="size-7 text-amber-500 fill-amber-500" />
            Customer Reviews & Reputation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage verified renter testimonials, equipment feedback, and Houston contractor ratings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-bold shadow-sm">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              MongoDB: <span className="text-emerald-400 font-bold">reviews</span>
            </span>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all active:scale-95"
            title="Reload from MongoDB"
          >
            <RefreshCw className={`size-3.5 text-slate-500 ${isSyncing ? "animate-spin text-[#0040DD]" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsAddingModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0040DD] hover:bg-[#0036ba] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0040DD]/20 transition-all"
          >
            <Plus className="size-4" />
            Add Verified Review
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Rating</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="size-4 fill-amber-500 text-amber-500" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">{avgRating} / 5.0</div>
          <div className="mt-1 text-xs text-slate-500">From {reviews.length} total reviews</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Published Online</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {reviews.filter((r) => r.status === "published").length}
          </div>
          <div className="mt-1 text-xs text-slate-500">Live on rental website</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Renters</span>
            <span className="p-2 rounded-xl bg-blue-50 text-[#0040DD]">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">100%</div>
          <div className="mt-1 text-xs text-slate-500">ID & transaction matched</div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">5-Star Ratio</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ThumbsUp className="size-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {Math.round((reviews.filter((r) => r.rating === 5).length / Math.max(1, reviews.length)) * 100)}%
          </div>
          <div className="mt-1 text-xs text-slate-500">Customer satisfaction index</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by author, vehicle, or review content..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]/30 focus:border-[#0040DD] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-slate-700"
          >
            <option value="all">All Stars (★)</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
            <MessageSquare className="size-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No reviews match your filters</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="size-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
                    {rev.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{rev.author}</span>
                      {rev.company && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {rev.company}
                        </span>
                      )}
                      {rev.verifiedRenter && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="size-3" />
                          Verified Renter
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Car className="size-3.5 text-[#0040DD]" />
                      <span className="font-medium text-slate-700">{rev.vehicleName}</span>
                      <span>•</span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                </div>

                {/* Stars & Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => toggleStatus(rev.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                      rev.status === "published"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {rev.status === "published" ? "Live" : "Hidden"}
                  </button>

                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Review Title & Body */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  "{rev.title}"
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Review Modal */}
      {isAddingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-5 my-4 sm:my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Star className="size-5 text-amber-500 fill-amber-500" />
                Add Verified Customer Testimonial
              </h3>
              <button
                onClick={() => setIsAddingModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Michael Thorne"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Contractor Name</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Thorne Electric Houston"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rented Vehicle *</label>
                <input
                  type="text"
                  required
                  value={newVehicleName}
                  onChange={(e) => setNewVehicleName(e.target.value)}
                  placeholder="e.g. 2008 Honda Ridgeline Midsize Pickup Truck"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Star Rating (1-5)</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold text-amber-600"
                  >
                    <option value={5}>★★★★★ (5 Stars - Outstanding)</option>
                    <option value={4}>★★★★☆ (4 Stars - Great)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Satisfactory)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@domain.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Headline *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Best utility pickup for Houston jobsites"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Comments *</label>
                <textarea
                  required
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write customer feedback, pickup yard experience, vehicle condition..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0040DD] text-white text-xs font-bold hover:bg-[#0036ba] shadow-xs"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
