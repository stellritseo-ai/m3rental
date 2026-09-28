import imgSedanBlack from "@/assets/eq-sedan-black.jpg";
import imgMidsizePickup from "@/assets/eq-midsize-pickup.jpg";
import imgCrossoverWagon from "@/assets/eq-crossover-wagon.jpg";
import imgShuttleBus from "@/assets/eq-shuttle-bus.jpg";
import imgCompactSuv from "@/assets/eq-compact-suv.jpg";
import imgLuxurySedan from "@/assets/eq-luxury-sedan.jpg";
import imgBucketTruck from "@/assets/eq-bucket-truck.jpg";
import imgTundraTrd from "@/assets/eq-tundra-trd.jpg";
import imgDuneBuggy from "@/assets/eq-dune-buggy.jpg";
import imgTractorBackhoe from "@/assets/eq-tractor-backhoe.jpg";
import imgFullsizePickupWhite from "@/assets/eq-fullsize-pickup-white.jpg";
import imgLedTrailer from "@/assets/eq-led-trailer.jpg";
import imgCargoTrailer from "@/assets/eq-cargo-trailer.jpg";
import imgVintageRv from "@/assets/eq-vintage-rv.jpg";
import imgEquipmentTrailer from "@/assets/eq-equipment-trailer.jpg";

export type CategoryId =
  | "cars"
  | "suvs"
  | "pickup-trucks"
  | "trucks"
  | "buses"
  | "trailers"
  | "construction-equipment"
  | "utility-equipment"
  | "specialty-equipment";

export type OperatorOption = "self" | "operator" | "driver" | "driver-operator";

export type Equipment = {
  slug: string;
  name: string;
  year?: string;
  category: CategoryId;
  type: string;
  color?: string;
  summary: string;
  features: string[];
  dayRate: number;
  monthRate?: number;
  operator: OperatorOption;
  featured?: boolean;
  image: string;
};

export const categories: { id: CategoryId; label: string; blurb: string }[] = [
  { id: "cars", label: "Cars", blurb: "Sedans for everyday transportation" },
  { id: "suvs", label: "SUVs", blurb: "Crossovers and family-size vehicles" },
  {
    id: "pickup-trucks",
    label: "Pickup Trucks",
    blurb: "Midsize and full-size work pickups",
  },
  { id: "trucks", label: "Trucks", blurb: "Work trucks and heavy-duty pickups" },
  { id: "buses", label: "Buses", blurb: "Shuttle buses and passenger vans" },
  {
    id: "trailers",
    label: "Trailers",
    blurb: "Utility, cargo and equipment trailers",
  },
  {
    id: "construction-equipment",
    label: "Construction Equipment",
    blurb: "Specialized machinery and equipment",
  },
  {
    id: "utility-equipment",
    label: "Utility Equipment",
    blurb: "Aerial, service and utility rigs",
  },
  {
    id: "specialty-equipment",
    label: "Specialty Equipment",
    blurb: "Unique equipment for specialized projects",
  },
];

export const operatorLabel: Record<OperatorOption, string> = {
  self: "Self Operated",
  operator: "Operator Included",
  driver: "Driver Included",
  "driver-operator": "Driver/Operator Included",
};

export const equipment: Equipment[] = [
  {
    slug: "2017-ford-fusion-midsize-sedan",
    name: "2017 Ford Fusion",
    year: "2017",
    category: "cars",
    type: "Midsize Sedan",
    color: "Shadow Black",
    summary:
      "Comfortable midsize sedan for daily driving, job-site visits and around-town transportation in Houston.",
    features: ["Midsize sedan body", "Shadow Black exterior"],
    dayRate: 50,
    operator: "self",
    image: imgSedanBlack,
  },
  {
    slug: "2008-honda-ridgeline-midsize-pickup",
    name: "2008 Honda Ridgeline",
    year: "2008",
    category: "pickup-trucks",
    type: "Midsize Pickup Truck",
    color: "Light Blue / Silver-Gray",
    summary:
      "Midsize pickup with roof rack rails — an easy-driving option for light hauling and material runs.",
    features: ["Roof rack rails", "Midsize pickup bed"],
    dayRate: 50,
    operator: "self",
    featured: true,
    image: imgMidsizePickup,
  },
  {
    slug: "2008-mercedes-benz-r-class",
    name: "2008 Mercedes-Benz R-Class",
    year: "2008",
    category: "suvs",
    type: "R350 / R500 Crossover Wagon",
    color: "Gold / Pewter Metallic",
    summary:
      "Roomy crossover wagon with a comfortable ride for crews, clients or longer drives.",
    features: [
      "Oval headlights",
      "3-bar chrome Mercedes grille",
      "Front fog lamps",
      "Front parking sensors",
    ],
    dayRate: 75,
    operator: "self",
    image: imgCrossoverWagon,
  },
  {
    slug: "2014-ford-e-series-goshen-coach-shuttle-bus",
    name: "2014 Ford E-Series / Goshen Coach Shuttle Bus",
    year: "2014",
    category: "buses",
    type: "Cutaway Shuttle Bus / Passenger Van",
    color: "White",
    summary:
      "Cutaway shuttle bus built to move crews, groups or event passengers in one trip.",
    features: [
      "Elevated fiberglass cab header",
      "Chrome front grille",
      "Chrome bumper",
      "Roof clearance marker lights",
      "Large side towing mirrors",
    ],
    dayRate: 175,
    operator: "self",
    featured: true,
    image: imgShuttleBus,
  },
  {
    slug: "2008-honda-cr-v",
    name: "2008 Honda CR-V",
    year: "2008",
    category: "suvs",
    type: "Compact Crossover SUV",
    color: "Black",
    summary:
      "Compact crossover SUV that is easy to park and economical for daily project transportation.",
    features: [
      "Split front grille",
      "Honda emblem",
      "Rounded headlights",
      "Fog-light housing",
    ],
    dayRate: 50,
    operator: "self",
    image: imgCompactSuv,
  },
  {
    slug: "1998-cadillac-deville",
    name: "1998 Cadillac DeVille",
    year: "1998",
    category: "cars",
    type: "Full-Size Luxury Sedan",
    color: "Bronzemist Metallic / Gold-Brown",
    summary:
      "Full-size luxury sedan with a smooth ride and generous interior space.",
    features: ["Full-size luxury sedan body", "Bronzemist metallic finish"],
    dayRate: 100,
    operator: "self",
    image: imgLuxurySedan,
  },
  {
    slug: "utility-service-bucket-truck",
    name: "Utility Service / Bucket Truck",
    category: "utility-equipment",
    type: "Aerial Boom Lift — Up to 35 Feet",
    summary:
      "Aerial bucket truck reaching up to 35 feet for signage, lighting, utility and overhead work.",
    features: [
      "Fiberglass aerial bucket",
      "Reach up to 35 feet",
      "Utility storage compartments",
      "Safety steps",
      "Tow hitch",
      "Cargo bed straps",
    ],
    dayRate: 420,
    operator: "operator",
    featured: true,
    image: imgBucketTruck,
  },
  {
    slug: "2025-toyota-tundra-trd-pro",
    name: "2025 Toyota Tundra TRD Pro",
    year: "2025",
    category: "pickup-trucks",
    type: "Full-Size Off-Road Pickup",
    color: "Terra / Mudbath",
    summary:
      "Late-model full-size off-road pickup with serious capability and a premium cab.",
    features: [
      "Toyota heritage grille",
      "Integrated LED light bar",
      "TRD off-road wheels",
      "High-clearance front bumper",
      "Off-road styling",
    ],
    dayRate: 220,
    operator: "self",
    featured: true,
    image: imgTundraTrd,
  },
  {
    slug: "off-road-sand-dune-buggy",
    name: "Off-Road Sand / Dune Buggy",
    category: "specialty-equipment",
    type: "Go-Kart Chassis Off-Road Buggy",
    color: "Silver / Gray",
    summary:
      "Open-frame off-road buggy for property access, outdoor projects and recreation.",
    features: [
      "Tubular steel roll cage",
      "Rear engine bay",
      "Rear utility rack",
      "Heavy-duty off-road tires",
      "Dual rear coilover suspension",
    ],
    dayRate: 100,
    operator: "self",
    image: imgDuneBuggy,
  },
  {
    slug: "john-deere-utility-tractor-backhoe",
    name: "John Deere Utility Tractor",
    category: "construction-equipment",
    type: "Front Loader + 260B Backhoe",
    color: "John Deere Green / Yellow",
    summary:
      "Utility tractor with front loader and rear backhoe for digging, grading and material handling.",
    features: [
      "Front loader bucket",
      "Rear 260B backhoe",
      "Digging bucket",
      "ROPS operator protection",
      "Industrial tires",
    ],
    dayRate: 270,
    operator: "operator",
    featured: true,
    image: imgTractorBackhoe,
  },
  {
    slug: "2008-toyota-tundra",
    name: "2008 Toyota Tundra",
    year: "2008",
    category: "pickup-trucks",
    type: "Full-Size Pickup",
    color: "White with black upper cab",
    summary:
      "Full-size work pickup set up for towing, hauling and rough job-site access.",
    features: [
      "Chrome rear step bumper",
      "Trailer hitch",
      "Running boards",
      "Lifted stance",
      "All-terrain tires",
    ],
    dayRate: 170,
    operator: "driver",
    featured: true,
    image: imgFullsizePickupWhite,
  },
  {
    slug: "mobile-led-digital-billboard-trailer",
    name: "Mobile LED Digital Billboard Trailer",
    category: "specialty-equipment",
    type: "Digital LED Video Wall Trailer",
    summary:
      "Towable LED video wall for promotions, events, announcements and on-site advertising.",
    features: [
      "Single axle",
      "Large LED display",
      "Stabilizer jacks",
      "Heavy-duty frame",
    ],
    dayRate: 300,
    operator: "driver-operator",
    featured: true,
    image: imgLedTrailer,
  },
  {
    slug: "enclosed-single-axle-cargo-trailer",
    name: "Enclosed Single-Axle Cargo / Construction Trailer",
    category: "trailers",
    type: "Enclosed Cargo Trailer",
    summary:
      "Enclosed single-axle trailer that keeps tools and materials secure and dry between job sites.",
    features: [
      "Single axle",
      "Fender flares",
      "Clearance lights",
      "Front tongue coupler",
      "Hand truck/dolly",
    ],
    dayRate: 150,
    operator: "self",
    image: imgCargoTrailer,
  },
  {
    slug: "vintage-travco-class-a-motorhome",
    name: "Vintage Travco Class A Motorhome / Bus RV",
    category: "specialty-equipment",
    type: "Class A Motorhome",
    color: "White with light blue accent stripe",
    summary:
      "Distinctive vintage motorhome available daily or monthly for site offices, projects and events.",
    features: [
      "Rounded fiberglass body",
      "TRAVCO emblem",
      "Split windshield",
      "Rooftop A/C",
      "Passenger entry door",
      "RV windows",
    ],
    dayRate: 270,
    monthRate: 800,
    operator: "self",
    featured: true,
    image: imgVintageRv,
  },
  {
    slug: "heavy-duty-tandem-axle-equipment-trailer",
    name: "Heavy-Duty Tandem Axle Equipment Trailer",
    category: "trailers",
    type: "Tandem Axle Equipment Trailer",
    color: "Red",
    summary:
      "Tandem axle equipment trailer with loading ramps for moving machinery and heavy loads.",
    features: [
      "Tandem axle",
      "Heavy-duty tires",
      "Steel fenders",
      "A-frame tongue",
      "Manual jack",
      "Safety chains",
      "Tie-down rails",
      "Rear loading ramps",
    ],
    dayRate: 200,
    operator: "self",
    featured: true,
    image: imgEquipmentTrailer,
  },
];

export const featuredEquipment = equipment.filter((item) => item.featured);

export function getEquipment(slug: string) {
  return equipment.find((item) => item.slug === slug);
}

export function categoryLabel(id: CategoryId) {
  return categories.find((c) => c.id === id)?.label ?? id;
}

export function relatedEquipment(item: Equipment, count = 3) {
  const sameCategory = equipment.filter(
    (e) => e.slug !== item.slug && e.category === item.category,
  );
  const others = equipment.filter(
    (e) => e.slug !== item.slug && e.category !== item.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}
