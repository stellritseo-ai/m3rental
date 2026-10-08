import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/lib/site";
import operatorImg from "@/assets/operator.jpg";
import logoImg from "@/assets/logo.png";

const servicesList = [
  "70+ Commercial Units",
  "No Credit Card Req.",
  "Turnkey Operators",
  "Cash & Zelle Accepted",
  "15-Min Yard Pickup",
];

const faqs = [
  {
    id: "faq-1",
    q: "Do I need a credit card to rent equipment?",
    a: "No! M3 Rental makes equipment accessible without requiring a traditional credit card. You can rent easily using Cash, Zelle, Cash App, or standard debit cards without credit checks or corporate walls.",
  },
  {
    id: "faq-2",
    q: "What payment methods do you accept?",
    a: "We accept Cash upon yard pickup or scheduled delivery, instant fee-free Zelle bank transfers, Cash App, and secure credit/debit card processing via Stripe.",
  },
  {
    id: "faq-3",
    q: "Do you provide certified machine operators?",
    a: "Yes! Selected machinery and heavy vehicles can be rented with a certified, experienced driver or operator so your crew saves time and avoids machine operation liabilities.",
  },
  {
    id: "faq-4",
    q: "Is the operator included in the rental price?",
    a: "On eligible equipment listings marked 'Operator Available', professional operator service is provided upfront at the standard rental price with no surprise add-on charges or hidden fees.",
  },
  {
    id: "faq-5",
    q: "Where is the equipment pickup yard located in Houston?",
    a: `Our main fleet yard is centrally located in Southwest Houston at ${site.street}, ${site.city} — easily accessible from Beltway 8 and US-59 for fast towing and rapid jobsite dispatch.`,
  },
  {
    id: "faq-6",
    q: "Can I rent equipment for multiple days, weekly, or monthly?",
    a: "Yes. All equipment is available on a daily rate and can be booked for multiple consecutive days, weekly blocks, or discounted monthly commercial contracts.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string>("faq-1");

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? "" : id);
  };

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-[60px] px-4 sm:px-6 lg:px-8 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)] max-w-[94rem] transition-all duration-300 scroll-mt-24"
    >
      {/* ── Background Decorations (Brown style) ── */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #0040DD 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-40 right-0 w-[560px] h-[560px] rounded-full bg-[#0040DD]/6 blur-[130px]" />
        <div className="absolute bottom-0 -left-24 w-[500px] h-[500px] rounded-full bg-[#16A34A]/6 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[94rem]">
        <div className="grid gap-10 sm:gap-14 lg:grid-cols-12 lg:gap-16 items-start">
          {/* ── LEFT COLUMN: FAQ Accordion (col-span-7 like Brown) ── */}
          <Reveal className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 bg-[#0040DD]/8 border border-[#0040DD]/25 rounded-full px-5 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#0040DD] shadow-xs select-none">
              <HelpCircle className="w-3.5 h-3.5 text-[#0040DD]" />
              <span>Frequently Asked Questions</span>
            </div>

            {/* Headline & Description */}
            <div>
              <h2
                className="text-[25px] sm:text-[28px] lg:text-[34px] font-display font-black text-slate-900 tracking-tight leading-tight"
                style={{ marginTop: "-14px", marginBottom: "0px" }}
              >
                Got Questions?{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0040DD] to-[#16A34A]">
                  We Have Clear Answers.
                </span>
              </h2>
              <p
                className="text-slate-500 font-medium text-[14.5px] leading-relaxed max-w-xl"
                style={{ marginTop: "5px", marginBottom: "-12px" }}
              >
                Everything you need to know about our commercial truck rentals, heavy trailers, turnkey machine operators, and Houston jobsite delivery.
              </p>
            </div>

            {/* Accordion list */}
            <div className="space-y-2.5 pt-1">
              {faqs.map((faq) => {
                const isOpen = openId === faq.id;

                return (
                  <div
                    key={faq.id}
                    className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? "bg-[#0040DD]/[0.03] border-[#0040DD]/35 shadow-sm"
                        : "bg-white border-slate-200 hover:border-[#0040DD]/25 hover:shadow-2xs"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full flex items-center justify-between py-3 px-4 sm:py-3.5 sm:px-5 text-left gap-3.5 cursor-pointer select-none"
                      aria-expanded={isOpen}
                    >
                      <span className="font-extrabold text-[14px] sm:text-[15px] text-slate-900 leading-snug flex items-center gap-2.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                            isOpen ? "bg-[#0040DD]" : "bg-slate-300"
                          }`}
                        />
                        {faq.q}
                      </span>

                      <div
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isOpen
                            ? "bg-[#0040DD] text-white rotate-180 shadow-xs"
                            : "bg-slate-100 text-slate-500 group-hover:bg-[#0040DD]/10"
                        }`}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-3.5 pt-0 text-slate-600 font-medium text-[13px] leading-relaxed border-t border-[#0040DD]/10 mt-0.5 pt-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Direct call bottom line */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <Link
                to="/equipment"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0040DD] to-[#16A34A] text-white border border-white/20 text-[11px] font-black uppercase tracking-widest rounded-full px-7 py-3 shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 w-full sm:w-auto cursor-pointer"
              >
                <span>Browse 70+ Fleet Units</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={site.phoneHref}
                className="inline-flex items-center justify-center sm:justify-start gap-2 text-slate-800 text-[13px] font-extrabold hover:text-[#0040DD] transition-colors cursor-pointer py-1.5"
              >
                <Phone className="h-4 w-4 text-[#0040DD]" />
                <span>Call {site.phone}</span>
              </a>
            </div>
          </Reveal>

          {/* ── RIGHT COLUMN: Section Image Showcase (col-span-5 like Brown) ── */}
          <div className="hidden lg:block lg:col-span-5 relative w-full lg:sticky lg:top-[120px] self-start">
            {/* Outer ambient glow */}
            <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-[#0040DD]/15 via-transparent to-[#16A34A]/15 blur-xl pointer-events-none" />

            <div className="relative rounded-3xl overflow-hidden shadow-[0_24px_70px_-12px_rgba(0,0,0,0.22)] border-2 border-white group">
              {/* Main Image */}
              <img
                src={operatorImg}
                alt="M3 Equipment & Heavy Machine Operator in Houston"
                className="w-full h-[440px] sm:h-[480px] lg:h-[510px] object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />

              {/* Dark Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/20 pointer-events-none" />

              {/* Floating Top Header Bar: Logo + Business Name & Phone */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
                <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl shadow-lg">
                  <img
                    src={logoImg}
                    alt="M3 Rental Logo"
                    className="h-5 w-auto object-contain brightness-110"
                  />
                  <div className="text-left">
                    <p className="text-[11px] font-black text-white leading-none tracking-tight">
                      M3 Rental
                    </p>
                    <p className="text-[9px] font-bold text-amber-400 leading-none mt-0.5">
                      Houston Equipment
                    </p>
                  </div>
                </div>

                <a
                  href={site.phoneHref}
                  className="inline-flex items-center gap-1.5 bg-[#0040DD] border border-white/30 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-2xl shadow-lg hover:scale-105 transition-transform"
                >
                  <Phone className="w-3 h-3 fill-current" />
                  <span>{site.phone}</span>
                </a>
              </div>

              {/* Floating Bottom Card: Service Pills & Action */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl p-4 shadow-2xl text-left z-20">
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {servicesList.map((srv) => (
                    <span
                      key={srv}
                      className="inline-flex items-center gap-1 bg-[#0040DD]/10 border border-[#0040DD]/25 text-[#0040DD] text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#0040DD]" />
                      <span>{srv}</span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#16A34A] font-black block">
                      Houston Yard • S Wilcrest Dr
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                      Call {site.phone} for 15-Min Pickup
                    </p>
                  </div>
                  <a
                    href={site.phoneHref}
                    aria-label={`Call ${site.phone}`}
                    className="shrink-0 w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center border border-white/20 shadow-md hover:bg-[#0040DD] transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
