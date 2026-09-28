import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
  UserCheck,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { directionsUrl, mapEmbedUrl, site } from "@/lib/site";

export function LocationSection() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    equipment: "",
    duration: "Daily",
    operator: "No operator needed",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please enter your name and phone number.");
      return;
    }

    setIsSubmitting(true);

    const body = [
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email || "Not provided"}`,
      `Equipment Needed: ${form.equipment || "General fleet inquiry"}`,
      `Rental Duration: ${form.duration}`,
      `Machine Operator: ${form.operator}`,
      "",
      `Notes: ${form.message || "None"}`,
    ].join("\n");

    const mailto = `${site.emailHref}?subject=${encodeURIComponent(
      `Rental Inquiry — ${form.equipment || "Houston Equipment"}`
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Inquiry prepared! We will confirm availability shortly.", {
        description: `You can also call ${site.phone} for immediate yard dispatch.`,
      });
    }, 400);
  };

  return (
    <section
      id="location-contact"
      className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24"
      style={{ margin: "15px", paddingTop: "60px", paddingBottom: "60px" }}
    >
      {/* Ambient background glow blooms */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#0040DD]/[0.04] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#16A34A]/[0.06] blur-3xl"
      />

      <div className="relative mx-auto max-w-[94rem] z-10">
        {/* ── Section Header ── */}
        <Reveal className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0040DD] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0040DD]" />
            </span>
            <span>Houston Yard & Direct Inquiries</span>
            <MapPin className="size-3 text-[#0040DD]" />
          </div>

          <h2
            className="text-slate-900 font-black tracking-tight leading-[1.18] text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-display lg:whitespace-nowrap"
            style={{ marginTop: "-5px", marginBottom: "6px" }}
          >
            Visit Our Houston Yard or{" "}
            <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
              Request Equipment Online.
            </span>
          </h2>

          <p
            className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto mb-[-8px] sm:mb-[-30px]"
          >
            Centrally located on S Wilcrest Dr in Southwest Houston. Reserve machinery online or stop by for keys in under 15 minutes.
          </p>
        </Reveal>

        {/* ── Main 2-Column Split: Contact Form (Left) & Yard Map/Info (Right) ── */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 items-start">
          {/* ── LEFT COLUMN: Contact / Rental Request Form (col-span-7) ── */}
          <Reveal className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-8 lg:p-9 shadow-sm relative">
              {/* Form Header */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    Instant Equipment Inquiry
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    No credit card required. Houston dispatch responds within 15 minutes.
                  </p>
                </div>

                <div className="hidden sm:flex size-11 rounded-xl bg-blue-50 border border-blue-200/80 items-center justify-center text-[#0040DD] shrink-0">
                  <Truck className="size-5" />
                </div>
              </div>

              {isSubmitted ? (
                /* Success Confirmation State */
                <div className="py-10 text-center flex flex-col items-center justify-center">
                  <div className="size-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[#16A34A] mb-4 shadow-sm animate-in zoom-in-95 duration-300">
                    <CheckCircle2 className="size-9" />
                  </div>

                  <h4 className="text-2xl font-black text-slate-900 font-display mb-1.5">
                    Rental Request Prepared!
                  </h4>
                  <p className="text-slate-600 text-sm max-w-md mx-auto mb-6 leading-relaxed font-medium">
                    Your inquiry has been compiled. You can also call our yard dispatcher directly at{" "}
                    <strong className="text-slate-900 font-bold">{site.phone}</strong> for instant confirmation.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={site.phoneHref}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0040DD] to-[#16A34A] text-white text-xs font-black uppercase tracking-widest rounded-full px-6 py-3 shadow-md hover:scale-105 active:scale-95 transition-all"
                    >
                      <Phone className="size-4" />
                      <span>Call {site.phone}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setForm({
                          name: "",
                          phone: "",
                          email: "",
                          equipment: "",
                          duration: "Daily",
                          operator: "No operator needed",
                          message: "",
                        });
                      }}
                      className="px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1: Full Name & Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => update("name")(e.target.value)}
                        placeholder="e.g. Marcus Rodriguez"
                        className="w-full bg-white rounded-xl border border-slate-200/90 py-3 px-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0040DD] focus:ring-1 focus:ring-[#0040DD] transition-all font-medium shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => update("phone")(e.target.value)}
                          placeholder="(281) 000-0000"
                          className="w-full bg-white rounded-xl border border-slate-200/90 py-3 pl-4 pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0040DD] focus:ring-1 focus:ring-[#0040DD] transition-all font-medium shadow-2xs"
                        />
                        <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Email & Equipment Needed */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email")(e.target.value)}
                          placeholder="contractor@email.com"
                          className="w-full bg-white rounded-xl border border-slate-200/90 py-3 pl-4 pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0040DD] focus:ring-1 focus:ring-[#0040DD] transition-all font-medium shadow-2xs"
                        />
                        <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Equipment Needed
                      </label>
                      <input
                        type="text"
                        value={form.equipment}
                        onChange={(e) => update("equipment")(e.target.value)}
                        placeholder="e.g. 14K Dump Trailer, Tundra TRD, Backhoe"
                        className="w-full bg-white rounded-xl border border-slate-200/90 py-3 px-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0040DD] focus:ring-1 focus:ring-[#0040DD] transition-all font-medium shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Row 3: Duration & Operator Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Rental Duration
                      </label>
                      <select
                        value={form.duration}
                        onChange={(e) => update("duration")(e.target.value)}
                        className="w-full bg-white rounded-xl border border-slate-200/90 py-3 px-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0040DD] focus:ring-1 focus:ring-[#0040DD] transition-all font-medium shadow-2xs cursor-pointer"
                      >
                        <option value="Daily">Daily Rental (1-2 Days)</option>
                        <option value="Weekend">Weekend Rental</option>
                        <option value="Weekly">Weekly Rental (Volume Discount)</option>
                        <option value="Monthly">Monthly Commercial Contract</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Driver / Operator Option
                      </label>
                      <select
                        value={form.operator}
                        onChange={(e) => update("operator")(e.target.value)}
                        className="w-full bg-white rounded-xl border border-slate-200/90 py-3 px-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0040DD] focus:ring-1 focus:ring-[#0040DD] transition-all font-medium shadow-2xs cursor-pointer"
                      >
                        <option value="No operator needed">Self-Operated (No driver needed)</option>
                        <option value="Need certified operator">Need Certified Machine Operator</option>
                        <option value="Need delivery only">Need Flatbed Jobsite Delivery</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Project Message / Address Notes */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Jobsite Notes or Pickup Date (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => update("message")(e.target.value)}
                      placeholder="Tell us when you need it or where in Houston your jobsite is located..."
                      className="w-full bg-white rounded-xl border border-slate-200/90 py-3 px-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0040DD] focus:ring-1 focus:ring-[#0040DD] transition-all font-medium resize-none shadow-2xs"
                    />
                  </div>

                  {/* Submit Action Row */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0040DD] to-[#16A34A] text-white text-xs font-black uppercase tracking-widest rounded-xl px-8 py-3.5 transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                    >
                      <Send className="size-4" />
                      <span>{isSubmitting ? "Preparing Inquiry..." : "Submit Rental Request"}</span>
                    </button>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 text-center sm:text-right">
                      <ShieldCheck className="size-4 text-[#16A34A] shrink-0" />
                      <span>$0 Credit Card Req. • Cash & Zelle</span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </Reveal>

          {/* ── RIGHT COLUMN: Yard Location, Map & Direct Contacts (col-span-5) ── */}
          <Reveal delay={90} className="lg:col-span-5 space-y-5">
            {/* Yard Address Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-[#F59E0B] shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0040DD] bg-blue-50 px-2 py-0.5 rounded-full">
                      Primary Yard & Office
                    </span>
                    <h4 className="text-lg font-black text-slate-900 font-display mt-0.5">
                      {site.street}
                    </h4>
                  </div>
                </div>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open in Google Maps"
                  className="size-9 rounded-xl bg-slate-100 hover:bg-[#0040DD] text-slate-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs shrink-0 cursor-pointer"
                >
                  <Navigation className="size-4" />
                </a>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="size-3.5 text-[#0040DD] shrink-0" />
                  <span>{site.city} • Southwest Houston</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-[#16A34A] shrink-0" />
                  <span>Mon–Sat: 7:00 AM – 7:00 PM • Sunday Closed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="size-3.5 text-amber-500 shrink-0" />
                  <span>Fast access from Beltway 8 & US-59 Southwest Freeway</span>
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-xs"
                >
                  <Phone className="size-3.5 text-[#16A34A]" />
                  <span>{site.phone}</span>
                </a>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0040DD] border border-blue-200/80 text-[11px] font-black uppercase tracking-wider transition-all"
                >
                  <Navigation className="size-3.5" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>

            {/* Embedded Live Google Map Frame */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 shadow-md bg-white p-2 group relative">
              <div className="relative rounded-xl overflow-hidden bg-slate-100">
                <iframe
                  title="M3 Rental Houston Yard Map"
                  src={mapEmbedUrl}
                  loading="lazy"
                  className="h-[270px] sm:h-[310px] w-full border-0 transition-opacity duration-300"
                />

                {/* Floating Map Yard Tag */}
                <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-slate-950/85 backdrop-blur-md px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg border border-white/20">
                  <span className="size-2 rounded-full bg-[#16A34A] animate-ping" />
                  <span>M3 Rental Yard Active</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
