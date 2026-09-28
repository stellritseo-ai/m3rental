import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Phone, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/lib/site";
import heroSite from "@/assets/hero-site.jpg";
import operatorImg from "@/assets/operator.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About M3 Rental | Houston Equipment Rental Company" },
      {
        name: "description",
        content:
          "M3 Rental provides vehicles, trailers, construction and specialty equipment rentals throughout Houston and surrounding areas, with flexible payment options.",
      },
      { property: "og:title", content: "About M3 Rental | Houston, TX" },
      {
        property: "og:description",
        content:
          "Equipment that helps you get the job done — 70+ rental options in Houston, Texas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const points = [
  {
    title: "70+ Rental Options",
    body: "A growing inventory of vehicles, trucks, trailers, construction, and specialty equipment.",
    color: "text-[#0040DD]",
    bg: "bg-blue-50 border-blue-200/60",
  },
  {
    title: "Flexible Payments",
    body: "Cash, Zelle, Cash App, and Stripe accepted — no traditional credit card required.",
    color: "text-[#16A34A]",
    bg: "bg-emerald-50 border-emerald-200/60",
  },
  {
    title: "Driver & Operator Options",
    body: "Selected equipment can be rented with a professional driver or operator at the same rental price.",
    color: "text-[#F59E0B]",
    bg: "bg-amber-50 border-amber-200/60",
  },
  {
    title: "Houston Based",
    body: `Conveniently located at ${site.street}, ${site.city} for quick regional dispatch.`,
    color: "text-[#0040DD]",
    bg: "bg-blue-50 border-blue-200/60",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About M3 Rental"
        title="Equipment That Helps You Get the Job Done."
        description="M3 Rental provides vehicles, trailers, construction equipment and specialty equipment for contractors and homeowners throughout Houston and surrounding Texas areas."
      />

      {/* Approach Section */}
      <section className="section-pad bg-white">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="media-zoom overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl p-2 bg-gradient-to-b from-white to-slate-50">
            <img
              src={heroSite}
              alt="M3 Rental equipment working on a Houston construction site"
              loading="lazy"
              width={1920}
              height={1088}
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          </Reveal>
          <Reveal delay={100}>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#0040DD] shadow-xs">
              <Sparkles className="size-3.5 text-[#0040DD]" />
              <span>Our Mission</span>
              <Sparkles className="size-3.5 text-[#0040DD]" />
            </div>
            <h2 className="display-lg mt-3 text-slate-900 font-black tracking-tight leading-tight">
              Rental Made{" "}
              <span className="bg-gradient-to-r from-[#0040DD] to-[#16A34A] bg-clip-text text-transparent">
                Accessible
              </span>
            </h2>
            <p className="mt-4 text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
              Our goal is simple: make equipment rental more accessible, flexible, and
              straightforward. From work trucks and trailers to specialty equipment
              and operator-supported machinery, we help Houston crews get moving
              without unnecessary delays or restrictive paperwork.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {points.map((point) => (
                <div
                  key={point.title}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5"
                >
                  <h3 className={`font-display text-base font-bold ${point.color}`}>
                    {point.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-600 leading-relaxed">
                    {point.body}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/equipment" className="btn-base btn-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-md">
                Browse Equipment
                <ArrowRight className="size-4" />
              </Link>
              <a href={site.phoneHref} className="btn-base btn-outline text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                <Phone className="size-4 text-[#16A34A]" />
                Call {site.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Operator Experience Section */}
      <section className="bg-slate-50/80 border-t border-slate-200/70 section-pad">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#15803D] shadow-xs">
              <UserCheck className="size-3.5 text-[#16A34A]" />
              <span>Operator Included</span>
            </div>
            <h2 className="display-lg mt-3 text-slate-900 font-black tracking-tight leading-tight">
              Equipment and Experience{" "}
              <span className="bg-gradient-to-r from-[#16A34A] to-[#0040DD] bg-clip-text text-transparent">
                Together
              </span>
            </h2>
            <p className="mt-4 text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
              Selected equipment can be rented with a professional driver or operator
              at the same rental price — arrive, operate, and get the job moving safely.
            </p>
            <Link
              to="/equipment"
              search={{ operator: "with" }}
              className="btn-base btn-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider mt-8 shadow-md"
            >
              <span>Explore Operator Equipment</span>
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <Reveal delay={100} className="media-zoom overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl p-2 bg-white">
            <img
              src={operatorImg}
              alt="Professional operator running a backhoe loader on a jobsite"
              loading="lazy"
              width={1280}
              height={960}
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
