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

export const Route = createFileRoute("/")({
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
  return (
    <SiteLayout>
      <HeroSection />
      <AboutSection />
      {/* <HeroStatsSection /> */}
      {/* <QuickSearchSection /> */}
      <FeaturedSection />
      {/* <SpotlightSection /> */}
      <CategoriesSection />
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
