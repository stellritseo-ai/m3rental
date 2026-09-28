import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { site, directionsUrl } from "@/lib/site";
import logoImg from "@/assets/logo.png";

/* ── Inline SVG Social Icons ── */
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const NextdoorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const MapMarkerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const socials = [
  { icon: FacebookIcon, href: "https://www.facebook.com", label: "Facebook" },
  { icon: NextdoorIcon, href: "https://nextdoor.com", label: "Nextdoor" },
  {
    icon: MapMarkerIcon,
    href: directionsUrl,
    label: "Google Maps Yard Location",
  },
];

/** Collapsible section for clean, organized mobile viewing */
function MobileCollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 py-3.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full py-1 text-left cursor-pointer group"
        aria-expanded={open}
      >
        <span className="text-xs uppercase tracking-widest text-[#FFD54F] font-black group-hover:text-white transition-colors">
          {title}
        </span>
        <div
          className={`h-7 w-7 rounded-full flex items-center justify-center bg-white/5 border border-white/10 transition-all duration-300 ${open ? "rotate-180 bg-[#0040DD]/30 text-[#FFD54F]" : "text-slate-400"
            }`}
        >
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      {open && (
        <div className="pt-3 pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export function Footer() {
  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About M3 Rental", href: "/about" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Why Choose M3", href: "/#why-m3" },
    { label: "Contractor Reviews", href: "/#testimonials" },
    { label: "Rental FAQ", href: "/#faq" },
    { label: "Contact & Yard", href: "/contact" },
  ];

  const fleetLinks = [
    {
      label: "Work Trucks & Pickups",
      href: "/equipment?category=pickup-trucks",
    },
    {
      label: "Hauling & Dump Trailers",
      href: "/equipment?category=trailers",
    },
    {
      label: "Heavy Construction Machinery",
      href: "/equipment?category=construction-equipment",
    },
    {
      label: "Passenger & Cargo Vans",
      href: "/equipment?category=vans",
    },
    {
      label: "Specialty & Compaction",
      href: "/equipment?category=specialty-equipment",
    },
    {
      label: "Machines With Operator",
      href: "/equipment?operator=with",
    },
    {
      label: "View All 70+ Inventory →",
      href: "/equipment",
    },
  ];

  const servicesLinks = [
    {
      label: "Operator Included Rentals",
      href: "/equipment?operator=with",
    },
    {
      label: "Zero Credit Card Trap (Cash/Zelle)",
      href: "/#how-it-works",
    },
    {
      label: "15-Minute Rapid Yard Turnaround",
      href: "/#location-contact",
    },
    {
      label: "Commercial Jobsite Delivery",
      href: "/#location-contact",
    },
    {
      label: "Fast Online Quote Request",
      href: "/contact",
    },
    {
      label: "Deposit & Payment Policies",
      href: "/#faq",
    },
  ];

  const trustBadges = [
    "70+ Machines",
    "No Credit Card Req.",
    "Turnkey Operators",
    "15-Min Yard Pickup",
  ];

  return (
    <footer
      className="relative overflow-hidden rounded-[10px] bg-[#070D1D] text-white border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.45)] max-w-[94rem] mx-auto transition-all"
      style={{ margin: "15px" }}
    >
      {/* ── Background Subtle Aesthetics & Glows ── */}
      <div className="absolute inset-0 bg-grid opacity-[0.025] pointer-events-none" />

      {/* Top dual-gradient accent rule */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0040DD] via-[#F59E0B] via-[#16A34A] to-transparent opacity-85" />

      {/* Ambient background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 w-[450px] h-[450px] bg-[#0040DD]/12 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-10 w-[400px] h-[400px] bg-[#16A34A]/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "10s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#F59E0B]/5 rounded-full blur-3xl"
      />

      <div className="relative z-10">
        {/* ── TOP RAPID DISPATCH & JOBSITE SUPPORT BANNER ── */}
        <div className="border-b border-white/10 bg-white/[0.025] px-5 sm:px-8 lg:px-12 py-6 sm:py-7">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
            {/* Left status badge & headline */}
            <div className="space-y-1.5 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#16A34A]/20 border border-[#16A34A]/40 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#4ADE80]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80]" />
                </span>
                <span>SW Houston Yard Open • 15-Minute Turnaround</span>
              </div>
              <h3 className="font-display text-[20px] sm:text-[23px] font-black tracking-tight text-white leading-tight">
                Need Equipment On Your Jobsite Today?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Direct contractor dispatch line with zero credit card holds,
                instant reservation confirmation, and turnkey operator options.
              </p>
            </div>

            {/* Right Call & Quote Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href={site.phoneHref}
                className="group flex items-center justify-center gap-3 bg-gradient-to-r from-[#0040DD] to-[#16A34A] border border-white/20 rounded-xl px-5 py-3 shadow-lg hover:shadow-[0_0_25px_rgba(0,64,221,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 text-[#FFD54F] group-hover:scale-110 transition-transform">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/80">
                    Direct Yard Dispatch
                  </span>
                  <span className="font-black text-white text-[15px] tracking-tight leading-none">
                    {site.phone}
                  </span>
                </div>
              </a>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:text-[#FFD54F] transition-all cursor-pointer text-center"
              >
                <span>Request Online Quote</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── MOBILE VERSION (MATCHED TO BROWN PROJECT EXPERIENCE) ── */}
        <div className="block lg:hidden px-5 sm:px-8 py-8 sm:py-10 text-left">
          {/* Logo & Description */}
          <div className="mb-6">
            <Link to="/" className="inline-block mb-3">
              <img
                src={logoImg}
                alt="M3 Rental Logo"
                className="h-10 sm:h-11 w-auto object-contain brightness-105"
              />
            </Link>

            <p className="font-display text-base font-black text-[#FFD54F] tracking-tight mb-2">
              {site.tagline}
            </p>

            <p className="text-[13px] text-slate-300 leading-relaxed font-medium mb-5">
              Houston’s dependable equipment partner for general contractors,
              landscapers, tree crews, and builders. Transparent rates, flexible
              Cash/Zelle terms, and certified operators.
            </p>

            {/* Mobile Direct Phone CTA Card */}
            <a
              href={site.phoneHref}
              className="flex items-center gap-3 w-full bg-gradient-to-r from-[#0040DD] to-[#16A34A] border border-[#FFD54F]/40 rounded-2xl px-4 py-3 mb-5 shadow-lg active:scale-98 transition-transform"
            >
              <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-[#FFD54F] animate-bounce" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#FFD54F] font-black">
                  Yard Hotline • 15-Min Turnaround
                </span>
                <span className="font-black text-white text-[15px] tracking-tight leading-tight">
                  {site.phone}
                </span>
              </div>
            </a>

            {/* Trust Badges - 2x2 grid */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {trustBadges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10.5px] font-bold text-[#FFD54F] uppercase tracking-wide"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] shrink-0" />
                  ✓ {badge}
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-slate-400">
                Follow Us:
              </span>
              {socials.map(({ icon: Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid place-items-center h-9 w-9 rounded-xl bg-slate-900/90 border border-[#FFD54F]/30 text-[#FFD54F] hover:bg-[#0040DD] hover:text-white active:scale-95 transition-all shadow-sm"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Collapsible Sections */}
          <MobileCollapsibleSection title="Quick Navigation">
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-xs text-slate-300 hover:text-[#FFD54F] font-semibold block transition-colors py-0.5"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </MobileCollapsibleSection>

          <MobileCollapsibleSection title="Fleet Directory">
            <ul className="space-y-2.5">
              {fleetLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-xs text-slate-300 hover:text-[#FFD54F] font-semibold block transition-colors py-0.5"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </MobileCollapsibleSection>

          <MobileCollapsibleSection title="Contractor Services & Policies">
            <ul className="space-y-2.5">
              {servicesLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-xs text-slate-300 hover:text-[#FFD54F] font-semibold block transition-colors py-0.5"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </MobileCollapsibleSection>

          <MobileCollapsibleSection title="Yard Location & Contacts">
            <ul className="space-y-3 text-xs">
              <li>
                <a
                  href={site.phoneHref}
                  className="flex items-center gap-2.5 text-slate-300 hover:text-[#4ADE80] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-[#FFD54F] shrink-0" />
                  <span className="font-semibold text-white">{site.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={site.emailHref}
                  className="flex items-center gap-2.5 text-slate-300 hover:text-[#4ADE80] transition-colors break-all"
                >
                  <Mail className="h-3.5 w-3.5 text-[#FFD54F] shrink-0" />
                  <span>{site.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-slate-300 hover:text-[#4ADE80] transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#FFD54F] shrink-0 mt-0.5" />
                  <span>
                    {site.street}, {site.city}
                  </span>
                </a>
              </li>
            </ul>
          </MobileCollapsibleSection>

          <MobileCollapsibleSection title="Yard Hours & Dispatch">
            <div className="bg-[#0B1528] border border-[#FFD54F]/30 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed font-semibold space-y-1.5">
              <span className="text-[#FFD54F] font-black uppercase tracking-wider block mb-1 text-[10px] flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                </span>
                Fast Commercial Yard Dispatch
              </span>
              <p className="text-white">Mon–Sat: 7:00 AM – 7:00 PM</p>
              <p className="text-slate-400">
                Sunday: By Appointment & Emergency Dispatch
              </p>
              <p className="text-[11px] text-[#4ADE80] pt-1">
                ⚡ Equipment hooked & ready in 15 mins
              </p>
            </div>
          </MobileCollapsibleSection>
        </div>

        {/* ── DESKTOP VERSION (REFINED 5-COLUMN ARCHITECTURE) ── */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 px-8 lg:px-12 py-14 sm:py-16 items-start text-left">
          {/* Col 1: Brand & Trust Badges (col-span-4) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-block">
              <img
                src={logoImg}
                alt="M3 Rental Logo"
                className="h-12 lg:h-[50px] w-auto object-contain brightness-105"
              />
            </Link>

            <p className="font-display text-base font-black text-[#FFD54F] tracking-tight">
              {site.tagline}
            </p>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm font-medium">
              Houston’s trusted rental source for commercial work trucks,
              heavy earthmoving machinery, hauling trailers, and specialty
              contractor units. Fast 15-minute yard turnaround with transparent
              pricing, Cash/Zelle terms, and certified operators.
            </p>

            {/* Socials with hover lift */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-bold text-slate-400">
                Follow Us:
              </span>
              {socials.map(({ icon: Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid place-items-center h-9 w-9 rounded-xl bg-slate-900/90 border border-[#FFD54F]/35 text-[#FFD54F] hover:bg-[#0040DD] hover:text-white hover:-translate-y-1 active:scale-95 transition-all shadow-sm"
                >
                  <Icon />
                </a>
              ))}
            </div>

            {/* Trust Badges 2x2 */}
            <div className="flex flex-wrap gap-2 pt-2">
              {trustBadges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-[#FFD54F]/40 rounded-xl px-3 py-1.5 text-[10px] font-black text-[#FFD54F] uppercase tracking-wider transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] shrink-0" />
                  ✓ {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links (col-span-2) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs uppercase tracking-widest text-[#FFD54F] font-black mb-5">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-slate-300 hover:text-[#FFD54F] transition-all inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 text-[#16A34A] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Fleet Directory (col-span-2) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs uppercase tracking-widest text-[#FFD54F] font-black mb-5">
              Fleet Directory
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              {fleetLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-slate-300 hover:text-[#FFD54F] transition-all inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 text-[#16A34A] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Services & Policies (col-span-2) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs uppercase tracking-widest text-[#FFD54F] font-black mb-5">
              Services & Policies
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              {servicesLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-slate-300 hover:text-[#FFD54F] transition-all inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 text-[#16A34A] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact & Hours (col-span-2) */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#FFD54F] font-black mb-5">
                Houston Yard Hub
              </h3>
              <ul className="space-y-3.5 text-sm">
                <li>
                  <a
                    href={site.phoneHref}
                    className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[#0040DD]/30 border border-[#0040DD]/50 flex items-center justify-center text-[#FFD54F] group-hover:bg-[#0040DD] transition-all shrink-0">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        Yard Phone
                      </span>
                      <span className="font-bold text-white tracking-tight text-xs truncate">
                        {site.phone}
                      </span>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href={site.emailHref}
                    className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[#0040DD]/30 border border-[#0040DD]/50 flex items-center justify-center text-[#FFD54F] group-hover:bg-[#0040DD] transition-all shrink-0">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        Email
                      </span>
                      <span className="font-semibold text-white tracking-tight text-xs truncate">
                        {site.email}
                      </span>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[#0040DD]/30 border border-[#0040DD]/50 flex items-center justify-center text-[#FFD54F] group-hover:bg-[#0040DD] transition-all shrink-0">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        SW Houston Yard
                      </span>
                      <span className="font-semibold text-white tracking-tight text-xs leading-snug">
                        {site.street}
                        <br />
                        {site.city}
                      </span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            {/* Yard Hours Card */}
            <div className="bg-[#0B1528] border border-white/10 rounded-2xl p-4 shadow-inner">
              <span className="text-[#FFD54F] font-black uppercase tracking-wider block mb-2 text-[10.5px] flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                </span>
                Yard Hours &amp; Dispatch
              </span>
              <div className="text-xs text-slate-300 leading-relaxed font-medium space-y-1">
                <p className="text-white font-semibold">
                  Mon–Sat: 7:00 AM – 7:00 PM
                </p>
                <p className="text-slate-400">
                  Sunday: By Appointment &amp; Dispatch
                </p>
                <p className="text-[11px] text-[#4ADE80] pt-1">
                  ⚡ 15-Minute Yard Turnaround
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR (COPYRIGHT, TRUST SUMMARY & BACK TO TOP) ── */}
        <div className="border-t border-white/10 px-5 sm:px-8 lg:px-12 py-6 bg-black/40 pb-28 lg:pb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            {/* Copyright Info */}
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-xs text-slate-400 font-semibold order-2 sm:order-1">
              <p>
                © 2026 M3 Rental, LLC. All Rights Reserved. Houston Commercial
                Fleet &amp; Equipment.
              </p>
              <span className="hidden sm:inline text-white/20">|</span>
              <p className="text-slate-400">
                Family &amp; Contractor Owned •{" "}
                <span className="text-[#FFD54F] font-bold">Houston, TX</span>
              </p>
            </div>

            {/* Trust badge & Back to top button */}
            <div className="flex items-center gap-6 order-1 sm:order-2">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-xs text-slate-300 hover:text-white transition-colors font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer group py-1 select-none"
              >
                <span>Back to Top</span>
                <div className="h-6 w-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-[#0040DD] group-hover:text-white transition-all">
                  <ArrowUp className="h-3.5 w-3.5 text-[#FFD54F] group-hover:text-white transition-colors" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
