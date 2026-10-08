import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ShoppingCart,
  Star,
  UserCheck,
} from "lucide-react";
import { categoryLabel, operatorLabel, type Equipment } from "@/data/equipment";
import { addToCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export function EquipmentCard({
  item,
  className,
}: {
  item: Equipment;
  className?: string;
}) {
  const [added, setAdded] = useState(false);
  const withOperator = item.operator !== "self";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item, 1, true);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
        style={{ aspectRatio: "16 / 10" }}
        className="relative block w-full aspect-[16/10] bg-slate-100 overflow-hidden shrink-0"
      >
        <img
          src={item.image}
          alt={`${item.name} available for rent from M3 Rental in Houston`}
          loading="lazy"
          width={1280}
          height={960}
          className="size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Subtle image bottom & top gradient for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/20 pointer-events-none" />

        {/* Top-left Featured Badge or Category */}
        {item.featured && (
          <span className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 inline-flex items-center gap-1 rounded-full bg-[#0040DD]/90 text-white border border-blue-400/50 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider shadow-md z-10">
            <Star className="size-2.5 sm:size-3 fill-amber-300 text-amber-300" />
            <span>Top Pick</span>
          </span>
        )}

        {/* Top-right Operator / Availability badge */}
        <span
          className={cn(
            "absolute right-2.5 top-2.5 sm:right-3 sm:top-3 inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md z-10",
            withOperator
              ? "bg-[#F59E0B] text-slate-950 border border-amber-300 font-black"
              : "bg-[#16A34A]/90 text-white border border-emerald-400/70",
          )}
        >
          {withOperator ? (
            <>
              <UserCheck className="size-2.5 sm:size-3 text-slate-950" />
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
        <div className="absolute bottom-2 left-2.5 sm:bottom-2.5 sm:left-3 pointer-events-none z-10 max-w-[calc(100%-20px)]">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/75 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[10.5px] font-bold text-white border border-white/20 shadow-md truncate">
            {item.year ? `${item.year} • ` : ""}
            <span className="truncate">{item.type}</span>
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        {/* Category & Color Eyebrow */}
        <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider mb-1">
          <span className="text-[#0040DD] font-black tracking-wide">
            {categoryLabel(item.category)}
          </span>
          {item.color && (
            <span className="truncate max-w-[110px] sm:max-w-[130px] text-slate-400 font-semibold lowercase first-letter:uppercase text-[10px] sm:text-[10.5px]">
              {item.color}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-[15.5px] sm:text-[18px] font-black leading-snug text-slate-900 group-hover:text-[#0040DD] transition-colors line-clamp-1">
          <Link to="/equipment/$slug" params={{ slug: item.slug }}>
            {item.name}
          </Link>
        </h3>

        {/* Feature Highlights Chips */}
        {item.features && item.features.length > 0 && (
          <div className="mt-2 sm:mt-2.5 flex flex-wrap gap-1 sm:gap-1.5">
            {item.features.slice(0, 2).map((feat) => (
              <span
                key={feat}
                className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200/80 px-1.5 sm:px-2 py-0.5 text-[9.5px] sm:text-[10.5px] font-semibold text-slate-600 truncate max-w-[140px] sm:max-w-[200px]"
              >
                <CheckCircle2 className="size-2.5 text-[#16A34A] shrink-0" />
                <span className="truncate">{feat}</span>
              </span>
            ))}
          </div>
        )}

        {/* Summary Description */}
        <p className="mt-1.5 sm:mt-2 line-clamp-2 text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed flex-1">
          {item.summary}
        </p>

        {/* Micro Trust Tag */}
        <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[10.5px] font-bold text-slate-500">
          <span className="size-1.5 rounded-full bg-[#16A34A] shrink-0" />
          <span className="truncate">$0 Credit Card Req. • Cash & Zelle Ready</span>
        </div>

        {/* Pricing Strip */}
        <div className="mt-3 sm:mt-3.5 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="leading-none">
            <span className="font-display text-xl sm:text-[26px] font-black text-slate-900 tracking-tight">
              ${item.dayRate}
            </span>
            <span className="ml-1 text-[10.5px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider">
              {item.pricingUnit ? (item.pricingUnit.startsWith("/") ? item.pricingUnit : `/${item.pricingUnit}`) : "/ day"}
            </span>
          </div>

          {item.monthRate ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] sm:text-[11px] font-black text-[#16A34A] bg-emerald-50 border border-emerald-200/80 px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs">
                ${item.monthRate}/mo
              </span>
              <span className="text-[8.5px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Monthly Rate
              </span>
            </div>
          ) : (
            <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-full">
              Flexible Terms
            </span>
          )}
        </div>

        {/* Card CTA Buttons */}
        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 pt-1 w-full">
          <button
            type="button"
            onClick={handleAddToCart}
            className={cn(
              "w-full inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl border py-2.5 px-2 text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider transition-all duration-200 shadow-2xs cursor-pointer text-center active:scale-95 group/cart",
              added
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-slate-100 hover:bg-slate-200/90 text-slate-800 hover:text-[#0040DD] border-slate-200/90 hover:border-[#0040DD]/30",
            )}
          >
            {added ? (
              <>
                <Check className="size-3.5 text-emerald-600 stroke-[3]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="size-3.5 text-slate-600 group-hover/cart:text-[#0040DD] transition-colors shrink-0" />
                <span className="truncate">Add to Cart</span>
              </>
            )}
          </button>
          <Link
            to="/equipment/$slug"
            params={{ slug: item.slug }}
            className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#0040DD] to-[#16A34A] hover:from-[#16A34A] hover:to-[#0040DD] text-white py-2.5 px-2 text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer text-center group/rent"
          >
            <span className="truncate">Rent Now</span>
            <ArrowRight className="size-3 transition-transform group-hover/rent:translate-x-0.5 shrink-0" />
          </Link>
        </div>
      </div>
    </article>
  );
}
