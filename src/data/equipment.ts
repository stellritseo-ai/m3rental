
export type CategoryId =
  | "pickup-trucks"
  | "trucks"
  | "trailers"
  | "construction-equipment"
  | "welding-equipment"
  | "tools"
  | "safety-equipment"
  | "generators"
  | "digital-equipment"
  | "machines"
  | "cars"
  | "suvs"
  | "buses"
  | "utility-equipment"
  | "specialty-equipment"
  | "equipment"
  | "vehicles";

export type OperatorOption = "self" | "operator" | "driver" | "driver-operator";

export type Equipment = {
  id?: string | null | undefined;
  slug: string;
  name: string;
  year?: string | null | undefined;
  category: CategoryId;
  type: string;
  color?: string | null | undefined;
  summary: string;
  features: string[];
  dayRate: number;
  monthRate?: number | null | undefined;
  pricingUnit?: string | null | undefined;
  operator: OperatorOption;
  operatorIncluded?: boolean | undefined;
  operatorService?: string | null | undefined;
  specs?: string | null | undefined;
  featured?: boolean | undefined;
  image: string;
  status?: "available" | "booked" | "maintenance" | undefined;
  vin?: string | null | undefined;
  updatedAt?: string | undefined;
};

export const categories: { id: CategoryId; label: string; blurb: string }[] = [
  { id: "pickup-trucks", label: "Pickup Trucks", blurb: "Midsize and full-size work pickups" },
  { id: "trucks", label: "Commercial Trucks", blurb: "Flatbed, bucket, dump trucks & dually haulers" },
  { id: "trailers", label: "Trailers", blurb: "Utility, flatbed, gooseneck & cargo trailers" },
  { id: "construction-equipment", label: "Heavy Equipment", blurb: "Boom lifts, backhoes, tractors & cranes" },
  { id: "welding-equipment", label: "Welding Equipment", blurb: "MIG welders, gas cylinders & welding rigs" },
  { id: "tools", label: "Tools & Power Gear", blurb: "Saws, drills, impact wrenches & hand tools" },
  { id: "safety-equipment", label: "Safety Equipment", blurb: "Fall protection harnesses, PPE sets & gear" },
  { id: "generators", label: "Generators & Power", blurb: "Portable generators & air compressors" },
  { id: "digital-equipment", label: "Digital Displays", blurb: "Mobile LED video wall trailers & display panels" },
  { id: "machines", label: "Commercial Machines", blurb: "Industrial tortilla machines & specialized units" },
  { id: "cars", label: "Cars & Sedans", blurb: "Sedans and luxury vehicles for everyday driving" },
  { id: "suvs", label: "SUVs & Wagons", blurb: "Crossovers and family-size vehicles" },
  { id: "buses", label: "Buses & RVs", blurb: "Shuttle buses, motorhomes and conversions" },
  { id: "utility-equipment", label: "Utility Equipment", blurb: "Aerial, service and utility rigs" },
  { id: "specialty-equipment", label: "Specialty Equipment", blurb: "Unique equipment for specialized projects" },
];

export const operatorLabel: Record<OperatorOption, string> = {
  self: "Self Operated",
  operator: "Operator Included",
  driver: "Driver Included",
  "driver-operator": "Driver/Operator Included",
};


export const equipment: Equipment[] = [];

export const featuredEquipment: Equipment[] = [];

export function getEquipment(_slug: string): Equipment | undefined {
  return undefined;
}

export function categoryLabel(id: CategoryId) {
  return categories.find((c) => c.id === id)?.label ?? id;
}

export function relatedEquipment(item: Equipment, allFleet: Equipment[] = [], count = 3) {
  const pool = allFleet && allFleet.length > 0 ? allFleet : [];
  const sameCategory = pool.filter(
    (e) => e.slug !== item.slug && e.category === item.category,
  );
  const others = pool.filter(
    (e) => e.slug !== item.slug && e.category !== item.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}
