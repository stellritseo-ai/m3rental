/**
 * M3 Rental Houston — Comprehensive Dashboard Data Store
 * Provides persistent management for fleet equipment, customer quotes, notifications, and inbox.
 */

import { useState, useEffect } from "react";
import { equipment, Equipment } from "@/data/equipment";
import { getBookings, Booking } from "@/lib/booking-store";
import { deduplicateFleet } from "./fleet-utils";

export const STORAGE_KEY_MANAGED_FLEET = "m3_rental_managed_fleet_v6";

// Auto-purge any stale legacy browser caches from previous versions
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("m3_rental_managed_fleet_v1");
    localStorage.removeItem("m3_rental_managed_fleet_v2");
    localStorage.removeItem("m3_rental_managed_fleet_v3");
    localStorage.removeItem("m3_rental_managed_fleet_v4");
    localStorage.removeItem("m3_rental_managed_fleet_v5");
    localStorage.removeItem("m3_rental_fleet_overrides_v1");
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
  id?: string | null | undefined;
  slug: string;
  dayRate?: number | undefined;
  monthRate?: number | null | undefined;
  pricingUnit?: string | null | undefined;
  status?: ("available" | "booked" | "maintenance") | undefined;
  featured?: boolean | undefined;
};

const STORAGE_KEY_QUOTES = "m3_rental_quotes_v1";
const STORAGE_KEY_NOTIFS = "m3_rental_notifications_v1";
const STORAGE_KEY_FLEET_OVERRIDES = "m3_rental_fleet_overrides_v1";

const SEED_QUOTES: RentalQuote[] = [];

const SEED_NOTIFS: DashboardNotification[] = [];

// Auto-sync with MongoDB on client mount
if (typeof window !== "undefined") {
  import("./api/quotes.functions").then(({ getQuotesDb }) => {
    getQuotesDb().then((res) => {
      if (res && res.success && (res as any).source === "mongodb" && Array.isArray(res.quotes)) {
        try {
          localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(res.quotes));
          window.dispatchEvent(new Event("m3-quotes-changed"));
        } catch {}
      }
    }).catch(() => {});
  });
  import("./api/notifications.functions").then(({ getNotificationsDb }) => {
    getNotificationsDb().then((res) => {
      if (res && res.success && (res as any).source === "mongodb" && Array.isArray(res.notifications)) {
        try {
          localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(res.notifications));
          window.dispatchEvent(new Event("m3-notifs-changed"));
        } catch {}
      }
    }).catch(() => {});
  });
  import("./api/equipment.functions").then(({ getEquipmentDb }) => {
    getEquipmentDb().then((res) => {
      if (res && res.success && Array.isArray(res.equipment)) {
        try {
          localStorage.setItem(STORAGE_KEY_MANAGED_FLEET, JSON.stringify(res.equipment));
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
// Fleet overrides used to be applied on top of database values from localStorage, which let stale
// browser data shadow MongoDB. The database is now the single source of truth, so nothing is applied
// from here any more (edits are written to MongoDB via updateEquipmentDb instead).
export function getFleetOverrides(): Record<string, FleetOverride> {
  return {};
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

// Helper to get all equipment from local store (synced from MongoDB)
export function getManagedFleet(): ManagedFleetItem[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MANAGED_FLEET);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed as ManagedFleetItem[];
        }
      }
    } catch {}
  }
  return [];
}

export function resetCatalogToExcel(): Equipment[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_FLEET);
      localStorage.removeItem(STORAGE_KEY_FLEET_OVERRIDES);
    } catch {}
  }
  return [];
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
        if (isMounted && res && res.success && Array.isArray(res.equipment)) {
          const list = res.equipment as unknown as Equipment[];
          setManagedFleet(list);
          setFleet(list);
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
