import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Phone, Sparkles, UserRound } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EquipmentCard } from "@/components/site/EquipmentCard";
import { Reveal } from "@/components/site/Reveal";
import {
  categoryLabel,
  getEquipment,
  operatorLabel,
  relatedEquipment,
} from "@/data/equipment";
import { site } from "@/lib/site";

export const Route = createFileRoute("/equipment/$slug")({
  loader: ({ params }) => {
    const item = getEquipment(params.slug);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    const item = loaderData?.item;
    const title = item
      ? `${item.name} Rental — $${item.dayRate}/day | M3 Rental Houston`
      : "Equipment Rental | M3 Rental Houston";
    const description = item
      ? `${item.summary} Rent from M3 Rental in Houston, TX for $${item.dayRate} per day. Cash, Zelle, Cash App and Stripe accepted.`
      : "Equipment rental in Houston, TX from M3 Rental.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: EquipmentDetailPage,
});

function EquipmentDetailPage() {
  const { item } = Route.useLoaderData();
  const related = relatedEquipment(item);
  const withOperator = item.operator !== "self";

  return (
    <SiteLayout>
      {/* Product Header / Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200/80 py-12 sm:py-14 lg:py-16">
        {/* Soft background glows */}
        <div className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-[#0040DD]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-[#16A34A]/10 blur-3xl" />

        <div className="container-x relative">
          <Link
            to="/equipment"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-[#0040DD]"
          >
            <ArrowLeft className="size-4" /> All equipment catalog
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14 items-center">
            {/* Image Preview Container */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl bg-white p-3">
              <img
                src={item.image}
                alt={`${item.name} — ${item.type} available for rent in Houston from M3 Rental`}
                width={1280}
                height={960}
                className="w-full rounded-2xl object-cover"
              />
              <span className="absolute left-6 top-6 rounded-full bg-[#F59E0B] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-slate-900 shadow-sm">
                {withOperator ? operatorLabel[item.operator] : "Available Now"}
              </span>
            </div>

            {/* Info Column */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#0040DD] shadow-xs">
                <Sparkles className="size-3.5 text-[#0040DD]" />
                <span>{categoryLabel(item.category)}</span>
              </div>

              <h1 className="font-display text-[26px] sm:text-[34px] md:text-[40px] font-black tracking-tight leading-tight text-slate-900 mt-4">
                {item.name}
              </h1>

              <p className="mt-2 text-base font-semibold text-slate-500">
                {item.year ? `${item.year} • ` : ""}
                {item.type}
                {item.color ? ` • ${item.color}` : ""}
              </p>

              <div className="mt-7 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <p className="leading-none">
                  <span className="font-display text-5xl sm:text-6xl font-extrabold text-[#0040DD]">
                    ${item.dayRate}
                  </span>
                  <span className="ml-2 text-lg font-bold text-slate-500">
                    / day
                  </span>
                </p>
                {item.monthRate && (
                  <p className="font-display text-2xl font-bold text-[#16A34A]">
                    ${item.monthRate}
                    <span className="text-sm font-semibold text-slate-500"> / month</span>
                  </p>
                )}
              </div>

              {withOperator && (
                <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs sm:text-sm font-bold text-[#15803D]">
                  <UserRound className="size-4 text-[#16A34A]" />
                  {operatorLabel[item.operator]} included at standard rental rate
                </p>
              )}

              <p className="mt-6 text-base text-slate-600 font-medium leading-relaxed">
                {item.summary}
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <Link
                  to="/contact"
                  search={{ equipment: item.name }}
                  className="btn-base btn-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg"
                >
                  Request This Equipment
                </Link>
                <a
                  href={site.phoneHref}
                  className="btn-base btn-outline text-xs sm:text-sm font-extrabold uppercase tracking-wider hover:border-[#0040DD] hover:text-[#0040DD]"
                >
                  <Phone className="size-4 text-[#16A34A]" />
                  Call {site.phone}
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 mr-1">Accepted:</span>
                {site.payments.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications & Features */}
      <section className="section-pad bg-white">
        <div className="container-x grid gap-8 lg:grid-cols-3">
          <Reveal className="card-premium p-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
            <h2 className="font-display text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              Machine Specifications
            </h2>
            <dl className="mt-4 space-y-3 text-sm font-medium">
              <Spec label="Category" value={categoryLabel(item.category)} />
              <Spec label="Type" value={item.type} />
              {item.year && <Spec label="Year" value={String(item.year)} />}
              {item.color && <Spec label="Color" value={item.color} />}
              <Spec label="Daily rate" value={`$${item.dayRate} / day`} />
              {item.monthRate && (
                <Spec label="Monthly rate" value={`$${item.monthRate} / month`} />
              )}
              <Spec label="Operation" value={operatorLabel[item.operator]} />
            </dl>
          </Reveal>

          <Reveal delay={90} className="card-premium p-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
            <h2 className="font-display text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              Included Features
            </h2>
            <ul className="mt-4 space-y-3 text-sm font-medium">
              {item.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#16A34A]" />
                  <span className="text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={180} className="card-premium p-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
            <h2 className="font-display text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              Rental Information
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 font-medium">
              <li>✓ Available for daily, weekly, or monthly duration.</li>
              <li>✓ Cash, Zelle, Cash App, and Stripe cards accepted.</li>
              <li>✓ No traditional credit card required.</li>
              <li>
                ✓ Call M3 Rental at{" "}
                <a href={site.phoneHref} className="font-bold text-[#0040DD] hover:underline">
                  {site.phone}
                </a>{" "}
                for instant availability confirmation.
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Related Equipment */}
      <section className="bg-slate-50/80 border-t border-slate-200/70 section-pad">
        <div className="container-x">
          <h2 className="display-lg text-slate-900 font-black tracking-tight leading-tight">
            Related Equipment Options
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel, index) => (
              <Reveal key={rel.slug} delay={index * 80}>
                <EquipmentCard item={rel} className="h-full" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2.5 last:border-0">
      <dt className="text-slate-500 font-medium">{label}</dt>
      <dd className="text-right font-bold text-slate-900">{value}</dd>
    </div>
  );
}
