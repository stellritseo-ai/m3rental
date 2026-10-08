import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  HelpCircle,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UserCheck,
  WalletCards,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RentalRequestForm } from "@/components/site/RentalRequestForm";
import { Reveal } from "@/components/site/Reveal";
import { directionsUrl, mapEmbedUrl, site } from "@/lib/site";
import { cleanSearch, readString } from "@/lib/search";

import banner2 from "@/assets/banner2.jpeg";
import banner1 from "@/assets/banner1.jpeg";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { equipment?: string } =>
    cleanSearch({ equipment: readString(search, "equipment") }),
  head: () => ({
    meta: [
      { title: "Contact M3 Rental | Houston Equipment Rentals & Yard Dispatch" },
      {
        name: "description",
        content:
          "Reserve equipment with M3 Rental in Houston, TX. $0 credit card required. Call (281) 933-5000 or visit our Southwest Houston yard at 11732 S Wilcrest Dr. Fast 15-min turnaround on 70+ units.",
      },
      { property: "og:title", content: "Contact M3 Rental | Houston, TX" },
      {
        property: "og:description",
        content:
          "Rent commercial trucks, trailers, construction and specialty equipment in Houston. Fast confirmation, cash/Zelle/Cash App/Stripe accepted.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const faqItems = [
  {
    q: "Can I visit the Houston yard in person to pick up equipment today?",
    a: "Yes! Walk-ins are welcome Monday through Saturday between 7:00 AM and 7:00 PM at 11732 S Wilcrest Dr in Southwest Houston. We recommend calling (281) 933-5000 before driving over so our dispatchers can prep and stage your unit for a 15-minute key handoff.",
  },
  {
    q: "Do I really not need a traditional credit card to rent?",
    a: "That is correct. M3 Rental is built contractor-first. We accept Cash, instant fee-free Zelle bank transfers, Cash App, and standard debit or credit cards via Stripe without restrictive corporate paperwork or credit score hurdles.",
  },
  {
    q: "What do I need to bring when picking up equipment?",
    a: "You just need a valid government-issued driver's license or photo ID, proof of active vehicle insurance (if renting motorized trucks or towing heavy trailers), and your payment method (Cash, Zelle, Cash App, or Card).",
  },
  {
    q: "Can you deliver equipment directly to my jobsite in Houston?",
    a: "Yes! We provide prompt flatbed delivery across Harris, Fort Bend, Brazoria, Montgomery, and surrounding Texas counties. Delivery fees depend on distance and machine size. Contact dispatch to schedule your jobsite delivery window.",
  },
  {
    q: "Can you provide a certified machine operator or truck driver?",
    a: "Yes! Selected heavy machinery (backhoes, excavators, boom lifts, bucket trucks) can be booked with an experienced, certified machine operator. This saves your crew time and eliminates machine operation liabilities on site.",
  },
  {
    q: "How fast do your Houston dispatchers respond to online requests?",
    a: "Online rental requests submitted through this form are reviewed immediately by our on-duty Houston dispatch desk, with an average response time of under 15 minutes during operating hours (Mon–Sat 7am–7pm).",
  },
];

const driveTimes = [
  { from: "Sugar Land / Stafford", time: "8–12 mins", route: "via US-59 N & S Wilcrest Dr" },
  { from: "Galleria / Uptown", time: "15–18 mins", route: "via Westpark Tollway & Beltway 8" },
  { from: "Downtown Houston", time: "20–25 mins", route: "via I-69 / US-59 South" },
  { from: "Katy / Energy Corridor", time: "18–22 mins", route: "via I-10 & Sam Houston Tollway" },
  { from: "Pearland / Missouri City", time: "15–20 mins", route: "via Beltway 8 West" },
];

function ContactPage() {
  const { equipment } = Route.useSearch();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Check Houston Time (America/Chicago) for dynamic Open/Closed badge
  const yardStatus = (() => {
    try {
      const now = new Date();
      const houstonDate = new Date(
        now.toLocaleString("en-US", { timeZone: "America/Chicago" }),
      );
      const day = houstonDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const hour = houstonDate.getHours();
      const isOpen = day >= 1 && day <= 6 && hour >= 7 && hour < 19;
      return {
        isOpen,
        text: isOpen
          ? "Yard Open Now • Walk-ins Welcome"
          : day === 0
            ? "Sunday: Emergency Dispatch & Appointments Only"
            : "Yard Opens at 7:00 AM Mon–Sat",
      };
    } catch {
      return {
        isOpen: true,
        text: "Yard Open Mon–Sat: 7:00 AM – 7:00 PM",
      };
    }
  })();

  const handleCopy = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <SiteLayout>
      {/* ── 1. CONTACT HERO SECTION (Compact, Centered, Rich Overlay) ── */}
      <section
        className="relative isolate min-h-[320px] sm:min-h-[360px] md:min-h-[390px] overflow-hidden flex items-center justify-center py-8 sm:py-10 md:py-12 lg:py-14 rounded-[10px] border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.12)] mx-auto mb-3 sm:mb-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        {/* Background Image with Ken Burns zoom effect */}
        <div className="absolute inset-0 -z-30 overflow-hidden bg-slate-950">
          <img
            src={banner2}
            alt="M3 Rental heavy equipment fleet and Houston dispatch yard"
            fetchPriority="high"
            decoding="async"
            className="size-full object-cover object-center transform scale-105 transition-transform duration-[7000ms] ease-out will-change-transform"
          />
        </div>

        {/* Multi-layered Image Overlay: dark tint + gradient depth + subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-20 bg-slate-950/70"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/85 via-black/55 to-black/85"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0040DD]/15 via-transparent to-transparent blur-2xl"
          aria-hidden="true"
        />

        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center justify-center">
          {/* Top Badges Row - Centered */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            {/* Rating badge with 5 gold stars */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10.5px] sm:text-xs font-semibold text-white backdrop-blur-md shadow-xs">
              <span className="flex text-amber-400 gap-0.5 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3 sm:size-3.5 fill-current text-amber-400" />
                ))}
              </span>
              <span>Houston's #1 Contractor-Friendly Equipment Rental</span>
            </span>

            {/* Live Yard Status pill */}
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-3 py-1 text-[10.5px] sm:text-xs font-bold text-emerald-300 backdrop-blur-md shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>{yardStatus.text}</span>
            </span>
          </div>

          {/* Main Headline - Centered */}
          <h1
            className="font-display text-[23px] sm:text-[28px] md:text-[34px] lg:text-[38px] font-extrabold capitalize tracking-tight text-white leading-[31px] sm:leading-[37px] md:leading-[43px] text-center"
            style={{
              textShadow: "0 2px 12px rgba(0, 0, 0, 0.8)",
            }}
          >
            Ready to Rent Your Equipment? <br />
            <span className="text-[#3daf05]">
              Direct Houston Yard & Dispatch
            </span>
          </h1>

          {/* Description - Centered */}
          <p className="mt-3 text-[13px] sm:text-[14.5px] text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto text-center">
            Reserve tools, heavy machinery, work trucks, and trailers with zero credit card required. Cash, Zelle, Cash App, and Stripe accepted. Pick up at our Southwest Houston yard or request same-day jobsite delivery.
          </p>

          {/* Hero Quick Action Buttons - Centered */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={site.phoneHref}
              className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
            >
              <Phone className="size-4 text-white" />
              <span>Call Yard: {site.phone}</span>
            </a>

            <a
              href={site.emailHref}
              className="btn-base btn-glass font-bold"
            >
              <Mail className="size-4" />
              <span>Email Dispatch</span>
            </a>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-base btn-glass font-bold"
            >
              <Navigation className="size-4" />
              <span>Get Directions</span>
            </a>
          </div>

          {/* Hero 4-Item Trust Grid - Compact & Centered */}
          <div className="mt-6 sm:mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-3xl mx-auto pt-4 sm:pt-5 border-t border-white/15 text-center">
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-white font-display">70+ Units</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Active Commercial Fleet</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-amber-300 font-display">$0 Credit Card</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Cash, Zelle & Stripe</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-emerald-300 font-display">15-Min</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Fast Yard Turnaround</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-blue-300 font-display">Operators</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Turnkey Certified Drivers</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MAIN RENTAL REQUEST & COMMUNICATION SECTION ── */}
      <section
        id="rental-request-section"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        {/* Ambient background glow blooms */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#0040DD]/[0.04] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#16A34A]/[0.06] blur-3xl"
        />

        <div className="relative mx-auto max-w-[94rem] z-10">
          {/* Section Header */}
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0040DD] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0040DD]" />
              </span>
              <span>Direct Houston Inquiries • Instant Availability Check</span>
              <Sparkles className="size-3 text-[#0040DD]" />
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              Submit Your Rental Request or{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Contact Our Dispatchers
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              Fill out your machinery requirements below for immediate confirmation, or reach our Houston yard dispatch desk directly.
            </p>
          </Reveal>

          {/* 12-Column Grid Split: Request Form (Col 7) & Contact Cards (Col 5) */}
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 items-start">
            {/* ── LEFT COLUMN: Interactive Rental Request Form (col-span-7) ── */}
            <Reveal className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-8 lg:p-9 shadow-sm relative">
                {/* Form Header */}
                <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                      Equipment Booking Request
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      No credit card required. Houston dispatch responds within 15 minutes.
                    </p>
                  </div>

                  <div className="hidden sm:flex size-11 rounded-xl bg-blue-50 border border-blue-200/80 items-center justify-center text-[#0040DD] shrink-0">
                    <Truck className="size-5" />
                  </div>
                </div>

                {/* Pre-selected equipment banner if passed via search param */}
                {equipment && (
                  <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-[#0040DD] shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Pre-selected Equipment:{" "}
                        <strong className="text-slate-900 font-bold">{equipment}</strong>
                      </span>
                    </div>
                    <Link
                      to="/contact"
                      className="text-[11px] font-bold text-[#0040DD] hover:underline shrink-0"
                    >
                      Clear
                    </Link>
                  </div>
                )}

                {/* The Upgraded Form Component */}
                <RentalRequestForm defaultEquipment={equipment ?? ""} />
              </div>
            </Reveal>

            {/* ── RIGHT COLUMN: Houston Yard Dispatch & Communication Cards (col-span-5) ── */}
            <Reveal delay={90} className="lg:col-span-5 space-y-4">
              {/* Card 1: Direct Phone Call */}
              <div className="card-premium rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200/70">
                      <Phone className="size-6" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Direct Yard Phone
                      </span>
                      <a
                        href={site.phoneHref}
                        className="mt-1 block font-display text-2xl font-bold text-slate-900 hover:text-[#0040DD] transition-colors"
                      >
                        {site.phone}
                      </a>
                      <span className="text-xs font-semibold text-[#16A34A] flex items-center gap-1.5 mt-0.5">
                        <Clock className="size-3" />
                        <span>Mon–Sat: 7:00 AM – 7:00 PM (Central Time)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={site.phoneHref}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider text-center transition-all shadow-xs"
                  >
                    Call Dispatcher
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(site.phone, "Phone number", "phone")}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Copy phone number"
                  >
                    {copiedKey === "phone" ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    <span>{copiedKey === "phone" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Direct Email Inquiry */}
              <div className="card-premium rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#0040DD] border border-blue-200/70">
                    <Mail className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Houston Dispatch Email
                    </span>
                    <a
                      href={site.emailHref}
                      className="mt-1 block font-display text-lg sm:text-xl font-bold text-slate-900 hover:text-[#0040DD] transition-colors break-all"
                    >
                      {site.email}
                    </a>
                    <span className="text-xs font-semibold text-[#0040DD] flex items-center gap-1.5 mt-0.5">
                      <Zap className="size-3" />
                      <span>Average email reply under 15 minutes</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={site.emailHref}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0040DD] border border-blue-200/80 text-xs font-bold uppercase tracking-wider text-center transition-all"
                  >
                    Send Email
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(site.email, "Email address", "email")}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Copy email address"
                  >
                    {copiedKey === "email" ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    <span>{copiedKey === "email" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Houston Yard & Office */}
              <div className="card-premium rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-50 text-[#F59E0B] border border-amber-200/70">
                    <MapPin className="size-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Houston Yard & Fleet Depot
                    </span>
                    <div className="mt-1 font-display text-base sm:text-lg font-bold text-slate-900">
                      {site.street}
                      <br />
                      {site.city}
                    </div>
                    <span className="text-xs font-medium text-slate-500 mt-0.5 block">
                      Southwest Houston • Near Beltway 8 & US-59
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="size-3.5" />
                    <span>Get Directions</span>
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(`${site.street}, ${site.city}`, "Yard address", "address")
                    }
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Copy yard address"
                  >
                    {copiedKey === "address" ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    <span>{copiedKey === "address" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Card 4: Operating Hours & Live Status */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-display font-black text-sm uppercase tracking-wider">
                    <Clock className="size-4 text-[#0040DD]" />
                    <span>Yard Hours & Dispatch</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${yardStatus.isOpen
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${yardStatus.isOpen ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                        }`}
                    />
                    <span>{yardStatus.isOpen ? "Open Now" : "After Hours"}</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-800">Monday – Friday</span>
                    <span className="font-bold text-slate-900">7:00 AM – 7:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-800">Saturday</span>
                    <span className="font-bold text-slate-900">7:00 AM – 7:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-slate-800">Sunday</span>
                    <span className="font-semibold text-slate-500">Emergency & Appts Only</span>
                  </div>
                </div>
              </div>

              {/* Card 5: Payment Flexibility (Matching high-trust brand card) */}
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-blue-50/60 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#16A34A] text-xs font-black uppercase tracking-wider mb-2">
                  <ShieldCheck className="size-4" />
                  <span>No Traditional Credit Card Needed</span>
                </div>
                <p className="font-display text-xl sm:text-2xl font-black text-slate-900">
                  Cash • Zelle • Cash App
                </p>
                <p className="mt-1.5 text-xs text-slate-600 font-semibold leading-relaxed">
                  No credit walls or bureaucratic hold-ups. Clear flat daily and weekly rates.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 3. HOUSTON YARD MAP & HIGHWAY ACCESS GUIDE ── */}
      <section
        id="yard-location-section"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          {/* Header */}
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <Navigation className="size-3 text-[#0040DD]" />
              <span>Southwest Houston Fleet Yard • Rapid Regional Dispatch</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              Find Our Houston Yard &{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Highway Access Guide
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              Centrally located on S Wilcrest Dr with seamless connection to Beltway 8 and US-59 Southwest Freeway.
            </p>
          </Reveal>

          {/* 12-Column Map & Directions Hub */}
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 items-stretch">
            {/* Left Col (7): Google Maps Interactive View */}
            <Reveal className="lg:col-span-7 flex flex-col">
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-lg bg-white p-2.5 h-full flex flex-col">
                <div className="relative rounded-xl overflow-hidden bg-slate-100 flex-1 min-h-[380px] lg:min-h-[460px]">
                  <iframe
                    title="M3 Rental Houston Yard Map"
                    src={mapEmbedUrl}
                    loading="lazy"
                    className="size-full border-0 absolute inset-0"
                  />

                  {/* Floating Live Yard Tag */}
                  <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 rounded-full bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 text-[10.5px] font-black uppercase tracking-wider text-white shadow-lg border border-white/20">
                    <span className="size-2 rounded-full bg-[#16A34A] animate-ping" />
                    <span>M3 Rental Yard Active • {site.street}</span>
                  </div>
                </div>

                <div className="pt-3 px-1 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                    <MapPin className="size-4 text-[#0040DD]" />
                    <span>{site.street}, {site.city}</span>
                  </div>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0040DD] hover:underline"
                  >
                    <span>Open in Full Google Maps</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Right Col (5): Highway Landmarks & Drive-Time Hub */}
            <Reveal delay={100} className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              {/* Highway Proximity Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 font-display font-black text-sm uppercase tracking-wider mb-4">
                  <Compass className="size-4 text-[#0040DD]" />
                  <span>Immediate Freeway Connections</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
                    <span className="block text-lg font-black text-[#0040DD] font-display">~3 min</span>
                    <span className="text-[10.5px] font-bold text-slate-700">Beltway 8</span>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
                    <span className="block text-lg font-black text-[#16A34A] font-display">~4 min</span>
                    <span className="text-[10.5px] font-bold text-slate-700">US-59 / I-69</span>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
                    <span className="block text-lg font-black text-[#F59E0B] font-display">~8 min</span>
                    <span className="text-[10.5px] font-bold text-slate-700">Westpark Toll</span>
                  </div>
                </div>
              </div>

              {/* Estimated Drive Times from Greater Houston Hubs */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Estimated Drive Time to Yard
                  </span>
                  <span className="text-[11px] font-bold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-full">
                    SW Houston Yard
                  </span>
                </div>

                <div className="space-y-3">
                  {driveTimes.map((item) => (
                    <div
                      key={item.from}
                      className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                    >
                      <div>
                        <span className="block text-xs sm:text-sm font-bold text-slate-900">
                          {item.from}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.route}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-black text-[#0040DD] font-display bg-blue-50 px-2.5 py-1 rounded-lg">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jobsite Delivery Banner */}
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-emerald-50/60 p-4.5 flex items-start gap-3">
                <Truck className="size-5 text-[#0040DD] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    Jobsite Delivery Available
                  </span>
                  <p className="text-slate-600 font-medium mt-0.5">
                    We deliver flatbed machinery and trailers directly to jobsites in Harris, Fort Bend, Brazoria, Montgomery, and Waller counties.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 4. FREQUENTLY ASKED QUESTIONS (CONTACT & RENTAL VISITS) ── */}
      <section
        id="contact-faq-section"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <HelpCircle className="size-3 text-[#0040DD]" />
              <span>Rental & Yard Visit Questions</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Questions
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              Everything you need to know about visiting our Houston yard, equipment reservations, deposits, and payment options.
            </p>
          </Reveal>

          <div className="max-w-4xl mx-auto space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <Reveal key={index} delay={index * 40}>
                  <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <span className="font-display text-sm sm:text-base font-bold text-slate-900">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`size-5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#0040DD]" : ""
                          }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Quick Help Callout Box */}
          <div className="mt-12 max-w-2xl mx-auto rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 text-center">
            <h4 className="font-display text-base font-black text-slate-900">
              Have a custom project or immediate emergency?
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
              Our Houston dispatch team is standing by to assist with specialized rig requirements and same-day towing.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={site.phoneHref}
                className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
              >
                <Phone className="size-4" />
                <span>Call {site.phone}</span>
              </a>
              <a
                href={site.emailHref}
                className="btn-base btn-outline font-bold"
              >
                <Mail className="size-4" />
                <span>Email {site.email}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BOTTOM CINEMATIC CALL-TO-ACTION BANNER ── */}
      <section
        className="relative isolate overflow-hidden rounded-[10px] border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.12)] py-12 sm:py-18 px-6 sm:px-12 text-center mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden bg-slate-950">
          <img
            src={banner1}
            alt="M3 Rental heavy commercial equipment fleet ready in Houston"
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-center transform scale-105"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/70 to-black/50"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-xs mb-4">
            <Sparkles className="size-3.5 text-amber-400" />
            <span>Houston Commercial Equipment & Vehicle Rentals</span>
          </span>

          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Need Equipment on Your Jobsite Today?
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-200 font-medium max-w-xl mx-auto leading-relaxed">
            Stop by 11732 S Wilcrest Dr or call our dispatchers now. We keep your jobs moving with $0 credit card required.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={site.phoneHref}
              className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
            >
              <Phone className="size-4" />
              <span>Call Yard Dispatch: {site.phone}</span>
            </a>

            <Link
              to="/equipment"
              className="btn-base btn-glass font-bold"
            >
              <span>Explore 70+ Rental Units</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
