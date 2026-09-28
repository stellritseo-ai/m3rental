import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bus,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock,
  Layers,
  RotateCcw,
  Search,
  Sparkles,
  Truck,
  UserCheck,
  Wrench,
  X,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { categories } from "@/data/equipment";
import { cleanSearch } from "@/lib/search";

export function QuickSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [operator, setOperator] = useState("");
  const [period, setPeriod] = useState("");

  const hasActiveFilters = Boolean(query || category || price || operator || period);

  const resetFilters = () => {
    setQuery("");
    setCategory("");
    setPrice("");
    setOperator("");
    setPeriod("");
  };

  const submit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    navigate({
      to: "/equipment",
      search: cleanSearch({ q: query, category, price, operator, period }),
    });
  };

  const quickCategories = [
    { id: "", label: "All Fleet", icon: Sparkles },
    { id: "pickup-trucks", label: "Pickup Trucks", icon: Truck },
    { id: "trailers", label: "Trailers", icon: Layers },
    { id: "construction-equipment", label: "Construction", icon: Wrench },
    { id: "buses", label: "Passenger Vans", icon: Bus },
  ];

  return (
    <div className="w-full">
      {/* ── Quick-Select Interactive Category Chips ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        {quickCategories.map((item) => {
          const Icon = item.icon;
          const isActive = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(isActive && item.id !== "" ? "" : item.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-2xs ${
                isActive
                  ? "bg-[#0040DD] text-white shadow-sm ring-2 ring-[#0040DD]/30 scale-[1.02]"
                  : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              <Icon className={`size-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Search Console Frame ── */}
      <form
        onSubmit={submit}
        className="rounded-[10px] border border-slate-200/90 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/70 p-4 sm:p-6 lg:p-7 shadow-[0_12px_35px_-8px_rgba(15,23,42,0.08)] relative"
      >
        {/* Primary Keyword Search Bar */}
        <div className="relative flex items-center gap-2.5 rounded-[10px] border border-slate-200/90 bg-white px-3.5 py-2 shadow-2xs focus-within:border-[#0040DD] focus-within:ring-2 focus-within:ring-[#0040DD]/15 transition-all">
          <div className="size-9 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#0040DD] shrink-0 shadow-2xs">
            <Search className="size-4.5 text-[#0040DD]" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search equipment, vehicles, trailers by name or type..."
            className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* 4 Segmented Filter Dropdowns */}
        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Category */}
          <div className="relative flex items-center rounded-[10px] border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 focus-within:border-[#0040DD] focus-within:ring-2 focus-within:ring-[#0040DD]/15 transition-all">
            <div className="pl-3 text-slate-400 pointer-events-none shrink-0">
              <Layers className="size-4 text-[#0040DD]" />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none bg-transparent py-3 pl-2.5 pr-8 text-xs sm:text-[13px] font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 size-4 text-slate-400" />
          </div>

          {/* 2. Price Range */}
          <div className="relative flex items-center rounded-[10px] border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 focus-within:border-[#0040DD] focus-within:ring-2 focus-within:ring-[#0040DD]/15 transition-all">
            <div className="pl-3 text-slate-400 pointer-events-none shrink-0">
              <CircleDollarSign className="size-4 text-[#16A34A]" />
            </div>
            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full appearance-none bg-transparent py-3 pl-2.5 pr-8 text-xs sm:text-[13px] font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">Any Daily Rate</option>
              <option value="0-100">$0–$100 / day</option>
              <option value="100-200">$100–$200 / day</option>
              <option value="200-300">$200–$300 / day</option>
              <option value="300-plus">$300+ / day</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 size-4 text-slate-400" />
          </div>

          {/* 3. Operator Option */}
          <div className="relative flex items-center rounded-[10px] border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 focus-within:border-[#0040DD] focus-within:ring-2 focus-within:ring-[#0040DD]/15 transition-all">
            <div className="pl-3 text-slate-400 pointer-events-none shrink-0">
              <UserCheck className="size-4 text-[#F59E0B]" />
            </div>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full appearance-none bg-transparent py-3 pl-2.5 pr-8 text-xs sm:text-[13px] font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">Operator Option</option>
              <option value="with">Operator Included</option>
              <option value="self">Self-Operated</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 size-4 text-slate-400" />
          </div>

          {/* 4. Rental Duration */}
          <div className="relative flex items-center rounded-[10px] border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 focus-within:border-[#0040DD] focus-within:ring-2 focus-within:ring-[#0040DD]/15 transition-all">
            <div className="pl-3 text-slate-400 pointer-events-none shrink-0">
              <Clock className="size-4 text-[#0040DD]" />
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full appearance-none bg-transparent py-3 pl-2.5 pr-8 text-xs sm:text-[13px] font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">Rental Duration</option>
              <option value="daily">Daily Rental</option>
              <option value="weekly">Weekly Rental</option>
              <option value="monthly">Monthly Rental</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 size-4 text-slate-400" />
          </div>
        </div>

        {/* ── Console Action Bar ── */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 border-t border-slate-200/80">
          {/* Live Inventory Status */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[#16A34A]" />
            </span>
            <span>70+ equipment units ready for Houston yard pickup or site delivery</span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-white active:scale-95 transition-all"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="submit"
              className="btn-base btn-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider w-full sm:w-auto justify-center shadow-md hover:shadow-lg active:scale-95 transition-all px-5 py-2.5"
            >
              <Search className="size-4" />
              <span>Find Equipment</span>
            </button>
          </div>
        </div>
      </form>

      {/* ── Bottom Micro-Trust Guarantee Badges ── */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-[#16A34A]" />
          <span>Cash, Zelle, Cash App & Cards</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-[#0040DD]" />
          <span>No Credit Card Required</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-[#F59E0B]" />
          <span>Operator-Supported Options</span>
        </span>
      </div>
    </div>
  );
}

export function QuickSearchSection() {
  return (
    <section
      className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 transition-all duration-300"
      style={{ margin: "15px" }}
    >
      {/* Ambient background glow blooms */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-80 w-80 rounded-full bg-[#0040DD]/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[#16A34A]/5 blur-3xl" />
      </div>

      <div className="w-full max-w-[94rem] mx-auto relative z-10">
        <Reveal className="text-center max-w-3xl mx-auto">
          {/* Eyebrow Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0040DD]/20 bg-blue-50/80 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-[#0040DD] shadow-2xs">
            <Sparkles className="size-3.5 text-[#0040DD]" />
            <span>Fast Equipment Finder</span>
            <Sparkles className="size-3.5 text-[#0040DD]" />
          </span>

          {/* Section Headline */}
          <h2 className="mt-3 font-display text-[26px] sm:text-[34px] md:text-[38px] font-black tracking-tight leading-[1.2] text-slate-900">
            Find the Right Equipment for{" "}
            <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
              Your Job.
            </span>
          </h2>

          <p className="mt-2.5 text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Search our extensive inventory of heavy trucks, trailers, construction earthmovers, and specialty utility equipment.
          </p>
        </Reveal>

        {/* Search Console */}
        <Reveal delay={100} className="mx-auto mt-8 max-w-5xl">
          <QuickSearch />
        </Reveal>
      </div>
    </section>
  );
}
