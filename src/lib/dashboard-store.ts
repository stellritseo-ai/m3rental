/**
 * M3 Rental Houston — Comprehensive Dashboard Data Store
 * Provides persistent management for fleet equipment, customer quotes, notifications, and inbox.
 */

import { useState, useEffect } from "react";
import { equipment, Equipment } from "@/data/equipment";
import { getBookings, Booking } from "@/lib/booking-store";
import { deduplicateFleet } from "./fleet-utils";

export const STORAGE_KEY_MANAGED_FLEET = "m3_rental_managed_fleet_v5";

// Auto-purge any stale legacy browser caches from previous versions
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("m3_rental_managed_fleet_v1");
    localStorage.removeItem("m3_rental_managed_fleet_v2");
    localStorage.removeItem("m3_rental_managed_fleet_v3");
    localStorage.removeItem("m3_rental_managed_fleet_v4");
  } catch {}
}

export type QuoteStatus = "new" | "quoted" | "confirmed" | "declined";

export type RentalQuote = {
  id: string;
  customerName: string;
  companyName?: string;
  phone: string;
  email: string;
  equipmentRequested: string;
  rentalDuration: string;
  jobsiteLocation: string;
  operatorRequired: boolean;
  notes?: string;
  status: QuoteStatus;
  quotedAmount?: number;
  createdAt: string;
};

export type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "quote" | "system";
  link?: string;
  read: boolean;
  createdAt: string;
};

export type FleetOverride = {
  id?: string | undefined;
  slug: string;
  dayRate?: number | undefined;
  monthRate?: number | undefined;
  pricingUnit?: string | undefined;
  status?: ("available" | "booked" | "maintenance") | undefined;
  featured?: boolean | undefined;
};

const STORAGE_KEY_QUOTES = "m3_rental_quotes_v1";
const STORAGE_KEY_NOTIFS = "m3_rental_notifications_v1";
const STORAGE_KEY_FLEET_OVERRIDES = "m3_rental_fleet_overrides_v1";

const SEED_QUOTES: RentalQuote[] = [
  {
    id: "REQ-20261007-101",
    customerName: "David Gutierrez",
    companyName: "Lone Star Excavation LLC",
    phone: "(713) 555-0143",
    email: "david@lonestarexcavation.com",
    equipmentRequested: "Tractor / Backhoe Loader",
    rentalDuration: "2 Weeks",
    jobsiteLocation: "Sugar Land, TX (US-59 corridor)",
    operatorRequired: true,
    notes: "Trenching for stormwater drainage lines on commercial lot.",
    status: "new",
    quotedAmount: 4800,
    createdAt: "2026-10-07T08:15:00.000Z",
  },
  {
    id: "REQ-20261006-088",
    customerName: "Rachel Sterling",
    companyName: "Sterling Events Group",
    phone: "(832) 555-0921",
    email: "rachel@sterlingevents.com",
    equipmentRequested: "Ford E-Series Shuttle Bus",
    rentalDuration: "3 Days",
    jobsiteLocation: "Houston Galleria / Memorial Park",
    operatorRequired: true,
    notes: "Passenger transport between hotel and venue for corporate conference.",
    status: "quoted",
    quotedAmount: 1050,
    createdAt: "2026-10-06T14:30:00.000Z",
  },
  {
    id: "REQ-20261005-042",
    customerName: "Hector Morales",
    companyName: "Morales Roofing & Siding",
    phone: "(281) 555-8832",
    email: "hector@moralesroofing.net",
    equipmentRequested: "2008 Honda Ridgeline Midsize Pickup Truck",
    rentalDuration: "5 Days",
    jobsiteLocation: "Katy, TX",
    operatorRequired: false,
    notes: "Ladder runs and shingle haul for residential project.",
    status: "confirmed",
    quotedAmount: 250,
    createdAt: "2026-10-05T09:00:00.000Z",
  },
];

const SEED_NOTIFS: DashboardNotification[] = [
  {
    id: "notif-1",
    title: "New Booking Submitted",
    message: "2008 Honda Ridgeline booked by Carlos Mendoza ($150.00). Payment verification pending.",
    type: "payment",
    link: "/dashboard/bookings",
    read: false,
    createdAt: "2026-10-07T11:45:00.000Z",
  },
  {
    id: "notif-2",
    title: "New Commercial Quote Request",
    message: "David Gutierrez requested Backhoe Loader with operator for Sugar Land site.",
    type: "quote",
    link: "/dashboard/quotes",
    read: false,
    createdAt: "2026-10-07T08:15:00.000Z",
  },
  {
    id: "notif-3",
    title: "Yard Dispatch Status",
    message: "SW Houston Yard is active with 15-minute turnaround enabled.",
    type: "system",
    read: true,
    createdAt: "2026-10-06T07:00:00.000Z",
  },
];

// Auto-sync with MongoDB on client mount
if (typeof window !== "undefined") {
  import("./api/quotes.functions").then(({ getQuotesDb }) => {
    getQuotesDb().then((res) => {
      if (res && res.success && res.quotes && res.quotes.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(res.quotes));
          window.dispatchEvent(new Event("m3-quotes-changed"));
        } catch {}
      }
    }).catch(() => {});
  });
  import("./api/notifications.functions").then(({ getNotificationsDb }) => {
    getNotificationsDb().then((res) => {
      if (res && res.success && res.notifications && res.notifications.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(res.notifications));
          window.dispatchEvent(new Event("m3-notifs-changed"));
        } catch {}
      }
    }).catch(() => {});
  });
  import("./api/equipment.functions").then(({ getEquipmentDb }) => {
    getEquipmentDb().then((res) => {
      if (res && res.success && res.equipment && res.equipment.length > 0) {
        try {
          const overrides = getFleetOverrides();
          const fleetData = (res.equipment as unknown as Equipment[]).map((item) => {
            const ov = overrides[item.slug] || (item.id ? overrides[item.id] : undefined);
            if (!ov) return item;
            return {
              ...item,
              ...(ov.dayRate !== undefined ? { dayRate: ov.dayRate } : {}),
              ...(ov.monthRate !== undefined ? { monthRate: ov.monthRate } : {}),
              ...(ov.pricingUnit ? { pricingUnit: ov.pricingUnit } : {}),
              ...(ov.featured !== undefined ? { featured: ov.featured } : {}),
              ...(ov.status ? { overrideStatus: ov.status, status: ov.status } : {}),
            };
          });
          localStorage.setItem(STORAGE_KEY_MANAGED_FLEET, JSON.stringify(fleetData));
          window.dispatchEvent(new Event("m3-fleet-changed"));
        } catch {}
      }
    }).catch(() => {});
  });
}

// --- Quotes API ---
export function getQuotes(): RentalQuote[] {
  if (typeof window === "undefined") return SEED_QUOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUOTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(SEED_QUOTES));
      return SEED_QUOTES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_QUOTES;
  }
}

export function saveQuotes(quotes: RentalQuote[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
    window.dispatchEvent(new Event("m3-quotes-changed"));
  } catch (e) {
    console.error(e);
  }
}

export function updateQuoteStatus(id: string, status: QuoteStatus, quotedAmount?: number): void {
  const all = getQuotes();
  const updated = all.map((q) => {
    if (q.id === id) {
      return {
        ...q,
        status,
        ...(quotedAmount !== undefined ? { quotedAmount } : {}),
      };
    }
    return q;
  });
  saveQuotes(updated);

  if (typeof window !== "undefined") {
    import("./api/quotes.functions").then(({ updateQuoteDb }) => {
      updateQuoteDb({
        data: {
          quoteId: id,
          status,
          ...(quotedAmount !== undefined ? { quotedAmount } : {}),
        },
      }).catch(() => {});
    });
  }
}

// --- Notifications API ---
export function getNotifications(): DashboardNotification[] {
  if (typeof window === "undefined") return SEED_NOTIFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(SEED_NOTIFS));
      return SEED_NOTIFS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_NOTIFS;
  }
}

export function saveNotifications(notifs: DashboardNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
    window.dispatchEvent(new Event("m3-notifs-changed"));
  } catch (e) {
    console.error(e);
  }
}

export function markNotificationAsRead(id: string): void {
  const all = getNotifications();
  const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);

  if (typeof window !== "undefined") {
    import("./api/notifications.functions").then(({ markNotificationReadDb }) => {
      markNotificationReadDb({ data: { id } }).catch(() => {});
    });
  }
}

export function markAllNotificationsAsRead(): void {
  const all = getNotifications();
  const updated = all.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);

  if (typeof window !== "undefined") {
    import("./api/notifications.functions").then(({ markAllNotificationsReadDb }) => {
      markAllNotificationsReadDb().catch(() => {});
    });
  }
}

// --- Fleet Overrides API ---
export function getFleetOverrides(): Record<string, FleetOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FLEET_OVERRIDES);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveFleetOverride(override: FleetOverride): void {
  if (typeof window === "undefined") return;
  try {
    const all = getFleetOverrides();
    all[override.slug] = { ...all[override.slug], ...override };
    if (override.id) {
      all[override.id] = { ...all[override.id], ...override };
    }
    localStorage.setItem(STORAGE_KEY_FLEET_OVERRIDES, JSON.stringify(all));
    window.dispatchEvent(new Event("m3-fleet-changed"));

    import("./api/equipment.functions").then(({ updateEquipmentDb }) => {
      updateEquipmentDb({
        data: {
          slug: override.slug,
          ...(override.id ? { id: override.id } : {}),
          ...(override.dayRate !== undefined ? { dayRate: override.dayRate } : {}),
          ...(override.monthRate !== undefined ? { monthRate: override.monthRate } : {}),
          ...(override.pricingUnit ? { pricingUnit: override.pricingUnit } : {}),
          ...(override.status !== undefined ? { status: override.status } : {}),
          ...(override.featured !== undefined ? { featured: override.featured } : {}),
        },
      }).catch(() => {});
    });
  } catch (e) {
    console.error(e);
  }
}

const STORAGE_KEY_CUSTOM_FLEET = "m3_rental_custom_equipment_v1";

export function getCustomFleet(): Equipment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_FLEET);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomProduct(item: Equipment): void {
  if (typeof window === "undefined") return;
  try {
    const current = getCustomFleet();
    const updated = [item, ...current.filter((c) => c.slug !== item.slug)];
    localStorage.setItem(STORAGE_KEY_CUSTOM_FLEET, JSON.stringify(updated));
  } catch {}
}

export function removeCustomProduct(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getCustomFleet();
    const updated = current.filter((c) => c.slug !== slug);
    localStorage.setItem(STORAGE_KEY_CUSTOM_FLEET, JSON.stringify(updated));
  } catch {}
}

export function removeMultipleCustomProducts(slugs: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const slugSet = new Set(slugs);
    const current = getCustomFleet();
    const updated = current.filter((c) => !slugSet.has(c.slug));
    localStorage.setItem(STORAGE_KEY_CUSTOM_FLEET, JSON.stringify(updated));
  } catch {}
}

export type ManagedFleetItem = Equipment & {
  overrideStatus?: "available" | "booked" | "maintenance" | undefined;
};

// Helper to get all equipment merged with local admin overrides & custom products
export function getManagedFleet(): ManagedFleetItem[] {
  let list: ManagedFleetItem[] = [];
  const overrides = getFleetOverrides();

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MANAGED_FLEET);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed as ManagedFleetItem[];
        }
      }
    } catch {}
  }

  if (list.length === 0) {
    const custom = getCustomFleet();
    const allBase = [...custom, ...equipment.filter((e) => !custom.some((c) => c.slug === e.slug))];
    list = allBase as ManagedFleetItem[];
  }

  // Apply any active overrides onto list items
  list = list.map((item) => {
    const ov = overrides[item.slug] || (item.id ? overrides[item.id] : undefined);
    if (!ov) return item;
    return {
      ...item,
      ...(ov.dayRate !== undefined ? { dayRate: ov.dayRate } : {}),
      ...(ov.monthRate !== undefined ? { monthRate: ov.monthRate } : {}),
      ...(ov.pricingUnit ? { pricingUnit: ov.pricingUnit } : {}),
      ...(ov.featured !== undefined ? { featured: ov.featured } : {}),
      ...(ov.status ? { overrideStatus: ov.status, status: ov.status } : {}),
    };
  });

  if (typeof window !== "undefined" && list.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY_MANAGED_FLEET, JSON.stringify(list));
    } catch {}
  }

  // Always deduplicate to guarantee 100% unique items
  const { kept, removedSlugs } = deduplicateFleet<ManagedFleetItem>(list);
  if (removedSlugs.length > 0 && typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_MANAGED_FLEET, JSON.stringify(kept));
      const cleanCustom = getCustomFleet().filter((c) => !removedSlugs.includes(c.slug));
      localStorage.setItem(STORAGE_KEY_CUSTOM_FLEET, JSON.stringify(cleanCustom));
    } catch {}
  }

  return kept;
}

export function resetCatalogToExcel(): Equipment[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_MANAGED_FLEET, JSON.stringify(equipment));
      localStorage.removeItem(STORAGE_KEY_CUSTOM_FLEET);
      localStorage.removeItem(STORAGE_KEY_FLEET_OVERRIDES);
      window.dispatchEvent(new Event("m3-fleet-changed"));
    } catch {}
  }
  return equipment;
}

export function cleanAllDuplicates(): { removedCount: number; remainingCount: number } {
  if (typeof window === "undefined") return { removedCount: 0, remainingCount: 0 };
  const current = getManagedFleet();
  const { kept, removedSlugs } = deduplicateFleet<ManagedFleetItem>(current);
  localStorage.setItem(STORAGE_KEY_MANAGED_FLEET, JSON.stringify(kept));
  localStorage.setItem(
    STORAGE_KEY_CUSTOM_FLEET,
    JSON.stringify(getCustomFleet().filter((c) => !removedSlugs.includes(c.slug)))
  );
  window.dispatchEvent(new Event("m3-fleet-changed"));
  return { removedCount: removedSlugs.length, remainingCount: kept.length };
}

export function setManagedFleet(fleet: Equipment[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_MANAGED_FLEET, JSON.stringify(fleet));
    window.dispatchEvent(new Event("m3-fleet-changed"));
  } catch {}
}

export function updateManagedFleetProduct(slug: string, updates: Partial<Equipment>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getManagedFleet();
    const updated = current.map((item) =>
      item.slug === slug || (item.id && updates.id && item.id === updates.id)
        ? ({ ...item, ...updates } as Equipment)
        : item
    );
    localStorage.setItem(STORAGE_KEY_MANAGED_FLEET, JSON.stringify(updated));

    // Also update fleet overrides if pricing, pricingUnit or status updated
    if (
      updates.dayRate !== undefined ||
      updates.monthRate !== undefined ||
      updates.pricingUnit !== undefined ||
      updates.status ||
      updates.featured !== undefined
    ) {
      const overrides = getFleetOverrides();
      overrides[slug] = {
        ...overrides[slug],
        slug,
        ...(updates.dayRate !== undefined ? { dayRate: updates.dayRate } : {}),
        ...(updates.monthRate !== undefined ? { monthRate: updates.monthRate } : {}),
        ...(updates.pricingUnit ? { pricingUnit: updates.pricingUnit } : {}),
        ...(updates.status ? { status: updates.status as any } : {}),
        ...(updates.featured !== undefined ? { featured: updates.featured } : {}),
      };
      localStorage.setItem(STORAGE_KEY_FLEET_OVERRIDES, JSON.stringify(overrides));
    }

    window.dispatchEvent(new Event("m3-fleet-changed"));
  } catch {}
}

export function addManagedFleetProduct(item: Equipment): void {
  if (typeof window === "undefined") return;
  try {
    const current = getManagedFleet();
    const updated = [item, ...current.filter((c) => c.slug !== item.slug)];
    localStorage.setItem(STORAGE_KEY_MANAGED_FLEET, JSON.stringify(updated));
    window.dispatchEvent(new Event("m3-fleet-changed"));
  } catch {}
}

export function removeManagedFleetProducts(slugs: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const slugSet = new Set(slugs);
    const current = getManagedFleet();
    const updated = current.filter((c) => !slugSet.has(c.slug));
    localStorage.setItem(STORAGE_KEY_MANAGED_FLEET, JSON.stringify(updated));
    window.dispatchEvent(new Event("m3-fleet-changed"));
  } catch {}
}

export function getManagedEquipmentItem(slug: string): Equipment | undefined {
  const fleet = getManagedFleet();
  return fleet.find((i) => i.slug === slug);
}

// React hook for reactive fleet synchronization across public pages & dashboard
export function useManagedFleet() {
  const [fleet, setFleet] = useState<Equipment[]>(() => getManagedFleet());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    import("./api/equipment.functions").then(({ getEquipmentDb }) => {
      getEquipmentDb().then((res) => {
        if (isMounted && res && res.success && res.equipment && res.equipment.length > 0) {
          const overrides = getFleetOverrides();
          const merged = (res.equipment as unknown as Equipment[]).map((item) => {
            const ov = overrides[item.slug] || (item.id ? overrides[item.id] : undefined);
            if (!ov) return item;
            return {
              ...item,
              ...(ov.dayRate !== undefined ? { dayRate: ov.dayRate } : {}),
              ...(ov.monthRate !== undefined ? { monthRate: ov.monthRate } : {}),
              ...(ov.pricingUnit ? { pricingUnit: ov.pricingUnit } : {}),
              ...(ov.featured !== undefined ? { featured: ov.featured } : {}),
              ...(ov.status ? { overrideStatus: ov.status, status: ov.status } : {}),
            };
          });
          setManagedFleet(merged);
          setFleet(merged);
        }
      }).catch(() => {});
    });

    const syncHandler = () => {
      setFleet(getManagedFleet());
    };

    window.addEventListener("m3-fleet-changed", syncHandler);
    window.addEventListener("storage", syncHandler);
    return () => {
      isMounted = false;
      window.removeEventListener("m3-fleet-changed", syncHandler);
      window.removeEventListener("storage", syncHandler);
    };
  }, []);

  return { fleet, isLoading };
}
