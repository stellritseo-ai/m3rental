import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Mail, MapPin, Navigation, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { RentalRequestForm } from "@/components/site/RentalRequestForm";
import { Reveal } from "@/components/site/Reveal";
import { directionsUrl, mapEmbedUrl, site } from "@/lib/site";
import { cleanSearch, readString } from "@/lib/search";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { equipment?: string } =>
    cleanSearch({ equipment: readString(search, "equipment") }),
  head: () => ({
    meta: [
      { title: "Contact M3 Rental | Request Equipment in Houston, TX" },
      {
        name: "description",
        content:
          "Request equipment from M3 Rental in Houston. Call (281) 933-5000 or send a rental request with your equipment, dates and operator needs.",
      },
      { property: "og:title", content: "Contact M3 Rental | Houston, TX" },
      {
        property: "og:description",
        content:
          "Tell M3 Rental what equipment you need and we'll help with availability and rental details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { equipment } = Route.useSearch();

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact M3 Rental"
        title="Ready to Rent Your Equipment?"
        description="Tell us what equipment you need and our Houston team will immediately confirm availability and rental arrangements."
      />

      <section className="section-pad bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-[1.35fr_1fr]">
          <Reveal className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#0040DD] shadow-xs mb-3">
              <Sparkles className="size-3.5 text-[#0040DD]" />
              <span>Rental Request</span>
              <Sparkles className="size-3.5 text-[#0040DD]" />
            </div>
            <h2 className="display-lg text-slate-900 font-black tracking-tight leading-tight">
              Submit Your Rental Request
            </h2>
            <p className="mt-2 text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
              Fill in your details below and we will get back to you with instant machine availability.
            </p>
            <div className="mt-7">
              <RentalRequestForm defaultEquipment={equipment ?? ""} />
            </div>
          </Reveal>

          <Reveal delay={120} className="flex flex-col gap-4">
            <a
              href={site.phoneHref}
              className="card-premium flex items-start gap-4 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-lg transition-all"
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200/60">
                <Phone className="size-6" />
              </div>
              <span>
                <span className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Phone (Direct)
                </span>
                <span className="mt-1 block font-display text-2xl font-bold text-slate-900">
                  {site.phone}
                </span>
                <span className="text-xs font-semibold text-[#16A34A]">Mon–Sat: 7:00 AM – 7:00 PM</span>
              </span>
            </a>

            <a
              href={site.emailHref}
              className="card-premium flex items-start gap-4 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-lg transition-all"
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#0040DD] border border-blue-200/60">
                <Mail className="size-6" />
              </div>
              <span className="min-w-0">
                <span className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Email
                </span>
                <span className="mt-1 block break-all font-display text-xl font-bold text-slate-900">
                  {site.email}
                </span>
                <span className="text-xs font-semibold text-[#0040DD]">Fast email response</span>
              </span>
            </a>

            <div className="card-premium flex items-start gap-4 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-50 text-[#F59E0B] border border-amber-200/60">
                <MapPin className="size-6" />
              </div>
              <span>
                <span className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  Houston Yard & Office
                </span>
                <span className="mt-1 block font-display text-lg font-bold text-slate-900">
                  {site.street}
                  <br />
                  {site.city}
                </span>
              </span>
            </div>

            {/* Payment banner matching brown high-trust card */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/50 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[#16A34A] text-xs font-extrabold uppercase tracking-wider">
                <ShieldCheck className="size-4" />
                <span>Payment Flexibility</span>
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900">
                Cash • Zelle • Cash App • Stripe
              </p>
              <p className="mt-1.5 text-xs text-slate-600 font-semibold">
                No traditional credit card required. Transparent flat daily and weekly pricing.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-slate-50/80 border-t border-slate-200/70 section-pad">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#0040DD] shadow-xs">
                <Navigation className="size-3 text-[#0040DD]" />
                <span>Visit Us</span>
              </div>
              <h2 className="display-lg mt-3 text-slate-900 font-extrabold tracking-tight">
                M3 Rental Houston Yard
              </h2>
              <p className="mt-2 font-semibold text-slate-700">
                {site.street}, {site.city}
              </p>
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-base btn-primary font-bold shadow-md hover:shadow-lg"
            >
              <Navigation className="size-4" />
              <span>Get Directions</span>
            </a>
          </div>
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl bg-white p-2">
            <iframe
              title="Map showing M3 Rental in Houston, Texas"
              src={mapEmbedUrl}
              loading="lazy"
              className="h-[380px] w-full rounded-2xl lg:h-[460px] border-0"
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
