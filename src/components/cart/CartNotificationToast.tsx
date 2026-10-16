import React from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Sparkles,
  ShoppingCart,
  ArrowRight,
  X,
  ShieldCheck,
  Truck,
  MapPin,
  Trash2,
  RotateCcw,
} from "lucide-react";
import type { Equipment } from "@/data/equipment";
import { categoryLabel } from "@/data/equipment";
import { openCartDrawer } from "@/lib/cart-store";

interface CartNotificationToastProps {
  toastId: number | string;
  equipment: Equipment;
  rentalDays: number;
  isUpdate?: boolean;
}

export function CartNotificationToast({
  toastId,
  equipment,
  rentalDays,
  isUpdate = false,
}: CartNotificationToastProps) {
  const handleViewCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.dismiss(toastId);
    openCartDrawer();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.dismiss(toastId);
  };

  const totalEstimate = equipment.dayRate * Math.max(1, rentalDays);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="relative w-[380px] sm:w-[410px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl bg-white/98 backdrop-blur-xl border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,64,221,0.22),0_12px_24px_-6px_rgba(15,23,42,0.1)] transition-all animate-in fade-in-0 zoom-in-95 duration-200 select-none text-left"
    >
      {/* ── Top Brand Gradient Accent Bar ── */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#F59E0B]" />

      <div className="p-3.5 sm:p-4">
        {/* ── Header Row: Badge & Dismiss ── */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {isUpdate ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-blue-50 text-[#0040DD] border border-blue-200/80 shadow-2xs">
                <Sparkles className="size-3 text-[#0040DD]" />
                Duration Updated
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <CheckCircle2 className="size-3 text-emerald-600" />
                Added to Cart
              </span>
            )}
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <MapPin className="size-2.5 text-slate-400" /> Houston Yard
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* ── Middle Row: Product Image & Details ── */}
        <div className="flex items-center gap-3">
          {/* Equipment Image Thumbnail */}
          <div className="relative size-16 sm:size-17 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 shadow-2xs group">
            {equipment.image ? (
              <img
                src={equipment.image}
                alt={equipment.name}
                className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="size-full flex items-center justify-center text-slate-400">
                <Truck className="size-6" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded-md bg-slate-900/85 text-white text-[9.5px] font-black tracking-tight backdrop-blur-xs">
              {rentalDays}d
            </div>
          </div>

          {/* Equipment Titles & Pricing */}
          <div className="min-w-0 flex-1">
            <h4
              className="font-bold text-[13px] sm:text-[13.5px] leading-snug text-slate-950 truncate"
              title={equipment.name}
            >
              {equipment.name}
            </h4>

            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
              {equipment.category ? categoryLabel(equipment.category) : "Commercial Rental"}
            </p>

            <div className="flex items-center gap-2 mt-1.5">
              <span className="font-black text-[#0040DD] text-[13px]">
                ${equipment.dayRate}
                <span className="text-[10px] font-semibold text-slate-400 ml-0.5">/day</span>
              </span>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/60">
                Total: <strong className="text-slate-950 font-black">${totalEstimate}</strong>
                <span className="text-[9.5px] text-slate-500 font-normal ml-1">
                  ({rentalDays} {rentalDays === 1 ? "day" : "days"})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer Row: Guarantee & CTA ── */}
        <div className="border-t border-slate-100 pt-2.5 mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-500">
            <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
            <span>Instant Lock • Free Yard Pickup</span>
          </div>

          <button
            type="button"
            onClick={handleViewCart}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0040DD] to-blue-700 hover:from-blue-700 hover:to-[#0040DD] text-white text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer group"
          >
            <ShoppingCart className="size-3.5 text-blue-100" />
            <span>View Cart</span>
            <ArrowRight className="size-3 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface CartRemoveNotificationProps {
  toastId: number | string;
  name: string;
  image?: string | undefined;
  onUndo?: (() => void) | undefined;
}

export function CartRemoveNotificationToast({
  toastId,
  name,
  image,
  onUndo,
}: CartRemoveNotificationProps) {
  const handleUndo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.dismiss(toastId);
    if (onUndo) onUndo();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.dismiss(toastId);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="relative w-[380px] sm:w-[410px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl bg-white/98 backdrop-blur-xl border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(239,68,68,0.18),0_12px_24px_-6px_rgba(15,23,42,0.1)] transition-all animate-in fade-in-0 zoom-in-95 duration-200 select-none text-left"
    >
      {/* ── Top Red/Rose Accent Bar ── */}
      <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-slate-400" />

      <div className="p-3.5 sm:p-4">
        {/* ── Header Row ── */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
            <Trash2 className="size-3 text-rose-600" />
            Removed from Cart
          </span>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* ── Middle Row ── */}
        <div className="flex items-center gap-3">
          {image ? (
            <div className="relative size-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0">
              <img
                src={image}
                alt={name}
                className="size-full object-cover opacity-80"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          ) : (
            <div className="size-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 shadow-2xs">
              <Trash2 className="size-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-[13px] text-slate-900 truncate" title={name}>
              {name}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Item removed from your rental cart reservations.
            </p>
          </div>
        </div>

        {/* ── Footer Row with Undo ── */}
        {onUndo && (
          <div className="border-t border-slate-100 pt-2 mt-2.5 flex items-center justify-between">
            <span className="text-[10.5px] text-slate-400 font-medium">Changed your mind?</span>
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1 text-xs font-black text-[#0040DD] hover:text-blue-700 hover:underline cursor-pointer"
            >
              <RotateCcw className="size-3" />
              Undo Removal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Triggers the custom pixel-perfect luxury cart toast
 */
export function showCartToast(
  equipment: Equipment,
  rentalDays: number = 1,
  isUpdate: boolean = false,
) {
  const toastId = `m3-cart-${equipment.slug}`;

  toast.custom(
    (id) => (
      <CartNotificationToast
        toastId={id}
        equipment={equipment}
        rentalDays={rentalDays}
        isUpdate={isUpdate}
      />
    ),
    {
      id: toastId,
      duration: 4500,
    },
  );
}

/**
 * Triggers the custom pixel-perfect cart removal toast
 */
export function showCartRemoveToast(
  equipmentName: string,
  equipmentImage?: string,
  onUndo?: () => void,
) {
  const toastId = `m3-cart-removed-${Date.now()}`;

  toast.custom(
    (id) => (
      <CartRemoveNotificationToast
        toastId={id}
        name={equipmentName}
        image={equipmentImage}
        onUndo={onUndo}
      />
    ),
    {
      id: toastId,
      duration: 4000,
    },
  );
}
