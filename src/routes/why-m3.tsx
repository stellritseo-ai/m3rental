import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coins,
  Compass,
  CreditCard,
  DollarSign,
  FileCheck,
  Hammer,
  HardHat,
  HelpCircle,
  Layers,
  MapPin,
  Phone,
  Scale,
  ShieldAlert,
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
import { site } from "@/lib/site";

import banner3 from "@/assets/banner3.jpeg";
import banner1 from "@/assets/banner1.jpeg";
import operatorImg from "@/assets/operator.jpg";
import heroSite from "@/assets/hero-site.jpg";

export const Route = createFileRoute("/why-m3")({
  head: () => ({
    meta: [
      {
        title: "Why M3 Rental | Commercial Equipment & Contractor Solutions Houston, TX",
      },
      {
        name: "description",
        content:
          "Discover why Houston contractors and commercial businesses partner with M3 Rental. $0 credit card required, rent-to-buy equity options, turnkey machine operators, and 70+ commercial units with 15-min dispatch.",
      },
      {
        property: "og:title",
        content: "Why Choose M3 Rental | Houston Commercial Equipment",
      },
      {
        property: "og:description",
        content:
          "Built for Houston businesses: cash/Zelle/Cash App/Stripe payments, rent-to-buy machinery, certified operators, and transparent commercial pricing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WhyM3Page,
});

const comparisonPoints = [
  {
    feature: "Payment Flexibility & Approvals",
    traditional:
      "Strict corporate credit score checks, lengthy financial paperwork, and high credit card hold deposits.",
    m3: "Cash, instant fee-free Zelle, Cash App, or Stripe accepted. Zero bureaucratic hold-ups or credit walls.",
    m3Highlight: "Immediate Release",
  },
  {
    feature: "Equipment Ownership & Equity",
    traditional:
      "100% sunk cost. Every dollar spent on monthly rentals produces zero equity or eventual asset ownership.",
    m3: "Houston's unique Rent-to-Buy program for tools & midsize machinery, converting rental dollars into equity.",
    m3Highlight: "Rent-to-Buy Option",
  },
  {
    feature: "Machine Operators & Drivers",
    traditional:
      "Self-operated only. You must recruit, vet, and carry high payroll insurance for certified operators.",
    m3: "Selected heavy excavators, backhoes, and bucket trucks available with certified turnkey operators.",
    m3Highlight: "Turnkey Operator Included",
  },
  {
    feature: "Turnaround & Staging Speed",
    traditional:
      "45–60 minute counter queues, corporate dispatch delays, and rigid reservation cancellation penalties.",
    m3: "15-minute key handoff at our S Wilcrest yard or same-day hotshot jobsite delivery across Greater Houston.",
    m3Highlight: "15-Min Yard Dispatch",
  },
  {
    feature: "Commercial Rate Transparency",
    traditional:
      "Hidden environmental surcharges, mandatory damage waiver extras, and unexpected fuel recharge spikes.",
    m3: "Upfront, transparent daily, weekly volume-discounted, and monthly commercial project rates.",
    m3Highlight: "Zero Hidden Surcharges",
  },
  {
    feature: "Local Dispatch Knowledge",
    traditional:
      "Impersonal national call center routing tickets to out-of-state representatives unfamiliar with Houston.",
    m3: "Direct phone access to local yard dispatchers who know Houston freeways, soil conditions, and jobsite codes.",
    m3Highlight: "100% Houston Local",
  },
];

const commercialPillars = [
  {
    icon: WalletCards,
    title: "Preserve Business Working Capital",
    desc: "Avoid locking up tens of thousands of dollars in commercial credit card limits. Use Cash, Zelle, Cash App, or cards with flat, tax-deductible rental expense billing.",
    color: "text-[#F59E0B]",
    bg: "bg-amber-50 border-amber-200/70",
    badge: "Cash Flow Protection",
  },
  {
    icon: Coins,
    title: "Houston's Rent-to-Buy Equity Program",
    desc: "Growing subcontractors can apply rental payments toward purchasing tools and midsize machinery. Test machines on active jobs before making capital purchase commitments.",
    color: "text-[#16A34A]",
    bg: "bg-emerald-50 border-emerald-200/70",
    badge: "Asset Building",
  },
  {
    icon: UserCheck,
    title: "Turnkey Certified Machine Operators",
    desc: "Eliminate equipment damage liability and specialized operator recruiting costs. Rent backhoes, bucket trucks, and earthmovers with experienced operators ready to work.",
    color: "text-[#0040DD]",
    bg: "bg-blue-50 border-blue-200/70",
    badge: "Zero Operator Overhead",
  },
  {
    icon: Truck,
    title: "70+ Commercial-Grade Units",
    desc: "From half-ton and 1-ton crew cabs to 14K hydraulic dump trailers, goosenecks, passenger vans, and excavation rigs. Inspected and maintained for maximum jobsite uptime.",
    color: "text-[#0040DD]",
    bg: "bg-blue-50 border-blue-200/70",
    badge: "Heavy-Duty Fleet",
  },
  {
    icon: Clock,
    title: "15-Minute Yard Key Handover",
    desc: "Your crews can't afford to sit idle waiting in rental lobbies. Pre-stage machinery with a quick phone call and roll out of our Southwest Houston yard in under 15 minutes.",
    color: "text-[#16A34A]",
    bg: "bg-emerald-50 border-emerald-200/70",
    badge: "Fast Dispatch",
  },
  {
    icon: ShieldCheck,
    title: "Greater Houston Jobsite Delivery",
    desc: "Hotshot and flatbed delivery directly to commercial job sites across Harris, Fort Bend, Brazoria, and Montgomery counties, keeping your timelines strictly on target.",
    color: "text-[#F59E0B]",
    bg: "bg-amber-50 border-amber-200/70",
    badge: "Direct Jobsite Delivery",
  },
];

const industriesServed = [
  {
    title: "General Contractors & Commercial Framing",
    desc: "Heavy-duty 1-ton work trucks, gooseneck trailers, and material-moving equipment to stage job sites efficiently.",
    icon: Building2,
    badge: "Commercial Construction",
    units: ["Full-Size Work Pickups", "Gooseneck Flatbeds", "Forklifts"],
  },
  {
    title: "Excavation, Utilities & Underground Rigs",
    desc: "Backhoe loaders, mini excavators, and trenching machinery available with experienced operators to meet tight deadlines.",
    icon: HardHat,
    badge: "Earthmoving & Trenching",
    units: ["Tractor Backhoes", "Excavators", "Operator Service"],
  },
  {
    title: "Roofing, Demolition & Site Clean-Up",
    desc: "High-capacity hydraulic 14K dump trailers for rapid shingle disposal, construction debris, and concrete teardown.",
    icon: Layers,
    badge: "Debris Removal",
    units: ["14,000 lb Dump Trailers", "Heavy Tow Pickups", "Tarp Systems"],
  },
  {
    title: "Landscaping, Grading & Site Prep",
    desc: "Skid steers, dump haulers, and utility equipment trailers built to move dirt, gravel, sod, and trees without equipment strain.",
    icon: Wrench,
    badge: "Site Development",
    units: ["Skid Steer Loaders", "Utility Trailers", "Grading Attachments"],
  },
  {
    title: "Hotshot Hauling & Regional Freight",
    desc: "Heavy-capacity equipment trailers and tow vehicles capable of transporting pallets, pipe, and materials across Texas corridors.",
    icon: Truck,
    badge: "Logistics & Transport",
    units: ["Equipment Trailers", "Tundra TRD Trucks", "Cargo Haulers"],
  },
  {
    title: "Municipal, Utility & High-Visibility Projects",
    desc: "Mobile LED sign trailers, aerial bucket trucks, and passenger shuttle buses for road safety and workforce transport.",
    icon: Zap,
    badge: "Specialty & Traffic",
    units: ["Mobile LED Trailers", "Bucket Trucks", "Passenger Vans"],
  },
];

const businessFaqs = [
  {
    q: "How does M3's Rent-to-Buy program benefit growing contractors?",
    a: "Our Rent-to-Buy program allows contractors to apply rental payments toward purchasing tools and midsize equipment. Instead of sinking capital into non-recoverable rental expenses, you build ownership equity while keeping monthly overhead predictable and projects fully funded.",
  },
  {
    q: "What payment methods are available for commercial and trade accounts?",
    a: "We welcome Cash, instant fee-free Zelle bank transfers, Cash App, and standard business debit/credit cards processed securely via Stripe. Established commercial accounts with recurring monthly projects can also arrange commercial invoicing terms.",
  },
  {
    q: "How does renting with an operator save our business money?",
    a: "When renting heavy machinery with an M3 certified operator, you eliminate specialized payroll costs, operator worker's comp premiums, and machine damage liability on site. Our experienced operators maximize hourly productivity and keep jobs moving safely.",
  },
  {
    q: "Do you offer discounted weekly and monthly commercial project rates?",
    a: "Yes. All units in our 70+ commercial fleet feature volume-discounted weekly rates and extended monthly commercial contract terms. Call our dispatch desk at (281) 933-5000 for customized multi-machine package quotes.",
  },
  {
    q: "What documentation does our company need to pick up equipment?",
    a: "Picking up equipment is fast and straightforward: provide a valid driver's license for the authorized driver, proof of active business vehicle insurance (for motorized vehicles or heavy towing), and your preferred payment method (Cash, Zelle, Cash App, or Card).",
  },
  {
    q: "Can M3 deliver equipment directly to our active jobsite in Greater Houston?",
    a: "Yes! We provide prompt flatbed delivery across Harris, Fort Bend, Brazoria, Montgomery, and Waller counties. Whether your jobsite is in Katy, Sugar Land, Downtown, The Woodlands, or Pearland, dispatch coordinates direct drop-off and pickup.",
  },
];

function WhyM3Page() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <SiteLayout>
      {/* ── 1. COMPACT CENTERED HERO SECTION (Matching Contact Page) ── */}
      <section
        className="relative isolate min-h-[320px] sm:min-h-[360px] md:min-h-[390px] overflow-hidden flex items-center justify-center py-8 sm:py-10 md:py-12 lg:py-14 rounded-[10px] border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.12)] mx-auto mb-3 sm:mb-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        {/* Background Image with Ken Burns zoom effect */}
        <div className="absolute inset-0 -z-30 overflow-hidden bg-slate-950">
          <img
            src={banner3}
            alt="M3 Rental commercial machinery and operator-supported equipment in Houston"
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
              <span>Houston's Contractor-First Equipment Partner</span>
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-3 py-1 text-[10.5px] sm:text-xs font-bold text-emerald-300 backdrop-blur-md shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>Commercial Fleets • Jobsite Dispatch • Flexible Payments</span>
            </span>
          </div>

          {/* Main Headline - Centered */}
          <h1
            className="font-display text-[23px] sm:text-[28px] md:text-[34px] lg:text-[38px] font-extrabold capitalize tracking-tight text-white leading-[31px] sm:leading-[37px] md:leading-[43px] text-center"
            style={{
              textShadow: "0 2px 12px rgba(0, 0, 0, 0.8)",
            }}
          >
            Why Houston Businesses & Contractors <br />
            <span className="text-[#3daf05]">
              Choose M3 Rental
            </span>
          </h1>

          {/* Description - Centered */}
          <p className="mt-3 text-[13px] sm:text-[14.5px] text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto text-center">
            Eliminate corporate rental friction. Zero credit card barriers, Houston's unique rent-to-buy equity program, turnkey certified machine operators, and flat commercial pricing designed for growing businesses.
          </p>

          {/* Hero Quick Action Buttons - Centered */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
            >
              <FileCheck className="size-4 text-white" />
              <span>Request Commercial Rental</span>
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
              <span>Explore 70+ Units</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Hero 4-Item Trust Grid - Compact & Centered */}
          <div className="mt-6 sm:mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-3xl mx-auto pt-4 sm:pt-5 border-t border-white/15 text-center">
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-amber-300 font-display">$0 Credit Card</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Cash, Zelle & Stripe</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-emerald-300 font-display">Rent-To-Buy</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Build Equipment Equity</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-blue-300 font-display">Turnkey Operators</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Certified Machine Drivers</span>
            </div>
            <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3 text-center">
              <span className="block text-sm sm:text-base font-black text-white font-display">15-Min</span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">Fast SW Houston Dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. THE CONTRACTOR ADVANTAGE (M3 VS CORPORATE CHAINS) ── */}
      <section
        id="commercial-comparison"
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
              <Scale className="size-3 text-[#0040DD]" />
              <span>Contractor Advantage • M3 vs Corporate Rental Chains</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              Engineered Specifically for{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Houston Trade Contractors
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              See why trade professionals, builders, and commercial fleets choose M3 Rental over slow, impersonal national rental chains.
            </p>
          </Reveal>

          {/* Comparison Table / Cards */}
          <div className="grid gap-4 lg:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {comparisonPoints.map((item, index) => (
              <Reveal key={item.feature} delay={index * 50}>
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        {item.feature}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#16A34A] bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                        {item.m3Highlight}
                      </span>
                    </div>

                    {/* M3 Advantage (Highlighted) */}
                    <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/80 p-3.5 mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#16A34A] mb-1">
                        <CheckCircle2 className="size-3.5 shrink-0" />
                        <span>M3 Rental Approach</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                        {item.m3}
                      </p>
                    </div>

                    {/* Traditional Chains (Contrasted) */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
                        <ShieldAlert className="size-3.5 shrink-0 text-slate-400" />
                        <span>Traditional Corporate Chains</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">
                        {item.traditional}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SIX CORE BUSINESS PILLARS ── */}
      <section
        id="commercial-pillars"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <Sparkles className="size-3 text-[#0040DD]" />
              <span>Business Solutions • Built for Profit & Productivity</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              Everything Your Jobsite Needs to{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Stay on Schedule
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              Designed around the real-world operational challenges of commercial contractors, crews, and fleet managers.
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {commercialPillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <Reveal key={pillar.title} delay={index * 60}>
                  <div className="card-premium rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-lg transition-all h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`size-12 rounded-xl flex items-center justify-center border ${pillar.bg}`}
                        >
                          <Icon className={`size-6 ${pillar.color}`} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          {pillar.badge}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-black text-slate-900 mb-2">
                        {pillar.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0040DD]">
                      <span>Learn More</span>
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. RENT-TO-BUY SPOTLIGHT SECTION ── */}
      <section
        id="rent-to-buy-program"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            {/* Visual Showcase (Col 5) */}
            <Reveal className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-xl bg-slate-950 p-2 relative group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <img
                    src={heroSite}
                    alt="Houston contractor utilizing M3 Rental equipment with rent-to-buy option"
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-[#16A34A] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-1">
                      Houston Rent-to-Buy Option
                    </span>
                    <h4 className="text-white font-display font-black text-lg leading-snug">
                      Tools & Midsize Equipment Financing
                    </h4>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Content & Economics (Col 7) */}
            <Reveal delay={90} className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-[#16A34A] text-xs font-black uppercase tracking-wider">
                <Coins className="size-3.5 text-[#16A34A]" />
                <span>Build Machine Equity</span>
              </div>

              <h2 className="display-lg text-slate-900 font-black tracking-tight leading-tight">
                Turn Sunk Rental Costs into{" "}
                <span className="bg-gradient-to-r from-[#0040DD] to-[#16A34A] bg-clip-text text-transparent">
                  Business Equity.
                </span>
              </h2>

              <p className="text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
                Why pay thousands in equipment rentals and walk away with nothing? M3 Rental offers Houston contractors a practical <strong>Rent-to-Buy</strong> path for tools and midsize equipment. Use machines on active jobs, verify their earning power, and credit rental dollars toward ownership.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs font-display">
                    <CheckCircle2 className="size-4 text-[#16A34A]" />
                    <span>Zero Bank Loan Hurdles</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    No commercial underwriting or rigid credit committee delays.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs font-display">
                    <CheckCircle2 className="size-4 text-[#16A34A]" />
                    <span>Jobsite Trial Period</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Make sure the unit fits your workload before finalizing purchase.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/contact"
                  className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
                >
                  <DollarSign className="size-4" />
                  <span>Inquire About Rent-to-Buy</span>
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

      {/* ── 5. INDUSTRIES & COMMERCIAL USE CASES ── */}
      <section
        id="commercial-industries"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <Building2 className="size-3 text-[#0040DD]" />
              <span>Commercial Applications • Industry Solutions</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              Trusted by Trade Professionals Across{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Greater Houston
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              Our 70+ unit fleet supports builders, sub-crews, and specialty service trades on jobsites from Katy to Galveston.
            </p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {industriesServed.map((ind, index) => {
              const Icon = ind.icon;
              return (
                <Reveal key={ind.title} delay={index * 50}>
                  <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="size-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-[#0040DD] shadow-2xs">
                          <Icon className="size-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#0040DD] bg-blue-50 px-2.5 py-1 rounded-full">
                          {ind.badge}
                        </span>
                      </div>

                      <h3 className="font-display text-base sm:text-lg font-black text-slate-900 mb-2">
                        {ind.title}
                      </h3>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                        {ind.desc}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                        Common Fleet Units:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ind.units.map((unit) => (
                          <span
                            key={unit}
                            className="bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. COMMERCIAL FAQS ── */}
      <section
        id="commercial-faq"
        className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]"
      >
        <div className="relative mx-auto max-w-[94rem] z-10">
          <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
              <HelpCircle className="size-3 text-[#0040DD]" />
              <span>Commercial & Contractor FAQs</span>
            </div>

            <h2
              className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display"
              style={{ marginTop: "-5px", marginBottom: "6px" }}
            >
              Commercial Account &{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Fleet Questions
              </span>
            </h2>

            <p className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto">
              Clear answers regarding payments, rent-to-buy terms, delivery windows, and operator services.
            </p>
          </Reveal>

          <div className="max-w-4xl mx-auto space-y-3">
            {businessFaqs.map((faq, index) => {
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
              Need a custom commercial fleet arrangement?
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
              Our Houston dispatchers can bundle equipment haulers, dump trailers, and operators for long-term job contracts.
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
            src={banner1}
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
            Equip Your Crew Without the Bureaucracy.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-200 font-medium max-w-xl mx-auto leading-relaxed">
            Fast dispatch, cash/Zelle/Cash App/Stripe acceptance, rent-to-buy equity, and operator-ready machinery. Experience equipment rental built around your business.
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
