import { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
  Zap,
  Tag,
  FileText,
  BadgeCheck,
  UserCheck,
  ChevronRight,
  Share2,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EquipmentCard } from "@/components/site/EquipmentCard";
import { Reveal } from "@/components/site/Reveal";
import { VehicleBookingCard } from "@/components/booking/VehicleBookingCard";
import {
  categoryLabel,
  getEquipment,
  operatorLabel,
  relatedEquipment,
  type Equipment,
} from "@/data/equipment";
import { site } from "@/lib/site";
import { getVehicleCurrentStatus } from "@/lib/booking-store";
import { useManagedFleet } from "@/lib/dashboard-store";
import { addToCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equipment/$slug")({
  loader: async ({ params }) => {
    let item: Equipment | undefined = undefined;
    let allFleet: Equipment[] = [];
    try {
      const { getEquipmentDb } = await import("@/lib/api/equipment.functions");
      const res = await getEquipmentDb();
      if (res && res.equipment && res.equipment.length > 0) {
        allFleet = res.equipment as unknown as Equipment[];
        const found = allFleet.find(
          (e) => e.slug === params.slug || (e.id && e.id.toLowerCase() === params.slug.toLowerCase())
        );
        if (found) item = found;
      }
    } catch {}

    if (!item) {
      item = getEquipment(params.slug);
    }
    if (!item) throw notFound();
    return { item, allFleet };
  },
  head: ({ loaderData }) => {
    const item = loaderData?.item;
    const title = item
      ? `${item.name} Rental — $${item.dayRate}/day | M3 Rental Houston`
      : "Equipment Rental | M3 Rental Houston";
    const description = item
      ? `${item.summary} Rent ${item.name} from M3 Rental in Houston, TX for $${item.dayRate} per day. Cash, Zelle, Cash App accepted.`
      : "Commercial equipment & vehicle rental in Houston, TX from M3 Rental.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: item?.image },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: EquipmentDetailPage,
});

function EquipmentDetailPage() {
  const { item: loaderItem, allFleet: loaderFleet } = Route.useLoaderData();
  const { fleet } = useManagedFleet();
  const currentFleet = fleet && fleet.length > 0 ? fleet : loaderFleet;
  const item = currentFleet.find((f) => f.slug === loaderItem.slug) || loaderItem;

  const related = useMemo(() => {
    if (currentFleet.length > 0) {
      const sameCategory = currentFleet.filter(
        (e) => e.category === item.category && e.slug !== item.slug
      );
      const others = currentFleet.filter(
        (e) => e.category !== item.category && e.slug !== item.slug
      );
      return [...sameCategory, ...others].slice(0, 3);
    }
    return relatedEquipment(item);
  }, [currentFleet, item]);

  // Reactive Availability Status
  const [liveStatus, setLiveStatus] = useState(getVehicleCurrentStatus(item.slug));
  const [activeTab, setActiveTab] = useState<"features" | "specs" | "terms">("features");
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setLiveStatus(getVehicleCurrentStatus(item.slug));
    };
    updateStatus();
    window.addEventListener("m3-bookings-changed", updateStatus);
    return () => {
      window.removeEventListener("m3-bookings-changed", updateStatus);
    };
  }, [item.slug]);

  // Smart vehicle display formatting (avoid repeating year if already in item.name)
  const displayTitle = item.name;
  const vehicleColor = item.color || "Commercial Fleet Metallic";
  const unitId = item.id || `M3-${item.slug.slice(0, 3).toUpperCase()}`;

  // Rich categorized specs based on vehicle or equipment type
  const specItems = useMemo(() => {
    const list: { label: string; value: string; icon: any }[] = [
      {
        label: "Inventory Unit ID",
        value: unitId,
        icon: Tag,
      },
      {
        label: "Category",
        value: categoryLabel(item.category),
        icon: Layers,
      },
      {
        label: "Exterior Finish",
        value: vehicleColor,
        icon: Sparkles,
      },
      {
        label: "Operation Mode",
        value: operatorLabel[item.operator] || (item.operatorIncluded ? "Operator Included" : "Self-Operated"),
        icon: UserCheck,
      },
      {
        label: "Fleet Availability",
        value: liveStatus.badgeText,
        icon: Clock,
      },
      {
        label: "Pickup Location",
        value: "SW Houston Yard (Wilcrest Dr)",
        icon: MapPin,
      },
    ];

    if (item.year) {
      list.splice(1, 0, {
        label: "Model Year",
        value: `${item.year} Commercial Fleet`,
        icon: Calendar,
      });
    }

    if (item.specs) {
      list.push({
        label: "Key Capabilities",
        value: item.specs,
        icon: Wrench,
      });
    }

    return list;
  }, [item, unitId, vehicleColor, liveStatus.badgeText]);

  // Enriched feature list with tailored descriptions
  const richFeatures = useMemo(() => {
    if (item.features && item.features.length > 2) {
      return item.features.map((f) => ({
        title: f,
        desc: "Certified contractor-grade feature verified during our 32-point yard inspection.",
      }));
    }

    if (item.category === "cars") {
      return [
        {
          title: "Fuel Efficient Powertrain",
          desc: "Excellent MPG for daily commercial transit, courier tasks, and business client travel.",
        },
        {
          title: "Spacious Trunk & Cabin",
          desc: "16+ cu. ft. luggage and tool storage capacity with seating for up to 5 adult passengers.",
        },
        {
          title: "Advanced Safety & ABS",
          desc: "Equipped with 4-wheel anti-lock braking, electronic stability control, and full-cabin airbags.",
        },
        {
          title: "Premium Infotainment & Bluetooth",
          desc: "Hands-free calling, Bluetooth streaming, and convenient steering wheel-mounted controls.",
        },
        {
          title: "Cold Climate Air Conditioning",
          desc: "High-output Houston climate control system tested and charged before every rental.",
        },
        {
          title: "DOT & Multi-Point Yard Inspection",
          desc: "Tires, fluid levels, brakes, and electrical systems fully certified ready for immediate handover.",
        },
      ];
    }

    if (item.category === "pickup-trucks" || item.category === "trucks") {
      return [
        {
          title: "High-Strength Cargo Bed",
          desc: "Heavy-duty bed capacity engineered for lumber, jobsite tools, pallets, and debris hauling.",
        },
        {
          title: "Integrated Towing Package",
          desc: "Class III/IV hitch receiver with electrical trailer harness for rapid trailer hookups.",
        },
        {
          title: "Heavy-Duty All-Terrain Tires",
          desc: "Reinforced tread for active construction sites, unpaved terrain, and highway driving.",
        },
        {
          title: "Spacious Crew/Work Cabin",
          desc: "Ample room for work crews with lockable compartments for secure valuable tool storage.",
        },
        {
          title: "Regular Fleet Maintenance",
          desc: "Inspected suspension, brake rotors, and transmission fluids for maximum hauler reliability.",
        },
      ];
    }

    return [
      {
        title: item.type || "Commercial Heavy Equipment",
        desc: "Precision engineering tailored for contractor speed, safety, and operational uptime.",
      },
      {
        title: "Fully Tested & Functional",
        desc: "Inspected by certified mechanics at our Houston facility prior to jobsite release.",
      },
      {
        title: "Immediate 15-Minute Yard Pickup",
        desc: "Arrive at 11732 S Wilcrest Dr, complete swift digital paperwork, and dispatch immediately.",
      },
      {
        title: "Flexible Payment Without Credit Bureau Traps",
        desc: "Cash, Zelle, Cash App, and major credit cards accepted with zero corporate credit checks.",
      },
    ];
  }, [item]);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: `${item.name} Rental | M3 Rental Houston`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const handleAddToCart = () => {
    addToCart(item, 1, true);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <SiteLayout>
      {/* ── BREADCRUMB & CONTEXT BANNER ── */}
      <section className="bg-slate-900 border-b border-slate-800 text-slate-300 py-3 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[94rem] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 flex-wrap">
            <Link
              to="/"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="size-3 text-slate-600" />
            <Link
              to="/equipment"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Equipment Catalog
            </Link>
            <ChevronRight className="size-3 text-slate-600" />
            <Link
              to="/equipment"
              search={{ category: item.category }}
              className="text-slate-400 hover:text-white transition-colors capitalize"
            >
              {categoryLabel(item.category)}
            </Link>
            <ChevronRight className="size-3 text-slate-600" />
            <span className="text-white font-bold truncate max-w-[200px] sm:max-w-none">
              {item.name}
            </span>
          </nav>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              <span>15-Minute Yard Pickup Active</span>
            </div>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-1.5 text-white hover:text-emerald-300 font-bold transition-colors"
            >
              <Phone className="size-3.5 text-emerald-400 fill-current" />
              <span>Yard Dispatch: {site.phone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── MAIN PRODUCT SHOWCASE & BOOKING HERO ── */}
      <section className="relative py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="w-full max-w-[94rem] mx-auto">
          {/* Top Quick Action Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link
              to="/equipment"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-[#0040DD] hover:border-[#0040DD]/30 shadow-2xs transition-all active:scale-95"
            >
              <ArrowLeft className="size-3.5 text-[#0040DD]" />
              <span>Back to Complete Fleet</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95",
                  addedToCart
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 hover:text-[#0040DD]"
                )}
              >
                {addedToCart ? (
                  <>
                    <Check className="size-3.5 text-emerald-600 stroke-[3]" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-3.5 text-[#0040DD]" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-600 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
                title="Share this equipment link"
              >
                <Share2 className="size-3.5" />
                <span>Share</span>
              </button>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Houston Yard Inspected</span>
              </span>
            </div>
          </div>

          {/* 2-Column Responsive Layout: Left = Product Deep Dive | Right = Sticky Booking */}
          <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:gap-10 xl:gap-12 items-start">
            
            {/* ── LEFT COLUMN: PRODUCT DETAILS & SHOWCASE ── */}
            <div className="space-y-6 sm:space-y-8">
              
              {/* Product Header & Title Block */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                {/* Badge Row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {/* Official ID Pill */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-black tracking-wider uppercase shadow-2xs">
                    <Tag className="size-3 text-[#FFD54F]" />
                    <span>ID: {unitId}</span>
                  </span>

                  {/* Category Pill */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0040DD] text-[11px] font-black tracking-wider uppercase">
                    <Layers className="size-3 text-[#0040DD]" />
                    <span>{categoryLabel(item.category)}</span>
                  </span>

                  {/* Year Tag */}
                  {item.year && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black">
                      <Calendar className="size-3 text-slate-500" />
                      <span>{item.year} Model</span>
                    </span>
                  )}

                  {/* Operator Pill */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border",
                      item.operator !== "self"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    )}
                  >
                    <UserCheck className="size-3" />
                    <span>{operatorLabel[item.operator] || "Self-Operated"}</span>
                  </span>

                  {/* Live Status Pill */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-2xs ml-auto",
                      liveStatus.colorClass
                    )}
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        liveStatus.status === "AVAILABLE"
                          ? "bg-emerald-500 animate-pulse"
                          : liveStatus.status === "PAYMENT VERIFICATION PENDING"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      )}
                    />
                    <span>{liveStatus.badgeText}</span>
                  </span>
                </div>

                {/* Main Product Title */}
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {displayTitle}
                </h1>

                {/* Subtitle / Model Details */}
                <p className="mt-2 text-sm sm:text-base font-semibold text-slate-500 flex flex-wrap items-center gap-2">
                  <span>{item.type}</span>
                  <span className="text-slate-300">•</span>
                  <span>Color: <strong className="text-slate-800">{vehicleColor}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-600 font-bold">Houston Yard Ready</span>
                </p>

                {/* Pricing & Terms Strip */}
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Standard Rate:
                    </span>
                    <span className="font-display text-3xl sm:text-4xl font-black text-[#0040DD]">
                      ${item.dayRate}
                    </span>
                    <span className="text-sm font-bold text-slate-500">
                      /{item.pricingUnit || "day"}
                    </span>
                  </div>

                  {item.monthRate ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <Sparkles className="size-4 text-emerald-600" />
                      <div>
                        <span className="text-[11px] font-bold text-emerald-900 block leading-tight">
                          Monthly Contractor Discount:
                        </span>
                        <span className="text-xs font-black text-emerald-700">
                          ${item.monthRate} / month
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Zap className="size-3.5 text-amber-500 fill-current" />
                      <span>Weekly &amp; Multi-Day Contractor Discounts Available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── FEATURED PRODUCT IMAGE STAGE ── */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-md group">
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={`${item.name} commercial equipment rental Houston`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  
                  {/* Subtle vignette gradient */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold border border-white/15 shadow-sm">
                      <Truck className="size-3.5 text-[#FFD54F]" />
                      <span>SW Houston Dispatch</span>
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-xs font-black tracking-wider uppercase border border-white/20 shadow-sm">
                      <CheckCircle2 className="size-3.5" />
                      <span>Ready Today</span>
                    </span>
                  </div>

                  {/* Bottom Image Overlay Bar */}
                  <div className="absolute bottom-4 inset-x-4 flex flex-wrap items-center justify-between gap-3 text-white">
                    <div className="flex items-center gap-2 text-xs font-bold drop-shadow-md">
                      <MapPin className="size-3.5 text-[#FFD54F]" />
                      <span>11732 S Wilcrest Dr., Houston, TX 77099</span>
                    </div>

                    <div className="text-[11px] font-semibold text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      ⚡ 15-Minute Turnaround Guarantee
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 6-STAT CORE SPECIFICATION DASHBOARD ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-[#0040DD]/30 transition-all">
                  <div className="flex items-center gap-2 text-[#0040DD] mb-1">
                    <Tag className="size-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Rental Pricing
                    </span>
                  </div>
                  <p className="font-display text-lg font-black text-slate-900 mt-1">
                    ${item.dayRate} <span className="text-xs font-semibold text-slate-500">/{item.pricingUnit || "day"}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Clear rates • No surprise fees
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-[#0040DD]/30 transition-all">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <UserCheck className="size-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Operation Mode
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    {operatorLabel[item.operator] || "Self Operated"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {item.operatorService || (item.operator !== "self" ? "Certified Operator included" : "Valid driver license")}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-[#0040DD]/30 transition-all">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <ShieldCheck className="size-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Zero Credit Trap
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    No Bureau Holds
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Cash, Zelle &amp; Debit accepted
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-[#0040DD]/30 transition-all">
                  <div className="flex items-center gap-2 text-amber-600 mb-1">
                    <Clock className="size-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Turnaround
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    15-Minute Yard Exit
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Sign &amp; roll on S Wilcrest Dr
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-[#0040DD]/30 transition-all">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Truck className="size-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Jobsite Delivery
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    Greater Houston
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Katy, Pearland, Sugar Land &amp; more
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-[#0040DD]/30 transition-all">
                  <div className="flex items-center gap-2 text-rose-600 mb-1">
                    <BadgeCheck className="size-4" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Inspection
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    32-Point Certified
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Detailed pre-handover check
                  </p>
                </div>
              </div>

              {/* ── TABBED DEEP DIVE: FEATURES | SPECS | RENTAL TERMS ── */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                {/* Tab Navigation Headers */}
                <div className="flex border-b border-slate-200/80 bg-slate-50/60 p-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("features")}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
                      activeTab === "features"
                        ? "bg-white text-[#0040DD] shadow-2xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    <Wrench className="size-4" />
                    <span>Features &amp; Capabilities</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("specs")}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
                      activeTab === "specs"
                        ? "bg-white text-[#0040DD] shadow-2xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    <FileText className="size-4" />
                    <span>Technical Specs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("terms")}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
                      activeTab === "terms"
                        ? "bg-white text-[#0040DD] shadow-2xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    <ShieldCheck className="size-4" />
                    <span>Rental Policies</span>
                  </button>
                </div>

                {/* Tab 1: Features & Overview */}
                {activeTab === "features" && (
                  <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Equipment Overview &amp; Contractor Utility
                      </h3>
                      <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                        {item.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                        Key Features &amp; Equipment Capabilities
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {richFeatures.map((f, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="size-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="size-3.5 stroke-[3]" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-slate-900">
                                  {f.title}
                                </h5>
                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                  {f.desc}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Technical Specs Table */}
                {activeTab === "specs" && (
                  <div className="p-6 sm:p-8 animate-in fade-in">
                    <h3 className="text-base font-black text-slate-900 mb-4">
                      Technical Fleet Specifications
                    </h3>
                    <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                      {specItems.map((spec, i) => {
                        const Icon = spec.icon;
                        return (
                          <div
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white hover:bg-slate-50/80 transition-colors gap-1.5"
                          >
                            <span className="font-bold text-slate-500 flex items-center gap-2">
                              <Icon className="size-3.5 text-[#0040DD]" />
                              <span>{spec.label}</span>
                            </span>
                            <span className="font-black text-slate-900 text-right sm:text-left">
                              {spec.value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab 3: Rental Policies & Trust Guarantees */}
                {activeTab === "terms" && (
                  <div className="p-6 sm:p-8 space-y-4 animate-in fade-in">
                    <h3 className="text-base font-black text-slate-900 mb-2">
                      Commercial Rental Terms &amp; Policies
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-1.5">
                        <span className="font-black text-slate-900 flex items-center gap-2 text-sm">
                          <Zap className="size-4 text-[#0040DD]" />
                          <span>Flexible Cash &amp; Digital Payments</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                          We accept Cash, Zelle, Cash App, debit cards, and credit cards through Stripe. We do NOT run credit bureau checks or place punitive holds on your personal credit.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 space-y-1.5">
                        <span className="font-black text-slate-900 flex items-center gap-2 text-sm">
                          <Clock className="size-4 text-emerald-600" />
                          <span>15-Minute Rapid Yard Turnaround</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                          Arrive at our SW Houston facility on S Wilcrest Dr, inspect the equipment, sign digital agreements in under 5 minutes, and hit the road.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/40 space-y-1.5">
                        <span className="font-black text-slate-900 flex items-center gap-2 text-sm">
                          <Truck className="size-4 text-amber-600" />
                          <span>Commercial Jobsite Delivery</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                          Delivery and retrieval are available anywhere in Greater Houston, including Katy, Pearland, Sugar Land, Spring, and Conroe. Flat-rate delivery quotes provided upfront.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/40 space-y-1.5">
                        <span className="font-black text-slate-900 flex items-center gap-2 text-sm">
                          <ShieldCheck className="size-4 text-purple-600" />
                          <span>Certified Operators Available</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                          For equipment requiring specialized operation (such as boom lifts, bucket trucks, or backhoes), certified machine operators can be scheduled with your rental.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── HOUSTON YARD DIRECT DISPATCH CALLOUT ── */}
              <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-white to-emerald-50/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0040DD] text-white text-[10px] font-black uppercase tracking-wider mb-2">
                    <Sparkles className="size-3" />
                    <span>Contractor Dedicated Line</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">
                    Need Multi-Day or Fleet Contractor Discounts?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl">
                    Speak directly with our yard dispatcher for custom multi-unit packages, project schedules, and same-day delivery terms.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <a
                    href={site.phoneHref}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0040DD] hover:bg-[#0036ba] text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 text-center"
                  >
                    <Phone className="size-4 fill-current" />
                    <span>Call {site.phone}</span>
                  </a>

                  <Link
                    to="/contact"
                    search={{ equipment: item.name }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all text-center"
                  >
                    <span>Request Custom Quote</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN: STICKY ONLINE VEHICLE BOOKING SYSTEM ── */}
            <div className="lg:sticky lg:top-24 xl:top-28 self-start space-y-4">
              <div className="relative">
                <VehicleBookingCard vehicle={item} />
              </div>

              {/* High Trust Guarantee Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3.5 text-xs">
                <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-wider">
                  <ShieldCheck className="size-4 text-[#16A34A]" />
                  <span>The M3 Rental Commitment</span>
                </div>

                <div className="space-y-2 text-slate-600 text-[11px] leading-relaxed">
                  <div className="flex items-start gap-2">
                    <Check className="size-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                    <span><strong>No Cancellation Traps:</strong> Cancel or reschedule with 24h notice at zero penalty.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="size-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                    <span><strong>15-Minute Yard Turnaround:</strong> Walk in, inspect, sign, and drive off immediately.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="size-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                    <span><strong>Multi-Payment Freedom:</strong> Cash, Zelle, Cash App, debit, or Stripe accepted.</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>SW Houston Yard Facility</span>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=11732%20S%20Wilcrest%20Dr%2C%20Houston%2C%20TX%2077099"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0040DD] hover:underline flex items-center gap-1"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="size-2.5" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MORE EQUIPMENT IN HOUSTON (RELATED FLEET) ── */}
      <section className="bg-white border-t border-slate-200/90 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[94rem] mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0040DD]">
                Houston Inventory
              </span>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">
                More Equipment in {categoryLabel(item.category)}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Similar vehicles and commercial machinery ready for jobsite dispatch today.
              </p>
            </div>
            <Link
              to="/equipment"
              className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#0040DD] hover:underline"
            >
              <span>Explore All Complete Fleet</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel, index) => (
              <Reveal key={rel.slug} delay={index * 60}>
                <EquipmentCard item={rel} className="h-full" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
