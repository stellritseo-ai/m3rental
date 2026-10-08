import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HelpCircle, Phone, Sparkles } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { site } from "@/lib/site";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Rental FAQ | M3 Rental Houston Equipment Rentals" },
      {
        name: "description",
        content:
          "Answers about M3 Rental payments, operator-included equipment, rental periods, availability and our Houston location.",
      },
      { property: "og:title", content: "Rental FAQ | M3 Rental Houston" },
      {
        property: "og:description",
        content:
          "Payments, driver/operator options, rental periods and how to reserve equipment with M3 Rental.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

export const faqs = [
  {
    q: "Do I need a credit card to rent equipment?",
    a: "No! M3 Rental makes equipment accessible without requiring a traditional credit card. You can rent easily using alternative convenient payment methods.",
  },
  {
    q: "What forms of payment do you accept?",
    a: "We accept Cash, Zelle, Cash App, and Stripe (major debit/credit cards).",
  },
  { q: "Do you accept cash?", a: "Yes, cash payments are accepted upon pickup or scheduled delivery." },
  { q: "Do you accept Zelle?", a: "Yes, instant fee-free Zelle bank transfers are fully accepted." },
  { q: "Do you accept Cash App?", a: "Yes, Cash App payments are welcomed and processed smoothly." },
  { q: "Can I pay through Stripe?", a: "Yes, secure card transactions can be processed via Stripe." },
  {
    q: "Do you provide drivers or operators?",
    a: "Yes! Selected machinery and heavy vehicles can be rented with a certified, experienced driver or operator.",
  },
  {
    q: "Is the driver/operator included in the rental price?",
    a: "On eligible equipment listings marked 'Operator Available', the professional operator is provided at the standard rental price with no surprise add-on charges.",
  },
  {
    q: "How many pieces of equipment do you have?",
    a: "M3 Rental offers 70+ rental options spanning work trucks, utility trailers, dump trailers, excavators, loaders, tractors, and specialty machinery.",
  },
  {
    q: "Where are you located in Houston?",
    a: `Our main yard is centrally located in Houston at ${site.street}, ${site.city}, easily accessible from major highways.`,
  },
  {
    q: "Can I rent equipment for multiple days?",
    a: "Yes. Equipment is available on a daily rate and can be booked for multiple consecutive days or weekly blocks.",
  },
  {
    q: "Do you offer monthly rentals?",
    a: "Yes, discounted monthly rental pricing is available on most equipment lines.",
  },
  {
    q: "How do I check equipment availability?",
    a: `Contact our team at ${site.phone} or submit a rental request online, and we will confirm machine readiness immediately.`,
  },
  {
    q: "How do I reserve equipment?",
    a: "Simply pick your equipment, contact us to confirm your dates, and select your preferred payment method.",
  },
];

function FaqPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Rental Information"
        title="Frequently Asked Questions"
        description="Everything you need to know about payments, available operators, rental periods, and reserving machinery with M3 Rental."
      />

      <section className="section-pad bg-white">
        <div className="container-x max-w-3xl">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((item, index) => (
              <AccordionItem
                key={item.q}
                value={`item-${index}`}
                className="bg-slate-50/70 border border-slate-200/90 rounded-2xl px-4 sm:px-6 py-1 shadow-xs transition-colors hover:border-[#0040DD]/30"
              >
                <AccordionTrigger className="text-left font-display text-base sm:text-lg font-bold text-slate-900 hover:text-[#0040DD] transition-colors py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Light Theme "Still have questions" Card */}
          <div className="mt-14 rounded-3xl border border-slate-200/90 bg-gradient-to-br from-blue-50/70 via-white to-emerald-50/70 p-5 sm:p-10 lg:p-12 text-center shadow-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#0040DD] shadow-xs mb-3">
              <HelpCircle className="size-3.5 text-[#0040DD]" />
              <span>We're Here to Help</span>
            </div>
            <h2 className="display-lg text-slate-900 font-black tracking-tight leading-tight">
              Still Have Questions?
            </h2>
            <p className="mt-3 text-[13.5px] sm:text-base text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
              Talk directly with M3 Rental in Houston about your project, dates, and equipment requirements.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              <a href={site.phoneHref} className="btn-base btn-primary text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-md">
                <Phone className="size-4" />
                Call {site.phone}
              </a>
              <Link to="/contact" search={{}} className="btn-base btn-outline text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                <span>Request Rental Online</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
