import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bus,
  Car,
  HardHat,
  Layers,
  Shield,
  Sparkles,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { categories, equipment } from "@/data/equipment";
import { cn } from "@/lib/utils";

export function CategoriesSection() {
  const categoryConfig: Record<
    string,
    {
      icon: any;
      color: string;
      bg: string;
      border: string;
      tag: string;
      features: string[];
      startingPrice: string;
    }
  > = {
    "pickup-trucks": {
      icon: Truck,
      color: "text-[#0040DD]",
      bg: "bg-blue-50/90",
      border: "border-blue-200/80",
      tag: "Half-Ton & Crew Cabs",
      features: ["F-150 / Tundra", "Tow Package", "Crew Cab"],
      startingPrice: "From $50/day",
    },
    trailers: {
      icon: Layers,
      color: "text-[#F59E0B]",
      bg: "bg-amber-50/90",
      border: "border-amber-200/80",
      tag: "Cargo, Dump & Haulers",
      features: ["Hydraulic Dump", "Equipment Haulers", "Cargo Enclosed"],
      startingPrice: "From $60/day",
    },
    "construction-equipment": {
      icon: HardHat,
      color: "text-[#F59E0B]",
      bg: "bg-amber-50/90",
      border: "border-amber-200/80",
      tag: "Earthmoving & Trenching",
      features: ["Backhoe Loaders", "Excavators", "Trenchers"],
      startingPrice: "From $180/day",
    },
    trucks: {
      icon: Truck,
      color: "text-[#0040DD]",
      bg: "bg-blue-50/90",
      border: "border-blue-200/80",
      tag: "Heavy Work Trucks",
      features: ["Heavy-Duty 1-Ton", "Flatbed & Utility", "Jobsite Rigs"],
      startingPrice: "From $85/day",
    },
    buses: {
      icon: Bus,
      color: "text-[#16A34A]",
      bg: "bg-emerald-50/90",
      border: "border-emerald-200/80",
      tag: "Passenger & Crew Vans",
      features: ["15-Passenger Vans", "Shuttle Buses", "Crew Transports"],
      startingPrice: "From $120/day",
    },
    cars: {
      icon: Car,
      color: "text-[#0040DD]",
      bg: "bg-blue-50/90",
      border: "border-blue-200/80",
      tag: "Sedans & Commuters",
      features: ["Fuel Efficient", "Daily Transport", "Jobsite Visits"],
      startingPrice: "From $45/day",
    },
    suvs: {
      icon: Shield,
      color: "text-[#0040DD]",
      bg: "bg-blue-50/90",
      border: "border-blue-200/80",
      tag: "All-Weather 4WD SUVs",
      features: ["All-Wheel Drive", "Family & Team Transport", "High Clearance"],
      startingPrice: "From $65/day",
    },
    "utility-equipment": {
      icon: Wrench,
      color: "text-[#16A34A]",
      bg: "bg-emerald-50/90",
      border: "border-emerald-200/80",
      tag: "Aerial & Service Rigs",
      features: ["Bucket Trucks", "Aerial High-Reach", "Utility Service Beds"],
      startingPrice: "From $160/day",
    },
    "specialty-equipment": {
      icon: Zap,
      color: "text-[#0040DD]",
      bg: "bg-blue-50/90",
      border: "border-blue-200/80",
      tag: "Specialized & Mobile LED",
      features: ["Mobile LED Trailers", "Dune Buggies", "Vintage RV & Campers"],
      startingPrice: "From $150/day",
    },
  };

  return (
    <section
      className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 transition-all duration-300"
      style={{ margin: "15px" }}
    >
      {/* Ambient background glow blooms */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#0040DD]/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-[#16A34A]/5 blur-3xl" />
      </div>

      <div className="w-full max-w-[94rem] mx-auto relative z-10">
        {/* ── Section Header Row ── */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            {/* Eyebrow Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0040DD]/20 bg-blue-50/80 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-[#0040DD] shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0040DD] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0040DD]" />
              </span>
              <span>Houston Fleet Catalog • 9 Commercial Categories</span>
            </span>

            {/* Headline */}
            <h2 className="mt-3 font-display text-[26px] sm:text-[34px] md:text-[38px] font-black tracking-tight leading-[1.2] text-slate-900">
              Explore All Rental{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Categories.
              </span>
            </h2>

            <p className="mt-2.5 text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
              From heavy-duty work trucks and hydraulic dump trailers to earthmoving machinery and passenger shuttles — browse Houston's most accessible, cash/Zelle-ready rental fleet.
            </p>
          </div>

          <Link
            to="/equipment"
            className="btn-base btn-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg self-start md:self-end shrink-0"
          >
            <span>Browse All 70+ Units</span>
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>

        {/* ── 3x3 Category Grid ── */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const cfg = categoryConfig[category.id] ?? {
              icon: Layers,
              color: "text-[#0040DD]",
              bg: "bg-blue-50/90",
              border: "border-blue-200/80",
              tag: "Rental Fleet",
              features: ["Commercial Grade", "Houston Dispatch"],
              startingPrice: "Call for rates",
            };
            const Icon = cfg.icon;
            const count = equipment.filter(
              (e) => e.category === category.id,
            ).length;

            return (
              <Reveal key={category.id} delay={(index % 3) * 60}>
                <Link
                  to="/equipment"
                  search={{ category: category.id }}
                  className="group flex flex-col justify-between h-full p-4 sm:p-4.5 bg-white border border-slate-200/90 rounded-[10px] shadow-[0_4px_16px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_30px_-6px_rgba(0,64,221,0.12)] hover:border-[#0040DD]/45 hover:-translate-y-1 transition-all duration-200 relative overflow-hidden select-none"
                >
                  {/* Top hairline hover gradient accent */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#F59E0B] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />

                  {/* Corner ambient glow */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#0040DD]/5 rounded-full blur-xl group-hover:bg-[#0040DD]/10 transition-colors pointer-events-none" />

                  <div>
                    {/* Top Row: Icon + Category Tag */}
                    <div className="flex items-center justify-between gap-2.5">
                      <div
                        className={cn(
                          "size-10 rounded-[8px] border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200",
                          cfg.bg,
                          cfg.border,
                          cfg.color,
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-700 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                        {cfg.tag}
                      </span>
                    </div>

                    {/* Category Title */}
                    <h3 className="mt-2.5 font-display text-[17px] sm:text-[18px] font-black text-slate-900 group-hover:text-[#0040DD] transition-colors leading-snug">
                      {category.label}
                    </h3>

                    {/* Blurb Description */}
                    <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed line-clamp-1">
                      {category.blurb}
                    </p>

                    {/* Features / Models Micro Chips (Compact 2 chips) */}
                    {cfg.features && cfg.features.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {cfg.features.slice(0, 2).map((feat) => (
                          <span
                            key={feat}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600 group-hover:border-slate-300 transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-[#16A34A] shrink-0" />
                            <span className="truncate">{feat}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer Strip */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col leading-none">
                      <span className="inline-flex items-center gap-1.5 text-[10.5px] font-black text-slate-800">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#16A34A]" />
                        </span>
                        {count > 0
                          ? `${count} ${count === 1 ? "Model" : "Models"} Ready`
                          : "Ready to Dispatch"}
                      </span>
                      <span className="text-[9.5px] font-extrabold text-[#16A34A] mt-1">
                        {cfg.startingPrice}
                      </span>
                    </div>

                    <div className="size-7 rounded-full bg-slate-100 group-hover:bg-[#0040DD] text-slate-500 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:translate-x-0.5">
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
