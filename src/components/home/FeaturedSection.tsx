import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Layers,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { EquipmentCard } from "@/components/site/EquipmentCard";
import { featuredEquipment } from "@/data/equipment";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function FeaturedSection() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const tabs = [
    { id: "all", label: "All Featured", icon: Sparkles },
    { id: "trailers", label: "Trailers", icon: Layers },
    { id: "trucks", label: "Work Trucks", icon: Truck },
    { id: "machinery", label: "Heavy Machinery", icon: Wrench },
  ];

  const filteredItems = featuredEquipment.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "trailers") return item.category === "trailers";
    if (activeTab === "trucks")
      return (
        item.category === "pickup-trucks" ||
        item.category === "trucks" ||
        item.category === "buses"
      );
    if (activeTab === "machinery")
      return (
        item.category === "construction-equipment" ||
        item.category === "utility-equipment" ||
        item.category === "specialty-equipment"
      );
    return true;
  });

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
        {/* ── Section Header Row ── */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-4xl">
            {/* Eyebrow Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0040DD]/20 bg-blue-50/80 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-[#0040DD] shadow-2xs">
              <Sparkles className="size-3.5 text-[#0040DD]" />
              <span>Featured Houston Fleet</span>
            </span>

            {/* Headline */}
            <h2 className="mt-3 font-display text-[23px] sm:text-[28px] md:text-[33px] lg:text-[36px] font-black tracking-tight leading-[1.2] text-slate-900 lg:whitespace-nowrap">
              Popular Commercial Rentals in{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Houston.
              </span>
            </h2>

            <p
              className="max-w-2xl text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-[-4px] sm:mb-[-20px]"
              style={{ marginTop: "5px" }}
            >
              Reliable, job-ready heavy trucks, haulers, and machinery prepared for immediate yard pickup on Wilcrest Dr. or prompt delivery across Texas.
            </p>
          </div>

          <Link
            to="/equipment"
            className="btn-base btn-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg self-start md:self-end shrink-0"
          >
            <span>View All 70+ Units</span>
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>

        {/* ── Interactive Category Tabs ── */}
        <Reveal delay={60} className="mt-8 flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count =
              tab.id === "all"
                ? featuredEquipment.length
                : tab.id === "trailers"
                  ? featuredEquipment.filter((i) => i.category === "trailers").length
                  : tab.id === "trucks"
                    ? featuredEquipment.filter(
                      (i) =>
                        i.category === "pickup-trucks" ||
                        i.category === "trucks" ||
                        i.category === "buses",
                    ).length
                    : featuredEquipment.filter(
                      (i) =>
                        i.category === "construction-equipment" ||
                        i.category === "utility-equipment" ||
                        i.category === "specialty-equipment",
                    ).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-2xs select-none",
                  isActive
                    ? "bg-[#0040DD] text-white shadow-md ring-2 ring-[#0040DD]/20 scale-[1.02]"
                    : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200/80",
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5",
                    isActive ? "text-[#FFD54F]" : "text-slate-500",
                  )}
                />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 text-slate-600",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </Reveal>

        {/* ── Featured Equipment Grid ── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredItems.slice(0, 8).map((item, index) => (
            <Reveal
              key={item.slug}
              delay={(index % 4) * 60}
              className="h-full"
            >
              <EquipmentCard item={item} className="h-full" />
            </Reveal>
          ))}
        </div>

        {/* ── Bottom Commercial Quote Assurance Banner ── */}
        <Reveal delay={120} className="mt-10 rounded-[10px] border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3 text-left">
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-[#16A34A] border border-emerald-200/60 shadow-2xs shrink-0 mt-0.5 sm:mt-0">
              <CheckCircle2 className="size-5 text-[#16A34A]" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                Need long-term contractor rates or multiple units dispatched together?
              </p>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
                Custom commercial pricing available with flexible weekly and monthly fleet terms.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            <a
              href={site.phoneHref}
              className="btn-base btn-outline btn-sm text-xs font-black uppercase tracking-wider flex-1 sm:flex-initial text-center justify-center"
            >
              Call {site.phone}
            </a>
            <Link
              to="/contact"
              className="btn-base btn-primary btn-sm text-xs font-black uppercase tracking-wider shadow-sm flex-1 sm:flex-initial text-center justify-center"
            >
              <span>Get Fleet Quote</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
