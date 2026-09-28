import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Phone, ShieldCheck, Star, UserCheck } from "lucide-react";
import { site } from "@/lib/site";
import heroVideo from "@/assets/hero.mp4";

export function HeroSection() {
  return (
    <section
      className="relative isolate min-h-[75vh] sm:min-h-[80vh] lg:min-h-[85vh] overflow-hidden flex items-center py-14 sm:py-18 md:py-20 lg:py-24 rounded-[10px] border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.12)]"
      style={{ margin: "0px 15px 15px 15px" }}
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 -z-10 size-full object-cover"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      {/* Hero Scrim with deep blue-tinted cinematic overlay */}
      <div className="hero-scrim absolute inset-0 -z-10" />

      {/* Ambient background glows like in brown */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-[#0040DD]/20 blur-3xl animate-blob" />
        <div
          className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-[#16A34A]/20 blur-3xl animate-blob"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="w-full max-w-[94rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Eyebrow Badge with 5 Stars like Brown project */}
          <span
            className="inline-flex flex-wrap sm:flex-nowrap items-center gap-1.5 max-w-full rounded-2xl sm:rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10.5px] sm:text-xs font-semibold text-white backdrop-blur-md shadow-xs mt-[60px]"
            style={{ marginTop: "60px" }}
          >
            <span className="flex text-amber-400 gap-0.5 shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3 sm:size-3.5 fill-current text-amber-400" />
              ))}
            </span>
            <span>Houston's Premier Equipment & Vehicle Rentals</span>
          </span>

          {/* Main Headline */}
          <h1
            className="font-display text-[26px] sm:text-[34px] md:text-[41px] font-extrabold tracking-tight text-white mt-[10px] leading-[36px] sm:leading-[44px] md:leading-[50px] -mb-[15px]"
            style={{ marginTop: "10px", marginBottom: "-15px" }}
          >
            The Equipment You Need. When You Need It.{" "}
            <span className="bg-gradient-to-r from-[#4ADE80] via-[#FBBF24] to-[#60A5FA] bg-clip-text text-transparent">
              Ready to Rent.
            </span>
          </h1>

          {/* Description (Exact Brown project size: 13px -> 15px -> 17px, leading-relaxed) */}
          <p className="max-w-2xl mt-3 sm:mt-4 text-white text-[13px] sm:text-[15px] md:text-[17px] leading-relaxed md:leading-[36px] font-medium">
            From work trucks and heavy hauling trailers to specialty machinery and
            operator-supported equipment, M3 Rental makes equipment rental simple,
            flexible, and accessible in Houston, Texas.
          </p>

          {/* CTA Buttons (Brown style: stacked on mobile, row on sm+) */}
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Link
              to="/equipment"
              className="btn-base btn-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider w-full sm:w-auto justify-center shadow-lg"
            >
              <span>Browse 70+ Equipment</span>
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={site.phoneHref}
              className="btn-base bg-white/15 hover:bg-white text-white hover:text-[#0A1124] border border-white/35 backdrop-blur-md text-xs sm:text-sm font-extrabold uppercase tracking-wider w-full sm:w-auto justify-center transition-all shadow-sm"
            >
              <Phone className="size-4 text-[#4ADE80]" />
              Call {site.phone}
            </a>
          </div>

          {/* Trust Badges — Premium Glassmorphic Reassurance Pills */}
          <div className="mt-7 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
            {/* Badge 1: Flexible Payment */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-md px-3.5 py-1.5 shadow-xs transition-all duration-200 group">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30 group-hover:scale-110 transition-transform">
                <ShieldCheck className="size-3 text-amber-300" />
              </span>
              <span className="text-[11.5px] sm:text-xs font-semibold text-white/95 tracking-wide">
                Cash • Zelle • Cash App
              </span>
            </div>

            {/* Badge 2: No Credit Card */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-md px-3.5 py-1.5 shadow-xs transition-all duration-200 group">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/30 group-hover:scale-110 transition-transform">
                <BadgeCheck className="size-3 text-emerald-300" />
              </span>
              <span className="text-[11.5px] sm:text-xs font-semibold text-white/95 tracking-wide">
                No Credit Card Required
              </span>
            </div>

            {/* Badge 3: Operator Available */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-md px-3.5 py-1.5 shadow-xs transition-all duration-200 group">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-sky-300 ring-1 ring-sky-400/30 group-hover:scale-110 transition-transform">
                <UserCheck className="size-3 text-sky-300" />
              </span>
              <span className="text-[11.5px] sm:text-xs font-semibold text-white/95 tracking-wide">
                Operator Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
