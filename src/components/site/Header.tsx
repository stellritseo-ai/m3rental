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
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { cleanSearch } from "@/lib/search";
import logoImg from "@/assets/logo.png";
import { HeaderSearchModal } from "./HeaderSearchModal";
import { LanguageSelector, MobileLanguageToggle } from "./LanguageSelector";

const nav = [
  { key: "nav.home", label: "Home", to: "/" },
  { key: "nav.about", label: "About", to: "/about" },
  { key: "nav.equipment", label: "Equipment", to: "/equipment", hasDropdown: true },
  { key: "nav.sell", label: "Sell", to: "/sell" },
  { key: "nav.howItWorks", label: "How It Works", to: "/how-it-works" },
  { key: "nav.whyM3", label: "Why M3", to: "/why-m3" },
  { key: "nav.blog", label: "Blog", to: "/blog" },
];

const equipmentCategories = [
  {
    to: "/equipment?category=pickup-trucks",
    labelKey: "cat.pickups",
    label: "Work Trucks & Pickups",
    descKey: "cat.pickupsDesc",
    desc: "Half-ton to 1-ton crew cabs & heavy-duty haulers",
    icon: Truck,
    badgeKey: "badge.popular",
    badge: "Popular",
    badgeColor: "bg-blue-50 text-[#0040DD] border-blue-200",
  },
  {
    to: "/equipment?category=trailers",
    labelKey: "cat.trailers",
    label: "Hauling & Dump Trailers",
    descKey: "cat.trailersDesc",
    desc: "Heavy equipment, utility, cargo & hydraulic dump trailers",
    icon: Layers,
    badgeKey: "badge.highDemand",
    badge: "High Demand",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    to: "/equipment?category=construction-equipment",
    labelKey: "cat.construction",
    label: "Heavy Construction",
    descKey: "cat.constructionDesc",
    desc: "Backhoe loaders, excavators & earthmoving machinery",
    icon: HardHat,
    badgeKey: "badge.heavyDuty",
    badge: "Heavy-Duty",
    badgeColor: "bg-emerald-50 text-[#16A34A] border-emerald-200",
  },
  {
    to: "/equipment?operator=with",
    labelKey: "cat.operator",
    label: "Operator Included",
    descKey: "cat.operatorDesc",
    desc: "Machinery provided with certified, skilled operators",
    icon: UserCheck,
    badgeKey: "badge.turnkey",
    badge: "Turnkey",
    badgeColor: "bg-emerald-50 text-[#16A34A] border-emerald-200",
  },
  {
    to: "/equipment?category=cars",
    labelKey: "cat.vehicles",
    label: "Vehicles & Transport",
    descKey: "cat.vehiclesDesc",
    desc: "Sedans, SUVs & passenger shuttle transportation",
    icon: Car,
    badgeKey: "badge.available",
    badge: "Available",
    badgeColor: "bg-blue-50 text-[#0040DD] border-blue-200",
  },
  {
    to: "/equipment?category=specialty-equipment",
    labelKey: "cat.specialty",
    label: "Specialty & Utilities",
    descKey: "cat.specialtyDesc",
    desc: "Bucket trucks, mobile LED trailers & utility gear",
    icon: Wrench,
    badgeKey: "badge.specialized",
    badge: "Specialized",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

export function Header() {
  const navigate = useNavigate();
  const { totalCount, openCart } = useCart();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileEquipmentOpen, setMobileEquipmentOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "sticky z-50 transition-all duration-300 bg-white",
        scrolled
          ? "top-0 inset-x-0 w-full m-0 rounded-none border-b border-x-0 border-t-0 border-slate-200/90 shadow-md"
          : "top-2 sm:top-[15px] my-2 sm:my-[15px] mx-auto w-[calc(100%-16px)] sm:w-[calc(100%-30px)] rounded-[10px] border border-slate-200/90 shadow-xs",
      )}
    >
      {/* ── TOP UTILITY BAR (Brown-style high-trust header) ── */}
      <div
        className={cn(
          "w-full bg-[#0A1124] text-white border-b border-white/10 px-3 sm:px-4 lg:px-6 transition-all duration-300 origin-top rounded-t-[10px]",
          scrolled ? "max-h-0 py-0 opacity-0 border-none overflow-hidden" : "max-h-14 py-2 sm:py-2.5 opacity-100 overflow-visible",
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
                {t("topbar.location", "Houston, TX Rentals")}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 border-l border-white/15 pl-3.5 text-[11px] font-semibold text-slate-300">
              <ShieldCheck className="size-3.5 text-[#16A34A]" />
              <span>{t("topbar.payment", "Cash • Zelle • Cash App")}</span>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 border-l border-white/15 pl-3.5 text-[11px] font-semibold text-slate-300">
              <span className="text-[#F59E0B]">★</span>
              <span>{t("topbar.options", "70+ Local Rental Options")}</span>
            </div>
          </div>

          {/* Right: Working Hours & Direct Phone & Language Selector */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
              <Clock className="size-3.5 text-[#F59E0B]" />
              <span>{t("topbar.hours", "Mon–Sat: 7:00 AM – 7:00 PM")}</span>
            </div>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-1.5 font-bold text-white hover:text-[#4ADE80] transition-colors"
            >
              <Phone className="size-3.5 text-[#16A34A] fill-current" />
              <span>{site.phone}</span>
            </a>

            {/* ── LANGUAGE SELECTOR (Right after phone number) ── */}
            <div className="border-l border-white/20 pl-2.5 sm:pl-3.5 flex items-center">
              <LanguageSelector />
            </div>
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
              const itemLabel = t(item.key, item.label);

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
                      <span>{itemLabel}</span>
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
                              {t("submenu.inventory", "Houston Equipment Inventory")}
                            </span>
                          </div>
                          <Link
                            to="/equipment"
                            className="text-[11px] font-extrabold uppercase text-[#0040DD] hover:text-[#16A34A] tracking-wider transition-colors flex items-center gap-1 group/all"
                          >
                            <span>{t("submenu.exploreAll", "Explore All 70+ Equipment")}</span>
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
                                      {t(cat.labelKey, cat.label)}
                                    </span>
                                    <span
                                      className={cn(
                                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0",
                                        cat.badgeColor,
                                      )}
                                    >
                                      {t(cat.badgeKey, cat.badge)}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-medium leading-normal mt-1 line-clamp-2">
                                    {t(cat.descKey, cat.desc)}
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
                                {t("submenu.needEquipment", "Need Equipment or an Operator Today?")}
                              </span>
                              <span className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                                {t("submenu.dispatch", "Houston dispatch • Cash, Zelle, Cash App & Cards accepted")}
                              </span>
                            </div>
                          </div>
                          <a
                            href={site.phoneHref}
                            className="bg-gradient-to-r from-[#0040DD] to-[#16A34A] hover:from-[#16A34A] hover:to-[#0040DD] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all border border-white/20 shadow-sm whitespace-nowrap active:scale-95 flex items-center gap-1.5 shrink-0"
                          >
                            <span>{t("submenu.callNow", "Call Now")}</span>
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
                  {itemLabel}
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

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={openCart}
              aria-label="View rental cart"
              title="View rental cart"
              className="relative grid size-9 sm:size-10 place-items-center rounded-xl sm:rounded-full border border-slate-200/90 bg-slate-50/80 hover:bg-white text-slate-700 hover:text-[#0040DD] hover:border-[#0040DD]/50 transition-all duration-200 cursor-pointer shadow-xs active:scale-95 group"
            >
              <ShoppingCart className="size-4 sm:size-4.5 text-slate-600 group-hover:text-[#0040DD] transition-transform duration-200 group-hover:scale-110" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-[#0040DD] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-75">
                  {totalCount > 9 ? "9+" : totalCount}
                </span>
              )}
            </button>

            {/* Call Direct Signature Button (Brown style) */}
            {/* <a
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
            </a> */}

            {/* Rent Equipment Primary CTA */}
            <Link
              to="/contact"
              search={{}}
              className="btn-base btn-primary btn-sm text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all hidden sm:inline-flex"
            >
              {t("cta.contact", "Contact")}
            </Link>

            {/* Mobile Fast Call Pill */}
            <a
              href={site.phoneHref}
              aria-label={`Call ${site.phone}`}
              className="flex sm:hidden items-center gap-1.5 bg-gradient-to-r from-[#0040DD] to-[#16A34A] text-white text-[11px] font-black rounded-full px-3 py-1.5 border border-white/20 shadow-sm active:scale-95"
            >
              <Phone className="size-3.5 fill-current text-[#F59E0B]" />
              <span>{t("cta.call", "Call")}</span>
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

      {/* ── MOBILE MENU DRAWER ── */}
      <div
        className={cn(
          "lg:hidden overflow-y-auto transition-[max-height,opacity] duration-300 bg-white/98 pointer-events-auto shadow-2xl border-t border-slate-200/90 backdrop-blur-xl",
          scrolled ? "rounded-none" : "rounded-b-[10px]",
          open ? "max-h-[calc(100vh-100px)] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="w-full max-w-[94rem] mx-auto flex flex-col py-5 px-3 sm:px-4 space-y-2 text-left">
          {/* Quick Search Button in Mobile Menu */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setSearchOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/90 text-left text-slate-600 text-xs font-semibold mb-1 transition-colors cursor-pointer shadow-2xs"
          >
            <Search className="size-4 text-[#0040DD]" />
            <span className="flex-1 text-slate-700 font-bold">
              {t("cta.searchPlaceholder", "Search equipment, trucks, guides...")}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-400">
              ⌘K
            </span>
          </button>

          {/* Dedicated Mobile Language Switcher (Flags & Names) */}
          <div className="mb-2">
            <MobileLanguageToggle />
          </div>

          {nav.map((item) => {
            const active = pathname === item.to;
            const itemLabel = t(item.key, item.label);

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
                      {itemLabel}
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
                            <span>{t(cat.labelKey, cat.label)}</span>
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
                <span>{itemLabel}</span>
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
              {t("cta.rentOnline", "Rent Equipment Online")}
            </Link>
            <a
              href={site.phoneHref}
              className="btn-base bg-gradient-to-r from-[#0040DD] to-[#16A34A] text-white w-full justify-center shadow-sm text-xs font-extrabold"
            >
              <Phone className="size-4 text-[#F59E0B] fill-current" />
              {t("cta.call", "Call")} {site.phone}
            </a>

            <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 font-medium text-center space-y-1">
              <p className="font-bold text-slate-700">Houston Yard: {site.street}, {site.city}</p>
              <p>{t("cta.paymentAccepted", "Cash • Zelle • Cash App • Stripe Accepted")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── DYNAMIC SPOTLIGHT SEARCH MODAL ── */}
      <HeaderSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
