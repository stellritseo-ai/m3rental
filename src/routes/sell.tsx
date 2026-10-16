import { useCallback, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Gauge,
  Handshake,
  Hash,
  ImagePlus,
  Info,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  UploadCloud,
  User,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { categories } from "@/data/equipment";
import { createSellListingDb } from "@/lib/api/sell.functions";
import {
  CONDITION_META,
  CONTACT_LABEL,
  MAX_SELL_IMAGES,
  SELL_CONDITIONS,
  type ContactMethod,
  type SellCondition,
} from "@/lib/sell-shared";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/banner3.jpeg";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell Your Equipment to M3 Rental | Houston Trucks, Trailers & Machinery" },
      {
        name: "description",
        content:
          "Sell your truck, trailer, heavy equipment or tools to M3 Rental in Houston, TX. Upload photos, set your asking price and get a fair cash offer from our team — fast, local and hassle-free.",
      },
      { property: "og:title", content: "Sell Your Equipment to M3 Rental | Houston, TX" },
      {
        property: "og:description",
        content: "List your equipment in minutes. Fair cash offers, quick inspection and same-week payment in Houston.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SellPage,
});

// ─── Form model ───────────────────────────────────────────────────────────
type Photo = { id: string; dataUrl: string; name: string };

type FormState = {
  title: string;
  category: string;
  make: string;
  model: string;
  year: string;
  condition: SellCondition | "";
  usage: string;
  serialNumber: string;
  location: string;
  description: string;
  askingPrice: string;
  negotiable: boolean;
  name: string;
  phone: string;
  email: string;
  company: string;
  preferredContact: ContactMethod;
  bestTime: string;
  agree: boolean;
  website: string; // honeypot
};

const INITIAL: FormState = {
  title: "",
  category: "",
  make: "",
  model: "",
  year: "",
  condition: "",
  usage: "",
  serialNumber: "",
  location: "Houston, TX",
  description: "",
  askingPrice: "",
  negotiable: true,
  name: "",
  phone: "",
  email: "",
  company: "",
  preferredContact: "call",
  bestTime: "",
  agree: false,
  website: "",
};

type FieldKey = keyof FormState | "photos";
type Errors = Partial<Record<FieldKey, string | undefined>>;

const FIELD_ORDER: FieldKey[] = [
  "title",
  "category",
  "condition",
  "location",
  "description",
  "photos",
  "askingPrice",
  "name",
  "phone",
  "email",
  "agree",
];

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

function validate(f: FormState, photos: Photo[]): Errors {
  const e: Errors = {};
  if (f.title.trim().length < 3) e.title = "Give your equipment a clear title (e.g. 2018 Ford F-250 Super Duty).";
  if (!f.category) e.category = "Choose a category.";
  if (!f.condition) e.condition = "Select the current condition.";
  if (f.location.trim().length < 2) e.location = "Where is the equipment located?";
  if (f.description.trim().length < 20) e.description = "Add at least 20 characters — service history, issues, extras.";
  if (photos.length === 0) e.photos = "Upload at least one photo.";
  const price = Number(f.askingPrice.replace(/,/g, ""));
  if (!f.askingPrice || !Number.isFinite(price) || price <= 0) e.askingPrice = "Enter your asking price.";
  if (f.name.trim().length < 2) e.name = "Enter your full name.";
  if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid 10-digit phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!f.agree) e.agree = "Please confirm the details are accurate.";
  return e;
}

/** Downscale + re-encode on the client so uploads stay fast on mobile data. */
function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

function formatPrice(raw: string) {
  const digits = raw.replace(/[^\d.]/g, "");
  const [whole = "", dec] = digits.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec !== undefined ? `${withCommas}.${dec.slice(0, 2)}` : withCommas;
}

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const opt = (s: string) => s.trim() || undefined;

// ─── Page ─────────────────────────────────────────────────────────────────
function SellPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const room = MAX_SELL_IMAGES - photos.length;
      if (room <= 0) {
        toast.error(`You can upload up to ${MAX_SELL_IMAGES} photos.`);
        return;
      }
      const valid = files.filter((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) {
          toast.error(`${f.name}: only JPG, PNG or WEBP images are supported.`);
          return false;
        }
        if (f.size > MAX_SOURCE_BYTES) {
          toast.error(`${f.name} is larger than 20 MB.`);
          return false;
        }
        return true;
      });
      if (valid.length > room) toast.info(`Only the first ${room} photo${room === 1 ? "" : "s"} were added.`);

      setIsProcessing(true);
      try {
        const processed = await Promise.all(
          valid.slice(0, room).map(async (file) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name,
            dataUrl: await compressImage(file),
          })),
        );
        if (processed.length) {
          setPhotos((prev) => [...prev, ...processed].slice(0, MAX_SELL_IMAGES));
          setErrors((prev) => ({ ...prev, photos: undefined }));
        }
      } catch {
        toast.error("One of the photos couldn't be processed. Try a different image.");
      } finally {
        setIsProcessing(false);
      }
    },
    [photos.length],
  );

  const removePhoto = (id: string) => setPhotos((prev) => prev.filter((p) => p.id !== id));
  const makeCover = (id: string) =>
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      return target ? [target, ...prev.filter((p) => p.id !== id)] : prev;
    });

  const priceNumber = Number(form.askingPrice.replace(/,/g, "")) || 0;

  const completion = useMemo(() => {
    const checks = [
      form.title.trim().length >= 3,
      !!form.category,
      !!form.condition,
      form.description.trim().length >= 20,
      photos.length > 0,
      priceNumber > 0,
      form.name.trim().length >= 2,
      form.phone.replace(/\D/g, "").length >= 10,
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
      form.agree,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, photos.length, priceNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(form, photos);
    setErrors(found);
    const firstKey = FIELD_ORDER.find((k) => found[k]);
    if (firstKey) {
      toast.error("Please complete the highlighted fields.");
      document.getElementById(`sell-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createSellListingDb({
        data: {
          title: form.title.trim(),
          category: form.category,
          make: opt(form.make),
          model: opt(form.model),
          year: opt(form.year),
          condition: form.condition as SellCondition,
          usage: opt(form.usage),
          serialNumber: opt(form.serialNumber),
          location: form.location.trim(),
          description: form.description.trim(),
          askingPrice: priceNumber,
          negotiable: form.negotiable,
          images: photos.map((p) => p.dataUrl),
          seller: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            company: opt(form.company),
            preferredContact: form.preferredContact,
            bestTime: opt(form.bestTime),
          },
          website: opt(form.website),
        },
      });

      if (!res.success) {
        toast.error(res.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmittedId(res.id);
      toast.success("Your equipment has been submitted!", {
        description: "Our acquisitions team will reach out shortly.",
      });
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error(err);
      toast.error("Network error — please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setForm(INITIAL);
    setPhotos([]);
    setErrors({});
    setSubmittedId(null);
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <SiteLayout>
      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative isolate min-h-[330px] sm:min-h-[370px] md:min-h-[400px] overflow-hidden flex items-center justify-center py-9 sm:py-11 md:py-14 rounded-[10px] border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.12)] mx-auto mb-3 sm:mb-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)]">
        <div className="absolute inset-0 -z-30 overflow-hidden bg-slate-950">
          <img
            src={heroImg}
            alt="Trucks and heavy equipment at the M3 Rental Houston yard"
            fetchPriority="high"
            decoding="async"
            className="size-full object-cover object-center scale-105"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 -z-20 bg-slate-950/70" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/85 via-black/50 to-black/85"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] rounded-full bg-[#16A34A]/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10.5px] sm:text-xs font-semibold text-white backdrop-blur-md">
              <Handshake className="size-3.5 text-amber-300" />
              We Buy Trucks, Trailers & Equipment
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-3 py-1 text-[10.5px] sm:text-xs font-bold text-emerald-300 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Offers Reviewed Within 24 Hours
            </span>
          </div>

          <h1
            className="font-display text-[24px] sm:text-[30px] md:text-[36px] lg:text-[40px] font-extrabold tracking-tight text-white leading-[1.25]"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
          >
            Sell Your Equipment to M3 Rental <br className="hidden sm:block" />
            <span className="text-[#3daf05]">Fair Cash Offers, Houston Fast</span>
          </h1>

          <p className="mt-3 text-[13px] sm:text-[14.5px] text-slate-200 font-medium leading-relaxed max-w-2xl">
            Upload photos, share the details and set your asking price. Our acquisitions team reviews every
            listing, calls you back, and closes the deal locally — no auction fees, no strangers, no runaround.
          </p>

          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href="#sell-form" className="btn-base btn-primary font-bold shadow-md hover:shadow-lg">
              <Tag className="size-4" />
              <span>List My Equipment</span>
            </a>
            <a href={site.phoneHref} className="btn-base btn-glass font-bold">
              <Phone className="size-4" />
              <span>Talk to a Buyer: {site.phone}</span>
            </a>
          </div>

          <div className="mt-6 sm:mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-3xl pt-4 sm:pt-5 border-t border-white/15">
            {[
              { k: "24 hrs", v: "Offer Review Time", c: "text-white" },
              { k: "$0 Fees", v: "No Listing Charges", c: "text-amber-300" },
              { k: "Local", v: "Houston Inspection", c: "text-emerald-300" },
              { k: "Fast Pay", v: "Cash, Zelle or Check", c: "text-blue-300" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-2.5 sm:p-3">
                <span className={cn("block text-sm sm:text-base font-black font-display", s.c)}>{s.k}</span>
                <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-300">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS STRIP ───────────────────────────────────────── */}
      <section className="mx-auto w-[calc(100%-16px)] sm:w-[calc(100%-30px)] mb-3 sm:mb-[15px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            { icon: Camera, t: "Upload & Describe", d: "Photos, specs and your asking price in under 5 minutes." },
            { icon: BadgeCheck, t: "We Review", d: "Our team evaluates market value and condition." },
            { icon: Phone, t: "We Contact You", d: "Get a call, text or email to discuss your offer." },
            { icon: Handshake, t: "Close the Deal", d: "Quick inspection in Houston and same-week payment." },
          ].map((s, i) => (
            <div
              key={s.t}
              className="group relative rounded-2xl bg-white border border-slate-200/90 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_40px_-12px_rgba(0,64,221,0.16)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="relative size-11 shrink-0 rounded-xl bg-gradient-to-br from-[#0040DD] to-blue-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <s.icon className="size-5" />
                  <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-[#16A34A] border-2 border-white text-[10px] font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-[13.5px] font-black text-slate-900 tracking-tight">{s.t}</h2>
                  <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">{s.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. FORM + LIVE PREVIEW ──────────────────────────────────────── */}
      <section
        id="sell-form"
        className="mx-auto w-[calc(100%-16px)] sm:w-[calc(100%-30px)] mb-6 scroll-mt-28"
      >
        <div ref={formTopRef} className="scroll-mt-28" />

        {submittedId ? (
          <SuccessPanel id={submittedId} title={form.title} cover={photos[0]?.dataUrl} onReset={resetAll} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-3 sm:gap-4 items-start">
            {/* ── LEFT: FORM ── */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-[20px] bg-white border border-slate-200/90 shadow-[0_10px_30px_-12px_rgba(17,17,17,0.12)] overflow-hidden"
            >
              <div className="h-1 w-full bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#F59E0B]" />

              {/* Form header + progress */}
              <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-widest text-[#0040DD] bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-full">
                      <Sparkles className="size-3" /> Free Equipment Listing
                    </span>
                    <h2 className="mt-2 font-display text-[20px] sm:text-[24px] font-extrabold text-slate-900 tracking-tight">
                      Tell Us About Your Equipment
                    </h2>
                    <p className="text-[12.5px] text-slate-500 mt-0.5">
                      Fields marked <span className="text-rose-500 font-bold">*</span> are required.
                    </p>
                  </div>
                  <div className="sm:w-48">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                      <span>Listing complete</span>
                      <span className="text-[#0040DD] font-black">{completion}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0040DD] to-[#16A34A] transition-all duration-500"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-7">
                {/* ── STEP 1: Equipment details ── */}
                <FormSection step={1} icon={Truck} title="Equipment Details" subtitle="What are you selling?">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field id="title" label="Listing Title" required error={errors.title} className="sm:col-span-2">
                      <input
                        id="sell-input-title"
                        value={form.title}
                        onChange={(e) => set("title", e.target.value)}
                        placeholder="e.g. 2018 Ford F-250 Super Duty Crew Cab"
                        maxLength={140}
                        className={inputCls(!!errors.title)}
                      />
                    </Field>

                    <Field id="category" label="Category" required error={errors.category}>
                      <select
                        id="sell-input-category"
                        value={form.category}
                        onChange={(e) => set("category", e.target.value)}
                        className={cn(inputCls(!!errors.category), "appearance-none cursor-pointer pr-9 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_12px_center]")}
                      >
                        <option value="">Select a category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.label}>
                            {c.label}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </Field>

                    <Field id="location" label="Equipment Location" required error={errors.location}>
                      <IconInput icon={MapPin}>
                        <input
                          id="sell-input-location"
                          value={form.location}
                          onChange={(e) => set("location", e.target.value)}
                          placeholder="City, State"
                          className={cn(inputCls(!!errors.location), "pl-9")}
                        />
                      </IconInput>
                    </Field>

                    <Field id="make" label="Make / Brand">
                      <input
                        id="sell-input-make"
                        value={form.make}
                        onChange={(e) => set("make", e.target.value)}
                        placeholder="e.g. Ford, CAT, Big Tex"
                        className={inputCls(false)}
                      />
                    </Field>

                    <Field id="model" label="Model">
                      <input
                        id="sell-input-model"
                        value={form.model}
                        onChange={(e) => set("model", e.target.value)}
                        placeholder="e.g. F-250, 420F, 14GN"
                        className={inputCls(false)}
                      />
                    </Field>

                    <Field id="year" label="Year">
                      <input
                        id="sell-input-year"
                        inputMode="numeric"
                        value={form.year}
                        onChange={(e) => set("year", e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="e.g. 2019"
                        className={inputCls(false)}
                      />
                    </Field>

                    <Field id="usage" label="Hours / Mileage">
                      <IconInput icon={Gauge}>
                        <input
                          id="sell-input-usage"
                          value={form.usage}
                          onChange={(e) => set("usage", e.target.value)}
                          placeholder="e.g. 84,000 miles or 1,250 hrs"
                          className={cn(inputCls(false), "pl-9")}
                        />
                      </IconInput>
                    </Field>

                    <Field id="serialNumber" label="VIN / Serial Number" hint="Optional — speeds up valuation" className="sm:col-span-2">
                      <IconInput icon={Hash}>
                        <input
                          id="sell-input-serial"
                          value={form.serialNumber}
                          onChange={(e) => set("serialNumber", e.target.value.toUpperCase())}
                          placeholder="17-character VIN or manufacturer serial"
                          className={cn(inputCls(false), "pl-9 font-mono tracking-wide")}
                        />
                      </IconInput>
                    </Field>
                  </div>

                  {/* Condition */}
                  <Field id="condition" label="Condition" required error={errors.condition} className="mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Condition">
                      {SELL_CONDITIONS.map((c) => {
                        const meta = CONDITION_META[c];
                        const active = form.condition === c;
                        return (
                          <button
                            key={c}
                            id={`sell-condition-${c}`}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => set("condition", c)}
                            className={cn(
                              "relative text-left rounded-xl border p-3 transition-all duration-200 cursor-pointer",
                              active
                                ? "border-[#0040DD] bg-blue-50/70 ring-2 ring-[#0040DD]/15 shadow-sm"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                            )}
                          >
                            {active && (
                              <CheckCircle2 className="absolute top-2 right-2 size-4 text-[#0040DD]" />
                            )}
                            <span className="block text-[12.5px] font-black text-slate-900">{meta.label}</span>
                            <span className="block text-[10.5px] text-slate-500 mt-0.5 leading-snug">{meta.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field
                    id="description"
                    label="Description"
                    required
                    error={errors.description}
                    hint={`${form.description.trim().length}/4000`}
                    className="mt-4"
                  >
                    <textarea
                      id="sell-input-description"
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      rows={5}
                      maxLength={4000}
                      placeholder="Service history, recent repairs, known issues, attachments or extras included, reason for selling…"
                      className={cn(inputCls(!!errors.description), "h-auto py-3 resize-y min-h-[120px] leading-relaxed")}
                    />
                  </Field>
                </FormSection>

                {/* ── STEP 2: Photos ── */}
                <FormSection
                  step={2}
                  icon={Camera}
                  title="Photos"
                  subtitle={`Up to ${MAX_SELL_IMAGES} images — the first photo is your cover.`}
                >
                  <div id="sell-field-photos" className="scroll-mt-32">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                      }}
                      className={cn(
                        "relative rounded-2xl border-2 border-dashed transition-all duration-200",
                        isDragging
                          ? "border-[#0040DD] bg-blue-50/70 scale-[1.01]"
                          : errors.photos
                            ? "border-rose-300 bg-rose-50/40"
                            : "border-slate-300 bg-slate-50/60 hover:border-[#0040DD]/60 hover:bg-blue-50/30",
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        id="sell-input-photos"
                        type="file"
                        accept={ACCEPTED_TYPES.join(",")}
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files?.length) addFiles(e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        id="sell-upload-trigger"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing || photos.length >= MAX_SELL_IMAGES}
                        className="w-full flex flex-col items-center justify-center text-center px-4 py-7 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="size-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#0040DD] mb-2.5">
                          {isProcessing ? <RefreshCw className="size-5 animate-spin" /> : <UploadCloud className="size-6" />}
                        </div>
                        <span className="text-[13.5px] font-black text-slate-900">
                          {isProcessing ? "Optimizing photos…" : "Drag & drop photos here, or click to browse"}
                        </span>
                        <span className="text-[11.5px] text-slate-500 mt-1">
                          JPG, PNG or WEBP • {photos.length}/{MAX_SELL_IMAGES} added • Exterior, interior, engine & serial plate work best
                        </span>
                      </button>
                    </div>
                    {errors.photos && <ErrorText>{errors.photos}</ErrorText>}

                    {photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {photos.map((p, i) => (
                          <div
                            key={p.id}
                            className={cn(
                              "group relative aspect-[4/3] rounded-xl overflow-hidden border bg-slate-100 shadow-2xs animate-in fade-in zoom-in-95 duration-200",
                              i === 0 ? "border-[#0040DD] ring-2 ring-[#0040DD]/20" : "border-slate-200",
                            )}
                          >
                            <img src={p.dataUrl} alt={`Upload ${i + 1}`} className="size-full object-cover" />
                            {i === 0 && (
                              <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-[#0040DD] text-white text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 shadow">
                                <Star className="size-2.5 fill-current" /> Cover
                              </span>
                            )}
                            <div className="absolute inset-0 bg-slate-950/55 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              {i !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => makeCover(p.id)}
                                  className="rounded-lg bg-white/95 text-slate-900 text-[10.5px] font-black px-2 py-1 hover:bg-white cursor-pointer"
                                >
                                  Set cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removePhoto(p.id)}
                                aria-label={`Remove photo ${i + 1}`}
                                className="rounded-lg bg-rose-600 text-white p-1.5 hover:bg-rose-700 cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {photos.length < MAX_SELL_IMAGES && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0040DD] hover:bg-blue-50/40 flex flex-col items-center justify-center text-slate-400 hover:text-[#0040DD] transition-colors cursor-pointer"
                          >
                            <ImagePlus className="size-5" />
                            <span className="text-[10.5px] font-bold mt-1">Add more</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </FormSection>

                {/* ── STEP 3: Pricing ── */}
                <FormSection step={3} icon={DollarSign} title="Asking Price" subtitle="What would you like to get for it?">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
                    <Field id="askingPrice" label="Your Asking Price (USD)" required error={errors.askingPrice}>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] font-black text-slate-400">$</span>
                        <input
                          id="sell-input-price"
                          inputMode="decimal"
                          value={form.askingPrice}
                          onChange={(e) => set("askingPrice", formatPrice(e.target.value))}
                          placeholder="25,000"
                          className={cn(
                            inputCls(!!errors.askingPrice),
                            "h-14 pl-8 text-[22px] font-black tracking-tight text-slate-900",
                          )}
                        />
                      </div>
                    </Field>

                    <div className="sm:pt-[26px]">
                      <button
                        type="button"
                        id="sell-toggle-negotiable"
                        role="switch"
                        aria-checked={form.negotiable}
                        onClick={() => set("negotiable", !form.negotiable)}
                        className={cn(
                          "h-14 w-full sm:w-auto inline-flex items-center gap-3 rounded-xl border px-4 transition-all cursor-pointer",
                          form.negotiable
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        <span
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors shrink-0",
                            form.negotiable ? "bg-[#16A34A]" : "bg-slate-300",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
                              form.negotiable ? "left-[22px]" : "left-0.5",
                            )}
                          />
                        </span>
                        <span className="text-left">
                          <span className="block text-[12.5px] font-black">Price Negotiable</span>
                          <span className="block text-[10.5px] opacity-75">Open to offers</span>
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-[11.5px] text-slate-600 leading-relaxed">
                    <Info className="size-4 text-[#0040DD] shrink-0 mt-0.5" />
                    <span>
                      Not sure what it's worth? Enter your best estimate — our team compares recent Texas market sales and
                      will walk you through a fair number when we call.
                    </span>
                  </div>
                </FormSection>

                {/* ── STEP 4: Seller info ── */}
                <FormSection step={4} icon={User} title="Your Contact Details" subtitle="So our buyer can reach you.">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field id="name" label="Full Name" required error={errors.name}>
                      <IconInput icon={User}>
                        <input
                          id="sell-input-name"
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          placeholder="John Smith"
                          className={cn(inputCls(!!errors.name), "pl-9")}
                        />
                      </IconInput>
                    </Field>

                    <Field id="company" label="Company" hint="Optional">
                      <IconInput icon={Building2}>
                        <input
                          id="sell-input-company"
                          autoComplete="organization"
                          value={form.company}
                          onChange={(e) => set("company", e.target.value)}
                          placeholder="Smith Contracting LLC"
                          className={cn(inputCls(false), "pl-9")}
                        />
                      </IconInput>
                    </Field>

                    <Field id="phone" label="Phone Number" required error={errors.phone}>
                      <IconInput icon={Phone}>
                        <input
                          id="sell-input-phone"
                          type="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={(e) => set("phone", formatPhone(e.target.value))}
                          placeholder="(713) 555-0123"
                          className={cn(inputCls(!!errors.phone), "pl-9")}
                        />
                      </IconInput>
                    </Field>

                    <Field id="email" label="Email Address" required error={errors.email}>
                      <IconInput icon={Mail}>
                        <input
                          id="sell-input-email"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          placeholder="you@example.com"
                          className={cn(inputCls(!!errors.email), "pl-9")}
                        />
                      </IconInput>
                    </Field>

                    <Field id="preferredContact" label="Preferred Contact Method">
                      <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200/70">
                        {(["call", "text", "email"] as const).map((m) => {
                          const Icon = m === "call" ? Phone : m === "text" ? MessageSquare : Mail;
                          const active = form.preferredContact === m;
                          return (
                            <button
                              key={m}
                              id={`sell-contact-${m}`}
                              type="button"
                              onClick={() => set("preferredContact", m)}
                              className={cn(
                                "h-9 rounded-lg inline-flex items-center justify-center gap-1.5 text-[12px] font-bold transition-all cursor-pointer",
                                active ? "bg-white text-[#0040DD] shadow-sm" : "text-slate-500 hover:text-slate-800",
                              )}
                            >
                              <Icon className="size-3.5" />
                              {m === "call" ? "Call" : m === "text" ? "Text" : "Email"}
                            </button>
                          );
                        })}
                      </div>
                    </Field>

                    <Field id="bestTime" label="Best Time to Reach You" hint="Optional">
                      <IconInput icon={Clock}>
                        <input
                          id="sell-input-besttime"
                          value={form.bestTime}
                          onChange={(e) => set("bestTime", e.target.value)}
                          placeholder="e.g. Weekdays after 4 PM"
                          className={cn(inputCls(false), "pl-9")}
                        />
                      </IconInput>
                    </Field>
                  </div>

                  {/* Honeypot (hidden from humans) */}
                  <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="sell-input-website">Website</label>
                    <input
                      id="sell-input-website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => set("website", e.target.value)}
                    />
                  </div>
                </FormSection>

                {/* Agreement + submit */}
                <div className="pt-1 space-y-4">
                  <div id="sell-field-agree" className="scroll-mt-32">
                    <label
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors",
                        errors.agree ? "border-rose-300 bg-rose-50/50" : form.agree ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50/60 hover:bg-slate-50",
                      )}
                    >
                      <input
                        id="sell-input-agree"
                        type="checkbox"
                        checked={form.agree}
                        onChange={(e) => set("agree", e.target.checked)}
                        className="mt-0.5 size-4.5 accent-[#16A34A] cursor-pointer shrink-0"
                      />
                      <span className="text-[12px] text-slate-600 leading-relaxed">
                        I confirm I own this equipment (or am authorized to sell it), the details and photos are
                        accurate, and I agree to be contacted by M3 Rental about this listing.
                      </span>
                    </label>
                    {errors.agree && <ErrorText>{errors.agree}</ErrorText>}
                  </div>

                  <button
                    id="sell-submit"
                    type="submit"
                    disabled={isSubmitting || isProcessing}
                    className="group w-full h-14 rounded-2xl bg-gradient-to-r from-[#0040DD] to-blue-700 hover:from-blue-700 hover:to-[#0040DD] text-white font-black uppercase tracking-wider text-[13px] sm:text-sm shadow-[0_14px_30px_-10px_rgba(0,64,221,0.55)] hover:shadow-[0_18px_36px_-10px_rgba(0,64,221,0.65)] transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="size-4.5 animate-spin" />
                        Uploading Photos & Submitting…
                      </>
                    ) : (
                      <>
                        <Handshake className="size-5" />
                        Submit My Equipment for an Offer
                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Lock className="size-3" /> Your details are only shared with the M3 Rental acquisitions team.
                  </p>
                </div>
              </div>
            </form>

            {/* ── RIGHT: LIVE PREVIEW + TRUST ── */}
            <aside className="lg:sticky lg:top-28 space-y-3 sm:space-y-4">
              <ListingPreview form={form} cover={photos[0]?.dataUrl} photoCount={photos.length} price={priceNumber} />

              <div className="rounded-[20px] bg-slate-950 text-white p-5 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 size-48 rounded-full bg-[#0040DD]/40 blur-3xl" />
                <div className="absolute -bottom-20 -left-10 size-48 rounded-full bg-[#16A34A]/30 blur-3xl" />
                <div className="relative">
                  <h3 className="text-[14px] font-black tracking-tight flex items-center gap-2">
                    <ShieldCheck className="size-4.5 text-[#4ADE80]" /> Why Sell to M3 Rental?
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {[
                      { icon: Zap, t: "Fast decisions", d: "Most listings reviewed within one business day." },
                      { icon: TrendingUp, t: "Fair market offers", d: "Priced against real Texas resale data." },
                      { icon: Wrench, t: "Any condition", d: "Running, worn or needing repair — we look at it all." },
                      { icon: DollarSign, t: "Get paid quickly", d: "Cash, Zelle or business check at handoff." },
                    ].map((b) => (
                      <li key={b.t} className="flex items-start gap-2.5">
                        <span className="size-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                          <b.icon className="size-3.5 text-amber-300" />
                        </span>
                        <span>
                          <span className="block text-[12.5px] font-bold">{b.t}</span>
                          <span className="block text-[11px] text-slate-400 leading-snug">{b.d}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={site.phoneHref}
                    className="mt-4 flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-slate-950 text-[12.5px] font-black hover:bg-slate-100 transition-colors"
                  >
                    <Phone className="size-4 text-[#16A34A]" /> Prefer to talk? {site.phone}
                  </a>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

// ─── Building blocks ──────────────────────────────────────────────────────
function inputCls(hasError: boolean) {
  return cn(
    "w-full h-11 rounded-xl border bg-white px-3.5 text-[13.5px] text-slate-900 placeholder:text-slate-400 outline-none transition-all",
    "focus:border-[#0040DD] focus:ring-4 focus:ring-[#0040DD]/10",
    hasError ? "border-rose-300 bg-rose-50/30 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 hover:border-slate-300",
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-[11.5px] font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
      <X className="size-3" /> {children}
    </p>
  );
}

function Field({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string | undefined;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={`sell-field-${id}`} className={cn("scroll-mt-32", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] font-bold text-slate-800">
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        {hint && <span className="text-[10.5px] font-medium text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function IconInput({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
      {children}
    </div>
  );
}

function FormSection({
  step,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  step: number;
  icon: typeof User;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="relative">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative size-10 rounded-xl bg-blue-50 border border-blue-200/70 text-[#0040DD] flex items-center justify-center shrink-0">
          <Icon className="size-4.5" />
          <span className="absolute -top-1.5 -left-1.5 size-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
            {step}
          </span>
        </div>
        <div>
          <h3 className="text-[15px] font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-[11.5px] text-slate-500">{subtitle}</p>
        </div>
        <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent ml-2" />
      </div>
      {children}
    </fieldset>
  );
}

function ListingPreview({
  form,
  cover,
  photoCount,
  price,
}: {
  form: FormState;
  cover: string | undefined;
  photoCount: number;
  price: number;
}) {
  const condition = form.condition ? CONDITION_META[form.condition] : null;
  const subtitle = [form.year, form.make, form.model].filter(Boolean).join(" • ");

  return (
    <div className="rounded-[20px] bg-white border border-slate-200/90 shadow-[0_16px_40px_-12px_rgba(0,64,221,0.16)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <span className="text-[10.5px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-[#16A34A] animate-pulse" /> Live Listing Preview
        </span>
        <span className="text-[10.5px] font-bold text-slate-400">{photoCount} photo{photoCount === 1 ? "" : "s"}</span>
      </div>

      <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {cover ? (
          <img src={cover} alt="Cover preview" className="size-full object-cover animate-in fade-in duration-300" />
        ) : (
          <div className="size-full flex flex-col items-center justify-center text-slate-400">
            <Camera className="size-8" />
            <span className="text-[11px] font-semibold mt-1.5">Your cover photo appears here</span>
          </div>
        )}
        {condition && (
          <span className={cn("absolute top-2.5 left-2.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-black shadow-sm", condition.tone)}>
            {condition.label}
          </span>
        )}
        {form.negotiable && price > 0 && (
          <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm">
            OBO
          </span>
        )}
      </div>

      <div className="p-4">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#0040DD]">
          {form.category || "Category"}
        </span>
        <h4 className="mt-0.5 text-[15px] font-black text-slate-900 leading-snug line-clamp-2 min-h-[2.5em]">
          {form.title.trim() || "Your equipment title"}
        </h4>
        {subtitle && <p className="text-[11.5px] text-slate-500 mt-0.5 truncate">{subtitle}</p>}

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Asking Price</span>
            <span className="block text-[24px] font-black text-slate-950 tracking-tight leading-none mt-0.5">
              {price > 0 ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "$—"}
            </span>
          </div>
          <div className="text-right space-y-1">
            {form.usage && (
              <span className="flex items-center justify-end gap-1 text-[11px] font-semibold text-slate-600">
                <Gauge className="size-3 text-slate-400" /> {form.usage}
              </span>
            )}
            <span className="flex items-center justify-end gap-1 text-[11px] font-semibold text-slate-600">
              <MapPin className="size-3 text-slate-400" /> {form.location || "Location"}
            </span>
          </div>
        </div>

        {form.description.trim() && (
          <p className="mt-3 pt-3 border-t border-slate-100 text-[11.5px] text-slate-500 leading-relaxed line-clamp-3">
            <FileText className="inline size-3 mr-1 text-slate-400 -mt-0.5" />
            {form.description}
          </p>
        )}
      </div>
    </div>
  );
}

function SuccessPanel({
  id,
  title,
  cover,
  onReset,
}: {
  id: string;
  title: string;
  cover: string | undefined;
  onReset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto rounded-[24px] bg-white border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#F59E0B]" />
      <div className="p-6 sm:p-10 text-center">
        <div className="relative mx-auto size-16 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center shadow-inner">
          <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
          <CheckCircle2 className="relative size-9" />
        </div>
        <h2 className="mt-4 font-display text-[24px] sm:text-[30px] font-extrabold text-slate-900 tracking-tight">
          Listing Submitted Successfully!
        </h2>
        <p className="mt-2 text-[13.5px] text-slate-500 max-w-lg mx-auto leading-relaxed">
          Thanks for choosing M3 Rental. Our acquisitions team is reviewing your equipment and will contact you using
          your preferred method — usually within one business day.
        </p>

        <div className="mt-6 mx-auto max-w-md flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-left">
          <div className="size-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
            {cover ? <img src={cover} alt="" className="size-full object-cover" /> : <Truck className="size-6 m-5 text-slate-400" />}
          </div>
          <div className="min-w-0">
            <span className="block text-[10.5px] font-black uppercase tracking-widest text-slate-400">Reference ID</span>
            <span className="block font-mono text-[15px] font-black text-[#0040DD]">{id}</span>
            <span className="block text-[12px] font-semibold text-slate-700 truncate">{title}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
          {[
            { icon: BadgeCheck, t: "Review", d: "We check specs, photos & market value." },
            { icon: Phone, t: "Contact", d: `We'll reach out — or call ${site.phone}.` },
            { icon: Handshake, t: "Deal", d: "Inspection, agreement and fast payment." },
          ].map((s) => (
            <div key={s.t} className="rounded-xl border border-slate-200 p-3">
              <s.icon className="size-4.5 text-[#0040DD]" />
              <span className="block mt-1.5 text-[12.5px] font-black text-slate-900">{s.t}</span>
              <span className="block text-[11px] text-slate-500 leading-snug">{s.d}</span>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            id="sell-submit-another"
            onClick={onReset}
            className="btn-base btn-primary font-bold"
          >
            <Tag className="size-4" /> Sell Another Item
          </button>
          <Link to="/equipment" className="btn-base font-bold border border-slate-200 bg-white text-slate-800 hover:bg-slate-50">
            Browse Rental Fleet <ArrowRight className="size-4" />
          </Link>
        </div>
        <p className="mt-4 text-[11px] text-slate-400">
          Questions? Email{" "}
          <a href={site.emailHref} className="font-bold text-[#0040DD] hover:underline">
            {site.email}
          </a>{" "}
          and mention reference {id}. {CONTACT_LABEL.call} is fastest.
        </p>
      </div>
    </div>
  );
}
