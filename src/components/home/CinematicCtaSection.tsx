import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Compass,
  CreditCard,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UserCheck,
  WalletCards,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { site, directionsUrl } from "@/lib/site";
import ctaSunset from "@/assets/cta-sunset.jpg";

const trustBadges = [
  {
    icon: Zap,
    title: "Same-Day Dispatch",
    desc: "Keys in hand within 15 min",
    color: "text-amber-400",
  },
  {
    icon: WalletCards,
    title: "Flexible Payments",
    desc: "Cash, Zelle, Card ($0 CC Req.)",
    color: "text-emerald-400",
  },
  {
    icon: UserCheck,
    title: "Turnkey Operators",
    desc: "Certified machine drivers",
    color: "text-blue-400",
  },
  {
    icon: MapPin,
    title: "Centrally Located Yard",
    desc: "11732 S Wilcrest, SW Houston",
    color: "text-amber-400",
  },
];

export function CinematicCtaSection() {
  return (
    <section
      className="relative isolate overflow-hidden rounded-[10px] border border-slate-700/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)] max-w-[94rem] transition-all duration-300"
    >
      {/* Background Image with Cinematic Zoom Effect */}
      <img
        src={ctaSunset}
        alt="M3 Heavy Equipment & Excavator at Sunset in Houston"
        loading="eager"
        width={1920}
        height={1088}
        className="absolute inset-0 size-full object-cover object-center scale-105 transition-transform duration-1000 ease-out z-0"
      />

      {/* Layered Cinematic Overlays: balanced so the sunset and excavator pop clearly */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/75 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 z-[2]" />

      {/* Ambient glowing radial spots */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 w-[450px] h-[450px] rounded-full bg-[#0040DD]/20 blur-3xl z-[3]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-1/4 w-[400px] h-[400px] rounded-full bg-[#16A34A]/20 blur-3xl z-[3]"
      />

      <div className="relative mx-auto max-w-[94rem] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 z-10 text-center">
        <Reveal className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow Live Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-widest mb-6 shadow-lg select-none">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span>Immediate Houston Jobsite Dispatch</span>
            <Sparkles className="size-3 text-amber-300 ml-0.5" />
          </div>

          {/* Main Headline */}
          <h2 className="text-white font-black tracking-tight leading-[1.14] text-[26px] sm:text-[34px] lg:text-[44px] font-display mt-0 mb-4 max-w-3xl">
            Ready to Power Your Next Job With{" "}
            <span className="bg-gradient-to-r from-amber-300 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
              M3 Commercial Fleet?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-200 text-[14px] sm:text-[16px] lg:text-[17px] leading-relaxed font-medium max-w-2xl mb-8">
            Over 70+ work-ready pickups, heavy-duty goosenecks, dump trailers, and earthmoving machinery ready for pickup on S Wilcrest Dr or delivery straight to your jobsite.
          </p>

          {/* Dual Primary Call-to-Actions */}
          <div className="flex flex-wrap justify-center items-center gap-3.5 mb-10">
            <Link
              to="/equipment"
              className="inline-flex items-center gap-2.5 bg-white hover:bg-slate-100 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-widest rounded-full px-7 py-3.5 transition-all duration-300 shadow-xl hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            >
              <Truck className="size-4 text-[#0040DD]" />
              <span>Explore 70+ Units</span>
              <ArrowRight className="size-4" />
            </Link>

            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#0040DD] to-[#16A34A] hover:opacity-95 text-white border border-white/20 text-xs sm:text-sm font-black uppercase tracking-widest rounded-full px-7 py-3.5 transition-all duration-300 shadow-xl hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            >
              <Phone className="size-4 text-white" />
              <span>Call Yard {site.phone}</span>
            </a>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black/50 hover:bg-black/70 text-slate-200 hover:text-white border border-white/20 text-xs sm:text-sm font-black uppercase tracking-widest rounded-full px-6 py-3.5 transition-all duration-300 backdrop-blur-md hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            >
              <Compass className="size-4 text-amber-400" />
              <span>Get Directions</span>
            </a>
          </div>

          {/* 4 Feature Value Pills with Glassmorphic Halo */}
          <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-white/15">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 transition-all duration-200 text-center"
                >
                  <Icon className={`size-5 ${badge.color} mb-1.5`} />
                  <span className="text-[12px] font-black text-white leading-tight font-display">
                    {badge.title}
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium leading-tight mt-0.5">
                    {badge.desc}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Trust Line */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-300">
            <span className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3.5 fill-current text-amber-400" />
              ))}
            </span>
            <span className="text-white font-extrabold">4.9/5 Rating</span>
            <span className="text-slate-500">•</span>
            <span>$0 Credit Card Requirement</span>
            <span className="text-slate-500">•</span>
            <span>100% Houston Local Operations</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
