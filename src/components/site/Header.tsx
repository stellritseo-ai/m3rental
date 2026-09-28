import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Car,
  ChevronDown,
  Clock,
  HardHat,
  Layers,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  UserCheck,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { cleanSearch } from "@/lib/search";
import logoImg from "@/assets/logo.png";

const nav = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Equipment", to: "/equipment", hasDropdown: true },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Why M3", to: "/#why-m3" },
  // { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

const equipmentCategories = [
  {
    to: "/equipment?category=pickup-trucks",
    label: "Work Trucks & Pickups",
    desc: "Half-ton to 1-ton crew cabs & heavy-duty haulers",
    icon: Truck,
    badge: "Popular",
    badgeColor: "bg-blue-50 text-[#0040DD] border-blue-200",
  },
  {
    to: "/equipment?category=trailers",
    label: "Hauling & Dump Trailers",
    desc: "Heavy equipment, utility, cargo & hydraulic dump trailers",
    icon: Layers,
    badge: "High Demand",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    to: "/equipment?category=construction-equipment",
    label: "Heavy Construction",
    desc: "Backhoe loaders, excavators & earthmoving machinery",
    icon: HardHat,
    badge: "Heavy-Duty",
    badgeColor: "bg-emerald-50 text-[#16A34A] border-emerald-200",
  },
  {
    to: "/equipment?operator=with",
    label: "Operator Included",
    desc: "Machinery provided with certified, skilled operators",
    icon: UserCheck,
    badge: "Turnkey",
    badgeColor: "bg-emerald-50 text-[#16A34A] border-emerald-200",
  },
  {
    to: "/equipment?category=cars",
    label: "Vehicles & Transport",
    desc: "Sedans, SUVs & passenger shuttle transportation",
    icon: Car,
    badge: "Available",
    badgeColor: "bg-blue-50 text-[#0040DD] border-blue-200",
  },
  {
    to: "/equipment?category=specialty-equipment",
    label: "Specialty & Utilities",
    desc: "Bucket trucks, mobile LED trailers & utility gear",
    icon: Wrench,
    badge: "Specialized",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

export function Header() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileEquipmentOpen, setMobileEquipmentOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setMobileEquipmentOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    setSearchOpen(false);
    navigate({
      to: "/equipment",
      search: cleanSearch({ q: trimmed }),
    });
  };

  return (
    <header
      className={cn(
        "sticky z-50 transition-all duration-300 bg-white",
        scrolled
          ? "top-0 inset-x-0 w-full rounded-none border-b border-x-0 border-t-0 border-slate-200/90 shadow-md"
          : "top-[15px] rounded-[10px] border border-slate-200/90 shadow-xs",
      )}
      style={{
        margin: scrolled ? "0px" : "15px",
        width: scrolled ? "100%" : "calc(100% - 30px)",
      }}
    >
      {/* ── TOP UTILITY BAR (Brown-style high-trust header) ── */}
      <div
        className={cn(
          "w-full bg-[#0A1124] text-white border-b border-white/10 px-3 sm:px-4 lg:px-6 transition-all duration-300 origin-top overflow-hidden rounded-t-[10px]",
          scrolled ? "max-h-0 py-0 opacity-0 border-none" : "max-h-14 py-2 sm:py-2.5 opacity-100",
        )}
      >
        <div className="w-full max-w-[94rem] mx-auto flex items-center justify-between text-xs font-medium">
          {/* Left: Quick Availability & Payment Reassurance */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]" />
              </span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#F59E0B] whitespace-nowrap">
                Houston, TX Rentals
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 border-l border-white/15 pl-3.5 text-[11px] font-semibold text-slate-300">
              <ShieldCheck className="size-3.5 text-[#16A34A]" />
              <span>Cash • Zelle • Cash App • Stripe Accepted</span>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 border-l border-white/15 pl-3.5 text-[11px] font-semibold text-slate-300">
              <span className="text-[#F59E0B]">★</span>
              <span>70+ Local Rental Options</span>
            </div>
          </div>

          {/* Right: Working Hours & Direct Phone */}
          <div className="flex items-center gap-4 shrink-0 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
              <Clock className="size-3.5 text-[#F59E0B]" />
              <span>Mon–Sat: 7:00 AM – 7:00 PM</span>
            </div>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-1.5 font-bold text-white hover:text-[#4ADE80] transition-colors"
            >
              <Phone className="size-3.5 text-[#16A34A] fill-current" />
              <span>{site.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── MAIN NAVIGATION BAR (Separate, Solid Light Theme Nav with Crisp Border) ── */}
      <div
        className={cn(
          "w-full transition-all duration-300 px-3 sm:px-4 lg:px-6 bg-white",
          scrolled
            ? "py-3 sm:py-3.5 rounded-none"
            : "py-3.5 sm:py-4 lg:py-4.5 rounded-b-[10px]",
        )}
      >
        <div className="w-full max-w-[94rem] mx-auto flex items-center justify-between gap-3 sm:gap-5 min-h-[2.75rem] sm:min-h-[3rem]">
          {/* Logo (Refined proportion, sits with luxurious breathing room) */}
          <Link
            to="/"
            className="flex items-center shrink-0 group transition-transform duration-200 hover:scale-[1.02]"
            onClick={() => setOpen(false)}
          >
            <img
              src={logoImg}
              alt="M3 Rental - Equipment & Vehicle Rentals in Houston, TX"
              className="h-8.5 sm:h-9 md:h-9.5 lg:h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation (Shifted toward right side) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 ml-auto mr-4 xl:mr-8">
            {nav.map((item) => {
              const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));

              if (item.hasDropdown) {
                return (
                  <div key={item.label} className="relative group/nav">
                    <Link
                      to="/equipment"
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12.5px] lg:text-[13px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer",
                        active
                          ? "bg-blue-50 text-[#0040DD] font-black border border-blue-200/80 shadow-2xs"
                          : "text-slate-700 hover:bg-slate-100 hover:text-[#0040DD] active:scale-95",
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="size-3.5 text-[#0040DD] group-hover/nav:rotate-180 transition-transform duration-200" />
                    </Link>

                    {/* ── PREMIUM PIXEL-PERFECT SUBMENU DROPDOWN ── */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 pt-2.5 opacity-0 invisible pointer-events-none group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:pointer-events-auto transition-all duration-200 transform group-hover/nav:translate-y-0 translate-y-1">
                      <div className="w-[660px] max-w-[calc(100vw-32px)] bg-white border border-slate-200/90 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] p-5 flex flex-col gap-3.5 relative overflow-hidden backdrop-blur-xl">
                        {/* Background Ambient Glows */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#0040DD]/8 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#16A34A]/8 rounded-full blur-2xl pointer-events-none" />

                        {/* Dropdown Header */}
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 relative z-10">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-lg bg-blue-50 text-[#0040DD] border border-blue-200/60">
                              <Sparkles className="size-3.5 text-[#0040DD]" />
                            </span>
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                              Houston Equipment Inventory
                            </span>
                          </div>
                          <Link
                            to="/equipment"
                            className="text-[11px] font-extrabold uppercase text-[#0040DD] hover:text-[#16A34A] tracking-wider transition-colors flex items-center gap-1 group/all"
                          >
                            <span>Explore All 70+ Equipment</span>
                            <ArrowRight className="size-3.5 group-hover/all:translate-x-1 transition-transform" />
                          </Link>
                        </div>

                        {/* 2-Column Grid */}
                        <div className="grid grid-cols-2 gap-2.5 relative z-10">
                          {equipmentCategories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <Link
                                key={cat.label}
                                to={cat.to}
                                className="group/item flex items-start gap-3 rounded-2xl p-2.5 bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-[#0040DD]/40 hover:shadow-md transition-all duration-200 text-left relative overflow-hidden"
                              >
                                <div className="size-10 rounded-xl bg-blue-50 border border-blue-200/60 group-hover/item:bg-[#0040DD] flex items-center justify-center text-[#0040DD] group-hover/item:text-white transition-all duration-200 shrink-0 shadow-2xs group-hover/item:scale-105">
                                  <Icon className="size-5" />
                                </div>
                                <div className="flex flex-col text-left min-w-0 pr-1">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="text-xs font-extrabold text-slate-900 group-hover/item:text-[#0040DD] transition-colors leading-tight truncate">
                                      {cat.label}
                                    </span>
                                    <span
                                      className={cn(
                                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0",
                                        cat.badgeColor,
                                      )}
                                    >
                                      {cat.badge}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-medium leading-normal mt-1 line-clamp-2">
                                    {cat.desc}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {/* Dispatch Banner inside Dropdown */}
                        <div className="bg-gradient-to-r from-[#0A1124] to-[#0F1E3D] border border-blue-900/40 rounded-2xl p-3.5 flex justify-between items-center gap-3 relative z-10 shadow-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-9 rounded-xl bg-[#0040DD] border border-blue-400/40 flex items-center justify-center text-[#F59E0B] shrink-0 shadow-md">
                              <Phone className="size-4 animate-pulse fill-current" />
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-xs font-black text-white truncate">
                                Need Equipment or an Operator Today?
                              </span>
                              <span className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                                Houston dispatch • Cash, Zelle, Cash App & Cards accepted
                              </span>
                            </div>
                          </div>
                          <a
                            href={site.phoneHref}
                            className="bg-gradient-to-r from-[#0040DD] to-[#16A34A] hover:from-[#16A34A] hover:to-[#0040DD] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all border border-white/20 shadow-sm whitespace-nowrap active:scale-95 flex items-center gap-1.5 shrink-0"
                          >
                            <span>Call Now</span>
                            <ArrowRight className="size-3 text-[#F59E0B]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    "rounded-lg px-3.5 py-1.5 text-[12.5px] lg:text-[13px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer",
                    active
                      ? "bg-blue-50 text-[#0040DD] font-black border border-blue-200/80 shadow-2xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-[#0040DD] active:scale-95",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Icon Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                if (open) setOpen(false);
              }}
              aria-label={searchOpen ? "Close search bar" : "Search fleet and equipment"}
              title="Search equipment"
              className={cn(
                "grid size-9 sm:size-10 place-items-center rounded-xl sm:rounded-full border transition-all duration-200 cursor-pointer shadow-xs active:scale-95 group",
                searchOpen
                  ? "border-[#0040DD] bg-blue-50 text-[#0040DD] ring-2 ring-[#0040DD]/20"
                  : "border-slate-200/90 bg-slate-50/80 hover:bg-white text-slate-700 hover:text-[#0040DD] hover:border-[#0040DD]/50",
              )}
            >
              {searchOpen ? (
                <X className="size-4.5 text-[#0040DD] transition-transform duration-200" />
              ) : (
                <Search className="size-4 sm:size-4.5 text-slate-600 group-hover:text-[#0040DD] transition-transform duration-200 group-hover:scale-110" />
              )}
            </button>

            {/* Call Direct Signature Button (Brown style) */}
            <a
              href={site.phoneHref}
              className="hidden xl:flex items-center gap-2.5 bg-gradient-to-r from-[#0040DD] to-[#16A34A] hover:from-[#16A34A] hover:to-[#0040DD] text-white px-3.5 py-1.5 rounded-full border border-white/25 shadow-[0_6px_20px_-4px_rgba(0,64,221,0.35)] hover:shadow-[0_10px_25px_-4px_rgba(22,163,74,0.55)] transition-all duration-300 shrink-0 active:scale-95 group/call"
            >
              <div className="size-7 rounded-full bg-white/20 flex items-center justify-center border border-white/40 shrink-0 shadow-2xs group-hover/call:rotate-12 transition-transform">
                <Phone className="size-3.5 fill-current text-[#F59E0B] animate-pulse" />
              </div>
              <div className="flex flex-col text-left leading-none pr-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#F59E0B]">
                  Call Direct
                </span>
                <span className="text-xs font-black text-white mt-0.5 tracking-tight">
                  {site.phone}
                </span>
              </div>
            </a>

            {/* Rent Equipment Primary CTA */}
            <Link
              to="/contact"
              search={{}}
              className="btn-base btn-primary btn-sm text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all hidden sm:inline-flex"
            >
              Rent Equipment
            </Link>

            {/* Mobile Fast Call Pill */}
            <a
              href={site.phoneHref}
              aria-label={`Call ${site.phone}`}
              className="flex sm:hidden items-center gap-1.5 bg-gradient-to-r from-[#0040DD] to-[#16A34A] text-white text-[11px] font-black rounded-full px-3 py-1.5 border border-white/20 shadow-sm active:scale-95"
            >
              <Phone className="size-3.5 fill-current text-[#F59E0B]" />
              <span>Call</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => {
                setOpen((v) => !v);
                if (searchOpen) setSearchOpen(false);
              }}
              className="grid size-9 sm:size-10 place-items-center rounded-xl border border-slate-200/90 bg-white text-slate-800 transition hover:border-[#0040DD] hover:text-[#0040DD] active:scale-95 lg:hidden cursor-pointer shadow-xs"
            >
              {open ? <X className="size-5 text-[#0040DD]" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── EXPANDABLE SEARCH BAR DRAWER ── */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 bg-white border-t border-slate-200/90",
          scrolled ? "rounded-none" : "rounded-b-[10px]",
          searchOpen
            ? "max-h-72 opacity-100 py-3.5 sm:py-4 px-3 sm:px-6 shadow-xl"
            : "max-h-0 opacity-0 py-0 px-3 sm:px-6 border-transparent pointer-events-none",
        )}
      >
        <div className="w-full max-w-4xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center gap-2 sm:gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-[#0040DD] pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 70+ equipment, work trucks, trailers, excavators..."
                className="w-full rounded-full border border-slate-200 bg-slate-50/90 pl-11 pr-10 py-2.5 sm:py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0040DD] focus:outline-none focus:ring-4 focus:ring-[#0040DD]/10 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-6 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0040DD] to-[#16A34A] hover:from-[#16A34A] hover:to-[#0040DD] text-white px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg shrink-0 cursor-pointer active:scale-95"
            >
              <span>Search</span>
              <ArrowRight className="size-3.5 sm:size-4" />
            </button>
          </form>

          {/* Quick search suggestion tags */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
            <span className="font-black text-slate-400 uppercase tracking-widest text-[10px] mr-1 hidden sm:inline">
              Popular:
            </span>
            {[
              { label: "Work Trucks", to: "/equipment?category=pickup-trucks" },
              { label: "Dump Trailers", to: "/equipment?category=trailers" },
              {
                label: "Heavy Construction",
                to: "/equipment?category=construction-equipment",
              },
              { label: "Passenger Vans", to: "/equipment?category=vans" },
              { label: "With Operator", to: "/equipment?operator=with" },
            ].map((pill) => (
              <Link
                key={pill.label}
                to={pill.to}
                onClick={() => setSearchOpen(false)}
                className="rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0040DD] border border-slate-200/80 hover:border-blue-200 px-3 py-1 font-bold transition-all duration-150 cursor-pointer"
              >
                {pill.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU DRAWER ── */}
      <div
        className={cn(
          "lg:hidden overflow-y-auto transition-[max-height,opacity] duration-300 bg-white/98 pointer-events-auto shadow-2xl border-t border-slate-200/90 backdrop-blur-xl",
          scrolled ? "rounded-none" : "rounded-b-[10px]",
          open ? "max-h-[calc(100vh-100px)] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="w-full max-w-[94rem] mx-auto flex flex-col py-5 px-3 sm:px-4 space-y-2 text-left">
          {nav.map((item) => {
            const active = pathname === item.to;

            if (item.hasDropdown) {
              return (
                <div key={item.label} className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50/50">
                  <div className="flex items-center justify-between p-3">
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "text-sm font-bold uppercase tracking-wider",
                        active ? "text-[#0040DD]" : "text-slate-800",
                      )}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileEquipmentOpen((v) => !v)}
                      className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-500"
                    >
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          mobileEquipmentOpen && "rotate-180",
                        )}
                      />
                    </button>
                  </div>

                  {mobileEquipmentOpen && (
                    <div className="p-2 pt-0 space-y-1 border-t border-slate-200/60">
                      {equipmentCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <Link
                            key={cat.label}
                            to={cat.to}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:text-[#0040DD]"
                          >
                            <Icon className="size-4 text-[#0040DD]" />
                            <span>{cat.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors",
                  active
                    ? "bg-blue-50 text-[#0040DD] font-extrabold"
                    : "text-slate-800 hover:bg-slate-50 hover:text-[#0040DD]",
                )}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Mobile Bottom Contact Callout */}
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              to="/contact"
              search={{}}
              onClick={() => setOpen(false)}
              className="btn-base btn-primary w-full justify-center shadow-md text-xs font-extrabold"
            >
              Rent Equipment Online
            </Link>
            <a
              href={site.phoneHref}
              className="btn-base bg-gradient-to-r from-[#0040DD] to-[#16A34A] text-white w-full justify-center shadow-sm text-xs font-extrabold"
            >
              <Phone className="size-4 text-[#F59E0B] fill-current" />
              Call {site.phone}
            </a>

            <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 font-medium text-center space-y-1">
              <p className="font-bold text-slate-700">Houston Yard: {site.street}, {site.city}</p>
              <p>Cash • Zelle • Cash App • Stripe Accepted</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
