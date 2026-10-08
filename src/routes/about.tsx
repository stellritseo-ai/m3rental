import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  FileCheck,
  Hammer,
  HardHat,
  HelpCircle,
  Layers,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UserCheck,
  Users,
  WalletCards,
  Wrench,
  Zap,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { directionsUrl, site } from "@/lib/site";

import heroSite from "@/assets/hero-site.jpg";
import operatorImg from "@/assets/operator.jpg";
import banner3 from "@/assets/banner3.jpeg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About M3 Rental | Houston Equipment Rental Company & Fleet Partner",
      },
      {
        name: "description",
        content:
          "Learn about M3 Rental in Houston, TX. Locally owned commercial equipment rental partner serving general contractors, trades, and businesses with 70+ units, flexible payments, and $0 credit card barriers.",
      },
      { property: "og:title", content: "About M3 Rental | Houston, TX" },
      {
        property: "og:description",
        content:
          "Equipment that helps you get the job done — 70+ commercial rental units in Houston, Texas with cash/Zelle/Cash App/Stripe acceptance and turnkey machine operators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const coreValues = [
  {
    icon: WalletCards,
    title: "Frictionless Capital Access",
    desc: "We protect our clients' cash flow. Zero credit score walls, no frozen corporate credit cards, and instant acceptance of Cash, Zelle, Cash App, and Stripe.",
    color: "text-[#F59E0B]",
    bg: "bg-amber-50 border-amber-200/80",
    badge: "Financial Flexibility",
  },
  {
    icon: Zap,
    title: "15-Minute Yard Turnaround",
    desc: "Every minute your crew sits waiting in a rental office is wasted revenue. We stage equipment in advance so key handoffs take under 15 minutes.",
    color: "text-[#0040DD]",
    bg: "bg-blue-50 border-blue-200/80",
    badge: "Speed of Execution",
  },
  {
    icon: UserCheck,
    title: "Turnkey Operator Expertise",
    desc: "Contractors shouldn't have to carry high insurance liabilities for specialized machinery. Selected heavy equipment can be rented with skilled, certified operators.",
    color: "text-[#16A34A]",
    bg: "bg-emerald-50 border-emerald-200/80",
    badge: "Operator Support",
  },
  {
    icon: Award,
    title: "Rent-to-Buy Machine Equity",
    desc: "Houston's unique program turning sunk rental costs into asset equity. Growing contractors can credit rental payments toward purchasing tools and machinery.",
    color: "text-[#F59E0B]",
    bg: "bg-amber-50 border-amber-200/80",
    badge: "Asset Building",
  },
];

const maintenanceChecklist = [
  {
    title: "25-Point Mechanical & Hydraulic Inspection",
    desc: "Before every rental departure, fluid levels, hydraulic pressures, hoses, brake pads, and tire treads undergo strict mechanical verification.",
  },
  {
    title: "Manufacturer-Certified Preventative Servicing",
    desc: "Diesel engines, hydraulic booms, and powertrain components are serviced on strict engine-hour intervals to eliminate unexpected on-site downtime.",
  },
  {
    title: "Cabin Sanitization & Control Certification",
    desc: "Operator cabs, steering controls, and instrumentation are thoroughly cleaned, tested, and certified jobsite-ready before keys are released.",
  },
  {
    title: "Commercial-Grade Attachment Rigging",
    desc: "Trenching buckets, augers, pallet forks, and hydraulic dump hoists are load-tested and securely fitted prior to customer departure or delivery.",
  },
];

const serviceRegions = [
  {
    region: "Harris County",
    coverage: "Southwest Houston, Downtown, Galleria, Pasadena, Spring, Humble",
    tag: "Primary Yard Depot",
  },
  {
    region: "Fort Bend County",
    coverage: "Sugar Land, Stafford, Missouri City, Richmond, Rosenberg",
    tag: "Immediate Response",
  },
  {
    region: "West Houston & Katy",
    coverage: "Energy Corridor, Katy, Cinco Ranch, Fulshear, Brookshire",
    tag: "Daily Jobsite Hauling",
  },
  {
    region: "Brazoria & Montgomery",
    coverage: "Pearland, Manvel, Alvin, Conroe, The Woodlands",
    tag: "Regional Dispatch",
  },
];

const aboutFaqs = [
  {
    q: "Is M3 Rental locally owned and operated in Houston?",
    a: "Yes! M3 Rental is 100% locally owned and operated right here in Houston, Texas. Our fleet depot is centrally located at 11732 S Wilcrest Dr in Southwest Houston, providing rapid access to Beltway 8 and US-59 for quick dispatch across Greater Houston.",
  },
  {
    q: "How did M3 Rental start and what makes it different from corporate chains?",
    a: "M3 Rental was founded by construction and fleet professionals who saw firsthand the bureaucracy of national rental corporations—rigid credit card policies, long lines, surprise fees, and impersonal call centers. We built M3 to be agile: 15-minute key releases, cash and Zelle acceptance, operator-supported machinery, and direct phone access to local dispatchers.",
  },
  {
    q: "Can businesses and subcontractors establish commercial rental accounts?",
    a: "Absolutely. We work with dozens of general contractors, framing crews, roofers, landscapers, and utility subcontractors across Texas. We offer discounted weekly and monthly commercial volume blocks and dedicated fleet reservations.",
  },
  {
    q: "What types of machinery and commercial vehicles do you maintain?",
    a: "Our fleet includes 70+ units: half-ton to 1-ton crew cab pickups, 14,000 lb hydraulic dump trailers, gooseneck flatbeds, backhoe loaders, mini excavators, passenger shuttle vans, and specialty utility rigs like bucket trucks and mobile LED trailers.",
  },
  {
    q: "How do you ensure machinery is safe and job-ready before dispatch?",
    a: "Every single piece of equipment undergoes a comprehensive 25-point inspection before leaving our yard. We test hydraulics, inspect brakes, verify safety shutoffs, and clean cabins so your crew can start working immediately without delays or safety hazards.",
  },
  {
    q: "Can contractors visit the Houston fleet yard to inspect machines before booking?",
    a: "Yes! Walk-ins are always welcome Monday through Saturday between 7:00 AM and 7:00 PM at our S Wilcrest Dr yard. You can view our machinery in person, talk to dispatchers, and choose the exact unit that fits your project scope.",
  },
];

function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <SiteLayout>
      {/* ── 1. COMPACT CENTERED HERO SECTION (Matching Contact, Why M3, How It Works) ── */}
      <section
        className="relative isolate min-h-[320px] sm:min-h-[360px] md:min-h-[390px] overflow-hidden flex items-center justify-center py-8 sm:py-10 md:py-12 lg:py-14 rounded-[10px] border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.12)] mx-auto mb-3 sm:mb-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        {/* Background Image with Ken Burns zoom effect */}
        <div className="absolute inset-0 -z-30 overflow-hidden bg-slate-950">
          <img
            src={heroSite}
            alt="M3 Rental commercial machinery working on Houston Texas construction site"
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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10.5px] sm:text-xs font-semibold text-white backdrop-blur-md shadow-xs">
              <span className="flex text-amber-400 gap-0.5 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3 sm:size-3.5 fill-current text-amber-400" />
                ))}
              </span>
              <span>Houston's Independent Commercial Equipment Partner</span>
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-3 py-1 text-[10.5px] sm:text-xs font-bold text-emerald-300 backdrop-blur-md shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>70+ Commercial Units • Locally Owned & Operated • Houston Yard</span>
            </span>
          </div>

          {/* Main Headline - Centered */}
          <h1
            className="font-display text-[23px] sm:text-[28px] md:text-[34px] lg:text-[38px] font-extrabold capitalize tracking-tight text-white leading-[31px] sm:leading-[37px] md:leading-[43px] text-center"
            style={{
              textShadow: "0 2px 12px rgba(0, 0, 0, 0.8)",
            }}
          >
            Powering Houston Trade Contractors <br />
            <span className="text-[#3daf05]">
              About M3 Rental
            </span>
          </h1>

          {/* Description - Centered */}
          <p className="mt-3 text-[13px] sm:text-[14.5px] text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto text-center">
            Founded in Houston, Texas, M3 Rental was built to solve the frustration of corporate equipment rental. We combine commercial-grade machinery, flexible payment terms without credit walls, and turnkey operator expertise to keep local jobs moving.
          </p>

          {/* Hero Quick Action Buttons - Centered */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
            >
              <FileCheck className="size-4 text-white" />
              <span>Connect with Houston Team</span>
            </Link>

            <a
              href={site.phoneHref}
              className="btn-base btn-glass font-bold"
            >
              <Phone className="size-4" />
              <span>Call Direct: {site.phone}</span>
            </a>

            <Link
              to="/equipment"
              className="btn-base btn-glass font-bold"
            >
              <span>Explore 70+ Units</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Hero 4-Item Trust Grid - Compact & Centered */}
          <div className="mt-6 sm:mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-3xl mx-auto pt-4 sm:pt-5 border-t border-white/15 text-center">
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-white font-display">70+ Units</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Commercial Fleet</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-amber-300 font-display">100% Local</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">SW Houston Yard</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-emerald-300 font-display">$0 Credit Card</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Cash, Zelle & Stripe</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-blue-300 font-display">15-Min</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Fast Gate Turnaround</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. OUR FOUNDING STORY & PURPOSE ── */}
      <section
        id="founding-story"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#0040DD]/[0.04] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#16A34A]/[0.06] blur-3xl"
        />

        <div className="relative mx-auto max-w-[94rem] z-10">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Visual Media (Col 5) */}
            <Reveal className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-xl bg-slate-950 p-2 relative group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <img
                    src={heroSite}
                    alt="M3 Rental Houston headquarters and machinery fleet"
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-[#0040DD] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-1">
                      Houston Yard & Depot
                    </span>
                    <h4 className="text-white font-display font-black text-lg leading-snug">
                      11732 S Wilcrest Dr, Houston, TX
                    </h4>
                  </div>
                </div>
              </div>

              {/* Quick Yard Credential Badges */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-center">
                  <span className="block text-base font-black text-[#0040DD] font-display">Mon–Sat</span>
                  <span className="text-[11px] font-semibold text-slate-600">7:00 AM – 7:00 PM</span>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-center">
                  <span className="block text-base font-black text-[#16A34A] font-display">Direct</span>
                  <span className="text-[11px] font-semibold text-slate-600">(281) 933-5000</span>
                </div>
              </div>
            </Reveal>

            {/* Narrative (Col 7) */}
            <Reveal delay={80} className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-300 bg-blue-50 text-[#0040DD] text-xs font-black uppercase tracking-wider">
                <Building2 className="size-3.5 text-[#0040DD]" />
                <span>Our Origin & Purpose</span>
              </div>

              <h2 className="display-lg text-slate-900 font-black tracking-tight leading-tight">
                Born to Eliminate Rental Roadblocks for{" "}
                <span className="bg-gradient-to-r from-[#0040DD] to-[#16A34A] bg-clip-text text-transparent">
                  Texas Trades.
                </span>
              </h2>

              <p className="text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
                For years, construction crews and independent subcontractors across Houston faced the same frustration when renting equipment: lengthy corporate applications, mandatory commercial credit card freezes, surprise checkout surcharges, and long counter waits.
              </p>

              <p className="text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
                M3 Rental was created to offer an agile, contractor-friendly alternative. Located in Southwest Houston, we hold equipment availability sacred, eliminate bureaucratic hurdles, and accept payment methods that respect contractor cash flow—including Cash, Zelle, Cash App, and Stripe.
              </p>

              {/* 4 Pillars Grid */}
              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs font-display">
                    <CheckCircle2 className="size-4 text-[#16A34A]" />
                    <span>No Credit Barriers</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Rent tools and heavy machinery without freezing lines of credit.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs font-display">
                    <CheckCircle2 className="size-4 text-[#16A34A]" />
                    <span>15-Minute Turnaround</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Pre-staged equipment ensures key handoffs in under 15 minutes.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/equipment"
                  className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
                >
                  <span>Explore Equipment Fleet</span>
                  <ArrowRight className="size-4" />
                </Link>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-base btn-outline font-bold"
                >
                  <MapPin className="size-4 text-[#0040DD]" />
                  <span>Visit Our Yard</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 3. FOUR CORE VALUES & OPERATING PRINCIPLES ── */}
      <section
        id="core-values"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <Sparkles className="size-3 text-[#0040DD]" />
              <span>Core Operating Principles</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              The Standards That Guide Every{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Dispatch & Reservation
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              Our business values are designed around real jobsite realities: speed, respect, transparent pricing, and reliability.
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((val, index) => {
              const Icon = val.icon;
              return (
                <Reveal key={val.title} delay={index * 50}>
                  <div className="card-premium rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-lg transition-all h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`size-12 rounded-xl flex items-center justify-center border ${val.bg}`}
                        >
                          <Icon className={`size-6 ${val.color}`} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          {val.badge}
                        </span>
                      </div>

                      <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mb-2">
                        {val.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {val.desc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-[#16A34A]">
                      <CheckCircle2 className="size-3.5" />
                      <span>Guaranteed Standard</span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. FLEET INTEGRITY & MAINTENANCE STANDARDS ── */}
      <section
        id="fleet-standards"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Checklist Column (Col 7) */}
            <Reveal className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-[#16A34A] text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="size-3.5 text-[#16A34A]" />
                <span>Jobsite Reliability Protocol</span>
              </div>

              <h2 className="display-lg text-slate-900 font-black tracking-tight leading-tight">
                Rigorous Fleet Maintenance for{" "}
                <span className="bg-gradient-to-r from-[#0040DD] to-[#16A34A] bg-clip-text text-transparent">
                  Zero Jobsite Downtime.
                </span>
              </h2>

              <p className="text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
                When equipment breaks down in the field, timelines surge and profit evaporates. M3 Rental subjects every vehicle, trailer, and earthmover to a strict 4-phase preventative maintenance protocol before any dispatch.
              </p>

              <div className="space-y-3 pt-1">
                {maintenanceChecklist.map((item, idx) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm font-display mb-1">
                      <span className="size-5 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center text-[11px] font-black shrink-0">
                        {idx + 1}
                      </span>
                      <span>{item.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed pl-7">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Visual Media & Operator Commitment (Col 5) */}
            <Reveal delay={90} className="lg:col-span-5 space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-xl bg-slate-950 p-2 relative group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <img
                    src={operatorImg}
                    alt="Professional machine operator testing excavator hydraulics"
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-[#16A34A] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-1">
                      Certified Operators Available
                    </span>
                    <h4 className="text-white font-display font-black text-lg leading-snug">
                      Operator-Supported Machinery
                    </h4>
                  </div>
                </div>
              </div>

              {/* High-Trust Regulatory Box */}
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/60 p-5 shadow-sm text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-[#0040DD] font-black uppercase tracking-wider font-display">
                  <BadgeCheck className="size-4" />
                  <span>Safety & Compliance Standards</span>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  All equipment meets rigorous Texas DOT safety standards. Motorized vehicles and trailers receive routine brake, tire, and axle inspections before rolling out to client sites.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 5. REGIONAL COVERAGE & HOUSTON SERVICE REACH ── */}
      <section
        id="regional-coverage"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <Compass className="size-3 text-[#0040DD]" />
              <span>Greater Houston Service Reach</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              Supporting Jobsites Across{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Greater Houston & Texas
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              Our central yard on S Wilcrest Dr gives crews swift access to major Texas transport arteries: Beltway 8, US-59, I-69, and Westpark Tollway.
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceRegions.map((reg, index) => (
              <Reveal key={reg.region} delay={index * 50}>
                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#0040DD] bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                        {reg.tag}
                      </span>
                      <MapPin className="size-4 text-slate-400" />
                    </div>

                    <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mb-2">
                      {reg.region}
                    </h3>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {reg.coverage}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs font-bold text-[#16A34A] flex items-center gap-1.5">
                    <Truck className="size-3.5" />
                    <span>Flatbed Delivery Available</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. ABOUT M3 FAQS ── */}
      <section
        id="about-faq"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <HelpCircle className="size-3 text-[#0040DD]" />
              <span>Company & Operations FAQ</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              Frequently Asked Questions About{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                M3 Rental
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              Learn more about our local team, booking process, commercial accounts, and fleet standards.
            </p>
          </Reveal>

          <div className="max-w-4xl mx-auto space-y-3">
            {aboutFaqs.map((faq, index) => {
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
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`size-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#0040DD]" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-12 max-w-2xl mx-auto rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 text-center">
            <h4 className="font-display text-base font-black text-slate-900">
              Want to visit our Houston fleet depot in person?
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
              Stop by 11732 S Wilcrest Dr Monday through Saturday from 7:00 AM to 7:00 PM for machine walkarounds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={site.phoneHref}
                className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
              >
                <Phone className="size-4" />
                <span>Call {site.phone}</span>
              </a>
              <Link
                to="/contact"
                className="btn-base btn-outline font-bold"
              >
                <span>Contact Dispatch Desk</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. CINEMATIC BOTTOM CTA ── */}
      <section
        className="relative isolate overflow-hidden rounded-[10px] border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.12)] py-12 sm:py-18 px-6 sm:px-12 text-center mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="absolute inset-0 -z-20 overflow-hidden bg-slate-950">
          <img
            src={banner3}
            alt="M3 Rental commercial equipment fleet ready in Houston"
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
            <span>Houston Commercial Equipment Partner</span>
          </span>

          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Partner with Houston's Most Accessible Equipment Fleet.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-200 font-medium max-w-xl mx-auto leading-relaxed">
            Stop by 11732 S Wilcrest Dr, call our Houston dispatchers, or submit your rental reservation online in under 2 minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
            >
              <FileCheck className="size-4 text-white" />
              <span>Submit Rental Request</span>
            </Link>

            <a
              href={site.phoneHref}
              className="btn-base btn-glass font-bold"
            >
              <Phone className="size-4" />
              <span>Call Yard Dispatch: {site.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
