import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Star,
  UserCheck,
} from "lucide-react";
import { categoryLabel, operatorLabel, type Equipment } from "@/data/equipment";
import { cn } from "@/lib/utils";

export function EquipmentCard({
  item,
  className,
}: {
  item: Equipment;
  className?: string;
}) {
  const withOperator = item.operator !== "self";

  return (
    <article
      className={cn(
        "group flex h-full flex-col bg-white border border-slate-200/90 rounded-2xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_22px_45px_-10px_rgba(0,64,221,0.16)] hover:border-[#0040DD]/45 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative",
        className,
      )}
    >
      {/* Top hover accent hairline */}
      <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#F59E0B] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

      {/* Media & Image Container */}
      <Link
        to="/equipment/$slug"
        params={{ slug: item.slug }}
        className="relative block aspect-[16/10.5] bg-slate-100 overflow-hidden shrink-0"
      >
        <img
          src={item.image}
          alt={`${item.name} available for rent from M3 Rental in Houston`}
          loading="lazy"
          width={1280}
          height={960}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle image bottom & top gradient for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/30 pointer-events-none" />

        {/* Top-left Featured Badge or Category */}
        {item.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#0040DD]/90 text-white border border-blue-400/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-md z-10">
            <Star className="size-3 fill-amber-300 text-amber-300" />
            <span>Top Pick</span>
          </span>
        )}

        {/* Top-right Operator / Availability badge */}
        <span
          className={cn(
            "absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md z-10",
            withOperator
              ? "bg-[#F59E0B] text-slate-950 border border-amber-300 font-black"
              : "bg-[#16A34A]/90 text-white border border-emerald-400/70",
          )}
        >
          {withOperator ? (
            <>
              <UserCheck className="size-3 text-slate-950" />
              <span>{operatorLabel[item.operator]}</span>
            </>
          ) : (
            <>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              <span>Available Today</span>
            </>
          )}
        </span>

        {/* Bottom-left category/fleet chip (e.g. 2008 • Midsize Pickup Truck) */}
        <div className="absolute bottom-2.5 left-3 pointer-events-none z-10">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-bold text-white border border-white/20 shadow-md">
            {item.year ? `${item.year} • ` : ""}
            {item.type}
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Category & Color Eyebrow */}
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
          <span className="text-[#0040DD] font-black tracking-wide">
            {categoryLabel(item.category)}
          </span>
          {item.color && (
            <span className="truncate max-w-[130px] text-slate-400 font-semibold lowercase first-letter:uppercase text-[10.5px]">
              {item.color}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-[17px] sm:text-[18px] font-black leading-snug text-slate-900 group-hover:text-[#0040DD] transition-colors line-clamp-1">
          <Link to="/equipment/$slug" params={{ slug: item.slug }}>
            {item.name}
          </Link>
        </h3>

        {/* Feature Highlights Chips */}
        {item.features && item.features.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.features.slice(0, 2).map((feat) => (
              <span
                key={feat}
                className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600 truncate max-w-full"
              >
                <CheckCircle2 className="size-2.5 text-[#16A34A] shrink-0" />
                <span className="truncate">{feat}</span>
              </span>
            ))}
          </div>
        )}

        {/* Summary Description */}
        <p className="mt-2 line-clamp-2 text-xs text-slate-500 font-medium leading-relaxed flex-1">
          {item.summary}
        </p>

        {/* Micro Trust Tag */}
        <div className="mt-3 flex items-center gap-1.5 text-[10.5px] font-bold text-slate-500">
          <span className="size-1.5 rounded-full bg-[#16A34A]" />
          <span>$0 Credit Card Req. • Cash & Zelle Ready</span>
        </div>

        {/* Pricing Strip */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="leading-none">
            <span className="font-display text-2xl sm:text-[27px] font-black text-slate-900 tracking-tight">
              ${item.dayRate}
            </span>
            <span className="ml-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              / day
            </span>
          </div>

          {item.monthRate ? (
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-black text-[#16A34A] bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                ${item.monthRate}/mo
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Monthly Rate
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-full">
              Flexible Terms
            </span>
          )}
        </div>

        {/* Card CTA Buttons */}
        <div className="mt-4 flex items-center gap-2 pt-1">
          <Link
            to="/equipment/$slug"
            params={{ slug: item.slug }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/90 text-slate-800 hover:text-[#0040DD] border border-slate-200/90 py-2.5 px-3 text-[11px] font-black uppercase tracking-wider transition-all duration-200 shadow-2xs group/btn cursor-pointer text-center"
          >
            <span>Specs</span>
            <ArrowRight className="size-3 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
          <Link
            to="/contact"
            search={{ equipment: item.name }}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#0040DD] to-[#16A34A] hover:from-[#16A34A] hover:to-[#0040DD] text-white py-2.5 px-3 text-[11px] font-black uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer text-center"
          >
            <span>Rent Now</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
