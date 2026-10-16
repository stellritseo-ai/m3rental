import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site";
import {
  HeroSection,
  HeroStatsSection,
  QuickSearchSection,
  FeaturedSection,
  SpotlightSection,
  CategoriesSection,
  OperatorSection,
  WhyM3Section,
  PaymentsSection,
  HowItWorksSection,
  UseCasesSection,
  CinematicCtaSection,
  AboutSection,
  TestimonialsSection,
  FaqSection,
  LocationSection,
} from "@/components/home";

import type { Equipment } from "@/data/equipment";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const { getEquipmentDb } = await import("@/lib/api/equipment.functions");
      const res = await getEquipmentDb();
      return { fleet: (res?.equipment || []) as Equipment[] };
    } catch {
      return { fleet: [] as Equipment[] };
    }
  },
  head: () => ({
    meta: [
      { title: "M3 Rental | Equipment & Vehicle Rentals in Houston, TX" },
      {
        name: "description",
        content:
          "M3 Rental rents trucks, trailers, construction, utility and specialty equipment in Houston, TX. 70+ rental options, operator available, Cash/Zelle/Cash App/Stripe accepted.",
      },
      {
        property: "og:title",
        content: "M3 Rental | Equipment & Vehicle Rentals in Houston, TX",
      },
      {
        property: "og:description",
        content:
          "The equipment you need, when you need it. 70+ rental options in Houston with flexible payments and operator-supported machinery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { fleet } = Route.useLoaderData();

  return (
    <SiteLayout>
      <HeroSection />
      <AboutSection />
      {/* <HeroStatsSection /> */}
      {/* <QuickSearchSection /> */}
      <FeaturedSection initialFleet={fleet} />
      {/* <SpotlightSection /> */}
      <CategoriesSection initialFleet={fleet} />
      {/* <OperatorSection /> */}
      <WhyM3Section />
      {/* <PaymentsSection /> */}
      <HowItWorksSection />
      {/* <UseCasesSection /> */}
      {/* <CinematicCtaSection /> */}
      <TestimonialsSection />
      <FaqSection />
      <LocationSection />
    </SiteLayout>
  );
}
