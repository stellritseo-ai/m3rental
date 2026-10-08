import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  HardHat,
  Phone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/lib/site";
import operatorImg from "@/assets/operator.jpg";

export function OperatorSection() {
  const benefits = [
    {
      icon: HardHat,
      color: "text-[#16A34A]",
      bg: "bg-emerald-50 border-emerald-200/60",
      title: "Equipment + Operator",
      desc: "Get heavy machinery and seasoned, certified operators bundled together seamlessly.",
    },
    {
      icon: CircleDollarSign,
      color: "text-[#F59E0B]",
      bg: "bg-amber-50 border-amber-200/60",
      title: "Transparent Rates",
      desc: "Predictable, clear rates with no hidden operational surcharges on eligible units.",
    },
    {
      icon: ShieldCheck,
      color: "text-[#0040DD]",
      bg: "bg-blue-50 border-blue-200/60",
      title: "Fully Insured & Compliant",
      desc: "No operator license or special commercial certification required on your crew's end.",
    },
  ];

  const eligibleUnits = [
    "John Deere Utility Backhoe",
    "35ft Utility Bucket Truck",
    "Heavy Equipment Trailers",
    "Commercial Transport Vans",
  ];

  return (
    <section
      className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)] py-8 sm:py-16 px-4 sm:px-6 lg:px-8 transition-all duration-300"
    >
      {/* Ambient background glow blooms */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#16A34A]/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-[#0040DD]/5 blur-3xl" />
      </div>

      <div className="w-full max-w-[94rem] mx-auto relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* ── LEFT COLUMN: Visual Media Showcase ── */}
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <Reveal className="relative">
              {/* Outer Showcase Frame */}
              <div className="overflow-hidden rounded-[10px] border border-slate-200/90 shadow-xl p-2 bg-gradient-to-b from-white via-slate-50 to-slate-100 group relative">
                <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-[8px] overflow-hidden bg-slate-950">
                  <img
                    src={operatorImg}
                    alt="Professional operator running heavy backhoe machinery on a Houston job site"
                    loading="lazy"
                    width={1280}
                    height={960}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle vignette scrim */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/20" />

                  {/* Top-Right Floating Certification Badge */}
                  <div className="absolute top-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 rounded-full bg-[#0A1124]/90 border border-white/20 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                    <ShieldCheck className="size-3.5 text-[#16A34A]" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">
                      Certified & Insured Operator
                    </span>
                  </div>

                  {/* Bottom-Right Location Pill */}
                  <div className="absolute bottom-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 rounded-full bg-[#0A1124]/90 border border-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                    <span className="size-2 rounded-full bg-[#16A34A] animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">
                      Houston Jobsite Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom-Left Overlapping Guarantee Card */}
              <div className="relative -mt-10 sm:-mt-12 ml-3 sm:ml-6 z-20 max-w-[340px] sm:max-w-[370px] rounded-[10px] bg-white/95 backdrop-blur-xl border border-slate-200/90 p-4 sm:p-5 shadow-[0_20px_45px_-10px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.9)_inset] hover:shadow-[0_25px_50px_-10px_rgba(15,23,42,0.22)] transition-all duration-300">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-[#16A34A] border border-emerald-200/60 shadow-2xs">
                    <CheckCircle2 className="size-4 text-[#16A34A]" />
                  </span>
                  <span className="text-[10.5px] font-black uppercase tracking-widest text-[#16A34A]">
                    Zero Crew Liability
                  </span>
                </div>
                <h4 className="mt-2 text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  No Heavy Equipment License Needed
                </h4>
                <p className="mt-1 text-xs text-slate-600 font-medium leading-relaxed">
                  Put our insured machine operators to work on day one without putting your crew at risk.
                </p>
              </div>
            </Reveal>
          </div>

          {/* ── RIGHT COLUMN: Content, Value Propositions & Actions ── */}
          <div className="lg:col-span-6 flex flex-col items-start text-left order-1 lg:order-2">
            <Reveal delay={80}>
              {/* Eyebrow Badge */}
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-50/90 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-900 shadow-2xs">
                <UserCheck className="size-3.5 text-[#16A34A]" />
                <span>Turnkey Equipment & Operator Service</span>
              </span>

              {/* Main Headline */}
              <h2 className="mt-4 font-display text-[26px] sm:text-[34px] md:text-[40px] font-black tracking-tight leading-[1.18] text-slate-900">
                Need More Than Machinery? We Provide the{" "}
                <span className="bg-gradient-to-r from-[#16A34A] via-[#0040DD] to-[#16A34A] bg-clip-text text-transparent">
                  Certified Operator Too.
                </span>
              </h2>

              {/* Narrative Story Copy */}
              <p className="mt-3.5 text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
                Avoid jobsite delays and expensive operational learning curves. Selected heavy equipment can be rented with an experienced, certified Texas driver or operator at transparent rates — arrive, operate safely, and keep project timelines moving.
              </p>

              {/* 3 Key Benefits Bento Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                {benefits.map((point) => {
                  const Icon = point.icon;
                  return (
                    <div
                      key={point.title}
                      className="group rounded-[10px] border border-slate-200/80 bg-slate-50/70 p-3.5 hover:bg-white hover:border-[#16A34A]/40 hover:shadow-xs transition-all duration-200"
                    >
                      <div
                        className={`size-8 rounded-lg border ${point.bg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                      >
                        <Icon className={`size-4 ${point.color}`} />
                      </div>
                      <h3 className="mt-2.5 font-display text-xs sm:text-[13px] font-black text-slate-900 leading-snug">
                        {point.title}
                      </h3>
                      <p className="mt-1 text-[11px] sm:text-xs text-slate-600 font-medium leading-normal">
                        {point.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Eligible Units Micro-Bar */}
              <div className="mt-6 w-full pt-4 border-t border-slate-100">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  Popular Operator-Supported Equipment:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {eligibleUnits.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 px-3 py-1 text-xs font-bold text-slate-700"
                    >
                      <CheckCircle2 className="size-3 text-[#16A34A]" />
                      <span>{name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/equipment"
                  search={{ operator: "with" }}
                  className="btn-base btn-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider w-full sm:w-auto justify-center shadow-md hover:shadow-lg active:scale-95"
                >
                  <span>Explore Operator Fleet</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/contact"
                  className="btn-base btn-outline text-xs sm:text-sm font-extrabold uppercase tracking-wider w-full sm:w-auto justify-center hover:border-[#16A34A] hover:text-[#16A34A] active:scale-95"
                >
                  <span>Request Operator Quote</span>
                </Link>
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-[#0040DD] transition-colors"
                >
                  <Phone className="size-3.5 text-[#16A34A]" />
                  <span>Call {site.phone}</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
