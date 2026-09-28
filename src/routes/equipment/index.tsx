import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Truck,
  UserCheck,
  WalletCards,
  X,
  ChevronDown,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EquipmentCard } from "@/components/site/EquipmentCard";
import { Reveal } from "@/components/site/Reveal";
import { categories, equipment, type CategoryId } from "@/data/equipment";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { cleanSearch, readString } from "@/lib/search";

type Search = {
  q?: string;
  category?: string;
  price?: string;
  operator?: string;
  period?: string;
  sort?: string;
};

export const Route = createFileRoute("/equipment/")({
  validateSearch: (search: Record<string, unknown>): Search =>
    cleanSearch({
      q: readString(search, "q"),
      category: readString(search, "category"),
      price: readString(search, "price"),
      operator: readString(search, "operator"),
      period: readString(search, "period"),
      sort: readString(search, "sort"),
    }),
  head: () => ({
    meta: [
      { title: "Equipment Catalog | M3 Rental Houston Equipment & Vehicle Rentals" },
      {
        name: "description",
        content:
          "Browse M3 Rental's Houston inventory: pickup trucks, trailers, dump haulers, construction machinery, and utility equipment with daily rates and flexible payments.",
      },
      { property: "og:title", content: "Equipment Catalog | M3 Rental Houston" },
      {
        property: "og:description",
        content:
          "Filter by category, price, operator availability and rental period, then request your rental in Houston, TX.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogPage,
});

const priceBands = [
  { id: "0-100", label: "Under $100", test: (n: number) => n <= 100 },
  { id: "100-200", label: "$100 – $200", test: (n: number) => n > 100 && n <= 200 },
  { id: "200-300", label: "$200 – $300", test: (n: number) => n > 200 && n <= 300 },
  { id: "300-plus", label: "$300+", test: (n: number) => n > 300 },
];

const operatorFilters = [
  { id: "operator", label: "Operator Included" },
  { id: "driver", label: "Driver Included" },
  { id: "self", label: "Self Operated" },
  { id: "with", label: "Any Operator Option" },
];

const periods = [
  { id: "daily", label: "Daily Rate" },
  { id: "weekly", label: "Weekly Rate" },
  { id: "monthly", label: "Monthly Discount" },
];

const sorts = [
  { id: "featured", label: "Featured Fleet" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "newest", label: "Newest Model" },
  { id: "popular", label: "Most Popular" },
];

function CatalogPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const setParam = (key: keyof Search, value?: string) => {
    navigate({
      search: (prev: Search) =>
        cleanSearch({
          ...prev,
          [key]: prev[key] === value ? undefined : value,
        }),
      resetScroll: false,
    });
  };

  const clearFilters = () => {
    navigate({
      search: () => ({}),
      resetScroll: false,
    });
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    equipment.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  const results = useMemo(() => {
    const query = search.q?.toLowerCase().trim();
    const band = priceBands.find((b) => b.id === search.price);

    let list = equipment.filter((item) => {
      if (
        query &&
        ![item.name, item.type, item.summary, item.color ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
        return false;
      if (search.category && item.category !== search.category) return false;
      if (band && !band.test(item.dayRate)) return false;
      if (search.operator === "with" && item.operator === "self") return false;
      if (search.operator === "self" && item.operator !== "self") return false;
      if (search.operator === "operator" && item.operator !== "operator") return false;
      if (
        search.operator === "driver" &&
        !(item.operator === "driver" || item.operator === "driver-operator")
      )
        return false;
      if (search.period === "monthly" && !item.monthRate) return false;
      return true;
    });

    if (search.sort === "price-asc") {
      list = [...list].sort((a, b) => a.dayRate - b.dayRate);
    } else if (search.sort === "price-desc") {
      list = [...list].sort((a, b) => b.dayRate - a.dayRate);
    } else if (search.sort === "newest") {
      list = [...list].sort((a, b) => Number(b.year ?? 0) - Number(a.year ?? 0));
    } else if (search.sort === "popular" || search.sort === "featured") {
      list = [...list].sort(
        (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
      );
    }

    return list;
  }, [search]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.q) count++;
    if (search.category) count++;
    if (search.price) count++;
    if (search.operator) count++;
    if (search.period) count++;
    return count;
  }, [search]);

  const activeCategoryLabel = useMemo(() => {
    if (!search.category) return null;
    return categories.find((c) => c.id === search.category)?.label || search.category;
  }, [search.category]);

  const activePriceLabel = useMemo(() => {
    if (!search.price) return null;
    return priceBands.find((b) => b.id === search.price)?.label || search.price;
  }, [search.price]);

  const activeOperatorLabel = useMemo(() => {
    if (!search.operator) return null;
    return operatorFilters.find((o) => o.id === search.operator)?.label || search.operator;
  }, [search.operator]);

  const activePeriodLabel = useMemo(() => {
    if (!search.period) return null;
    return periods.find((p) => p.id === search.period)?.label || search.period;
  }, [search.period]);

  return (
    <SiteLayout>
      {/* ── 1. HERO COMMAND HEADER (Framed Card Container) ── */}
      <section
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[14px] mx-auto mt-4 max-w-[94rem]"
        style={{ margin: "15px auto", padding: "40px 24px" }}
      >
        {/* Ambient atmospheric blooms */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 w-[460px] h-[460px] rounded-full bg-[#0040DD]/[0.04] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-[#16A34A]/[0.05] blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[11px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
            </span>
            <span>Houston Fleet Inventory • 70+ Units Ready</span>
            <Sparkles className="size-3 text-[#0040DD]" />
          </div>

          {/* Headline */}
          <h1 className="text-slate-900 font-black tracking-tight leading-[1.18] text-[24px] sm:text-[32px] md:text-[38px] font-display">
            Commercial Trucks, Trailers &{" "}
            <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
              Heavy Equipment in Houston.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3.5 max-w-2xl mx-auto text-[13.5px] sm:text-[15px] text-slate-500 font-medium leading-relaxed">
            Inspected pickups, goosenecks, dump trailers, vans, and earthmovers available for rapid
            yard pickup on S Wilcrest Dr or same-day Houston jobsite delivery.
          </p>

          {/* Trust Highlights Strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-bold text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200/80 px-3 py-1 shadow-2xs">
              <Clock className="size-3.5 text-[#0040DD]" />
              <span>15-Min Yard Pickup</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200/80 px-3 py-1 shadow-2xs">
              <WalletCards className="size-3.5 text-[#16A34A]" />
              <span>$0 Mandatory Credit Card</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200/80 px-3 py-1 shadow-2xs">
              <UserCheck className="size-3.5 text-[#F59E0B]" />
              <span>Certified Machine Operators</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200/80 px-3 py-1 shadow-2xs">
              <Truck className="size-3.5 text-[#0040DD]" />
              <span>Houston Jobsite Delivery</span>
            </span>
          </div>

          {/* ── Search & Filter Command Bar ── */}
          <div className="mt-8 rounded-2xl bg-white border border-slate-200/90 p-3 sm:p-4 shadow-[0_10px_35px_-8px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search input with icons */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#0040DD]" />
                <input
                  type="text"
                  value={search.q ?? ""}
                  onChange={(e) =>
                    navigate({
                      search: (prev: Search) =>
                        cleanSearch({ ...prev, q: e.target.value }),
                      resetScroll: false,
                    })
                  }
                  placeholder="Search fleet by name, trailer hitch, payload, vehicle model..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-10 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0040DD] focus:bg-white focus:ring-3 focus:ring-[#0040DD]/15 transition-all shadow-inner"
                />
                {search.q && (
                  <button
                    type="button"
                    onClick={() => setParam("q", undefined)}
                    aria-label="Clear search text"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="relative sm:w-60 shrink-0">
                <select
                  value={search.sort ?? "featured"}
                  onChange={(e) => setParam("sort", e.target.value)}
                  aria-label="Sort equipment"
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 pr-10 text-sm font-semibold text-slate-800 outline-none focus:border-[#0040DD] focus:bg-white focus:ring-3 focus:ring-[#0040DD]/15 transition-all cursor-pointer shadow-inner"
                >
                  {sorts.map((s) => (
                    <option key={s.id} value={s.id}>
                      Sort: {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              </div>
            </div>

            {/* ── Quick Category Carousel / Horizontal Tabs Bar ── */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <button
                type="button"
                onClick={() => setParam("category", undefined)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer select-none",
                  !search.category
                    ? "bg-[#0040DD] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900",
                )}
              >
                All Fleet ({equipment.length})
              </button>

              {categories.map((c) => {
                const count = categoryCounts[c.id] || 0;
                const isActive = search.category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setParam("category", c.id)}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1.5",
                      isActive
                        ? "bg-[#0040DD] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900",
                    )}
                  >
                    <span>{c.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-black",
                        isActive ? "bg-white/25 text-white" : "bg-white text-slate-500",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN CATALOG AREA (Sidebar + Results Grid) ── */}
      <section
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[14px] mx-auto my-4 max-w-[94rem] p-4 sm:p-6 lg:p-8"
        style={{ margin: "15px auto" }}
      >
        <div className="grid gap-8 lg:grid-cols-[17.5rem_1fr] items-start">
          {/* ── DESKTOP STICKY FILTER SIDEBAR ── */}
          <aside className="hidden lg:block lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 shadow-xs">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/70">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-[#0040DD]" />
                  <span className="text-sm font-black uppercase tracking-wider text-slate-900 font-display">
                    Refine Fleet
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="size-5 rounded-full bg-[#0040DD] text-white text-[10px] font-black flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0040DD] hover:underline cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Filter 1: Categories */}
              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                  Vehicle & Equipment Type
                </p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setParam("category", undefined)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                      !search.category
                        ? "bg-[#0040DD] text-white shadow-xs font-black"
                        : "text-slate-700 hover:bg-slate-200/60",
                    )}
                  >
                    <span>All Fleet Categories</span>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-black",
                        !search.category ? "bg-white/20 text-white" : "bg-white text-slate-500",
                      )}
                    >
                      {equipment.length}
                    </span>
                  </button>

                  {categories.map((c) => {
                    const count = categoryCounts[c.id] || 0;
                    const isActive = search.category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setParam("category", c.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                          isActive
                            ? "bg-[#0040DD] text-white shadow-xs font-black"
                            : "text-slate-700 hover:bg-slate-200/60",
                        )}
                      >
                        <span className="truncate">{c.label}</span>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-black shrink-0",
                            isActive ? "bg-white/20 text-white" : "bg-white text-slate-500",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter 2: Daily Price Range */}
              <div className="mt-6 pt-5 border-t border-slate-200/70">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                  Daily Rental Rate
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {priceBands.map((b) => (
                    <Chip
                      key={b.id}
                      active={search.price === b.id}
                      onClick={() => setParam("price", b.id)}
                    >
                      {b.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Filter 3: Operator / Driver */}
              <div className="mt-6 pt-5 border-t border-slate-200/70">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                  Driver & Operator Option
                </p>
                <div className="flex flex-col gap-1.5">
                  {operatorFilters.map((o) => (
                    <Chip
                      key={o.id}
                      active={search.operator === o.id}
                      onClick={() => setParam("operator", o.id)}
                      fullWidth
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Filter 4: Rental Period */}
              <div className="mt-6 pt-5 border-t border-slate-200/70">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                  Rental Term
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {periods.map((p) => (
                    <Chip
                      key={p.id}
                      active={search.period === p.id}
                      onClick={() => setParam("period", p.id)}
                    >
                      {p.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* ── Houston Yard Help Card ── */}
              <div className="mt-6 pt-5 border-t border-slate-200/70">
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50/70 border border-blue-200/70 p-4 text-center">
                  <div className="mx-auto size-9 rounded-full bg-white shadow-xs flex items-center justify-center text-[#0040DD] mb-2">
                    <Phone className="size-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Need Custom Dispatch?
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                    Call our Houston yard for multi-day contractor discounts or heavy operator bookings.
                  </p>
                  <a
                    href={site.phoneHref}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-xs"
                  >
                    <span>Call {site.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* ── RESULTS COLUMN ── */}
          <div>
            {/* Results Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <p className="text-sm font-bold text-slate-900">
                  Showing <span className="text-[#0040DD] font-black">{results.length}</span> of{" "}
                  {equipment.length} commercial units
                </p>
                <div className="h-4 w-px bg-slate-200" />
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <span className="size-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>Yard Open Mon–Sat 7AM–7PM</span>
                </span>
              </div>

              {/* Mobile Filter Toggle Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen((prev) => !prev)}
                  className="lg:hidden inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <SlidersHorizontal className="size-3.5 text-[#0040DD]" />
                  <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                </button>

                <a
                  href={site.phoneHref}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#0040DD] hover:underline"
                >
                  <Phone className="size-3 text-[#16A34A]" />
                  <span>Call {site.phone}</span>
                </a>
              </div>
            </div>

            {/* Mobile Expandable Filters Panel */}
            {mobileFiltersOpen && (
              <div className="lg:hidden mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Filter Options
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-bold text-[#0040DD] hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Price band on mobile */}
                <div className="mt-3">
                  <span className="block text-[11px] font-black uppercase text-slate-500 mb-2">
                    Daily Rate
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {priceBands.map((b) => (
                      <Chip
                        key={b.id}
                        active={search.price === b.id}
                        onClick={() => setParam("price", b.id)}
                      >
                        {b.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Operator on mobile */}
                <div className="mt-3 pt-3 border-t border-slate-200/70">
                  <span className="block text-[11px] font-black uppercase text-slate-500 mb-2">
                    Operator Option
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {operatorFilters.map((o) => (
                      <Chip
                        key={o.id}
                        active={search.operator === o.id}
                        onClick={() => setParam("operator", o.id)}
                      >
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-[#0040DD] text-white text-xs font-black uppercase tracking-wider shadow-sm"
                >
                  View {results.length} Units
                </button>
              </div>
            )}

            {/* ── Active Filter Badges Strip ── */}
            {activeFilterCount > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mr-1">
                  Active:
                </span>

                {search.q && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs">
                    <span>"{search.q}"</span>
                    <button
                      type="button"
                      onClick={() => setParam("q", undefined)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {activeCategoryLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#0040DD]/30 px-2.5 py-1 text-xs font-semibold text-[#0040DD] shadow-2xs">
                    <span>{activeCategoryLabel}</span>
                    <button
                      type="button"
                      onClick={() => setParam("category", undefined)}
                      className="text-[#0040DD]/70 hover:text-[#0040DD]"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {activePriceLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs">
                    <span>{activePriceLabel}</span>
                    <button
                      type="button"
                      onClick={() => setParam("price", undefined)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {activeOperatorLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-900 shadow-2xs">
                    <span>{activeOperatorLabel}</span>
                    <button
                      type="button"
                      onClick={() => setParam("operator", undefined)}
                      className="text-amber-700 hover:text-amber-950"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                {activePeriodLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs">
                    <span>{activePeriodLabel}</span>
                    <button
                      type="button"
                      onClick={() => setParam("period", undefined)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#0040DD] hover:underline cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>Clear All</span>
                </button>
              </div>
            )}

            {/* ── Results Grid ── */}
            {results.length === 0 ? (
              <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200/90 p-10 sm:p-14 text-center">
                <div className="mx-auto size-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mb-4">
                  <Search className="size-7 text-[#0040DD]" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900">
                  No Matching Equipment Found
                </h3>
                <p className="mt-2 text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                  We have units arriving daily at our S Wilcrest Dr yard. Try resetting your filter criteria or call our dispatch desk directly.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0040DD] hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Clear All Filters</span>
                  </button>
                  <a
                    href={site.phoneHref}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-sm transition-all"
                  >
                    <Phone className="size-3.5 text-[#16A34A]" />
                    <span>Call Yard: {site.phone}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((item, index) => (
                  <Reveal key={item.slug} delay={(index % 3) * 60} as="div">
                    <EquipmentCard item={item} className="h-full" />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 3. BOTTOM HOUSTON CONTRACTOR & FLEET GUARANTEE ── */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4 flex items-start gap-3">
              <div className="size-9 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#0040DD] shrink-0 mt-0.5">
                <Clock className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-slate-900">
                  15-Min Yard Pickup
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1">
                  Arrive at S Wilcrest Dr, inspect, sign, and drive away in under 15 minutes.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4 flex items-start gap-3">
              <div className="size-9 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#16A34A] shrink-0 mt-0.5">
                <WalletCards className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-slate-900">
                  $0 CC Requirement
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1">
                  Cash, Zelle, Cash App & debit cards accepted with zero corporate credit checks.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4 flex items-start gap-3">
              <div className="size-9 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#F59E0B] shrink-0 mt-0.5">
                <UserCheck className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-slate-900">
                  Certified Operators
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1">
                  Rent backhoes, bucket trucks & heavy haulers with skilled machine operators.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4 flex items-start gap-3">
              <div className="size-9 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#0040DD] shrink-0 mt-0.5">
                <Truck className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-slate-900">
                  Jobsite Delivery
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1">
                  Prompt flatbed and driveaway delivery anywhere across Greater Houston.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Chip({
  active,
  onClick,
  fullWidth,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer text-center select-none",
        fullWidth && "w-full text-left flex items-center justify-between",
        active
          ? "border-[#0040DD] bg-[#0040DD] text-white shadow-xs font-black"
          : "border-slate-200 bg-white text-slate-700 hover:border-[#0040DD] hover:text-[#0040DD] hover:bg-blue-50/40",
      )}
    >
      <span>{children}</span>
    </button>
  );
}
