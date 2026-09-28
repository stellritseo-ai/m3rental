import {
  BadgeCheck,
  CheckCircle2,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

interface Review {
  name: string;
  role: string;
  location: string;
  equipment: string;
  rating: number;
  initials: string;
  avatarGradient: string;
  tagBg: string;
  text: string;
  badge: string;
}

const reviewsRow1: Review[] = [
  {
    name: "Marcus R.",
    role: "General Contractor",
    location: "Houston, TX",
    equipment: "Dump Trailer & Skid Steer",
    rating: 5,
    initials: "MR",
    avatarGradient: "from-[#0040DD] to-[#1E40AF]",
    tagBg: "bg-blue-50 text-[#0040DD] border-blue-200/70",
    text: "M3 Rental made our site cleanup seamless. The 14K dump trailer was in pristine condition, paying with Zelle saved us accounting hassle, and yard turnaround was 10x faster than national chains.",
    badge: "Commercial Contractor",
  },
  {
    name: "David T.",
    role: "Landscaping Director",
    location: "Katy / West Houston",
    equipment: "John Deere Backhoe + Operator",
    rating: 5,
    initials: "DT",
    avatarGradient: "from-[#16A34A] to-[#15803D]",
    tagBg: "bg-emerald-50 text-[#16A34A] border-emerald-200/70",
    text: "Hiring equipment with a certified operator saved our crew 3 full days of manual trenching. Punctual, safe, and highly skilled driver. M3 is our permanent equipment partner.",
    badge: "Turnkey Operator Hire",
  },
  {
    name: "Elena G.",
    role: "Property Manager",
    location: "Sugar Land, TX",
    equipment: "Gooseneck Flatbed & Ram 3500",
    rating: 5,
    initials: "EG",
    avatarGradient: "from-amber-500 to-amber-700",
    tagBg: "bg-amber-50 text-amber-800 border-amber-200/70",
    text: "Straightforward daily rates without hidden surprises. The pickup was ready right when promised at their S Wilcrest yard. Responsive communication and very flexible payment options.",
    badge: "Fleet Rental",
  },
  {
    name: "Carlos M.",
    role: "Civil Subcontractor",
    location: "Southwest Houston",
    equipment: "35ft Bucket Truck",
    rating: 5,
    initials: "CM",
    avatarGradient: "from-[#0040DD] to-[#0D9488]",
    tagBg: "bg-cyan-50 text-cyan-800 border-cyan-200/70",
    text: "When our utility boom truck broke down mid-project, M3 arranged a ready-to-work unit within 90 minutes. Paying with Cash App and debit card made booking frictionless.",
    badge: "Emergency Dispatch",
  },
];

const reviewsRow2: Review[] = [
  {
    name: "Jason B.",
    role: "Independent Hotshot Driver",
    location: "Pasadena / Baytown",
    equipment: "24ft Enclosed Cargo Trailer",
    rating: 5,
    initials: "JB",
    avatarGradient: "from-[#16A34A] to-[#047857]",
    tagBg: "bg-emerald-50 text-[#16A34A] border-emerald-200/70",
    text: "Renting heavy haulers without getting trapped in week-long credit walls is a game changer for independent drivers. Solid axles, fresh tires, and honest staff.",
    badge: "Independent Hauler",
  },
  {
    name: "Sofia L.",
    role: "Corporate Logistics Lead",
    location: "Houston Galleria",
    equipment: "15-Passenger Van & LED Trailer",
    rating: 5,
    initials: "SL",
    avatarGradient: "from-indigo-600 to-[#0040DD]",
    tagBg: "bg-indigo-50 text-indigo-800 border-indigo-200/70",
    text: "Spotless vehicle interior and smooth mechanical condition. Picked up Saturday morning, returned Monday with zero delays. Great customer service from start to finish.",
    badge: "Verified Client",
  },
  {
    name: "Travis W.",
    role: "Concrete & Paving Foreman",
    location: "East Houston",
    equipment: "Komatsu Mini Excavator",
    rating: 5,
    initials: "TW",
    avatarGradient: "from-[#F59E0B] to-[#B45309]",
    tagBg: "bg-amber-50 text-amber-800 border-amber-200/70",
    text: "Top-tier machinery and zero bureaucratic runaround. Had an excavator and operator at our jobsite at 6:30 AM sharp. Outstanding reliability and clean machinery.",
    badge: "Jobsite Ready",
  },
  {
    name: "Ramon V.",
    role: "Commercial Roofing Lead",
    location: "Spring / Woodlands",
    equipment: "Chevy 2500 & Utility Trailer",
    rating: 5,
    initials: "RV",
    avatarGradient: "from-[#0040DD] to-[#2563EB]",
    tagBg: "bg-blue-50 text-[#0040DD] border-blue-200/70",
    text: "Clean 3/4 ton truck and trailer combo ready within 20 minutes of booking. No corporate credit card walls. Fast check-out on Wilcrest Dr. Highly recommended.",
    badge: "Commercial Roofing",
  },
];

function ReviewCard({ rev }: { rev: Review }) {
  return (
    <div className="w-[285px] xs:w-[330px] sm:w-[380px] md:w-[410px] shrink-0 p-5 sm:p-6 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[#0040DD]/30 transition-all duration-200 shadow-[0_2px_10px_-3px_rgba(15,23,42,0.04)] hover:shadow-md flex flex-col justify-between min-h-[230px] sm:min-h-[245px] select-none">
      <div>
        {/* Top Header: Stars & Equipment tag */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex text-amber-400 gap-0.5">
            {[...Array(rev.rating)].map((_, i) => (
              <Star
                key={i}
                className="size-4 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${rev.tagBg}`}
          >
            <Truck className="size-3 shrink-0" />
            <span className="truncate max-w-[170px]">{rev.equipment}</span>
          </span>
        </div>

        {/* Quote text */}
        <p className="text-slate-700 text-[13px] sm:text-[13.5px] leading-relaxed font-medium mb-4 line-clamp-4">
          "{rev.text}"
        </p>
      </div>

      {/* Author Bar */}
      <div className="flex items-center justify-between gap-2 pt-3.5 mt-auto border-t border-slate-200/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`size-9 rounded-full bg-gradient-to-br ${rev.avatarGradient} flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-2xs`}
          >
            {rev.initials}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-[13px] text-slate-900 leading-tight truncate">
              {rev.name}
            </p>
            <p className="text-[11px] text-slate-500 font-medium leading-tight truncate">
              {rev.role} • {rev.location}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider text-[#16A34A] bg-[#16A34A]/8 border border-[#16A34A]/20 px-2 py-0.5 rounded-md shrink-0">
          <BadgeCheck className="size-3" />
          <span>{rev.badge}</span>
        </span>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
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
        <Reveal className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#16A34A]/30 bg-[#16A34A]/8 text-[#16A34A] text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs select-none">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
            </span>
            <span>Verified Customer Reviews</span>
            <Sparkles className="size-3 text-[#16A34A]" />
          </div>

          <h2 className="text-slate-900 font-black tracking-tight leading-[1.18] text-[24px] sm:text-[30px] lg:text-[36px] font-display mt-0 mb-3">
            Trusted by Houston{" "}
            <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
              Crews & Contractors.
            </span>
          </h2>

          <p
            className="text-slate-500 text-[14px] sm:text-[15px] leading-relaxed font-medium max-w-xl mx-auto mb-[-12px] sm:mb-[-40px]"
            style={{ marginTop: "-5px" }}
          >
            Real feedback from commercial builders, landscapers, utility operators, and local Houston businesses who count on M3 Rental every day.
          </p>
        </Reveal>

        {/* ── Overall Rating Banner Strip ── */}
        <Reveal delay={60} className="mb-[10px]">
          <div
            className="rounded-xl bg-slate-50/80 border border-slate-200/80 px-5 py-3.5 sm:px-6 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto"
            style={{ marginBottom: "0px" }}
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display leading-none">
                4.9<span className="text-sm text-slate-400 font-bold">/5</span>
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-600 font-semibold">
                  Over 140+ Houston Contractor Rentals
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap items-start sm:items-center justify-center gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 text-xs sm:text-[12.5px] font-bold text-slate-700 md:whitespace-nowrap">
              <div className="flex items-center gap-1.5 shrink-0 sm:whitespace-nowrap">
                <CheckCircle2 className="size-4 text-[#16A34A] shrink-0" />
                <span>100% On-Time Yard Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 sm:whitespace-nowrap">
                <CheckCircle2 className="size-4 text-[#16A34A] shrink-0" />
                <span>$0 Mandatory Credit Card</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 sm:whitespace-nowrap">
                <CheckCircle2 className="size-4 text-[#16A34A] shrink-0" />
                <span>Inspected & Job-Ready</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Sliding Testimonials Marquee (Two Rows) ── */}
        <Reveal delay={100} className="relative overflow-hidden py-3 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="pause-on-hover relative">
            {/* Edge gradient fade masks */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10"
            />

            {/* Row 1: Slide Right to Left */}
            <div className="flex gap-4 sm:gap-5 mb-4 sm:mb-5 animate-marquee-left">
              {[...reviewsRow1, ...reviewsRow1, ...reviewsRow1].map((rev, index) => (
                <ReviewCard key={`row1-${rev.name}-${index}`} rev={rev} />
              ))}
            </div>

            {/* Row 2: Slide Left to Right */}
            <div className="flex gap-4 sm:gap-5 animate-marquee-right">
              {[...reviewsRow2, ...reviewsRow2, ...reviewsRow2].map((rev, index) => (
                <ReviewCard key={`row2-${rev.name}-${index}`} rev={rev} />
              ))}
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
