import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UserRound,
  Wrench,
  Layers,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { getEquipment, operatorLabel } from "@/data/equipment";
import { useManagedFleet } from "@/lib/dashboard-store";
import { site } from "@/lib/site";

interface SpotlightSectionProps {
  slug?: string;
}

export function SpotlightSection({
  slug = "2025-toyota-tundra-trd-pro",
}: SpotlightSectionProps) {
  const { fleet } = useManagedFleet();
  const [selectedSlug, setSelectedSlug] = useState<string>(slug);
  const spotlight =
    fleet.find((i) => i.slug === selectedSlug) ??
    getEquipment(selectedSlug) ??
    fleet.find((i) => i.slug === slug) ??
    getEquipment(slug);

  if (!spotlight) return null;

  const withOperator = spotlight.operator !== "self";

  const spotlightOptions = [
    {
      slug: "2025-toyota-tundra-trd-pro",
      label: "2025 Tundra TRD Pro",
      icon: Truck,
    },
    {
      slug: "john-deere-utility-tractor-backhoe",
      label: "John Deere Backhoe",
      icon: Wrench,
    },
    {
      slug: "utility-service-bucket-truck",
      label: "35ft Bucket Truck",
      icon: Layers,
    },
    {
      slug: "heavy-duty-tandem-axle-equipment-trailer",
      label: "14K Equipment Hauler",
      icon: Truck,
    },
  ];

  return (
    <section
      className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)] max-w-[94rem] transition-all duration-300"
    >
      {/* Ambient background glow blooms */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#0040DD]/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-[#F59E0B]/5 blur-3xl" />
      </div>

      <div className="w-full max-w-[94rem] mx-auto relative z-10">
        {/* ── Top Header & Flagship Switcher ── */}
        <Reveal className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-amber-900 shadow-2xs">
              <Star className="size-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span>Commercial Fleet Spotlight</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <ShieldCheck className="size-3.5 text-[#16A34A]" />
              <span>Houston Ready</span>
            </span>
          </div>

          {/* Quick Vehicle Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {spotlightOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = selectedSlug === opt.slug;
              return (
                <button
                  key={opt.slug}
                  type="button"
                  onClick={() => setSelectedSlug(opt.slug)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-2xs ${
                    isActive
                      ? "bg-[#0040DD] text-white shadow-sm ring-2 ring-[#0040DD]/20 scale-[1.02]"
                      : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200/80"
                  }`}
                >
                  <Icon className={`size-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* ── 2-Column Showcase Content ── */}
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
          {/* LEFT COLUMN: Narrative, Rates & Key Specs */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start text-left">
            <Reveal delay={60}>
              {/* Type / Color Tag */}
              <p className="text-xs font-black uppercase tracking-wider text-[#0040DD]">
                {spotlight.year ? `${spotlight.year} Model • ` : ""}
                {spotlight.type}
                {spotlight.color ? ` • ${spotlight.color}` : ""}
              </p>

              {/* Headline */}
              <h2 className="mt-2 font-display text-[26px] sm:text-[34px] md:text-[40px] font-black tracking-tight leading-[1.15] text-slate-900">
                {spotlight.name}
              </h2>

              {/* Summary Description */}
              <p className="mt-3.5 text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
                {spotlight.summary}
              </p>

              {/* Pricing & Terms Strip */}
              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                <span className="font-display text-4xl sm:text-5xl font-black text-[#0040DD]">
                  ${spotlight.dayRate}
                </span>
                <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-500">
                  / day
                </span>
                {spotlight.monthRate && (
                  <span className="rounded-full bg-emerald-50 border border-emerald-200/70 px-3 py-1 text-xs font-bold text-[#16A34A] shadow-2xs">
                    ${spotlight.monthRate} / month
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span className="size-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>Available at Wilcrest Dr Yard</span>
                </span>
              </div>

              {/* Feature Checklist Chips */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {spotlight.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2.5 rounded-[8px] border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs"
                  >
                    <CheckCircle2 className="size-3.5 text-[#16A34A] shrink-0" />
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Dual Action CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/equipment/$slug"
                  params={{ slug: spotlight.slug }}
                  className="btn-base btn-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider w-full sm:w-auto justify-center shadow-md hover:shadow-lg active:scale-95"
                >
                  <span>View Equipment Details</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/contact"
                  search={{ equipment: spotlight.name }}
                  className="btn-base btn-outline text-xs sm:text-sm font-extrabold uppercase tracking-wider w-full sm:w-auto justify-center hover:border-[#16A34A] hover:text-[#16A34A] active:scale-95"
                >
                  <span>Rent This Unit Now</span>
                </Link>
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-[#0040DD] transition-colors"
                >
                  <Phone className="size-3.5 text-[#16A34A]" />
                  <span>Call {site.phone}</span>
                </a>
              </div>
            </Reveal>
          </div>

          {/* RIGHT COLUMN: Media Showcase Frame */}
          <div className="lg:col-span-6 xl:col-span-5 relative">
            <Reveal delay={100} className="relative">
              {/* Outer Framed Box */}
              <div className="overflow-hidden rounded-[10px] border border-slate-200/90 shadow-xl p-2 bg-gradient-to-b from-white via-slate-50 to-slate-100 group relative">
                <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-[8px] overflow-hidden bg-slate-950">
                  <img
                    src={spotlight.image}
                    alt={`${spotlight.name} available to rent from M3 Rental Houston`}
                    loading="lazy"
                    width={1280}
                    height={960}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle cinematic vignette */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/20" />

                  {/* Top-Right Floating Rating Badge */}
                  <div className="absolute top-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 rounded-full bg-[#0A1124]/90 border border-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                    <span className="flex text-amber-400 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-3 fill-current text-amber-400" />
                      ))}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">
                      Houston, TX
                    </span>
                  </div>

                  {/* Bottom-Right Price Pill */}
                  <div className="absolute bottom-3.5 right-3.5 z-20 inline-flex items-baseline gap-1 rounded-full bg-[#0A1124]/90 border border-white/20 backdrop-blur-md px-3.5 py-1.5 shadow-lg">
                    <span className="font-display text-lg font-black text-white">
                      ${spotlight.dayRate}
                    </span>
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      / day
                    </span>
                  </div>

                  {/* Top-Left Operator Status Pill */}
                  <div className="absolute top-3.5 left-3.5 z-20 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-black uppercase tracking-wider shadow-md backdrop-blur-md border border-white/20">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                        withOperator
                          ? "bg-amber-500 text-slate-950 font-black"
                          : "bg-emerald-600 text-white font-black"
                      }`}
                    >
                      {withOperator && <UserRound className="size-3" />}
                      <span>{withOperator ? operatorLabel[spotlight.operator] : "Self-Drive"}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
