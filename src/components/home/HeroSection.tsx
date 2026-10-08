import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Phone,
  ShieldCheck,
  Star,
  UserCheck,
} from "lucide-react";
import { site } from "@/lib/site";
import banner1 from "@/assets/banner1.jpeg";
import banner2 from "@/assets/banner2.jpeg";
import banner3 from "@/assets/banner3.jpeg";
import banner4 from "@/assets/banner4.jpeg";
import banner5 from "@/assets/banner5.jpeg";
import banner6 from "@/assets/banner6.jpeg";


const heroBanners = [
  {
    src: banner1,
    alt: "M3 Rental heavy excavator and commercial equipment in Houston",
  },
  {
    src: banner2,
    alt: "M3 Rental skid steer loader ready for construction projects",
  },
  {
    src: banner3,
    alt: "M3 Rental telehandler forklift with operator in Houston",
  },
  {
    src: banner4,
    alt: "M3 Rental commercial trucks and equipment fleet in Houston",
  },
  {
    src: banner5,
    alt: "M3 Rental heavy machinery and construction equipment",
  },
  {
    src: banner6,
    alt: "M3 Rental site equipment and tools available for rent in Houston",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Infinite automated slideshow rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    if (touch) setTouchStart(touch.clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const touchEnd = touch.clientX;
    const diff = touchStart - touchEnd;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    setTouchStart(null);
  };

  return (
    <section
      className="relative isolate min-h-[75vh] sm:min-h-[80vh] lg:min-h-[85vh] overflow-hidden flex items-center py-14 sm:py-18 md:py-20 lg:py-24 rounded-[10px] border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.12)] mx-auto w-[calc(100%-16px)] sm:w-[calc(100%-30px)] mb-3 sm:mb-[15px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image Carousel (banner1, banner2, banner3) with smooth crossfade and Ken Burns zoom */}
      <div className="absolute inset-0 -z-20 overflow-hidden bg-slate-950">
        {heroBanners.map((banner, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={index}
              className={`absolute inset-0 size-full transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              aria-hidden={!isActive}
            >
              <img
                src={banner.src}
                alt={banner.alt}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className={`size-full object-cover object-center transform transition-transform duration-[7000ms] ease-out will-change-transform ${isActive ? "scale-105" : "scale-100"
                  }`}
              />
            </div>
          );
        })}
      </div>

      {/* Natural contrast scrim — ensures crisp text legibility without color tint */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/25 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/35 sm:to-transparent"
        aria-hidden="true"
      />

      <div className="w-full max-w-[94rem] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl xl:max-w-4xl">
          {/* Eyebrow Badge with 5 Stars like Brown project */}
          <span
            className="inline-flex flex-wrap sm:flex-nowrap items-center gap-1.5 max-w-full rounded-2xl sm:rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10.5px] sm:text-xs font-semibold text-white backdrop-blur-md shadow-xs mt-[60px]"
            style={{ marginTop: "60px" }}
          >
            <span className="flex text-amber-400 gap-0.5 shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3 sm:size-3.5 fill-current text-amber-400" />
              ))}
            </span>
            <span>The Right Place for Rent-to-Buy.</span>
          </span>

          {/* Main Headline */}
          <h1
            className="font-display font-extrabold tracking-tight text-white mt-[10px] leading-tight -mb-[15px]"
            style={{
              marginTop: "10px",
              marginBottom: "-15px",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.7)",
            }}
          >
            <strong className="font-black uppercase block text-[28px] sm:text-[38px] md:text-[45px] leading-[1.1] mb-2">
              NO CREDIT CARD REQUIRED!
            </strong>
            <span className="text-[#FACC15] block text-[20px] sm:text-[24px] md:text-[28px] leading-snug">
              Huston's RENT TO BUY Option For Tools & Midsize Equipment
            </span>
          </h1>

          {/* Description (Exact Brown project size: 13px -> 15px -> 17px, leading-relaxed) */}
          <p
            className="max-w-4xl xl:max-w-5xl mt-3 sm:mt-4 text-white text-[13px] sm:text-[15px] md:text-[17px] leading-relaxed md:leading-[36px] font-medium"
            style={{
              textShadow: "0 1px 6px rgba(0, 0, 0, 0.7)",
            }}
          >
            The Right Place for Rent-to-Buy.
            Flexible rentals for projects of every size, from small jobs to large-scale projects.
            No credit card or clear ID required. Rent-to-buy options offer flexibility and long-term value.{" "}

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
              className="btn-base bg-black/40 hover:bg-white text-white hover:text-[#0A1124] border border-white/35 backdrop-blur-md text-xs sm:text-sm font-extrabold uppercase tracking-wider w-full sm:w-auto justify-center transition-all shadow-sm"
            >
              <Phone className="size-4 text-[#4ADE80]" />
              Call {site.phone}
            </a>
          </div>

          {/* Trust Badges — Premium Glassmorphic Reassurance Pills */}
          <div className="mt-7 pt-5 border-t border-white/15 flex flex-nowrap sm:flex-wrap items-center gap-2 sm:gap-3.5 overflow-x-auto sm:overflow-visible hide-scrollbar pb-1 sm:pb-0">
            {/* Badge 1: Flexible Payment */}
            <div className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 shadow-xs transition-all duration-200 group">
              <span className="flex size-4 sm:size-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30 group-hover:scale-110 transition-transform">
                <ShieldCheck className="size-2.5 sm:size-3 text-amber-300" />
              </span>
              <span className="text-[10.5px] sm:text-[11.5px] md:text-xs font-semibold text-white/95 tracking-wide whitespace-nowrap">
                Cash • Zelle • Cash App
              </span>
            </div>

            {/* Badge 2: No Credit Card */}
            <div className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 shadow-xs transition-all duration-200 group">
              <span className="flex size-4 sm:size-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/30 group-hover:scale-110 transition-transform">
                <BadgeCheck className="size-2.5 sm:size-3 text-emerald-300" />
              </span>
              <span className="text-[10.5px] sm:text-[11.5px] md:text-xs font-semibold text-white/95 tracking-wide whitespace-nowrap">
                No Credit Card Required
              </span>
            </div>

            {/* Badge 3: Operator Available */}
            <div className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 shadow-xs transition-all duration-200 group">
              <span className="flex size-4 sm:size-5 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-sky-300 ring-1 ring-sky-400/30 group-hover:scale-110 transition-transform">
                <UserCheck className="size-2.5 sm:size-3 text-sky-300" />
              </span>
              <span className="text-[10.5px] sm:text-[11.5px] md:text-xs font-semibold text-white/95 tracking-wide whitespace-nowrap">
                Operator Available
              </span>
            </div>
          </div>
        </div>

        {/* Slider Controls — Premium Floating Pill */}
        <div className="mt-8 flex items-center justify-between sm:justify-end gap-3 pt-4 border-t border-white/10 lg:border-t-0 lg:pt-0 lg:mt-0 lg:absolute lg:bottom-0 lg:right-8 z-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 backdrop-blur-md px-3 py-1.5 shadow-xl">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous banner"
              className="flex size-7 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-1 focus:ring-white/40 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Dots / Indicators */}
            <div className="flex items-center gap-1.5 px-1">
              {heroBanners.map((_, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to banner ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${isActive
                      ? "w-7 bg-gradient-to-r from-[#4ADE80] to-[#60A5FA] shadow-[0_0_8px_rgba(74,222,128,0.7)]"
                      : "w-2 bg-white/40 hover:bg-white/70"
                      }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next banner"
              className="flex size-7 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-1 focus:ring-white/40 cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>

            <span className="text-[11px] font-bold text-white/90 pl-1 pr-1 tabular-nums border-l border-white/15">
              0{currentSlide + 1} / 0{heroBanners.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
