import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Phone,
  Sparkles,
  Star,
  Truck,
  UserCheck,
  WalletCards,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/lib/site";
import welcomeVideo from "@/assets/welcome.mp4";

export function AboutSection() {
  const valueProps = [
    {
      icon: WalletCards,
      title: "Flexible Payment Options",
      desc: "Cash, Zelle, Cash App & Stripe accepted. No mandatory credit cards.",
      iconColor: "text-[#F59E0B]",
      bgColor: "bg-amber-50 border-amber-200/60",
    },
    {
      icon: UserCheck,
      title: "Operator-Supported Equipment",
      desc: "Skilled operators available for backhoes, excavators & complex machinery.",
      iconColor: "text-[#0040DD]",
      bgColor: "bg-blue-50 border-blue-200/60",
    },
    {
      icon: Clock,
      title: "Fast Same-Day Availability",
      desc: "Quick yard pickup on Wilcrest Dr. or delivery across greater Houston.",
      iconColor: "text-[#16A34A]",
      bgColor: "bg-emerald-50 border-emerald-200/60",
    },
    {
      icon: Truck,
      title: "70+ Diverse Rental Fleet",
      desc: "Half-ton to 1-ton trucks, dump trailers, passenger vans & earthmovers.",
      iconColor: "text-[#0040DD]",
      bgColor: "bg-blue-50 border-blue-200/60",
    },
  ];


  return (
    <section
      className="relative overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] rounded-[10px] py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 mx-auto my-3 sm:my-[15px] w-[calc(100%-16px)] sm:w-[calc(100%-30px)] max-w-[94rem] transition-all duration-300"
    >
      {/* Ambient background glow blooms */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#0040DD]/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-[#16A34A]/5 blur-3xl" />
      </div>

      <div className="w-full max-w-[94rem] mx-auto relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14 items-center">
          {/* ── LEFT COLUMN: Multi-Layered Visual Presentation ── */}
          <div className="lg:col-span-5 relative">
            <Reveal className="relative">
              {/* Top-Right Floating Rating Badge */}
              <div className="absolute top-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 rounded-full bg-[#0A1124]/90 border border-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                <span className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3 fill-current text-amber-400" />
                  ))}
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">
                  Houston, TX
                </span>
              </div>

              {/* Main Video Showcase Frame */}
              <div className="overflow-hidden rounded-[10px] border border-slate-200/90 shadow-xl p-2 bg-gradient-to-b from-white via-slate-50 to-slate-100 group relative">
                <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[7/8] w-full rounded-[8px] overflow-hidden bg-slate-950">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  >
                    <source src={welcomeVideo} type="video/mp4" />
                  </video>
                  {/* Subtle cinematic vignette overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/15" />
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── RIGHT COLUMN: Content, Value Propositions & Metrics ── */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <Reveal delay={80}>
              {/* Eyebrow Badge */}
              <span className="inline-flex items-center gap-2 rounded-full border border-[#0040DD]/20 bg-blue-50/80 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-[#0040DD] shadow-2xs">
                <Sparkles className="size-3.5 text-[#0040DD]" />
                <span>About M3 Rental Houston</span>
              </span>

              {/* Main Headline */}
              <h2
                className="text-[25px] sm:text-[28px] lg:text-[34px] font-display font-black tracking-tight leading-[1.2] sm:leading-[1.25] text-slate-900"
                style={{ marginTop: "10px", marginBottom: "-10px" }}
              >
                Houston's Direct Partner For{" "}
                <span className="bg-gradient-to-r from-[#0040DD] via-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                  Equipment & Work Vehicles.
                </span>
              </h2>

              {/* Narrative Story Copy */}
              <div className="mt-4 space-y-3 text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
                <p>
                  M3 Rental was established to solve a common Texas contractor frustration: corporate rental chains with rigid qualification hurdles, slow turnarounds, and hidden fees. We built our yard to make commercial equipment and heavy haulers accessible when your project can't wait.
                </p>
                <p>
                  From heavy-duty pickups and gooseneck trailers to excavators paired with seasoned machine operators, our fleet is rigorously maintained and ready for immediate deployment across greater Houston and neighboring Texas communities.
                </p>
              </div>

              {/* 4 Value Proposition Bento Cards */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {valueProps.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="group flex items-start gap-3 rounded-[10px] border border-slate-200/80 bg-slate-50/60 p-3.5 hover:bg-white hover:border-[#0040DD]/40 hover:shadow-xs transition-all duration-200"
                    >
                      <div
                        className={`size-9 rounded-lg border ${item.bgColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                      >
                        <Icon className={`size-4.5 ${item.iconColor}`} />
                      </div>
                      <div className="flex flex-col min-w-0 pr-1">
                        <span className="text-xs sm:text-[13px] font-extrabold text-slate-900 leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[11px] sm:text-xs text-slate-600 font-medium leading-normal mt-1">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>


              {/* Action CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/about"
                  className="btn-base btn-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider w-full sm:w-auto justify-center shadow-md hover:shadow-lg"
                >
                  <span>Learn More About Us</span>
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href={site.phoneHref}
                  className="btn-base btn-outline text-xs sm:text-sm font-extrabold uppercase tracking-wider w-full sm:w-auto justify-center hover:border-[#0040DD] hover:text-[#0040DD]"
                >
                  <Phone className="size-4 text-[#16A34A]" />
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
