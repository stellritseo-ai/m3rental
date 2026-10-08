import { useEffect, useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertCircle,
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
  Lock,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  X,
  ZoomIn,
} from "lucide-react";
import type { Equipment } from "@/data/equipment";
import {
  Booking,
  calculateRentalPrice,
  createBooking,
  DEFAULT_PAYMENT_SETTINGS,
  getPaymentSettings,
  getTodayString,
  getUnavailableDateRanges,
  getVehicleCurrentStatus,
  isRangeAvailable,
  PaymentMethod,
  PaymentSettings,
} from "@/lib/booking-store";
import { getPaymentSettingsDb } from "@/lib/api/payments.functions";
import { site } from "@/lib/site";

interface Props {
  vehicle: Equipment;
}

type BookingStep = "dates" | "customer" | "payment" | "confirmed";

export function VehicleBookingCard({ vehicle }: Props) {
  const formId = useId();

  // Current active step
  const [step, setStep] = useState<BookingStep>("dates");

  // Date selection state
  const todayStr = getTodayString();
  const [pickupDate, setPickupDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");

  // Customer information state
  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("zelle");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>("");
  const [screenshotFileName, setScreenshotFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Settings & reactive store subscription
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(getPaymentSettings());
  const [unavailableRanges, setUnavailableRanges] = useState(
    getUnavailableDateRanges(vehicle.slug),
  );
  const [vehicleStatus, setVehicleStatus] = useState(
    getVehicleCurrentStatus(vehicle.slug),
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  // Live mount-time fetch from MongoDB Atlas
  useEffect(() => {
    getPaymentSettingsDb()
      .then((res) => {
        if (res && res.success && res.settings) {
          const fresh: PaymentSettings = {
            zelle: res.settings.zelle,
            cashapp: res.settings.cashapp,
          };
          setPaymentSettings(fresh);
          try {
            localStorage.setItem("m3_rental_payment_settings_v2", JSON.stringify(fresh));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn("[BookingCard] Could not fetch live payment settings:", err);
      });
  }, []);

  // Re-sync when store changes (e.g., admin approval/rejection or new booking / QR upload)
  useEffect(() => {
    const handleStoreChange = () => {
      setUnavailableRanges(getUnavailableDateRanges(vehicle.slug));
      setVehicleStatus(getVehicleCurrentStatus(vehicle.slug));
      setPaymentSettings(getPaymentSettings());
    };
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "m3_rental_payment_settings_v2" && e.newValue) {
        try {
          setPaymentSettings(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("m3-bookings-changed", handleStoreChange);
    window.addEventListener("m3-payment-settings-changed", handleStoreChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("m3-bookings-changed", handleStoreChange);
      window.removeEventListener("m3-payment-settings-changed", handleStoreChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [vehicle.slug]);

  // Real-time calculation of days and price
  const { days: rentalDays, total: totalAmount } = calculateRentalPrice(
    vehicle.dayRate,
    pickupDate,
    returnDate,
  );

  // Real-time validation of date range
  const availabilityCheck =
    pickupDate && returnDate
      ? isRangeAvailable(vehicle.slug, pickupDate, returnDate)
      : { available: true };

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Image upload handler with preview and size check
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
      toast.success("Payment screenshot uploaded!");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setPaymentScreenshot("");
    setScreenshotFileName("");
  };

  // Step 1 -> Step 2 validation
  const handleProceedToCustomer = () => {
    if (!pickupDate || !returnDate) {
      toast.error("Please select both pick-up and return dates.");
      return;
    }
    if (pickupDate < todayStr) {
      toast.error("Pick-up date cannot be in the past.");
      return;
    }
    if (returnDate < pickupDate) {
      toast.error("Return date must be on or after pick-up date.");
      return;
    }
    if (!availabilityCheck.available) {
      toast.error(availabilityCheck.conflictReason || "Selected dates are unavailable.");
      return;
    }
    setStep("customer");
  };

  // Step 2 -> Step 3 validation
  const handleProceedToPayment = () => {
    if (!customer.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!customer.phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (!customer.email.trim() || !customer.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!customer.address.trim()) {
      toast.error("Please enter your address for rental verification.");
      return;
    }
    setStep("payment");
  };

  // Step 3 -> Final Submission
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod !== "cash" && !paymentScreenshot) {
      toast.error("Please upload a screenshot of your successful payment.");
      return;
    }

    const finalCheck = isRangeAvailable(vehicle.slug, pickupDate, returnDate);
    if (!finalCheck.available) {
      toast.error(finalCheck.conflictReason || "Dates were just booked by another customer.");
      setStep("dates");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = createBooking({
        vehicleSlug: vehicle.slug,
        vehicleName: vehicle.name,
        vehicleImage: vehicle.image,
        dailyRate: vehicle.dayRate,
        customer,
        pickupDate,
        returnDate,
        paymentMethod,
        paymentScreenshot: paymentMethod === "cash" ? "CASH_UPON_YARD_PICKUP" : paymentScreenshot,
      });

      setIsSubmitting(false);

      if (!result.success || !result.booking) {
        toast.error(result.error || "Failed to submit booking.");
        return;
      }

      setConfirmedBooking(result.booking);
      setStep("confirmed");
      toast.success("Booking submitted successfully!", {
        description: `Booking #${result.booking.id} is now ${paymentMethod === "cash" ? "confirmed for pickup" : "pending verification"}.`,
      });
    }, 600);
  };

  const currentPayConfig =
    paymentMethod === "cashapp"
      ? (paymentSettings?.cashapp || DEFAULT_PAYMENT_SETTINGS.cashapp)
      : (paymentSettings?.zelle || DEFAULT_PAYMENT_SETTINGS.zelle);

  const defaultFallbackUrl =
    paymentMethod === "cashapp"
      ? DEFAULT_PAYMENT_SETTINGS.cashapp.qrCodeUrl
      : DEFAULT_PAYMENT_SETTINGS.zelle.qrCodeUrl;

  const activeQrUrl = currentPayConfig?.qrCodeUrl || defaultFallbackUrl;

  return (
    <div
      id="booking-system"
      className="rounded-2xl border border-slate-200/90 bg-white shadow-[0_10px_35px_-8px_rgba(15,23,42,0.08)] overflow-hidden transition-all duration-300 relative"
    >
      {/* Top dual-gradient accent rule */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD]" />

      {/* ── CARD HEADER: Clean, Light & Friendly ── */}
      <div className="bg-gradient-to-b from-slate-50/90 to-white border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0040DD] block">
              Online Booking
            </span>
            <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Reserve This Vehicle
            </h3>
          </div>

          {/* Simple Live Status */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${vehicleStatus.colorClass}`}
          >
            <span
              className={`size-2 rounded-full ${
                vehicleStatus.status === "AVAILABLE"
                  ? "bg-[#16A34A] animate-ping"
                  : vehicleStatus.status === "PAYMENT VERIFICATION PENDING"
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            />
            <span>{vehicleStatus.badgeText}</span>
          </span>
        </div>

        {/* Clean 3-Step Pill Progress */}
        {step !== "confirmed" && (
          <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => setStep("dates")}
              className={`flex items-center gap-1.5 font-bold transition-all ${
                step === "dates" ? "text-[#0040DD]" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <span
                className={`size-5 rounded-full flex items-center justify-center text-[10px] font-black transition-transform ${
                  step === "dates"
                    ? "bg-[#0040DD] text-white shadow-xs scale-105"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                1
              </span>
              <span className="text-xs">Dates</span>
            </button>

            <span className="text-slate-300">/</span>

            <button
              type="button"
              onClick={() => {
                if (pickupDate && returnDate && availabilityCheck.available) {
                  setStep("customer");
                }
              }}
              className={`flex items-center gap-1.5 font-bold transition-all ${
                step === "customer" ? "text-[#0040DD]" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <span
                className={`size-5 rounded-full flex items-center justify-center text-[10px] font-black transition-transform ${
                  step === "customer"
                    ? "bg-[#0040DD] text-white shadow-xs scale-105"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                2
              </span>
              <span className="text-xs">Details</span>
            </button>

            <span className="text-slate-300">/</span>

            <button
              type="button"
              onClick={() => {
                if (
                  pickupDate &&
                  returnDate &&
                  availabilityCheck.available &&
                  customer.fullName &&
                  customer.phone
                ) {
                  setStep("payment");
                }
              }}
              className={`flex items-center gap-1.5 font-bold transition-all ${
                step === "payment" ? "text-[#0040DD]" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <span
                className={`size-5 rounded-full flex items-center justify-center text-[10px] font-black transition-transform ${
                  step === "payment"
                    ? "bg-[#0040DD] text-white shadow-xs scale-105"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                3
              </span>
              <span className="text-xs">Payment</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {/* ══════════════════════════════════════════════════
            STEP 1: DATE SELECTION & AUTOMATIC CALCULATION
           ══════════════════════════════════════════════════ */}
        {step === "dates" && (
          <div className="space-y-4.5 animate-in fade-in-50 duration-200">
            {/* Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`${formId}-pickup`}
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Pick-up Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id={`${formId}-pickup`}
                    type="date"
                    min={todayStr}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-return`}
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Return Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id={`${formId}-return`}
                    type="date"
                    min={pickupDate || todayStr}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Conflict or Availability message */}
            {pickupDate && returnDate && (
              <div>
                {availabilityCheck.available ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200/90 p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2 shadow-2xs">
                    <CheckCircle2 className="size-4 text-[#16A34A] shrink-0" />
                    <span>Selected dates are Available ({pickupDate} to {returnDate})</span>
                  </div>
                ) : (
                  <div className="rounded-xl bg-red-50 border border-red-200/90 p-3 text-xs text-red-800 font-medium space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-red-900">
                      <ShieldAlert className="size-4 text-red-600 shrink-0" />
                      <span>Dates Already Booked</span>
                    </div>
                    <p>{availabilityCheck.conflictReason}</p>
                  </div>
                )}
              </div>
            )}

            {/* Price Calculation Card (Clean & Compact) */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-2.5 shadow-2xs">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Daily Rate:</span>
                <span className="font-bold text-slate-900">${vehicle.dayRate} / day</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Rental Duration:</span>
                <span className="font-bold text-slate-900">
                  {rentalDays > 0 ? `${rentalDays} Day${rentalDays > 1 ? "s" : ""}` : "—"}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-slate-900 text-sm">Estimated Total:</span>
                  <span className="block text-[11px] text-slate-500">
                    {rentalDays > 0 ? `$${vehicle.dayRate}/day × ${rentalDays} days` : "Select dates to calculate"}
                  </span>
                </div>
                <span className="font-display text-2xl sm:text-3xl font-black text-[#0040DD]">
                  ${totalAmount}.00
                </span>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={handleProceedToCustomer}
              disabled={!pickupDate || !returnDate || !availabilityCheck.available}
              className="w-full btn-base btn-primary font-black uppercase tracking-wider shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm py-3.5 transition-all"
            >
              <span>Continue to Customer Details</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP 2: CUSTOMER INFORMATION
           ══════════════════════════════════════════════════ */}
        {step === "customer" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setStep("dates")}
                className="text-xs font-bold text-slate-500 hover:text-[#0040DD] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-3.5" /> Back to dates
              </button>
              <span className="text-xs font-bold text-[#0040DD] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {rentalDays} Days: ${totalAmount}.00
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor={`${formId}-name`}
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id={`${formId}-name`}
                  type="text"
                  required
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`${formId}-phone`}
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formId}-phone`}
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="(281) 000-0000"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${formId}-email`}
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formId}-email`}
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-address`}
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Address (Billing or Delivery) <span className="text-red-500">*</span>
                </label>
                <input
                  id={`${formId}-address`}
                  type="text"
                  required
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="Street Address, City, Houston, TX"
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0040DD] focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                />
              </div>

              <div>
                <label
                  htmlFor={`${formId}-notes`}
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Optional Notes / Special Requests
                </label>
                <input
                  id={`${formId}-notes`}
                  type="text"
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  placeholder="e.g. Yard pickup time, equipment delivery..."
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#0040DD] focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToPayment}
              className="w-full btn-base btn-primary font-black uppercase tracking-wider shadow-md hover:shadow-lg cursor-pointer text-xs sm:text-sm py-3.5 mt-2 transition-all"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP 3: PAYMENT METHOD, QR CODE & SCREENSHOT
           ══════════════════════════════════════════════════ */}
        {step === "payment" && (
          <form onSubmit={handleSubmitBooking} className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setStep("customer")}
                className="text-xs font-bold text-slate-500 hover:text-[#0040DD] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-3.5" /> Back to details
              </button>
              <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Total: ${totalAmount}.00
              </span>
            </div>

            {/* Simple Booking Summary Card */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 text-xs space-y-1 shadow-2xs">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{vehicle.name}</span>
                <span className="text-[#0040DD] font-display text-sm font-black">${totalAmount}.00</span>
              </div>
              <div className="text-slate-500 text-[11px] flex justify-between">
                <span>{pickupDate} → {returnDate} ({rentalDays} Days)</span>
                <span>${vehicle.dayRate}/day</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Payment Method:
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    paymentMethod === "cash"
                      ? "border-[#16A34A] bg-emerald-50 text-emerald-800 shadow-2xs scale-[1.01]"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Cash (Yard)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("zelle")}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    paymentMethod === "zelle"
                      ? "border-[#7414CA] bg-purple-50 text-[#7414CA] shadow-2xs scale-[1.01]"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <QrCode className="size-3 text-[#7414CA]" />
                  <span>Zelle® QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cashapp")}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    paymentMethod === "cashapp"
                      ? "border-[#00D632] bg-emerald-50 text-emerald-800 shadow-2xs scale-[1.01]"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <QrCode className="size-3 text-[#00D632]" />
                  <span>Cash App QR</span>
                </button>
              </div>
            </div>

            {/* Payment Details Container */}
            {paymentMethod === "cash" ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3 shadow-2xs text-left animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs sm:text-sm">
                  <Banknote className="size-4.5 text-emerald-700" />
                  <span>Pay with Cash upon Equipment Pickup</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-emerald-950 leading-relaxed font-medium">
                  <p>
                    • <strong>Location:</strong> 11732 S Wilcrest Dr., Houston, TX 77099
                  </p>
                  <p>
                    • Pay exact or rounded cash at the counter upon equipment handover.
                  </p>
                  <p>
                    • <strong>Zero advance credit card holds</strong> and <strong>no bureau checks</strong>.
                  </p>
                  <p>
                    • You will receive an immediate printed &amp; digital receipt.
                  </p>
                </div>
                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                  <span>Total Due at Yard Counter:</span>
                  <span className="font-display text-base font-black text-emerald-900">
                    ${totalAmount}.00
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* QR Code and Account Info Card */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-4 text-center space-y-3 shadow-2xs">
                  <div className="flex flex-col items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setIsQrZoomed(true)}
                      className="group relative p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-[#0040DD]/60 hover:shadow-md transition-all cursor-pointer block"
                      title="Click to enlarge QR code for easy scanning"
                    >
                      <img
                        src={activeQrUrl}
                        alt={`${paymentMethod} QR Code`}
                        onError={(e) => {
                          e.currentTarget.src = defaultFallbackUrl;
                        }}
                        className="size-36 sm:size-44 object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[0.5px] rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="bg-white/95 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                          <ZoomIn className="size-3 text-[#0040DD]" /> Tap to Enlarge
                        </span>
                      </div>
                    </button>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1.5 flex items-center gap-1">
                      <QrCode className="size-3 text-[#0040DD]" />
                      <span>Live M3 {paymentMethod === "zelle" ? "Zelle" : "Cash App"} Scan Code</span>
                    </span>
                  </div>

                  {/* Recipient Details with Copy */}
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/80 text-xs text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">
                        {paymentMethod === "zelle" ? "Account / Email:" : "Cash App Cashtag:"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            paymentMethod === "zelle"
                              ? paymentSettings.zelle.accountEmailOrPhone
                              : paymentSettings.cashapp.cashtag,
                            "recipient",
                            paymentMethod === "zelle" ? "Zelle Email" : "Cashtag",
                          )
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0040DD] hover:underline cursor-pointer"
                      >
                        {copiedKey === "recipient" ? <Check className="size-3 text-[#16A34A]" /> : <Copy className="size-3" />}
                        <span>{copiedKey === "recipient" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5 truncate">
                      {paymentMethod === "zelle"
                        ? paymentSettings.zelle.accountEmailOrPhone
                        : paymentSettings.cashapp.cashtag}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Name: <span className="font-semibold text-slate-800">{currentPayConfig.accountName}</span> • Amount:{" "}
                      <span className="font-black text-[#0040DD]">${totalAmount}.00</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="text-[11px] text-slate-600 text-left bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/80 space-y-1">
                    <p className="font-bold text-[#0040DD]">How to Complete Payment:</p>
                    <ol className="list-decimal list-inside space-y-0.5">
                      <li>Scan QR code in your {paymentMethod === "zelle" ? "banking app" : "Cash App"}.</li>
                      <li>Send exact amount: <strong>${totalAmount}.00</strong></li>
                      <li>Take a screenshot of the payment receipt.</li>
                      <li>Upload the screenshot below to verify booking.</li>
                    </ol>
                  </div>
                </div>

                {/* Payment Screenshot Upload */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Upload Payment Screenshot <span className="text-red-500">*</span>
                  </label>

                  {!paymentScreenshot ? (
                    <label className="border-2 border-dashed border-slate-300 hover:border-[#0040DD] rounded-xl p-4 text-center block cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30">
                      <UploadCloud className="size-6 text-[#0040DD] mx-auto mb-1" />
                      <span className="text-xs font-bold text-slate-700 block">
                        Click to browse or upload screenshot
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        JPG, JPEG, PNG (Max 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5 truncate">
                        <img
                          src={paymentScreenshot}
                          alt="Screenshot Preview"
                          className="size-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div className="truncate text-left">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {screenshotFileName || "screenshot.png"}
                          </span>
                          <span className="text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="size-2.5" /> Uploaded successfully
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove screenshot"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || (paymentMethod !== "cash" && !paymentScreenshot)}
              className="w-full btn-base btn-primary font-black uppercase tracking-wider shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm py-3.5 transition-all"
            >
              {isSubmitting
                ? "Submitting Booking..."
                : paymentMethod === "cash"
                ? "Confirm Cash Booking & Reserve"
                : "Submit Payment & Complete Booking"}
            </button>
          </form>
        )}

        {/* ══════════════════════════════════════════════════
            STEP 4: CONFIRMATION RECEIPT
           ══════════════════════════════════════════════════ */}
        {step === "confirmed" && confirmedBooking && (
          <div className="text-center space-y-4 py-2 animate-in fade-in-50 duration-200">
            <div className="size-12 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="size-7" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
                Payment Verification Pending
              </span>
              <h3 className="font-display text-xl font-black text-slate-900 mt-2">
                Booking Submitted Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your rental request has been received. Our team will verify your payment and contact you shortly with your confirmation.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-left space-y-2 shadow-2xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Booking ID:</span>
                <span className="font-mono font-bold text-slate-900">#{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.vehicleName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dates:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.pickupDate} → {confirmedBooking.returnDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total:</span>
                <span className="font-black text-base text-[#0040DD] font-display">${confirmedBooking.totalAmount}.00</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={site.phoneHref}
                className="btn-base btn-primary text-xs font-bold py-2.5 flex-1 shadow-sm"
              >
                <Phone className="size-3.5" /> Call Yard: {site.phone}
              </a>
              <button
                type="button"
                onClick={() => {
                  setStep("dates");
                  setPickupDate("");
                  setReturnDate("");
                  setPaymentScreenshot("");
                  setConfirmedBooking(null);
                }}
                className="btn-base btn-outline text-xs font-bold py-2.5 flex-1"
              >
                <RotateCcw className="size-3.5" /> Book Another Date
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CARD FOOTER: Direct Phone Dispatch Assistance ── */}
      <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3 text-center text-xs text-slate-600">
        <span>Prefer to book by phone? </span>
        <a
          href={site.phoneHref}
          className="font-bold text-[#0040DD] hover:underline inline-flex items-center gap-1"
        >
          <Phone className="size-3 text-[#16A34A]" />
          <span>Call Dispatch: {site.phone}</span>
        </a>
      </div>

      {/* ── Fullscreen QR Code Lightbox Modal ── */}
      {isQrZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsQrZoomed(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0040DD] block">
                  Official Instant Payment
                </span>
                <h4 className="text-base font-black text-slate-900">
                  Scan {paymentMethod === "zelle" ? "Zelle" : "Cash App"} QR
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsQrZoomed(false)}
                className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-slate-200/80 shadow-inner flex justify-center">
              <img
                src={activeQrUrl}
                alt={`${paymentMethod} Large QR Code`}
                onError={(e) => {
                  e.currentTarget.src = defaultFallbackUrl;
                }}
                className="size-60 sm:size-64 object-contain rounded-xl"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-left space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Recipient:</span>
                <span className="font-bold text-slate-900">{currentPayConfig.accountName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{paymentMethod === "zelle" ? "Email/Phone:" : "Cashtag:"}</span>
                <span className="font-bold text-[#0040DD]">
                  {paymentMethod === "zelle"
                    ? paymentSettings.zelle.accountEmailOrPhone
                    : paymentSettings.cashapp.cashtag}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-slate-200/70 text-slate-900">
                <span>Exact Amount:</span>
                <span className="text-[#0040DD] text-sm">${totalAmount}.00</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsQrZoomed(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Done Scanning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
