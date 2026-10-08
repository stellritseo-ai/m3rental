import { useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Phone,
  Layers,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { categoryLabel } from "@/data/equipment";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, totalCount, totalCost, isOpen, closeCart, updateCartDays, removeFromCart, clearCart } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate({
      to: "/checkout",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={closeCart}
      />

      {/* Slide-over panel */}
      <div
        ref={drawerRef}
        className="relative z-10 w-full max-w-lg bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out border-l border-slate-200/90"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#FFD54F]">
              <ShoppingCart className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                <span>Rental Cart</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-extrabold">
                  {totalCount} {totalCount === 1 ? "item" : "items"}
                </span>
              </h2>
              <p className="text-[11px] text-slate-300 font-medium">
                Houston Yard Pickup &amp; Delivery Ready
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="size-16 rounded-3xl bg-blue-50 border border-blue-200/60 text-[#0040DD] flex items-center justify-center mx-auto shadow-inner">
                <ShoppingCart className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Your cart is empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                  Add vehicles, pickup trucks, or heavy construction machinery to build your Houston project rental package.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/equipment"
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0040DD] hover:bg-[#0036ba] text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <span>Browse Equipment Catalog</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {items.map((cartItem) => {
                const { equipment, rentalDays } = cartItem;
                const itemSubtotal = equipment.dayRate * rentalDays;

                return (
                  <div
                    key={equipment.slug}
                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs transition-all space-y-3"
                  >
                    <div className="flex gap-3.5 items-start">
                      {/* Image Thumbnail */}
                      <Link
                        to="/equipment/$slug"
                        params={{ slug: equipment.slug }}
                        onClick={closeCart}
                        className="size-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 block group/thumb"
                      >
                        <img
                          src={equipment.image}
                          alt={equipment.name}
                          className="size-full object-cover group-hover/thumb:scale-105 transition-transform"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/equipment/$slug"
                            params={{ slug: equipment.slug }}
                            onClick={closeCart}
                            className="text-xs sm:text-sm font-black text-slate-900 hover:text-[#0040DD] transition-colors line-clamp-1"
                          >
                            {equipment.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(equipment.slug)}
                            aria-label={`Remove ${equipment.name}`}
                            className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#0040DD] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                            {categoryLabel(equipment.category)}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            ${equipment.dayRate}/day
                          </span>
                        </div>

                        {/* Quantity / Rental Days Control */}
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500">
                              Duration:
                            </span>
                            <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                              <button
                                type="button"
                                onClick={() => updateCartDays(equipment.slug, Math.max(1, rentalDays - 1))}
                                disabled={rentalDays <= 1}
                                className="size-6 flex items-center justify-center hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="px-2 text-xs font-black text-slate-900 min-w-[28px] text-center">
                                {rentalDays}d
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartDays(equipment.slug, rentalDays + 1)}
                                className="size-6 flex items-center justify-center hover:bg-slate-200 text-slate-600 cursor-pointer"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900">
                              ${itemSubtotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50/70 rounded-xl px-2.5 py-1.5 border border-slate-100">
                      <Link
                        to="/equipment/$slug"
                        params={{ slug: equipment.slug }}
                        onClick={closeCart}
                        className="text-[#0040DD] hover:underline flex items-center gap-1"
                      >
                        <span>View Product Details &amp; Specs</span>
                        <ExternalLink className="size-2.5" />
                      </Link>
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>Ready at Houston Yard</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Summary Actions */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200/90 bg-slate-50/70 space-y-3 shrink-0">
            {/* Total Row */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Estimated Rental Total:
                </span>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Zero credit check • Taxes calculated at dispatch
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-black text-slate-900">
                  ${totalCost}
                </span>
              </div>
            </div>

            {/* Micro Trust Strip */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-2.5 text-[11px] font-bold text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <span>Cash, Zelle, Cash App &amp; Cards accepted with zero credit bureau holds.</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0040DD] to-[#16A34A] hover:from-[#16A34A] hover:to-[#0040DD] text-white py-3 px-4 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-center"
              >
                <span>Proceed to Reserve &amp; Checkout</span>
                <ArrowRight className="size-4" />
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Clear All Items
                </button>

                <a
                  href={site.phoneHref}
                  className="text-[11px] font-bold text-[#0040DD] hover:underline flex items-center gap-1"
                >
                  <Phone className="size-3 text-[#16A34A] fill-current" />
                  <span>Yard Phone: {site.phone}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
