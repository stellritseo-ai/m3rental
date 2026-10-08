import { useId, useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Mail,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  Wrench,
} from "lucide-react";
import { site } from "@/lib/site";
import { equipment as equipmentData } from "@/data/equipment";
import { useManagedFleet } from "@/lib/dashboard-store";
import { submitClientInquiry } from "@/lib/inbox-store";

const quickCategories = [
  { label: "All Equipment", query: "" },
  { label: "Dump Trailers & Haulers", query: "Dump Trailer" },
  { label: "Excavators & Earthmovers", query: "Excavator" },
  { label: "Heavy-Duty Pickups", query: "Tundra TRD" },
  { label: "Utility & Bucket Rigs", query: "Bucket Truck" },
  { label: "Forklifts & Lifts", query: "Forklift" },
];

export function RentalRequestForm({
  defaultEquipment = "",
}: {
  defaultEquipment?: string;
}) {
  const { fleet } = useManagedFleet();
  const currentEquipment = fleet && fleet.length > 0 ? fleet : equipmentData;
  const formId = useId();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    equipment: defaultEquipment,
    startDate: "",
    duration: "Daily",
    operator: "Self-Operated (No driver needed)",
    jobsiteLocation: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");

  const update = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectCategory = (cat: { label: string; query: string }) => {
    setActiveCategory(cat.label);
    if (cat.query) {
      setForm((prev) => ({ ...prev, equipment: cat.query }));
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.equipment.trim()) {
      toast.error("Please fill in your name, phone number, and required equipment.");
      return;
    }

    setIsSubmitting(true);

    const body = [
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Email: ${form.email.trim() || "Not provided"}`,
      `Equipment Needed: ${form.equipment.trim()}`,
      `Rental Start Date: ${form.startDate || "As soon as possible"}`,
      `Rental Duration: ${form.duration}`,
      `Machine Operator: ${form.operator}`,
      `Jobsite Location: ${form.jobsiteLocation.trim() || "Southwest Houston / Will pick up at yard"}`,
      "",
      `Additional Notes:`,
      form.message.trim() || "None",
    ].join("\n");

    const mailto = `${site.emailHref}?subject=${encodeURIComponent(
      `Rental Request — ${form.equipment.trim()} (M3 Houston)`,
    )}&body=${encodeURIComponent(body)}`;

    // Persist RFQ quote into MongoDB database
    import("@/lib/api/quotes.functions").then(({ createQuoteDb }) => {
      createQuoteDb({
        data: {
          customerName: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || "inquiry@m3rental.com",
          equipmentRequested: form.equipment.trim(),
          rentalDuration: form.duration,
          jobsiteLocation: form.jobsiteLocation.trim() || "Houston Yard Pickup",
          operatorRequired:
            form.operator.toLowerCase().includes("driver") ||
            form.operator.toLowerCase().includes("operator"),
          ...(form.message.trim() ? { notes: form.message.trim() } : {}),
        },
      }).catch(() => {});
    });

    // Submit to Dispatch Inbox
    submitClientInquiry({
      senderName: form.name.trim(),
      senderEmail: form.email.trim() || "inquiry@m3rental.com",
      senderPhone: form.phone.trim(),
      equipmentRequested: form.equipment.trim(),
      rentalDuration: form.duration,
      jobsiteLocation: form.jobsiteLocation.trim() || "Houston Yard Pickup",
      operatorRequired:
        form.operator.toLowerCase().includes("driver") ||
        form.operator.toLowerCase().includes("operator"),
      notes: form.message.trim() || undefined,
      source: "contact_page",
    });

    // Trigger email client
    window.location.href = mailto;

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Rental request submitted!", {
        description: `Logged in Houston dispatch database. Call ${site.phone} for immediate rollout.`,
      });
    }, 450);
  };

  const copyInquiryDetails = () => {
    const details = `M3 Rental Request:
Name: ${form.name}
Phone: ${form.phone}
Email: ${form.email || "N/A"}
Equipment: ${form.equipment}
Start Date: ${form.startDate || "Immediate"}
Duration: ${form.duration}
Operator: ${form.operator}
Location: ${form.jobsiteLocation || "Yard Pickup"}
Notes: ${form.message || "N/A"}`;

    navigator.clipboard.writeText(details);
    toast.success("Inquiry details copied to clipboard!");
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setForm({
      name: "",
      phone: "",
      email: "",
      equipment: "",
      startDate: "",
      duration: "Daily",
      operator: "Self-Operated (No driver needed)",
      jobsiteLocation: "",
      message: "",
    });
    setActiveCategory("");
  };

  if (isSubmitted) {
    return (
      <div className="py-8 px-4 sm:px-6 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
        <div className="size-16 rounded-2xl bg-emerald-100 border border-emerald-300/80 flex items-center justify-center text-[#16A34A] mb-4 shadow-sm">
          <CheckCircle2 className="size-9" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-[#16A34A] text-[11px] font-black uppercase tracking-wider mb-2">
          Request Compiled Successfully
        </span>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight mb-2">
          Your Rental Request is Ready!
        </h3>

        <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6 leading-relaxed font-medium">
          We opened your email client to dispatch the request directly to{" "}
          <strong className="text-slate-900 font-bold">{site.email}</strong>. For instant confirmation and gate access within 15 minutes, please call our yard dispatcher.
        </p>

        {/* Request summary box */}
        <div className="w-full max-w-md bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left mb-6 text-xs text-slate-700 space-y-1.5">
          <div className="flex justify-between font-bold text-slate-900 pb-1.5 border-b border-slate-200">
            <span>Summary for {form.name}</span>
            <span className="text-[#0040DD]">{site.phone}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Equipment: </span>
            <span className="font-semibold text-slate-900">{form.equipment}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Duration: </span>
            <span className="font-semibold text-slate-900">{form.duration}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Operator: </span>
            <span className="font-semibold text-slate-900">{form.operator}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Phone: </span>
            <span className="font-semibold text-slate-900">{form.phone}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={site.phoneHref}
            className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
          >
            <Phone className="size-4" />
            <span>Call Yard Now: {site.phone}</span>
          </a>

          <button
            type="button"
            onClick={copyInquiryDetails}
            className="btn-base btn-outline font-bold"
          >
            <Copy className="size-4 text-slate-500" />
            <span>Copy Inquiry Text</span>
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="size-3.5" />
            <span>Submit Another Request</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" id="rental-request-form">
      {/* Quick category filter chips */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-2">
          Quick Category Selection
        </label>
        <div className="flex flex-wrap gap-2">
          {quickCategories.map((cat) => {
            const isSelected = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                  isSelected
                    ? "bg-[#0040DD] text-white border-[#0040DD] shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 1: Full Name & Phone Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`${formId}-name`}
            className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Full Name <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <input
              id={`${formId}-name`}
              type="text"
              required
              value={form.name}
              onChange={(e) => update("name")(e.target.value)}
              placeholder="e.g. Marcus Rodriguez"
              className={inputClass}
            />
            <User className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            htmlFor={`${formId}-phone`}
            className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Phone Number <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <input
              id={`${formId}-phone`}
              type="tel"
              required
              inputMode="tel"
              value={form.phone}
              onChange={(e) => update("phone")(e.target.value)}
              placeholder="(281) 000-0000"
              className={inputClass}
            />
            <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 2: Email & Equipment Needed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`${formId}-email`}
            className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              id={`${formId}-email`}
              type="email"
              value={form.email}
              onChange={(e) => update("email")(e.target.value)}
              placeholder="contractor@email.com"
              className={inputClass}
            />
            <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            htmlFor={`${formId}-equipment`}
            className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Equipment Needed <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <input
              id={`${formId}-equipment`}
              type="text"
              required
              list={`${formId}-equipment-list`}
              value={form.equipment}
              onChange={(e) => update("equipment")(e.target.value)}
              placeholder="e.g. 14K Dump Trailer, Tundra TRD, Excavator"
              className={inputClass}
            />
            <Truck className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <datalist id={`${formId}-equipment-list`}>
              {currentEquipment.map((item) => (
                <option key={item.slug} value={item.name} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Row 3: Start Date & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`${formId}-date`}
            className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Rental Start Date
          </label>
          <div className="relative">
            <input
              id={`${formId}-date`}
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate")(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`${formId}-duration`}
            className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Rental Duration
          </label>
          <select
            id={`${formId}-duration`}
            value={form.duration}
            onChange={(e) => update("duration")(e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="Daily">Daily Rental (1–2 Days)</option>
            <option value="Weekend Special">Weekend Special (Pick up Fri, Return Mon)</option>
            <option value="Weekly (Volume Discount)">Weekly Rental (Discounted Tier)</option>
            <option value="Monthly Commercial Contract">Monthly Commercial Contract</option>
          </select>
        </div>
      </div>

      {/* Row 4: Operator & Jobsite Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`${formId}-operator`}
            className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Driver / Operator Option
          </label>
          <select
            id={`${formId}-operator`}
            value={form.operator}
            onChange={(e) => update("operator")(e.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="Self-Operated (No driver needed)">Self-Operated (No driver needed)</option>
            <option value="Need Certified Machine Operator">Need Certified Machine Operator</option>
            <option value="Need Flatbed Jobsite Delivery Only">Need Flatbed Jobsite Delivery Only</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`${formId}-location`}
            className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Jobsite City or Address (Optional)
          </label>
          <input
            id={`${formId}-location`}
            type="text"
            value={form.jobsiteLocation}
            onChange={(e) => update("jobsiteLocation")(e.target.value)}
            placeholder="e.g. Southwest Houston, Katy, Sugar Land"
            className={inputClass}
          />
        </div>
      </div>

      {/* Row 5: Project Details & Requirements */}
      <div>
        <label
          htmlFor={`${formId}-message`}
          className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5"
        >
          Additional Jobsite Notes or Attachment Needs (Optional)
        </label>
        <textarea
          id={`${formId}-message`}
          rows={3}
          value={form.message}
          onChange={(e) => update("message")(e.target.value)}
          placeholder="Tell us about attachment requirements (auger, bucket, forks), desired pickup time, or jobsite access instructions..."
          className={`${inputClass} resize-none min-h-[96px]`}
        />
      </div>

      {/* Submit Action Row */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto btn-base btn-primary font-bold shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <Send className="size-4" />
          <span>{isSubmitting ? "Preparing Request..." : "Submit Rental Request"}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 text-center sm:text-right">
          <ShieldCheck className="size-4 text-[#16A34A] shrink-0" />
          <span>$0 Credit Card Req. • Cash, Zelle & Stripe</span>
        </div>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal focus:border-[#0040DD] focus:ring-2 focus:ring-[#0040DD]/15 shadow-2xs";
