import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Clock,
  CreditCard,
  MapPin,
  Pause,
  Phone,
  Play,
  ShieldCheck,
  Star,
  Truck,
  UserCheck,
  Volume2,
  VolumeX,
  WalletCards,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/lib/site";
import whyChooseVideo from "@/assets/whychoose.mp4";

const features = [
  {
    icon: WalletCards,
    title: "Flexible Payment Options",
    desc: "Cash, Zelle, Cash App, and Stripe cards accepted for your convenience.",
  },
  {
    icon: CreditCard,
    title: "No Credit Card Required",
    desc: "No bureaucratic barriers or credit walls to access work equipment.",
  },
  {
    icon: UserCheck,
    title: "Certified Machine Operators",
    desc: "Rent backhoes, bucket trucks & heavy machinery with experienced drivers.",
  },
  {
    icon: Truck,
    title: "70+ Commercial Units",
    desc: "Heavy-duty pickups, goosenecks, dump trailers, vans & earthmovers.",
  },
  {
    icon: Award,
    title: "Transparent Upfront Rates",
    desc: "Clear daily, weekly, and monthly rates with zero surprise checkout fees.",
  },
  {
    icon: MapPin,
    title: "Centrally Located Yard",
    desc: "Located on S Wilcrest Dr in SW Houston for rapid pickup or jobsite delivery.",
  },
  {
    icon: Clock,
    title: "Same-Day Rapid Dispatch",
    desc: "When equipment breaks down or timelines surge, we keep your job moving.",
  },
  {
    icon: ShieldCheck,
    title: "Rigorously Maintained Fleet",
    desc: "Every truck, hauler, and machine is fully inspected and job-ready.",
  },
];

const trustStats = [
  { value: "70+", label: "Rental Units" },
  { value: "$0", label: "Credit Card Req." },
  { value: "100%", label: "Houston Local" },
  { value: "6 Days", label: "Mon–Sat Support" },
];

export function WhyM3Section() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  return (
    <section
      id="why-m3"
      className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-[60px] px-4 sm:px-6 lg:px-8 transition-all duration-300 scroll-mt-24"
      style={{ margin: "15px", paddingTop: "60px", paddingBottom: "60px" }}
    >
      {/* Ambient background glow blooms like Brown project */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#0040DD]/[0.04] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#16A34A]/[0.06] blur-3xl"
      />

      <div className="relative mx-auto max-w-[94rem] z-10">
        <div className="grid gap-10 sm:gap-14 lg:grid-cols-5 lg:gap-10 xl:gap-14 items-center">
          {/* ── LEFT: Content & Feature Grid (60% width) ── */}
          <Reveal className="flex flex-col order-2 lg:order-1 lg:col-span-3">
            {/* Eyebrow Badge with Live Ping Dot */}
            <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full border border-[#0040DD]/30 bg-[#0040DD]/8 text-[#0040DD] text-[10px] font-black uppercase tracking-widest mb-5 shadow-2xs select-none">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0040DD] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0040DD]" />
              </span>
              Why Choose M3 Rental
            </div>

            {/* Headline */}
            <h2
              className="text-[26px] lg:text-[30px] text-slate-900 font-black tracking-tight leading-[1.18] font-display lg:whitespace-nowrap"
              style={{ marginTop: "-10px", marginBottom: "10px" }}
            >
              Why Houston Trusts{" "}
              <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                M3 Equipment
              </span>{" "}
              & Vehicle Rentals.
            </h2>

            {/* Subtext */}
            <p
              className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-2xl"
              style={{ marginTop: "-5px", marginBottom: "10px" }}
            >
              Over 70+ commercial trucks, heavy trailers, and earthmoving machinery ready for immediate dispatch across Houston and neighboring Texas communities — without credit walls or corporate delays.
            </p>

            {/* Feature Grid (8 items in 2 columns like Brown project) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="group flex items-start gap-3 p-3 rounded-xl hover:bg-[#0040DD]/5 border border-transparent hover:border-[#0040DD]/15 transition-all duration-200 cursor-default"
                  >
                    <span className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-[#0040DD]/10 border border-[#0040DD]/20 group-hover:bg-[#0040DD]/20 transition-colors duration-200">
                      <Icon className="w-3.5 h-3.5 text-[#0040DD]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-extrabold text-slate-900 leading-tight mb-0.5 group-hover:text-[#0040DD] transition-colors duration-200">
                        {f.title}
                      </p>
                      <p className="text-[11.5px] text-slate-500 leading-relaxed font-medium">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons (Brown style) */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link
                to="/equipment"
                className="inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-[11px] font-black uppercase tracking-widest rounded-full px-6 py-3 transition-all duration-300 shadow-md hover:scale-[1.03] active:scale-[0.97] cursor-pointer w-full sm:w-auto"
              >
                <span>Explore All 70+ Units</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={site.phoneHref}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0040DD] to-[#16A34A] text-white border border-[#0040DD]/30 text-[11px] font-black uppercase tracking-widest rounded-full px-6 py-3 transition-all duration-300 shadow-md hover:scale-[1.03] active:scale-[0.97] cursor-pointer w-full sm:w-auto"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {site.phone}</span>
              </a>
            </div>
          </Reveal>

          {/* ── RIGHT: Video Card with Player & Stats (40% width) ── */}
          <Reveal delay={100} className="relative order-1 lg:order-2 lg:col-span-2 lg:sticky lg:top-[100px]">
            {/* Decorative glow rings */}
            <div
              aria-hidden
              className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-[#0040DD]/15 via-transparent to-[#16A34A]/15 blur-xl pointer-events-none"
            />
            <div
              aria-hidden
              className="absolute -inset-1 rounded-[32px] bg-gradient-to-tr from-[#0040DD]/20 to-[#16A34A]/20 blur-md pointer-events-none"
            />

            {/* Video container */}
            <div className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_-12px_rgba(0,0,0,0.2)] border-2 border-white/90 group">
              <video
                ref={videoRef}
                src={whyChooseVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-[280px] sm:h-[380px] lg:h-[590px] object-cover transition-transform duration-700 ease-out"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/15 to-transparent pointer-events-none" />

              {/* ── Play / Pause center button ── */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause video" : "Play video"}
                className="absolute inset-0 flex items-center justify-center z-10 group/btn cursor-pointer"
              >
                <span
                  className={`flex items-center justify-center w-16 h-16 rounded-full border-2 border-white/60 bg-black/35 backdrop-blur-sm shadow-xl transition-all duration-300 ${isPlaying
                    ? "opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100"
                    : "opacity-100 scale-100"
                    }`}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 text-white fill-white" />
                  ) : (
                    <Play className="w-7 h-7 text-white fill-white translate-x-0.5" />
                  )}
                </span>
              </button>

              {/* ── Sound toggle button (top-right) ── */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                className="absolute top-4 right-4 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/30 text-white hover:bg-black/60 hover:scale-110 transition-all duration-200 shadow-md cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Top-left badge */}
              <div className="absolute top-4 left-4 z-20 bg-[#0040DD] border border-white/30 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Houston's #1 Fleet Choice</span>
              </div>

              {/* Trust Stats Bar at bottom (Brown style adapted for 40% column) */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
                <div className="bg-slate-900/65 backdrop-blur-md border border-white/20 rounded-2xl px-2 sm:px-3 py-3 grid grid-cols-4 divide-x divide-white/15">
                  {trustStats.map((s) => (
                    <div key={s.label} className="flex flex-col items-center px-1 text-center">
                      <span className="text-amber-400 font-black text-[13px] sm:text-[15px] xl:text-[16px] leading-tight font-display">
                        {s.value}
                      </span>
                      <span className="text-white/85 text-[8px] sm:text-[8.5px] xl:text-[9.5px] font-bold uppercase tracking-normal sm:tracking-wider text-center leading-tight mt-0.5">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
