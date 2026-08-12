import { useClassForType } from "@/lib/landUse";

/** Short map labels and label priority for zoom-dependent symbology. */

const TYPE_SHORT: Record<string, string> = {
  hotel: "Hotel",
  general_store: "Store",
  bakery: "Bakery",
  blacksmith: "Blacksmith",
  post_telegraph: "Post Office",
  police: "Police",
  church: "Church",
  school: "School",
  house: "House",
  railway: "Railway",
  commerce: "Shop",
  brewery: "Brewery",
  commercial: "Shops",
  residential: "House",
  industrial: "Works",
  railway_industrial: "Rail yards",
  health: "Clinic",
  service: "Servo",
  recreation: "Sports",
  heritage: "Heritage",
  tourism: "Visitor",
  energy: "Solar",
  civic: "Town hall",
  population_marker: "Population",
};

/** 1 = landmark (label earlier), 2 = civic/commercial, 3 = ordinary dwelling */
export function labelRank(type: string, name: string): number {
  if (type === "population_marker") return 0;
  if (type === "residential" || type === "house") {
    if (name.includes("approximate") || name.includes("expansion") || name.includes("surveyed")) {
      return 3;
    }
    return 2;
  }
  if (
    ["hotel", "school", "church", "railway", "health", "heritage", "civic"].includes(
      type,
    )
  ) {
    return 1;
  }
  return 2;
}

export function shortNameFor(type: string, name: string): string {
  if (type === "residential" || type === "house") {
    if (name.includes("Dwelling") || name.includes("residential")) return "House";
    return name.length > 22 ? TYPE_SHORT[type] ?? "House" : name;
  }
  // Prefer concise known names
  if (name.length <= 28 && !name.includes("intensifies") && !name.includes("expanded")) {
    return name;
  }
  return TYPE_SHORT[type] ?? name.slice(0, 24);
}

/** Extrusion height in metres (visual only — Web Mercator). */
export function extrudeHeight(type: string, rank: number): number {
  if (type === "population_marker") return 0;
  if (type === "energy" || type === "recreation") return 2;
  if (type === "railway_industrial" || type === "industrial") return 5;
  if (rank === 1) return 8;
  if (rank === 2) return 6;
  return 4;
}

export function enrichLabelProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const type = String(props.type ?? "unknown");
  const name = String(props.name ?? "Structure");
  const useClass =
    typeof props.useClass === "string"
      ? String(props.useClass)
      : useClassForType(type);
  const rank =
    props.labelRank != null ? Number(props.labelRank) : labelRank(type, name);
  const shortName =
    typeof props.shortName === "string" && props.shortName.length > 0
      ? props.shortName
      : shortNameFor(type, name);
  return {
    ...props,
    shortName,
    labelRank: rank,
    useClass,
    markerRadius:
      useClass === "dwelling" ? 4.5 : useClass === "commercial" ? 8 : 7,
    extrudeHeight: extrudeHeight(type, rank),
    mapKind:
      props.mapKind ??
      (useClass === "dwelling" ? "dwelling" : "landmark"),
  };
}
