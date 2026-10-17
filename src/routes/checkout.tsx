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
  FileText,
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
  UserCheck,
  X,
  Zap,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart-store";
import { categoryLabel, operatorLabel } from "@/data/equipment";
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
  const [governmentId, setGovernmentId] = useState<string>("");
  const [govIdFileName, setGovIdFileName] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  // Terms Acceptance
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Submission & Confirmed State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[] | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(getPaymentSettings());

  // Mount-time database sync for live QR codes & payment accounts
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

  // Compute active QR code URLs and configuration
  const activeQrUrl = useMemo(() => {
    if (paymentMethod === "zelle") {
      return paymentSettings.zelle.qrCodeUrl || DEFAULT_PAYMENT_SETTINGS.zelle.qrCodeUrl;
    }
    if (paymentMethod === "cashapp") {
      return paymentSettings.cashapp.qrCodeUrl || DEFAULT_PAYMENT_SETTINGS.cashapp.qrCodeUrl;
    }
    return "";
  }, [paymentMethod, paymentSettings]);

  const defaultFallbackUrl = useMemo(() => {
    if (paymentMethod === "zelle") return DEFAULT_PAYMENT_SETTINGS.zelle.qrCodeUrl;
    if (paymentMethod === "cashapp") return DEFAULT_PAYMENT_SETTINGS.cashapp.qrCodeUrl;
    return "";
  }, [paymentMethod]);

  const currentPayConfig = useMemo(() => {
    if (paymentMethod === "zelle") {
      return {
        title: "Zelle® Transfer",
        accountName: paymentSettings.zelle.accountName,
        accountDetail: paymentSettings.zelle.accountEmailOrPhone,
        detailLabel: "Zelle Email / Phone",
        instructions: paymentSettings.zelle.instructions,
      };
    }
    if (paymentMethod === "cashapp") {
      return {
        title: "Cash App",
        accountName: paymentSettings.cashapp.accountName,
        accountDetail: paymentSettings.cashapp.cashtag,
        detailLabel: "Cash App Cashtag",
        instructions: paymentSettings.cashapp.instructions,
      };
    }
    return {
      title: "Cash on Pickup",
      accountName: "M3 Rental Houston Counter",
      accountDetail: "11732 S Wilcrest Dr, Houston, TX 77099",
      detailLabel: "Yard Counter",
      instructions: "Pay at counter upon physical inspection.",
    };
  }, [paymentMethod, paymentSettings]);

  // Copy helper
  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Payment Screenshot handler
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

  const removeScreenshot = () => {
    setPaymentScreenshot("");
    setScreenshotFileName("");
  };

  // Government ID handler
  const handleGovIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setGovIdFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setGovernmentId(result);
      toast.success("Government ID uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const removeGovId = () => {
    setGovernmentId("");
    setGovIdFileName("");
  };

  // Order submission
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

    // Required Government ID check
    if (!governmentId) {
      toast.error("Please upload a valid Government ID (Driver's License, State ID, or Passport).");
      return;
    }

    // Required Payment Screenshot for digital transfers
    if (paymentMethod !== "cash" && !paymentScreenshot) {
      toast.error(`Please upload a screenshot of your ${paymentMethod === "zelle" ? "Zelle" : "Cash App"} transfer.`);
      return;
    }

    // Terms Acceptance check
    if (!acceptedTerms) {
      toast.error("Please agree to the Terms & Conditions and Commercial Rental Agreement.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const createdList: Booking[] = [];
      let allSuccess = true;

      for (const cartItem of items) {
        // Derive dynamic operator mode based on dashboard configuration
        const isOperatorIncluded =
          cartItem.equipment.operator === "operator" ||
          cartItem.equipment.operator === "driver" ||
          cartItem.equipment.operator === "driver-operator" ||
          Boolean(cartItem.equipment.operatorIncluded);

        const operationMode: "self" | "operator" = isOperatorIncluded ? "operator" : "self";

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
          operationMode,
          paymentMethod,
          paymentScreenshot:
            paymentMethod === "cash"
              ? "CASH_UPON_YARD_PICKUP"
              : paymentScreenshot,
          governmentId: governmentId || undefined,
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

  // ══════════════════════════════════════════════════
  // SUCCESS CONFIRMATION VIEW
  // ══════════════════════════════════════════════════
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
          <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header Success Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-md text-center space-y-4">
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
                  Thank you, <strong className="text-slate-900">{customer.fullName}</strong>. Your rental reservation has been routed directly to our Houston yard dispatch desk on S Wilcrest Dr.
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

            {/* Verification & Document Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="size-5 text-[#0040DD]" />
                <span>Verification &amp; Attached Documents</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                {/* Government ID Slot */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="size-4 text-[#16A34A]" />
                      <span>Government ID</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Attached
                    </span>
                  </div>
                  {governmentId && (
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={governmentId}
                        alt="Government ID"
                        className="size-16 rounded-xl object-cover border border-slate-200 bg-white"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate text-xs">
                          {govIdFileName || "government-id.png"}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Driver License / State ID / Passport
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                          Ready for 5-minute counter handover
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Screenshot Slot */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Banknote className="size-4 text-[#0040DD]" />
                      <span>Payment Verification</span>
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1",
                        isCashOrder
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-amber-100 text-amber-900 border-amber-300"
                      )}
                    >
                      {isCashOrder ? (
                        <>
                          <CheckCircle2 className="size-3" /> Cash at Yard
                        </>
                      ) : (
                        <>
                          <Clock className="size-3" /> Under Review
                        </>
                      )}
                    </span>
                  </div>

                  {isCashOrder ? (
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Pay exact cash <strong>${totalCost}.00</strong> at the counter upon vehicle inspection. No advance card hold.
                    </p>
                  ) : paymentScreenshot ? (
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={paymentScreenshot}
                        alt="Payment Receipt"
                        className="size-16 rounded-xl object-cover border border-slate-200 bg-white"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate text-xs">
                          {screenshotFileName || "payment-receipt.png"}
                        </span>
                        <span className="text-[11px] text-slate-500 block capitalize">
                          {paymentMethod} Digital Transfer
                        </span>
                        <span className="text-[10px] text-purple-700 font-semibold mt-0.5 block">
                          Dispatcher reviewing receipt
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Next Steps for Customer */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
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
                    <span>Rapid Turnaround Guarantee</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Your equipment keys and rental documents are prepared in advance. Present your driver license or ID at the yard desk for rapid 15-minute exit.
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

  // ══════════════════════════════════════════════════
  // EMPTY CART VIEW
  // ══════════════════════════════════════════════════
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
                Add commercial trucks, trailers, or heavy machinery from our Houston inventory to proceed with checkout.
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

  // ══════════════════════════════════════════════════
  // ACTIVE CHECKOUT FORM VIEW
  // ══════════════════════════════════════════════════
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
              Checkout Step: Final Reservation &amp; Verification
            </span>
          </div>

          <form onSubmit={handleSubmitOrder}>
            <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:gap-10 items-start">
              
              {/* ── LEFT COLUMN: ITEMS, DATES, CUSTOMER, PAYMENT & DOCUMENTS ── */}
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

                      // Dynamic operator mode derived from equipment settings
                      const isOperatorIncluded =
                        equipment.operator === "operator" ||
                        equipment.operator === "driver" ||
                        equipment.operator === "driver-operator" ||
                        Boolean(equipment.operatorIncluded);

                      const opLabel =
                        operatorLabel[equipment.operator] ||
                        (isOperatorIncluded ? "Operator Included" : "Self Operated");

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

                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#0040DD] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full inline-block">
                                  {categoryLabel(equipment.category)}
                                </span>

                                {/* Dynamic Operator Status Pill */}
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                    isOperatorIncluded
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : "bg-blue-50 text-[#0040DD] border-blue-200"
                                  )}
                                >
                                  {isOperatorIncluded ? (
                                    <ShieldCheck className="size-3 text-emerald-600" />
                                  ) : (
                                    <User className="size-3 text-[#0040DD]" />
                                  )}
                                  <span>{opLabel}</span>
                                </span>
                              </div>

                              <Link
                                to="/equipment/$slug"
                                params={{ slug: equipment.slug }}
                                className="font-display text-sm sm:text-base font-black text-slate-900 hover:text-[#0040DD] transition-colors block truncate"
                              >
                                {equipment.name}
                              </Link>

                              <span className="text-xs font-bold text-slate-500 block">
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

                {/* 4. Payment Method & Verification Documents */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-xs space-y-6">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                    <div className="size-8 rounded-xl bg-blue-50 text-[#0040DD] flex items-center justify-center font-black text-xs">
                      4
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Payment &amp; Identity Verification
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
                  {paymentMethod === "cash" ? (
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
                      <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span>Total Cash Due at Yard Counter:</span>
                        <span className="font-display text-base font-black text-emerald-900">
                          ${totalCost}.00
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs animate-in fade-in">
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Enlargable QR Code */}
                        <div className="flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => setIsQrZoomed(true)}
                            className="group relative p-2.5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-[#0040DD]/60 hover:shadow-md transition-all cursor-pointer block shrink-0"
                            title="Click to enlarge QR code for easy scanning"
                          >
                            <img
                              src={activeQrUrl}
                              alt={`${paymentMethod} QR Code`}
                              onError={(e) => {
                                e.currentTarget.src = defaultFallbackUrl;
                              }}
                              className="size-36 sm:size-40 rounded-xl object-contain"
                            />
                            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[0.5px] rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
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

                        {/* Recipient Account Details with Copy */}
                        <div className="space-y-2.5 text-xs flex-1 text-center sm:text-left min-w-0">
                          <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                            {paymentMethod === "zelle" ? "Zelle Recipient Account:" : "Cash App Cashtag:"}
                          </span>

                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span className="font-mono font-black text-slate-900 text-sm bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 truncate">
                              {paymentMethod === "zelle"
                                ? paymentSettings.zelle.accountEmailOrPhone
                                : paymentSettings.cashapp.cashtag}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  paymentMethod === "zelle"
                                    ? paymentSettings.zelle.accountEmailOrPhone
                                    : paymentSettings.cashapp.cashtag,
                                  "recipient",
                                  paymentMethod === "zelle" ? "Zelle Email" : "Cashtag"
                                )
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[#0040DD] hover:bg-blue-50 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                            >
                              {copiedKey === "recipient" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                              <span>{copiedKey === "recipient" ? "Copied" : "Copy"}</span>
                            </button>
                          </div>

                          <div className="space-y-0.5 text-slate-600 text-[11px] font-medium">
                            <p>
                              Account Name: <strong className="text-slate-900">{currentPayConfig.accountName}</strong>
                            </p>
                            <p>
                              Amount to Send: <strong className="text-[#0040DD] font-black">${totalCost}.00</strong>
                            </p>
                          </div>

                          {/* How to Complete Payment */}
                          <div className="text-[11px] text-slate-600 text-left bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/80 space-y-1">
                            <p className="font-bold text-[#0040DD]">How to Complete Payment:</p>
                            <ol className="list-decimal list-inside space-y-0.5 text-[10.5px]">
                              <li>Scan QR code in your {paymentMethod === "zelle" ? "banking app" : "Cash App"}.</li>
                              <li>Send exact order amount: <strong>${totalCost}.00</strong></li>
                              <li>Take a screenshot of the payment receipt.</li>
                              <li>Upload the screenshot below to verify booking.</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── REQUIRED VERIFICATION DOCUMENTS: PAYMENT SCREENSHOT & GOVERNMENT ID ── */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <FileText className="size-4 text-[#0040DD]" />
                        <span>Upload Required Verification Documents</span>
                        <span className="text-red-500">*</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        To protect our commercial fleet and speed up your yard exit, please attach your Government ID and payment receipt.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Slot 1: Payment Screenshot */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Banknote className="size-3.5 text-[#0040DD]" />
                          <span>Payment Screenshot</span>
                          {paymentMethod !== "cash" && <span className="text-red-500">*</span>}
                        </span>

                        {paymentMethod === "cash" ? (
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs text-emerald-950 flex flex-col justify-center min-h-[105px]">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                              <CheckCircle2 className="size-4 text-emerald-700" />
                              <span>Cash Order Selected</span>
                            </div>
                            <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                              Pay <strong>${totalCost}.00</strong> in cash at the Houston yard counter. No digital transfer screenshot is required.
                            </p>
                          </div>
                        ) : !paymentScreenshot ? (
                          <label className="border-2 border-dashed border-slate-300 hover:border-[#0040DD] rounded-2xl p-4 text-center block cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30 min-h-[105px] flex flex-col items-center justify-center">
                            <UploadCloud className="size-6 text-[#0040DD] mx-auto mb-1" />
                            <span className="text-xs font-bold text-slate-700 block leading-tight">
                              Upload Payment Screenshot
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Zelle or Cash App Receipt (JPG, PNG, WebP)
                            </span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/jpg,image/webp"
                              onChange={handleScreenshotUpload}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50 flex items-center justify-between gap-3 shadow-2xs min-h-[105px]">
                            <div className="flex items-center gap-3 truncate">
                              <img
                                src={paymentScreenshot}
                                alt="Payment Proof"
                                className="size-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                              />
                              <div className="truncate text-left min-w-0">
                                <span className="text-xs font-bold text-slate-800 block truncate">
                                  {screenshotFileName || "payment-proof.png"}
                                </span>
                                <span className="text-[10px] text-[#16A34A] font-semibold flex items-center gap-1 mt-0.5">
                                  <CheckCircle2 className="size-3" /> Screenshot Attached
                                </span>
                                <span className="text-[9.5px] text-slate-400 block truncate">
                                  Ready for dispatcher review
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeScreenshot}
                              className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                              title="Remove payment screenshot"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Slot 2: Government ID */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <User className="size-3.5 text-[#16A34A]" />
                          <span>Government ID</span>
                          <span className="text-red-500">*</span>
                        </span>

                        {!governmentId ? (
                          <label className="border-2 border-dashed border-slate-300 hover:border-[#16A34A] rounded-2xl p-4 text-center block cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/30 min-h-[105px] flex flex-col items-center justify-center">
                            <UploadCloud className="size-6 text-[#16A34A] mx-auto mb-1" />
                            <span className="text-xs font-bold text-slate-700 block leading-tight">
                              Upload Government ID *
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Driver License, State ID, or Passport (JPG/PNG)
                            </span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/jpg,image/webp"
                              onChange={handleGovIdUpload}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50 flex items-center justify-between gap-3 shadow-2xs min-h-[105px]">
                            <div className="flex items-center gap-3 truncate">
                              <img
                                src={governmentId}
                                alt="Government ID"
                                className="size-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                              />
                              <div className="truncate text-left min-w-0">
                                <span className="text-xs font-bold text-slate-800 block truncate">
                                  {govIdFileName || "government-id.png"}
                                </span>
                                <span className="text-[10px] text-[#16A34A] font-semibold flex items-center gap-1 mt-0.5">
                                  <CheckCircle2 className="size-3" /> ID Attached
                                </span>
                                <span className="text-[9.5px] text-slate-400 block truncate">
                                  Encrypted &amp; confidential
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeGovId}
                              className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                              title="Remove Government ID"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── TERMS & CONDITIONS CHECKBOX ── */}
                  <div className="pt-2 border-t border-slate-100">
                    <label
                      htmlFor={`${formId}-terms`}
                      className={cn(
                        "flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none",
                        acceptedTerms
                          ? "border-blue-200 bg-blue-50/50 shadow-2xs"
                          : "border-slate-200 bg-slate-50/80 hover:bg-slate-50 hover:border-slate-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        id={`${formId}-terms`}
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-0.5 size-4 rounded-md border-slate-300 text-[#0040DD] focus:ring-[#0040DD]/30 cursor-pointer shrink-0"
                      />
                      <span className="text-xs text-slate-700 font-medium leading-relaxed">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowTermsModal(true);
                          }}
                          className="font-bold text-[#0040DD] underline hover:text-blue-800 cursor-pointer inline"
                        >
                          Terms &amp; Conditions
                        </button>{" "}
                        and Houston Commercial Rental Agreement. Zero credit bureau reporting and 24h flexible rescheduling.{" "}
                        <span className="text-red-500 font-bold">*</span>
                      </span>
                    </label>
                  </div>
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
                      <span>Government ID Verification:</span>
                      <span
                        className={cn(
                          "font-bold flex items-center gap-1",
                          governmentId ? "text-emerald-600" : "text-amber-600"
                        )}
                      >
                        {governmentId ? (
                          <>
                            <CheckCircle2 className="size-3" /> Attached
                          </>
                        ) : (
                          "Required"
                        )}
                      </span>
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
                      <span>Zero credit check • No automated card holds</span>
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

      {/* ── QR CODE ZOOM MODAL ── */}
      {isQrZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-display font-black text-slate-900 text-sm flex items-center gap-1.5">
                <QrCode className="size-4 text-[#0040DD]" />
                <span>Scan with Banking App</span>
              </span>
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
                <span className="text-[#0040DD] text-sm">${totalCost}.00</span>
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

      {/* ── TERMS & CONDITIONS MODAL ── */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0040DD]">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-base">
                    M3 Rental Terms &amp; Conditions
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Houston Commercial Yard Rental Policies
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="size-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
                <p className="font-extrabold text-[#0040DD] text-xs">
                  1. Operation &amp; Driver Qualifications
                </p>
                <p>
                  <strong>Self-Operated:</strong> Designated renters/drivers must be at least 21 years old and possess a valid, government-issued driver's license. All equipment must be operated within manufacturer-rated payload and safety limits.
                </p>
                <p>
                  <strong>With Operator:</strong> Units rented with an operator will be operated exclusively by certified M3 commercial operators for the contracted shift duration.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <p className="font-extrabold text-[#16A34A] text-xs">
                  2. Payment &amp; Zero Credit Trap Guarantee
                </p>
                <p>
                  We accept Cash, Zelle, and Cash App directly. We do NOT run credit bureau score inquiries or place predatory holds on your credit report. Full rental amount and standard refundable security deposit must be cleared before yard departure.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-extrabold text-slate-900 text-xs">
                  3. Yard Pick-up &amp; Return Inspection
                </p>
                <p>
                  Equipment is inspected jointly at our Houston yard (11732 S Wilcrest Dr, Houston, TX 77099). Renter agrees to return equipment in the same condition as dispatched, normal wear and tear excepted.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-extrabold text-slate-900 text-xs">
                  4. Flexible Rescheduling
                </p>
                <p>
                  Need to change dates due to weather or jobsite delays? Call our dispatch desk at (281) 933-5000 with 24 hours notice to reschedule at no additional penalty.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                  toast.success("Terms & Conditions accepted!");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0040DD] hover:bg-[#0036ba] text-white font-black uppercase tracking-wider text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Check className="size-3.5" /> Accept &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
