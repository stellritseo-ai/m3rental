/**
 * M3 Rental Houston — Pure Client Fleet Utilities
 * Deduplication and normalization logic separated from server-functions.
 */

export const KNOWN_DUPLICATE_SLUG_PAIRS: [string, string][] = [
  ["utility-service-bucket-truck", "35-foot-utility-service-bucket-truck"],
  ["john-deere-utility-tractor-backhoe", "john-deere-compact-utility-tractor"],
  ["heavy-duty-tandem-axle-equipment-trailer", "heavy-duty-flatbed-equipment-trailer"],
  ["2008-toyota-tundra", "2008-toyota-tundra"],
  ["2008-honda-cr-v", "2008-honda-cr-v"],
  ["1998-cadillac-deville", "1998-cadillac-deville"],
  ["2025-toyota-tundra-trd-pro", "2025-toyota-tundra-trd-pro"],
  ["off-road-sand-dune-buggy", "off-road-sand-dune-buggy"],
  ["mobile-led-digital-billboard-trailer", "mobile-led-digital-billboard-trailer"],
  ["enclosed-single-axle-cargo-trailer", "enclosed-single-axle-cargo-trailer"],
  ["vintage-travco-class-a-motorhome", "vintage-travco-class-a-motorhome"],
  ["2017-ford-fusion-midsize-sedan", "2017-ford-fusion-midsize-sedan"],
  ["2008-honda-ridgeline-midsize-pickup", "2008-honda-ridgeline-midsize-pickup"],
  ["2008-mercedes-benz-r-class", "2008-mercedes-benz-r-class"],
  ["2014-ford-e-series-goshen-coach-shuttle-bus", "2014-ford-e-series-goshen-coach-shuttle-bus"],
];

export function areItemsDuplicate(
  a: { slug: string; name: string; id?: string | undefined },
  b: { slug: string; name: string; id?: string | undefined }
): boolean {
  // If both have distinct M3- IDs, they are distinct products from the official Excel catalog
  if (a.id && b.id && a.id.startsWith("M3-") && b.id.startsWith("M3-")) {
    return a.id.toLowerCase() === b.id.toLowerCase();
  }

  // Exact slug match
  if (a.slug === b.slug) return true;

  // Exact ID match
  if (a.id && b.id && a.id.toLowerCase() === b.id.toLowerCase()) return true;

  // Known legacy mock items that map to an Excel item
  const isOldPair = KNOWN_DUPLICATE_SLUG_PAIRS.some(
    ([s1, s2]) =>
      (a.slug === s1 && b.slug === s2) ||
      (a.slug === s2 && b.slug === s1)
  );
  if (isOldPair) return true;

  // Exact normalized full name match only
  const na = (a.name || "").trim().toLowerCase();
  const nb = (b.name || "").trim().toLowerCase();
  if (na && nb && na === nb) return true;

  return false;
}

export function deduplicateFleet<
  T extends { slug: string; name: string; id?: string | undefined; image?: string | undefined }
>(
  items: T[]
): { kept: T[]; removedSlugs: string[] } {
  const kept: T[] = [];
  const removedSlugs: string[] = [];

  for (const item of items) {
    const existingIdx = kept.findIndex((k) => areItemsDuplicate(k, item));
    const existing = existingIdx !== -1 ? kept[existingIdx] : undefined;

    if (!existing || existingIdx === -1) {
      kept.push(item);
    } else {
      const itemHasId = Boolean(item.id && item.id.startsWith("M3-"));
      const existingHasId = Boolean(existing.id && existing.id.startsWith("M3-"));
      const itemHasCloudinary = Boolean(item.image && item.image.startsWith("http"));
      const existingHasCloudinary = Boolean(existing.image && existing.image.startsWith("http"));

      const preferItem =
        (itemHasId && !existingHasId) ||
        (itemHasCloudinary && !existingHasCloudinary) ||
        (item.name.length > existing.name.length && !existingHasId);

      if (preferItem) {
        removedSlugs.push(existing.slug);
        kept[existingIdx] = item;
      } else {
        removedSlugs.push(item.slug);
      }
    }
  }

  return { kept, removedSlugs: Array.from(new Set(removedSlugs)) };
}
