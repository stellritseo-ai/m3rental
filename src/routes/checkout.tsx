import { useState, useId, useMemo, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Info,
  Layers,
  Lock,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  UploadCloud,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart-store";
import { categoryLabel } from "@/data/equipment";
import {
  createBooking,
  DEFAULT_PAYMENT_SETTINGS,
  getPaymentSettings,
  getTodayString,
  PaymentMethod,
  PaymentSettings,
  Booking,
} from "@/lib/booking-store";
import { getPaymentSettingsDb } from "@/lib/api/payments.functions";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Fleet Checkout & Reservation | M3 Rental Houston" },
      {
        name: "description",
        content:
          "Complete your commercial vehicle and equipment rental reservation with M3 Rental in Houston, TX. Pay with Cash at pickup, Zelle, or Cash App. Zero credit bureau holds.",
      },
      { property: "og:title", content: "Fleet Checkout | M3 Rental Houston" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const formId = useId();
  const navigate = useNavigate();
  const { items, totalCost, totalCount, updateCartDays, removeFromCart, clearCart } = useCart();

  // Booking Dates
  const todayStr = getTodayString();
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const [pickupDate, setPickupDate] = useState<string>(todayStr);
  const [returnDate, setReturnDate] = useState<string>(tomorrowStr);
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("pickup");

  // Customer Information
  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>("");
  const [screenshotFileName, setScreenshotFileName] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Submission & Confirmed State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[] | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(getPaymentSettings());

  useEffect(() => {
    getPaymentSettingsDb()
      .then((res) => {
        if (res && res.success && res.settings) {
          const fresh = {
            zelle: res.settings.zelle,
            cashapp: res.settings.cashapp,
          };
          setPaymentSettings(fresh);
          try {
            localStorage.setItem("m3_rental_payment_settings_v2", JSON.stringify(fresh));
          } catch {}
        }
      })
      .catch((err) => console.warn("Checkout payment sync notice:", err));

    const handleUpdate = () => {
      setPaymentSettings(getPaymentSettings());
    };
    window.addEventListener("m3-payment-settings-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("m3-payment-settings-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, JPEG, or PNG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size exceeds 10MB limit.");
      return;
    }

    setScreenshotFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPaymentScreenshot(result);
      toast.success("Payment transfer receipt uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your rental cart is empty.");
      return;
    }

    if (!customer.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!customer.phone.trim()) {
      toast.error("Please enter your contact phone number.");
      return;
    }
    if (!customer.email.trim() || !customer.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!customer.address.trim()) {
      toast.error("Please enter your commercial or residential address.");
      return;
    }

    if (paymentMethod !== "cash" && !paymentScreenshot) {
      toast.error(`Please upload a screenshot of your ${paymentMethod === "zelle" ? "Zelle" : "Cash App"} transfer.`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const createdList: Booking[] = [];
      let allSuccess = true;

      for (const cartItem of items) {
        const res = createBooking({
          vehicleSlug: cartItem.equipment.slug,
          vehicleName: cartItem.equipment.name,
          vehicleImage: cartItem.equipment.image,
          dailyRate: cartItem.equipment.dayRate,
          customer: {
            ...customer,
            notes: `${customer.notes ? customer.notes + " | " : ""}Fulfillment: ${
              fulfillmentType === "pickup" ? "Yard Pickup" : "Jobsite Delivery Requested"
            }`,
          },
          pickupDate,
          returnDate,
          paymentMethod,
          paymentScreenshot:
            paymentMethod === "cash"
              ? "CASH_UPON_YARD_PICKUP"
              : paymentScreenshot,
        });

        if (res.success && res.booking) {
          createdList.push(res.booking);
        } else {
          allSuccess = false;
        }
      }

      setIsSubmitting(false);

      if (createdList.length > 0) {
        setConfirmedBookings(createdList);
        clearCart();
        toast.success("Order confirmed successfully!", {
          description: `Created ${createdList.length} equipment reservation${createdList.length > 1 ? "s" : ""}.`,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error("Could not process booking. Please call dispatch directly.");
      }
    }, 600);
  };

  // ── SUCCESS CONFIRMATION VIEW ──
  if (confirmedBookings && confirmedBookings.length > 0) {
    const isCashOrder = paymentMethod === "cash";

    return (
      <SiteLayout>
        <section className="bg-slate-900 border-b border-slate-800 text-slate-300 py-4 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Reservation Confirmed &amp; Dispatched</span>
            </span>
            <a
              href={site.phoneHref}
              className="text-emerald-400 hover:text-white font-bold transition-colors"
            >
              Yard Hotline: {site.phone}
            </a>
          </div>
        </section>

        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-50/60 min-h-[80vh]">
          <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header Success Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-8 lg:p-10 shadow-md text-center space-y-4">
              <div className="size-20 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="size-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
                  {isCashOrder ? "Cash On Pickup Confirmed" : "Payment Verification In Progress"}
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Your Equipment is Reserved!
                </h1>
                <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto font-medium leading-relaxed">
                  Thank you, <strong className="text-slate-900">{customer.fullName}</strong>. Your rental order has been routed directly to our Houston yard dispatch desk on S Wilcrest Dr.
                </p>
              </div>

              {/* Order Numbers Ribbon */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Assigned Booking Confirmation IDs:
                </span>
                <div className="flex flex-wrap gap-2">
                  {confirmedBookings.map((b) => (
                    <span
                      key={b.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black font-mono shadow-2xs"
                    >
                      <Sparkles className="size-3 text-[#FFD54F]" />
                      <span>{b.id}</span>
                      <span className="text-slate-400 font-sans text-[10px] font-bold">
                        ({b.vehicleName})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Steps for Customer */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="size-4.5 text-[#0040DD]" />
                <span>Next Steps &amp; Equipment Pickup Instructions</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                    <MapPin className="size-4 text-[#0040DD]" />
                    <span>Southwest Houston Yard</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    <strong>11732 S Wilcrest Dr., Houston, TX 77099</strong>
                    <br />
                    Mon–Sat: 7:00 AM – 7:00 PM
                  </p>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=11732%20S%20Wilcrest%20Dr%2C%20Houston%2C%20TX%2077099"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#0040DD] font-bold hover:underline pt-1"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                    {isCashOrder ? <Banknote className="size-4 text-emerald-600" /> : <ShieldCheck className="size-4 text-purple-600" />}
                    <span>Payment Verification</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {isCashOrder
                      ? "Pay exact or rounded cash at the yard counter when you arrive. You will receive an immediate printed and digital receipt."
                      : "Our dispatchers verify your uploaded digital transfer screenshot and ready your equipment keys and agreement in under 15 minutes."}
                  </p>
                </div>
              </div>

              {/* Yard Hotline Ribbon */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    Questions or Running Ahead of Schedule?
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Call dispatch directly for gate entry and priority turnaround.
                  </span>
                </div>
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0040DD] text-white text-xs font-black uppercase tracking-wider shadow-sm hover:bg-[#0036ba] transition-all"
                >
                  <Phone className="size-3.5 fill-current" />
                  <span>Call {site.phone}</span>
                </a>
              </div>

              <div className="pt-2 flex justify-center">
                <Link
                  to="/equipment"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0040DD] hover:underline"
                >
                  <span>Return to Equipment Fleet</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // ── EMPTY CART VIEW ──
  if (items.length === 0) {
    return (
      <SiteLayout>
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 min-h-[70vh] flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-xs space-y-4">
            <div className="size-16 rounded-3xl bg-blue-50 border border-blue-200/60 text-[#0040DD] flex items-center justify-center mx-auto shadow-inner">
              <ShoppingCart className="size-8" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-black text-slate-900">
                Your Rental Cart is Empty
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Add work trucks, commercial haulers, trailers, or heavy construction machinery from our Houston inventory to proceed with checkout.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/equipment"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0040DD] hover:bg-[#0036ba] text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
              >
                <span>Browse Houston Equipment</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  // ── ACTIVE CHECKOUT FORM VIEW ──
  return (
    <SiteLayout>
      {/* Top Banner Ribbon */}
      <section className="bg-slate-900 border-b border-slate-800 text-slate-300 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[94rem] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-slate-600">/</span>
            <Link to="/equipment" className="text-slate-400 hover:text-white transition-colors">
              Equipment
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-white font-bold">Checkout &amp; Reservation</span>
          </nav>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Zero Credit Bureau Check Active</span>
            </div>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-1.5 text-white hover:text-emerald-300 font-bold transition-colors"
            >
              <Phone className="size-3.5 text-emerald-400 fill-current" />
              <span>Yard Hotline: {site.phone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Checkout Grid */}
      <section className="py-6 sm:py-12 px-3 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="w-full max-w-[94rem] mx-auto">
          {/* Top Quick Action */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              to="/equipment"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-[#0040DD] shadow-2xs transition-all active:scale-95"
            >
              <ArrowLeft className="size-3.5" />
              <span>Continue Shopping</span>
            </Link>

            <span className="text-xs font-bold text-slate-500">
              Checkout Step: Final Reservation
            </span>
          </div>

          <form onSubmit={handleSubmitOrder}>
            <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:gap-10 items-start">
              
              {/* ── LEFT COLUMN: ITEMS, DATES, CUSTOMER, PAYMENT ── */}
              <div className="space-y-8">
                
                {/* 1. Review Cart Items */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-xl bg-blue-50 text-[#0040DD] flex items-center justify-center font-black text-xs">
                        1
                      </div>
                      <h2 className="text-lg font-black text-slate-900">
                        Review Fleet Items ({totalCount})
                      </h2>
                    </div>

                    <span className="text-xs font-bold text-slate-500">
                      Houston Yard Stock
                    </span>
                  </div>

                  <div className="space-y-4 divide-y divide-slate-100">
                    {items.map((cartItem) => {
                      const { equipment, rentalDays } = cartItem;
                      const subtotal = equipment.dayRate * rentalDays;

                      return (
                        <div
                          key={equipment.slug}
                          className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <Link
                              to="/equipment/$slug"
                              params={{ slug: equipment.slug }}
                              className="size-16 sm:size-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/90 block group/img"
                            >
                              <img
                                src={equipment.image}
                                alt={equipment.name}
                                className="size-full object-cover group-hover/img:scale-105 transition-transform"
                              />
                            </Link>

                            <div className="min-w-0">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#0040DD] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full inline-block mb-1">
                                {categoryLabel(equipment.category)}
                              </span>
                              <Link
                                to="/equipment/$slug"
                                params={{ slug: equipment.slug }}
                                className="font-display text-sm sm:text-base font-black text-slate-900 hover:text-[#0040DD] transition-colors block truncate"
                              >
                                {equipment.name}
                              </Link>
                              <span className="text-xs font-bold text-slate-500">
                                ${equipment.dayRate} / day
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-5">
                            {/* Days Adjuster */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-400">
                                Days:
                              </span>
                              <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() => updateCartDays(equipment.slug, Math.max(1, rentalDays - 1))}
                                  disabled={rentalDays <= 1}
                                  className="size-7 flex items-center justify-center hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                                >
                                  <Minus className="size-3" />
                                </button>
                                <span className="px-2 text-xs font-black text-slate-900 min-w-[28px] text-center">
                                  {rentalDays}d
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartDays(equipment.slug, rentalDays + 1)}
                                  className="size-7 flex items-center justify-center hover:bg-slate-200 text-slate-600 cursor-pointer"
                                >
                                  <Plus className="size-3" />
                                </button>
                              </div>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right min-w-[70px]">
                              <span className="text-sm font-black text-slate-900 block">
                                ${subtotal}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                for {rentalDays}d
                              </span>
                            </div>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => removeFromCart(equipment.slug)}
                              aria-label={`Remove ${equipment.name}`}
                              className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Schedule & Fulfillment */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                    <div className="size-8 rounded-xl bg-blue-50 text-[#0040DD] flex items-center justify-center font-black text-xs">
                      2
                    </div>
                    <h2 className="text-lg font-black text-slate-900">
                      Rental Dates &amp; Fulfillment
                    </h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Pick-up / Delivery Date *
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        min={todayStr}
                        onChange={(e) => setPickupDate(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Return Date *
                      </label>
                      <input
                        type="date"
                        value={returnDate}
                        min={pickupDate || todayStr}
                        onChange={(e) => setReturnDate(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                      />
                    </div>
                  </div>

                  {/* Fulfillment Choice */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Fulfillment Option:
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setFulfillmentType("pickup")}
                        className={cn(
                          "p-4 rounded-2xl border cursor-pointer transition-all",
                          fulfillmentType === "pickup"
                            ? "border-[#0040DD] bg-blue-50/50 shadow-2xs ring-1 ring-[#0040DD]"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-2 font-black text-xs text-slate-900">
                          <MapPin className="size-4 text-[#0040DD]" />
                          <span>Yard Self-Pickup (Free)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                          11732 S Wilcrest Dr., Houston, TX 77099. Fast 15-minute checkout.
                        </p>
                      </div>

                      <div
                        onClick={() => setFulfillmentType("delivery")}
                        className={cn(
                          "p-4 rounded-2xl border cursor-pointer transition-all",
                          fulfillmentType === "delivery"
                            ? "border-[#0040DD] bg-blue-50/50 shadow-2xs ring-1 ring-[#0040DD]"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-2 font-black text-xs text-slate-900">
                          <Truck className="size-4 text-[#0040DD]" />
                          <span>Greater Houston Jobsite Delivery</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                          Flat-rate quote based on mileage to Katy, Sugar Land, Pearland, etc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Customer Information */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                    <div className="size-8 rounded-xl bg-blue-50 text-[#0040DD] flex items-center justify-center font-black text-xs">
                      3
                    </div>
                    <h2 className="text-lg font-black text-slate-900">
                      Renter Information
                    </h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Full Name / Company Representative *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={customer.fullName}
                        onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Phone Number (SMS &amp; Gate Dispatch) *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. (281) 555-0199"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address (Digital Booking Receipt) *
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. john@contracting.com"
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Physical / Jobsite Address *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1234 Main St, Houston, TX 77002"
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Project Notes / Special Dispatch Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Need hitch receiver adapter, bringing crew trailer, jobsite access details..."
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0040DD]"
                    />
                  </div>
                </div>

                {/* 4. Payment Method Selection (INCLUDES CASH!) */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                    <div className="size-8 rounded-xl bg-blue-50 text-[#0040DD] flex items-center justify-center font-black text-xs">
                      4
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Select Payment Method
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Zero credit bureau checks • Cash, Zelle, and Cash App accepted
                      </p>
                    </div>
                  </div>

                  {/* 3 Payment Options Tabs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* CASH OPTION */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all cursor-pointer relative",
                        paymentMethod === "cash"
                          ? "border-[#16A34A] bg-emerald-50/60 shadow-xs ring-2 ring-[#16A34A]/20"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      )}
                    >
                      <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Popular
                      </span>
                      <div className="size-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                        <Banknote className="size-5" />
                      </div>
                      <span className="font-display font-black text-sm text-slate-900 block">
                        Cash on Pickup
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5 block leading-snug">
                        Pay at Houston Yard upon vehicle pickup. No advance card hold.
                      </span>
                    </button>

                    {/* ZELLE OPTION */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("zelle")}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all cursor-pointer",
                        paymentMethod === "zelle"
                          ? "border-[#7414CA] bg-purple-50/60 shadow-xs ring-2 ring-[#7414CA]/20"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      )}
                    >
                      <div className="size-9 rounded-xl bg-purple-100 text-[#7414CA] flex items-center justify-center mb-2">
                        <Zap className="size-5" />
                      </div>
                      <span className="font-display font-black text-sm text-slate-900 block">
                        Zelle® Transfer
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5 block leading-snug">
                        Direct bank-to-bank transfer. Instant digital verification.
                      </span>
                    </button>

                    {/* CASH APP OPTION */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cashapp")}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all cursor-pointer",
                        paymentMethod === "cashapp"
                          ? "border-[#00D632] bg-emerald-50/60 shadow-xs ring-2 ring-[#00D632]/20"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      )}
                    >
                      <div className="size-9 rounded-xl bg-emerald-100 text-[#00D632] flex items-center justify-center mb-2">
                        <QrCode className="size-5" />
                      </div>
                      <span className="font-display font-black text-sm text-slate-900 block">
                        Cash App
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5 block leading-snug">
                        Send to $M3RentalHouston with your name in memo.
                      </span>
                    </button>
                  </div>

                  {/* Payment Details Container */}
                  {paymentMethod === "cash" && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                        <Banknote className="size-4.5 text-emerald-700" />
                        <span>Cash Payment Policy &amp; Yard Handover</span>
                      </div>
                      <div className="space-y-2 text-xs text-emerald-950 font-medium leading-relaxed">
                        <p>
                          • Bring exact or rounded cash to our SW Houston facility counter at <strong>11732 S Wilcrest Dr., Houston, TX 77099</strong>.
                        </p>
                        <p>
                          • You will inspect the vehicle together with our yard technician, complete quick digital signatures, and receive an instant printed + digital receipt.
                        </p>
                        <p>
                          • <strong>Zero advance credit card holds</strong> and <strong>zero bureau reporting</strong>. Valid state driver's license required at handover.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "zelle" && (
                    <div className="rounded-2xl border border-purple-200 bg-purple-50/30 p-5 space-y-4 animate-in fade-in">
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <img
                          src={paymentSettings.zelle.qrCodeUrl || DEFAULT_PAYMENT_SETTINGS.zelle.qrCodeUrl}
                          alt="Zelle QR Code"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_PAYMENT_SETTINGS.zelle.qrCodeUrl;
                          }}
                          className="size-32 rounded-xl border border-purple-200 bg-white p-2 shadow-2xs shrink-0 object-contain"
                        />
                        <div className="space-y-2 text-xs flex-1 text-center sm:text-left">
                          <span className="text-[11px] font-black uppercase text-purple-800 tracking-wider block">
                            Zelle Recipient Account:
                          </span>
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span className="font-mono font-black text-slate-900 text-sm bg-white px-3 py-1.5 rounded-lg border border-purple-200">
                              {paymentSettings.zelle.accountEmailOrPhone}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(paymentSettings.zelle.accountEmailOrPhone, "zelle", "Zelle email")}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === "zelle" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                              <span>{copiedKey === "zelle" ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                          <p className="text-slate-600 font-medium text-[11px]">
                            Registered Name: <strong>{paymentSettings.zelle.accountName}</strong>. Please include your full name in the memo.
                          </p>
                        </div>
                      </div>

                      {/* Screenshot Upload */}
                      <div className="pt-2 border-t border-purple-100">
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Upload Transfer Screenshot *
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-purple-300 bg-white hover:bg-purple-50 cursor-pointer text-xs font-bold text-purple-800 transition-colors">
                            <UploadCloud className="size-4" />
                            <span>{screenshotFileName ? screenshotFileName : "Select screenshot image (JPG/PNG)"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleScreenshotUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cashapp" && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 space-y-4 animate-in fade-in">
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <img
                          src={paymentSettings.cashapp.qrCodeUrl || DEFAULT_PAYMENT_SETTINGS.cashapp.qrCodeUrl}
                          alt="Cash App QR Code"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_PAYMENT_SETTINGS.cashapp.qrCodeUrl;
                          }}
                          className="size-32 rounded-xl border border-emerald-200 bg-white p-2 shadow-2xs shrink-0 object-contain"
                        />
                        <div className="space-y-2 text-xs flex-1 text-center sm:text-left">
                          <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider block">
                            Cash App Cashtag:
                          </span>
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span className="font-mono font-black text-slate-900 text-sm bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
                              {paymentSettings.cashapp.cashtag}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(paymentSettings.cashapp.cashtag, "cashapp", "Cashtag")}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === "cashapp" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                              <span>{copiedKey === "cashapp" ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                          <p className="text-slate-600 font-medium text-[11px]">
                            Account Name: <strong>{paymentSettings.cashapp.accountName}</strong>. Match the exact order amount.
                          </p>
                        </div>
                      </div>

                      {/* Screenshot Upload */}
                      <div className="pt-2 border-t border-emerald-100">
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Upload Cash App Transfer Receipt *
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-emerald-300 bg-white hover:bg-emerald-50 cursor-pointer text-xs font-bold text-emerald-800 transition-colors">
                            <UploadCloud className="size-4" />
                            <span>{screenshotFileName ? screenshotFileName : "Select Cash App screenshot (JPG/PNG)"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleScreenshotUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* ── RIGHT COLUMN: STICKY ORDER SUMMARY & CTA ── */}
              <div className="lg:sticky lg:top-24 self-start space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-7 shadow-xs space-y-5">
                  <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                    Order Financial Summary
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Fleet Equipment ({totalCount} items):</span>
                      <span className="font-bold text-slate-900">${totalCost}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Yard Handover &amp; Inspection:</span>
                      <span className="font-bold text-emerald-600">FREE ($0)</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Credit Card Bureau Hold:</span>
                      <span className="font-bold text-emerald-600">$0 (No Hold)</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Selected Payment:</span>
                      <span className="font-bold uppercase text-slate-900">
                        {paymentMethod === "cash" ? "Cash at Pickup" : paymentMethod}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                          Total Due:
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Taxes calculated upon yard handover
                        </span>
                      </div>
                      <span className="font-display text-3xl font-black text-[#0040DD]">
                        ${totalCost}
                      </span>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0040DD] to-[#16A34A] hover:from-[#16A34A] hover:to-[#0040DD] text-white py-4 px-6 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60 cursor-pointer text-center"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Reservation...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="size-4" />
                          <span>Confirm &amp; Place Reservation</span>
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Trust badges */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="size-3.5 text-emerald-600 shrink-0" />
                      <span>Zero credit check • No automated holds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="size-3.5 text-emerald-600 shrink-0" />
                      <span>15-Minute rapid exit guarantee at S Wilcrest Dr</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="size-3.5 text-emerald-600 shrink-0" />
                      <span>Free cancellation with 24h dispatcher notice</span>
                    </div>
                  </div>
                </div>

                {/* Yard Directions Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 text-xs space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-[#0040DD]" />
                      <span>Houston Yard Facility</span>
                    </span>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=11732%20S%20Wilcrest%20Dr%2C%20Houston%2C%20TX%2077099"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0040DD] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Directions</span>
                      <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    11732 S Wilcrest Dr, Houston, TX 77099
                  </p>
                </div>
              </div>

            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
