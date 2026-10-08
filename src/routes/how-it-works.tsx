import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coins,
  CreditCard,
  FileCheck,
  FileText,
  Hammer,
  HelpCircle,
  KeyRound,
  Layers,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UserCheck,
  WalletCards,
  Wrench,
  Zap,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/lib/site";

import banner1 from "@/assets/banner1.jpeg";
import ctaSunset from "@/assets/cta-sunset.jpg";
import operatorImg from "@/assets/operator.jpg";
import heroSite from "@/assets/hero-site.jpg";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      {
        title: "How It Works | Commercial Equipment Rental Process M3 Rental Houston",
      },
      {
        name: "description",
        content:
          "Learn how M3 Rental works for Houston contractors and businesses. Fast 4-step rental process, $0 credit card required, 15-min yard dispatch, and same-day jobsite delivery.",
      },
      {
        property: "og:title",
        content: "How Equipment Rental Works at M3 Rental | Houston, TX",
      },
      {
        property: "og:description",
        content:
          "Frictionless commercial equipment procurement: browse 70+ units, confirm in 15 minutes, pay via Cash/Zelle/Cash App/Stripe, and roll out to your jobsite.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorksPage,
});

const steps = [
  {
    step: "01",
    title: "Browse Fleet & Select Machinery",
    desc: "Explore 70+ commercial trucks, heavy trailers, and earthmoving machinery. Choose between self-operated equipment, operator-supported machinery, or our rent-to-buy track.",
    icon: Search,
    color: "text-[#0040DD]",
    bg: "bg-blue-50 border-blue-200/80",
    badge: "Step 01 • Select Fleet",
    highlights: [
      "70+ commercial units online",
      "Transparent flat day/week/month rates",
      "Half-ton to 1-ton trucks, 14K dump trailers & excavators",
    ],
  },
  {
    step: "02",
    title: "Confirm In Under 15 Minutes",
    desc: "Submit an online request or call our Southwest Houston yard directly. A dedicated local dispatcher immediately confirms machine availability, locks in your reservation, and prepares equipment staging.",
    icon: Clock,
    color: "text-[#16A34A]",
    bg: "bg-emerald-50 border-emerald-200/80",
    badge: "Step 02 • Instant Confirmation",
    highlights: [
      "Direct line to Houston yard dispatch",
      "Average response under 15 minutes",
      "No corporate hold lines or ticketing queues",
    ],
  },
  {
    step: "03",
    title: "Flexible Payment Without Credit Walls",
    desc: "Pay seamlessly with Cash, fee-free instant Zelle, Cash App, or credit/debit card via Stripe. We eliminate bureaucratic corporate applications, credit score walls, and personal guarantee demands.",
    icon: WalletCards,
    color: "text-[#F59E0B]",
    bg: "bg-amber-50 border-amber-200/80",
    badge: "Step 03 • Flexible Checkout",
    highlights: [
      "$0 traditional credit card requirement",
      "Cash, Zelle & Cash App welcomed",
      "Clear, upfront pricing with zero surprise surcharges",
    ],
  },
  {
    step: "04",
    title: "15-Min Yard Pickup or Jobsite Delivery",
    desc: "Pick up at our S Wilcrest Dr yard in under 15 minutes or request flatbed jobsite delivery across Greater Houston. If you requested a certified operator, they arrive turnkey ready to work.",
    icon: KeyRound,
    color: "text-[#0040DD]",
    bg: "bg-blue-50 border-blue-200/80",
    badge: "Step 04 • Deployment & Ignition",
    highlights: [
      "15-minute gate turnaround in SW Houston",
      "Direct jobsite hotshot delivery available",
      "Turnkey certified machine operators on standby",
    ],
  },
];

const rentalModes = [
  {
    title: "Self-Operated Fleet Rental",
    subtitle: "For Experienced Contractors & Trade Crews",
    desc: "Pick up the machinery or get it delivered to your site. Your licensed operators run the equipment on your timeline with full autonomy.",
    icon: Wrench,
    badge: "Self-Operated",
    features: [
      "Work trucks, dump trailers & midsize excavators",
      "Simple vehicle insurance verification",
      "Standard daily, weekly, or monthly contracts",
    ],
  },
  {
    title: "Turnkey Operator-Supported Rigs",
    subtitle: "Certified Machine Operators Included",
    desc: "Rent backhoes, bucket trucks, or excavators with an experienced, certified machine operator. Eliminates operator payroll overhead and on-site liability.",
    icon: UserCheck,
    badge: "Operator Included",
    features: [
      "Skilled, safety-certified machine drivers",
      "Included upfront at transparent pricing",
      "Zero operator hiring or workers' comp burden",
    ],
  },
  {
    title: "Rent-to-Buy Ownership Track",
    subtitle: "Turn Sunk Rental Costs into Asset Equity",
    desc: "A unique Houston program for tools and midsize machinery. Test machines on active jobs and apply your rental payments toward purchasing.",
    icon: Coins,
    badge: "Rent-to-Buy Option",
    features: [
      "Build machine equity while completing contracts",
      "Zero bank loan underwriting delays",
      "Trial period on active commercial jobsites",
    ],
  },
  {
    title: "Commercial Fleet Accounts",
    subtitle: "Volume Discounts for Multi-Week Projects",
    desc: "Dedicated dispatcher support, tiered volume rates, and consolidated billing for contractors managing multi-month commercial developments.",
    icon: Layers,
    badge: "Commercial Volume",
    features: [
      "Discounted weekly and monthly billing blocks",
      "Guaranteed fleet staging for upcoming project phases",
      "Flexible project extensions without penalties",
    ],
  },
];

const checklistItems = [
  {
    title: "1. Government-Issued Photo ID",
    desc: "A valid state driver's license for the authorized driver or company representative picking up the unit.",
    icon: FileText,
  },
  {
    title: "2. Active Vehicle Insurance",
    desc: "Standard proof of insurance coverage when renting motorized work trucks or towing heavy trailers.",
    icon: ShieldCheck,
  },
  {
    title: "3. Preferred Payment Method",
    desc: "Cash upon yard pickup, instant fee-free Zelle bank transfer, Cash App, or credit/debit card via Stripe.",
    icon: CreditCard,
  },
  {
    title: "4. Jobsite Delivery Address (Optional)",
    desc: "If requesting flatbed jobsite delivery, provide your jobsite address and preferred delivery time window.",
    icon: MapPin,
  },
];

const operationFaqs = [
  {
    q: "How fast can equipment be ready for pickup after I submit a request?",
    a: "If equipment is currently in the yard, it can be staged and prepped for key handover in as little as 15 minutes. We encourage calling (281) 933-5000 before heading over so our dispatchers have your unit inspected, fueled, and parked for an instant roll-out.",
  },
  {
    q: "Do I need a corporate credit card or a commercial credit score check?",
    a: "No! M3 Rental operates without credit score walls or personal credit checks. We accept Cash, fee-free Zelle bank transfers, Cash App, and standard debit/credit cards via Stripe with zero corporate credit bureaucracy.",
  },
  {
    q: "How does jobsite delivery work across the Greater Houston area?",
    a: "We operate dedicated flatbed and hotshot delivery trailers serving Harris, Fort Bend, Brazoria, Montgomery, and Waller counties. Rates depend on mileage and machine size. Dispatch coordinates precise arrival windows directly with your jobsite foreman.",
  },
  {
    q: "Can I extend my rental if weather or project timelines surge?",
    a: "Yes! Simply call or text our Houston dispatch desk. We extend reservations on the fly without cancellation penalties and automatically adjust your billing to volume-discounted weekly or monthly rates.",
  },
  {
    q: "How does the Rent-to-Buy program work in practice?",
    a: "For eligible tools and midsize equipment, a portion of every dollar you pay in rental fees is credited toward the purchase price of the machine. This allows growing contractors to test machinery on active commercial jobs and build equity without commercial bank loans.",
  },
  {
    q: "What attachments are available with excavators and skid steers?",
    a: "We carry heavy-duty trenching buckets, augers, pallet forks, and grading attachments. When submitting your rental request, note your required attachments and dispatch will ensure they are mounted and ready upon departure.",
  },
];

function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <SiteLayout>
      {/* ── 1. COMPACT CENTERED HERO SECTION (Matching Contact & Why M3) ── */}
      <section
        className="relative isolate min-h-[320px] sm:min-h-[360px] md:min-h-[390px] overflow-hidden flex items-center justify-center py-8 sm:py-10 md:py-12 lg:py-14 rounded-[10px] border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.12)] mx-auto mb-3 sm:mb-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        {/* Background Image with Ken Burns zoom effect */}
        <div className="absolute inset-0 -z-30 overflow-hidden bg-slate-950">
          <img
            src={banner1}
            alt="M3 Rental heavy excavator and commercial equipment in Houston"
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
              <span>Contractor-Grade Equipment Procurement • Houston, TX</span>
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-3 py-1 text-[10.5px] sm:text-xs font-bold text-emerald-300 backdrop-blur-md shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>Simple 4-Step Process • $0 Credit Card Required • Same-Day Dispatch</span>
            </span>
          </div>

          {/* Main Headline - Centered */}
          <h1
            className="font-display text-[23px] sm:text-[28px] md:text-[34px] lg:text-[38px] font-extrabold capitalize tracking-tight text-white leading-[31px] sm:leading-[37px] md:leading-[43px] text-center"
            style={{
              textShadow: "0 2px 12px rgba(0, 0, 0, 0.8)",
            }}
          >
            Commercial Rental Made Effortless <br />
            <span className="text-[#3daf05]">
              How M3 Rental Works
            </span>
          </h1>

          {/* Description - Centered */}
          <p className="mt-3 text-[13px] sm:text-[14.5px] text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto text-center">
            From single-day tool rentals to multi-month commercial fleet contracts. Learn how our frictionless reservation, flexible payments (Cash, Zelle, Cash App, Stripe), turnkey operator options, and 15-minute dispatch get machines to your jobsite without corporate delays.
          </p>

          {/* Hero Quick Action Buttons - Centered */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
            >
              <FileCheck className="size-4 text-white" />
              <span>Start Rental Request</span>
            </Link>

            <a
              href={site.phoneHref}
              className="btn-base btn-glass font-bold"
            >
              <Phone className="size-4" />
              <span>Call Dispatch: {site.phone}</span>
            </a>

            <Link
              to="/equipment"
              className="btn-base btn-glass font-bold"
            >
              <span>Browse Fleet Inventory</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Hero 4-Item Trust Grid - Compact & Centered */}
          <div className="mt-6 sm:mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-3xl mx-auto pt-4 sm:pt-5 border-t border-white/15 text-center">
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-emerald-300 font-display">15-Min</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Fast Yard Turnaround</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-amber-300 font-display">$0 Credit Card</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Cash, Zelle & Stripe</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-blue-300 font-display">Turnkey Operators</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Certified Machine Drivers</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-white font-display">Jobsite Delivery</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Greater Houston Coverage</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. THE 4-STEP COMMERCIAL PROCUREMENT WORKFLOW ── */}
      <section
        id="rental-steps"
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
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <Zap className="size-3 text-[#0040DD]" />
              <span>4-Step Commercial Procurement Workflow</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              How Houston Crews Get Moving in{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                4 Simple Steps
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              We eliminated bureaucratic rental roadblocks so your crews can secure equipment and get straight to work.
            </p>
          </Reveal>

          {/* 4 Steps Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.step} delay={index * 60}>
                  <div className="card-premium rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-lg transition-all h-full flex flex-col justify-between relative group">
                    <div>
                      {/* Top Step Pill & Icon */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="size-10 rounded-xl bg-slate-900 text-white font-display font-black text-sm flex items-center justify-center shadow-xs">
                          {item.step}
                        </span>
                        <div
                          className={`size-10 rounded-xl flex items-center justify-center border ${item.bg}`}
                        >
                          <Icon className={`size-5 ${item.color}`} />
                        </div>
                      </div>

                      <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mb-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      {item.highlights.map((highlight) => (
                        <div
                          key={highlight}
                          className="flex items-start gap-1.5 text-[11px] text-slate-600 font-medium"
                        >
                          <CheckCircle2 className="size-3 text-[#16A34A] shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. FOUR COMMERCIAL PROCUREMENT MODES ── */}
      <section
        id="procurement-modes"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <Layers className="size-3 text-[#0040DD]" />
              <span>Tailored Procurement Modes • Match Your Operational Needs</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              Choose the Operational Setup That{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Fits Your Jobsite
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              Whether you need raw machinery, turnkey certified operators, or an asset-building Rent-to-Buy track, M3 adapts to your workflow.
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rentalModes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <Reveal key={mode.title} delay={index * 50}>
                  <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="size-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-[#0040DD] shadow-2xs">
                          <Icon className="size-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#0040DD] bg-blue-50 px-2.5 py-1 rounded-full">
                          {mode.badge}
                        </span>
                      </div>

                      <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mb-1 leading-snug">
                        {mode.title}
                      </h3>

                      <span className="block text-[11px] font-bold text-slate-500 mb-2">
                        {mode.subtitle}
                      </span>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                        {mode.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 space-y-1.5">
                      {mode.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-1.5 text-[11px] text-slate-700 font-semibold"
                        >
                          <CheckCircle2 className="size-3 text-[#16A34A] shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. WHAT BUSINESSES NEED (ONBOARDING CHECKLIST) ── */}
      <section
        id="contractor-checklist"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            {/* Visual Callout (Col 5) */}
            <Reveal className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-xl bg-slate-950 p-2 relative group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <img
                    src={operatorImg}
                    alt="Houston contractor picking up equipment at M3 Rental yard"
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-[#0040DD] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-1">
                      15-Minute Yard Release
                    </span>
                    <h4 className="text-white font-display font-black text-lg leading-snug">
                      Fastest Equipment Turnaround in SW Houston
                    </h4>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Checklist Details (Col 7) */}
            <Reveal delay={90} className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-300 bg-blue-50 text-[#0040DD] text-xs font-black uppercase tracking-wider">
                <BadgeCheck className="size-3.5 text-[#0040DD]" />
                <span>Zero Bureaucracy Checklist</span>
              </div>

              <h2 className="display-lg text-slate-900 font-black tracking-tight leading-tight">
                What You Need to Rent:{" "}
                <span className="bg-gradient-to-r from-[#0040DD] to-[#16A34A] bg-clip-text text-transparent">
                  No 10-Page Forms.
                </span>
              </h2>

              <p className="text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
                Traditional rental corporations make commercial clients wait days for credit checks. At M3 Rental, all you need are these 4 simple items to get equipment moving today:
              </p>

              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                {checklistItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-slate-200/80 bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-2.5 text-slate-900 font-bold text-xs font-display mb-1">
                        <Icon className="size-4 text-[#0040DD] shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/contact"
                  className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
                >
                  <FileCheck className="size-4" />
                  <span>Reserve Equipment Now</span>
                </Link>

                <a
                  href={site.phoneHref}
                  className="btn-base btn-outline font-bold"
                >
                  <Phone className="size-4 text-[#16A34A]" />
                  <span>Call {site.phone}</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 5. EXTENDING, RETURNING & RENT-TO-BUY TRANSITIONS ── */}
      <section
        id="lifecycle-management"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <RefreshCw className="size-3 text-[#0040DD]" />
              <span>Flexible Project Lifecycles • Hassle-Free Management</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              Need More Time or Want to Own?{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                We've Got You Covered.
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              Real jobsites have unpredictable schedules, weather delays, and expanding scopes. M3 gives you total flexibility.
            </p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            <Reveal delay={40}>
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-all h-full">
                <div className="size-11 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#0040DD] mb-4">
                  <Clock className="size-5" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mb-2">
                  Seamless Project Extensions
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                  Encounter rain delays or jobsite scope expansion? Text or call dispatch to extend your rental. No penalty fees, and your rate automatically transitions to discounted weekly or monthly pricing tiers.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0040DD]">
                  <CheckCircle2 className="size-3.5 text-[#16A34A]" />
                  <span>Zero extension penalties</span>
                </span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-all h-full">
                <div className="size-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#16A34A] mb-4">
                  <CheckCircle2 className="size-5" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mb-2">
                  Fast 10-Minute Returns
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                  Drop off equipment at our S Wilcrest yard Monday through Saturday. Our staff conducts an immediate check-in walkaround and issues instant digital receipts so your crews can move to the next site.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#16A34A]">
                  <CheckCircle2 className="size-3.5 text-[#16A34A]" />
                  <span>Immediate deposit release</span>
                </span>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-all h-full">
                <div className="size-11 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#F59E0B] mb-4">
                  <Coins className="size-5" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mb-2">
                  Convert to Purchase (Rent-to-Buy)
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                  Loved how the machinery performed on your site? Convert your rental agreement into a purchase. A portion of your rental payments is credited directly toward purchasing the unit.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                  <CheckCircle2 className="size-3.5 text-[#16A34A]" />
                  <span>Build equipment equity</span>
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 6. HOW IT WORKS FAQS ── */}
      <section
        id="how-it-works-faq"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <HelpCircle className="size-3 text-[#0040DD]" />
              <span>Operational & Rental FAQs</span>
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
              Everything you need to know about dispatch timing, jobsite delivery, payment options, and extensions.
            </p>
          </Reveal>

          <div className="max-w-4xl mx-auto space-y-3">
            {operationFaqs.map((faq, index) => {
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
              Need immediate machinery dispatch right now?
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
              Our Houston yard dispatch desk is staffed Mon–Sat from 7:00 AM to 7:00 PM for instant equipment releases.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={site.phoneHref}
                className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
              >
                <Phone className="size-4" />
                <span>Call Dispatch: {site.phone}</span>
              </a>
              <Link
                to="/contact"
                className="btn-base btn-outline font-bold"
              >
                <span>Submit Rental Request</span>
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
            src={ctaSunset}
            alt="M3 Rental heavy equipment fleet ready in Houston"
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
            Ready to Get Equipment Moving on Your Jobsite?
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-200 font-medium max-w-xl mx-auto leading-relaxed">
            Stop by 11732 S Wilcrest Dr, call our yard dispatch desk directly, or submit your online rental request in under 2 minutes.
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
