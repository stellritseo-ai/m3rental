import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  X,
  ArrowRight,
  Clock,
  Sparkles,
  Truck,
  Tag,
  ChevronRight,
  Calendar,
  Eye,
  BookOpen,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Command,
} from "lucide-react";
import { useManagedFleet } from "@/lib/dashboard-store";
import { getBlogPostsDb } from "@/lib/api/blog.functions";
import type { Equipment } from "@/data/equipment";
import type { BlogPostDoc } from "@/lib/blog-shared";
import { cleanSearch } from "@/lib/search";

interface HeaderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  { label: "CAT Excavator", q: "excavator" },
  { label: "Boom Lift", q: "boom" },
  { label: "Dump Trailer", q: "dump" },
  { label: "50-Ton Crane", q: "crane" },
  { label: "Work Pickup", q: "pickup" },
  { label: "Lowboy Trailer", q: "lowboy" },
];

const POPULAR_CATEGORIES = [
  { label: "Heavy Equipment", to: "/equipment?category=construction-equipment", count: "25+ Units" },
  { label: "Commercial Trucks", to: "/equipment?category=trucks", count: "18+ Units" },
  { label: "Trailers & Haulers", to: "/equipment?category=trailers", count: "20+ Units" },
  { label: "Safety Equipment", to: "/equipment?category=safety-equipment", count: "10+ Sets" },
];

export function HeaderSearchModal({ isOpen, onClose }: HeaderSearchModalProps) {
  const navigate = useNavigate();
  const { fleet } = useManagedFleet();
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<BlogPostDoc[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "equipment" | "articles">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load blog articles for search
  useEffect(() => {
    if (!isOpen) return;
    getBlogPostsDb({ data: { limit: 20 } })
      .then((res) => {
        if (res && res.posts) {
          setArticles(res.posts);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Filter matching equipment
  const matchingEquipment = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fleet.slice(0, 4);

    return fleet
      .filter((eq) => {
        return (
          eq.name.toLowerCase().includes(q) ||
          eq.type.toLowerCase().includes(q) ||
          eq.category.toLowerCase().includes(q) ||
          (eq.summary && eq.summary.toLowerCase().includes(q)) ||
          (eq.specs && eq.specs.toLowerCase().includes(q)) ||
          (eq.features && eq.features.some((f) => f.toLowerCase().includes(q)))
        );
      })
      .slice(0, 6);
  }, [fleet, query]);

  // Filter matching articles
  const matchingArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles.slice(0, 3);

    return articles
      .filter((art) => {
        return (
          art.title.toLowerCase().includes(q) ||
          art.category.toLowerCase().includes(q) ||
          art.excerpt.toLowerCase().includes(q) ||
          (art.tags && art.tags.some((t) => t.toLowerCase().includes(q)))
        );
      })
      .slice(0, 4);
  }, [articles, query]);

  const totalResults = matchingEquipment.length + matchingArticles.length;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onClose();
    navigate({
      to: "/equipment",
      search: cleanSearch({ q: trimmed }),
    });
  };

  const handleSelectPopular = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-10 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-4 sm:my-8 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Top Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center px-5 sm:px-6 py-4 border-b border-slate-200 bg-white"
        >
          <Search className="size-5 text-[#0040DD] shrink-0 mr-3.5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search equipment, excavators, cranes, trucks, safety guides..."
            className="w-full text-base sm:text-lg font-semibold text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
          />

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="size-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                title="Clear input"
              >
                <X className="size-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider transition-colors hidden sm:block"
            >
              ESC
            </button>
          </div>
        </form>

        {/* Filter Pills row when search query exists */}
        {query.trim() && (
          <div className="px-6 py-2.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeFilter === "all"
                    ? "bg-[#0040DD] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200"
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveFilter("equipment")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeFilter === "equipment"
                    ? "bg-[#0040DD] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200"
                }`}
              >
                Equipment ({matchingEquipment.length})
              </button>
              <button
                onClick={() => setActiveFilter("articles")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeFilter === "articles"
                    ? "bg-[#0040DD] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200"
                }`}
              >
                Articles & Guides ({matchingArticles.length})
              </button>
            </div>

            <button
              onClick={() => handleSubmit()}
              className="text-xs font-bold text-[#0040DD] hover:underline flex items-center gap-1 hidden sm:inline-flex"
            >
              View in Catalog
              <ArrowRight className="size-3" />
            </button>
          </div>
        )}

        {/* Search Results / Default Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ── 1. If Query is empty: Show Popular searches, Categories, and Featured Units ── */}
          {!query.trim() ? (
            <div className="space-y-6">
              {/* Popular Searches Pills */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="size-3 text-amber-500" />
                  Popular Equipment Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleSelectPopular(item.q)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#0040DD] hover:border-blue-200 text-slate-700 text-xs font-bold border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Search className="size-3 text-slate-400" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fleet Categories */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Layers className="size-3 text-blue-500" />
                  Browse Fleet by Category
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {POPULAR_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.label}
                      to={cat.to}
                      onClick={onClose}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 transition-all group block text-left"
                    >
                      <p className="text-xs font-black text-slate-900 group-hover:text-[#0040DD] transition-colors leading-snug">
                        {cat.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{cat.count}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Available Machinery */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Truck className="size-3 text-emerald-500" />
                    Ready for Houston Dispatch
                  </p>
                  <Link
                    to="/equipment"
                    onClick={onClose}
                    className="text-xs font-bold text-[#0040DD] hover:underline flex items-center gap-1"
                  >
                    View All 70+ Units <ArrowRight className="size-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fleet.slice(0, 4).map((eq) => (
                    <Link
                      key={eq.slug}
                      to="/equipment/$slug"
                      params={{ slug: eq.slug }}
                      onClick={onClose}
                      className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-300 transition-all shadow-xs flex items-center gap-3.5 group"
                    >
                      <img
                        src={eq.image}
                        alt={eq.name}
                        className="size-14 rounded-xl object-cover shrink-0 bg-slate-100 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          {eq.type || eq.category}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-[#0040DD] transition-colors">
                          {eq.name}
                        </h4>
                        <p className="text-xs font-black text-emerald-600 mt-0.5">
                          ${eq.dayRate} <span className="text-[10px] font-normal text-slate-400">/ day</span>
                        </p>
                      </div>
                      <ChevronRight className="size-4 text-slate-300 group-hover:text-[#0040DD] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : totalResults === 0 ? (
            /* ── 2. No Results Found Empty State ── */
            <div className="py-12 text-center">
              <div className="size-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Search className="size-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                No matches found for "{query}"
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Try searching for broader terms like "trailer", "excavator", "truck", or browse our
                complete fleet catalog.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  to="/equipment"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#0040DD] text-white text-xs font-black hover:bg-[#0034b0] transition-colors shadow-md"
                >
                  Browse Full Fleet
                </Link>
                <Link
                  to="/blog"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  Browse Blog & Guides
                </Link>
              </div>
            </div>
          ) : (
            /* ── 3. Live Matching Results ── */
            <div className="space-y-6">
              {/* Equipment Matches */}
              {(activeFilter === "all" || activeFilter === "equipment") &&
                matchingEquipment.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Truck className="size-3 text-[#0040DD]" />
                        Matching Fleet Machinery ({matchingEquipment.length})
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {matchingEquipment.map((eq) => (
                        <Link
                          key={eq.slug}
                          to="/equipment/$slug"
                          params={{ slug: eq.slug }}
                          onClick={onClose}
                          className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all shadow-xs flex items-center gap-3.5 group"
                        >
                          <img
                            src={eq.image}
                            alt={eq.name}
                            className="size-16 rounded-xl object-cover shrink-0 bg-slate-100 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                              {eq.type || eq.category}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 truncate group-hover:text-[#0040DD] transition-colors">
                              {eq.name}
                            </h4>
                            <p className="text-xs font-black text-emerald-600 mt-1">
                              ${eq.dayRate}{" "}
                              <span className="text-[10px] font-normal text-slate-400">/ day</span>
                            </p>
                          </div>
                          <ChevronRight className="size-4 text-slate-300 group-hover:text-[#0040DD] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              {/* Blog Article Matches */}
              {(activeFilter === "all" || activeFilter === "articles") &&
                matchingArticles.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="size-3 text-indigo-500" />
                        Articles & Operational Guides ({matchingArticles.length})
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {matchingArticles.map((art) => (
                        <Link
                          key={art.slug}
                          to="/blog/$slug"
                          params={{ slug: art.slug }}
                          onClick={onClose}
                          className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all shadow-xs flex items-center gap-4 group"
                        >
                          <img
                            src={art.coverImage}
                            alt={art.title}
                            className="size-14 rounded-xl object-cover shrink-0 bg-slate-900 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                {art.category}
                              </span>
                              <span className="text-[10px] text-slate-400">• {art.readTime}</span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                              {art.title}
                            </h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{art.excerpt}</p>
                          </div>
                          <ArrowRight className="size-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Modal Footer / Fast Search CTA */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
              ↵ Enter
            </span>
            <span className="hidden sm:inline">to view full catalog results</span>
          </div>

          <button
            onClick={() => handleSubmit()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0040DD] hover:bg-[#0034b0] text-white font-bold text-xs transition-colors shadow-xs"
          >
            Search Catalog
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
