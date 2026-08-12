/**
 * Land-use classes for symbology and placement rules.
 * GIS meaning: separate commercial spine (Twelfth Street) from residential fabric.
 */

export type UseClass =
  | "dwelling"
  | "commercial"
  | "civic"
  | "industrial"
  | "railway"
  | "other";

const COMMERCIAL = new Set([
  "hotel",
  "general_store",
  "bakery",
  "commerce",
  "commercial",
  "brewery",
  "blacksmith",
  "service",
  "tourism",
]);

const CIVIC = new Set([
  "post_telegraph",
  "police",
  "church",
  "school",
  "civic",
  "health",
  "heritage",
  "recreation",
]);

const INDUSTRIAL = new Set(["industrial", "energy"]);

const RAILWAY = new Set(["railway", "railway_industrial"]);

const DWELLING = new Set(["house", "residential"]);

/** Farina main road (OSM-aligned Twelfth / bakery–hotel latitude). */
export const TWELFTH_STREET_LAT = -30.06742;
/** Half-width of commercial corridor in degrees latitude (~25–30 m). */
export const COMMERCIAL_CORRIDOR_HALF = 0.00018;

export function useClassForType(type: string): UseClass {
  if (DWELLING.has(type)) return "dwelling";
  if (COMMERCIAL.has(type)) return "commercial";
  if (CIVIC.has(type)) return "civic";
  if (INDUSTRIAL.has(type)) return "industrial";
  if (RAILWAY.has(type)) return "railway";
  return "other";
}

/** Marker radius (px) — dwellings smaller than shops / civic. */
export function markerRadiusForUse(
  useClass: UseClass,
  lifecycle?: string,
): number {
  const ruinScale =
    lifecycle === "ruin" || lifecycle === "abandoned"
      ? 0.85
      : lifecycle === "lost"
        ? 0.6
        : 1;

  const base =
    useClass === "dwelling"
      ? 4.5
      : useClass === "commercial"
        ? 8
        : useClass === "civic"
          ? 7.5
          : useClass === "railway" || useClass === "industrial"
            ? 8.5
            : 6.5;

  return base * ruinScale;
}

/** Fill colours by land use (Actual amber / What If mint applied separately). */
export function fillColorForUse(
  useClass: UseClass,
  mode: "actual" | "whatIf",
): string {
  if (mode === "whatIf") {
    switch (useClass) {
      case "dwelling":
        return "#7eb8a8";
      case "commercial":
        return "#2dffc8";
      case "civic":
        return "#5ee0c8";
      case "industrial":
      case "railway":
        return "#3dcfb0";
      default:
        return "#3dcfb0";
    }
  }
  switch (useClass) {
    case "dwelling":
      return "#d4b37a";
    case "commercial":
      return "#ffcc66";
    case "civic":
      return "#f0d9a0";
    case "industrial":
    case "railway":
      return "#e8a050";
    default:
      return "#ffcc66";
  }
}

export function isInCommercialCorridor(lat: number): boolean {
  return Math.abs(lat - TWELFTH_STREET_LAT) <= COMMERCIAL_CORRIDOR_HALF;
}
