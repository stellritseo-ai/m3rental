import {
  ArrowRight,
  CheckCircle2,
  Clock,
  KeyRound,
  Phone,
  Search,
  Sparkles,
  Truck,
  WalletCards,
  Zap,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/lib/site";

const steps = [
  {
    step: "01",
    title: "Browse & Select Equipment",
    desc: "Explore 70+ commercial trucks, heavy trailers, and earthmoving machinery with transparent day, week, and monthly pricing.",
    icon: Search,
    accent: "from-[#0040DD] to-[#1E40AF]",
    borderHover: "hover:border-[#0040DD]/40",
    badgeBg: "bg-[#0040DD] text-white shadow-blue-500/30",
    iconBg: "bg-[#0040DD]/10 text-[#0040DD] border-[#0040DD]/20",
    highlights: ["70+ Active Units", "Clear Upfront Rates", "Heavy-Duty Fleet"],
  },
  {
    step: "02",
    title: "Confirm In 5 Minutes",
    desc: "Call or text our Houston yard dispatch directly. We verify real-time availability, hold your unit, and prep the paperwork.",
    icon: Clock,
    accent: "from-[#0040DD] to-[#16A34A]",
    borderHover: "hover:border-[#0040DD]/40",
    badgeBg: "bg-gradient-to-r from-[#0040DD] to-[#16A34A] text-white shadow-emerald-500/30",
    iconBg: "bg-blue-50 text-[#0040DD] border-[#0040DD]/20",
    highlights: ["Direct Yard Dispatcher", "No Corporate Delays", "Dates Secured Fast"],
  },
  {
    step: "03",
    title: "Flexible Payment Options",
    desc: "Pay seamlessly with Cash, Zelle, Cash App, or credit/debit card via Stripe. No credit checks or corporate accounts required.",
    icon: WalletCards,
    accent: "from-[#16A34A] to-[#15803D]",
    borderHover: "hover:border-[#16A34A]/40",
    badgeBg: "bg-[#16A34A] text-white shadow-emerald-500/30",
    iconBg: "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20",
    highlights: ["Cash & Zelle Accepted", "$0 Credit Card Req.", "Zero Hidden Fees"],
  },
  {
    step: "04",
    title: "Ignition & Get to Work",
    desc: "Pick up at our S Wilcrest yard in SW Houston or get it delivered to your jobsite. Need a driver? Certified operators are available.",
    icon: KeyRound,
    accent: "from-[#F59E0B] to-[#D97706]",
    borderHover: "hover:border-amber-400/40",
    badgeBg: "bg-amber-500 text-slate-950 shadow-amber-500/30",
    iconBg: "bg-amber-50 text-amber-700 border-amber-200/60",
    highlights: ["SW Houston Yard", "Same-Day Delivery", "Turnkey Operator"],
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
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
        <Reveal className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0040DD] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0040DD]" />
            </span>
            Simple 4-Step Process
          </div>

          <h2
            className="text-[25px] sm:text-[30px] lg:text-[35px] text-slate-900 font-black tracking-tight leading-[1.18] font-display"
            style={{ marginTop: "-10px", marginBottom: "10px" }}
          >
            Four Simple Steps to{" "}
            <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
              Get on the Jobsite.
            </span>
          </h2>

          <p
            className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto mb-[-10px] sm:mb-[-40px]"
            style={{ marginTop: "-3px" }}
          >
            No corporate paperwork hurdles, no mandatory credit card walls, and zero multi-day delays. From equipment selection to ignition in minutes.
          </p>
        </Reveal>

        {/* ── 4 Steps Grid with Step Connectors ── */}
        <div className="relative">
          {/* Subtle connecting energy line across desktop cards */}
          <div
            aria-hidden
            className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[#0040DD]/20 via-[#16A34A]/30 to-[#F59E0B]/30 z-0 pointer-events-none"
          />

          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal
                  key={step.step}
                  delay={index * 90}
                  className="relative group h-full"
                >
                  <div
                    className={`relative flex flex-col justify-between h-full p-6 sm:p-7 rounded-[14px] bg-slate-50/80 hover:bg-white border border-slate-200/90 ${step.borderHover} transition-all duration-300 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.04)] hover:shadow-xl hover:-translate-y-1.5`}
                  >
                    {/* Top Row: Number Badge & Icon */}
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-6">
                        <span
                          className={`inline-flex items-center justify-center size-10 rounded-xl ${step.badgeBg} font-display text-sm font-black shadow-md tracking-wider`}
                        >
                          {step.step}
                        </span>

                        <div
                          className={`size-12 rounded-xl border ${step.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xs`}
                        >
                          <Icon className="size-6" />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-[17px] sm:text-[18px] font-black text-slate-900 group-hover:text-[#0040DD] transition-colors duration-200 leading-snug mb-2 font-display">
                        {step.title}
                      </h3>

                      {/* Body Description */}
                      <p className="text-[13px] text-slate-500 leading-relaxed font-medium mb-6">
                        {step.desc}
                      </p>
                    </div>

                    {/* Bottom: Highlight Chips */}
                    <div className="pt-4 border-t border-slate-200/60 space-y-2">
                      {step.highlights.map((h) => (
                        <div
                          key={h}
                          className="flex items-center gap-2 text-[11.5px] font-bold text-slate-700"
                        >
                          <CheckCircle2 className="size-3.5 text-[#16A34A] shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Right Arrow Connector between cards (except last) */}
                  {index < steps.length - 1 && (
                    <div
                      aria-hidden
                      className="hidden lg:flex absolute -right-4 top-[52px] -translate-y-1/2 z-20 size-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-400 group-hover:text-[#0040DD] group-hover:border-[#0040DD]/30 transition-colors"
                    >
                      <ArrowRight className="size-3.5" />
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Reassurance & Immediate Dispatch Banner ── */}
        <Reveal delay={250} className="mt-10 sm:mt-14">
          <div className="rounded-[12px] bg-gradient-to-r from-slate-900 via-[#0A1224] to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <div className="size-13 rounded-xl bg-gradient-to-br from-[#0040DD] to-[#16A34A] flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
                <Zap className="size-6 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                  <h4 className="text-lg font-black tracking-tight text-white font-display">
                    Need Equipment Dispatched Today?
                  </h4>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#16A34A] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                    Live Houston Dispatch
                  </span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-xl">
                  Call our yard team directly. We confirm machine availability, lock in your rental window, and have keys in your hand within 15 minutes.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/equipment"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-950 text-[11px] font-black uppercase tracking-widest rounded-full px-5 py-3 transition-all duration-300 shadow-md hover:scale-[1.03] active:scale-[0.97] cursor-pointer w-full sm:w-auto"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Explore 70+ Units</span>
              </Link>
              <a
                href={site.phoneHref}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0040DD] to-[#16A34A] text-white border border-white/20 text-[11px] font-black uppercase tracking-widest rounded-full px-5 py-3 transition-all duration-300 shadow-md hover:scale-[1.03] active:scale-[0.97] cursor-pointer w-full sm:w-auto"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {site.phone}</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
