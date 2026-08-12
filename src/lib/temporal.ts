import type {
  BuildingLifecycle,
  Confidence,
  PhotoRecord,
  PopulationData,
  PopulationPoint,
  TimelineMilestone,
  TimelineMode,
} from "@/types/farina";
import { DIVERGENCE_YEAR } from "@/lib/constants";
import populationJson from "@data/population.json";

const populationData = populationJson as PopulationData;

export function milestonesForMode(
  milestones: TimelineMilestone[],
  mode: TimelineMode,
): TimelineMilestone[] {
  if (mode === "today") {
    const today = milestones.find((m) => m.id === "y2026_today") ??
      milestones.find((m) => m.year === 2026);
    return today ? [today] : milestones.slice(-1);
  }
  return milestones.filter((m) => {
    if (m.mode === "today") return false;
    if (m.mode === "both") return true;
    if (mode === "actual") return m.mode === "actual";
    return m.mode === "whatIf";
  });
}

export function captionForMilestone(
  m: TimelineMilestone,
  mode: TimelineMode,
): string {
  if (mode === "today" && m.captionToday) return m.captionToday;
  if (mode === "whatIf" && m.captionWhatIf) return m.captionWhatIf;
  if (mode === "actual" && m.captionActual) return m.captionActual;
  return m.caption ?? "";
}

export function isPastDivergence(year: number): boolean {
  return year >= DIVERGENCE_YEAR;
}

/**
 * Lifecycle for documented buildings at a given year.
 *
 * GIS meaning: occupancy ends at endYear; only features flagged
 * survivesAsRuin keep a ground footprint (ruin). Everything else
 * fades briefly, then is treated as lost (no marker).
 */
export function buildingLifecycle(
  props: Record<string, unknown>,
  year: number,
): BuildingLifecycle | null {
  const start = Number(props.startYear ?? 0);
  const end = Number(props.endYear ?? 9999);
  const restored =
    props.restoredYear != null ? Number(props.restoredYear) : null;
  const survives = Boolean(props.survivesAsRuin);

  if (year < start) {
    if (year >= 1878 && year < start) return "planned";
    return null;
  }

  if (restored != null && year >= restored) return "restored";

  if (year <= end) return "active";

  const yearsSince = year - end;

  // Physical remnant still readable on the ground (hotels, stone ruins, etc.)
  if (survives) {
    if (yearsSince <= 5) return "closed";
    if (yearsSince <= 20) return "abandoned";
    return "ruin";
  }

  // No surviving ruin — short afterlife, then gone from the map
  if (yearsSince <= 5) return "closed";
  if (yearsSince <= 15) return "abandoned";
  return "lost";
}

export function featureVisibleInYear(
  props: Record<string, unknown>,
  year: number,
  opts?: { allowRuinGhost?: boolean },
): boolean {
  const start = Number(props.startYear ?? props.year ?? props.activeFrom ?? 0);
  const end = Number(props.endYear ?? props.activeTo ?? 9999);
  if (year < start) return false;

  if (props.survivesAsRuin || opts?.allowRuinGhost) {
    return true;
  }

  if (year > end) {
    return Boolean(opts?.allowRuinGhost);
  }
  return year <= end;
}

export function lifecycleOpacity(lifecycle: BuildingLifecycle | null): number {
  switch (lifecycle) {
    case "planned":
      return 0.28;
    case "active":
      return 0.92;
    case "closed":
      return 0.55;
    case "abandoned":
      return 0.32;
    case "ruin":
      return 0.55;
    case "restored":
      return 0.88;
    case "lost":
      return 0.12;
    default:
      return 0;
  }
}

/** Whether a lifecycle still deserves a map marker by default. */
export function lifecycleShowsOnMap(
  lifecycle: BuildingLifecycle | null,
  opts?: { includeLostGhosts?: boolean },
): boolean {
  if (!lifecycle) return false;
  if (lifecycle === "lost") return Boolean(opts?.includeLostGhosts);
  return true;
}

export function confidenceLabel(c: Confidence | string | undefined): string {
  switch (c) {
    case "documented":
      return "Documented";
    case "approximate":
      return "Approximate";
    case "speculative":
      return "Speculative";
    default:
      return "Unknown";
  }
}

/** Linear interpolate between sorted population anchors. */
export function interpolatePopulation(
  series: PopulationPoint[],
  year: number,
): { value: number; point: PopulationPoint } | null {
  if (!series.length) return null;
  const sorted = [...series].sort((a, b) => a.year - b.year);
  if (year <= sorted[0].year) {
    return { value: sorted[0].value, point: sorted[0] };
  }
  if (year >= sorted[sorted.length - 1].year) {
    const last = sorted[sorted.length - 1];
    return { value: last.value, point: last };
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (year >= a.year && year <= b.year) {
      const t = (year - a.year) / (b.year - a.year || 1);
      const value = Math.round(a.value + t * (b.value - a.value));
      return { value, point: year - a.year <= b.year - year ? a : b };
    }
  }
  return { value: sorted[sorted.length - 1].value, point: sorted[sorted.length - 1] };
}

export function populationAtYear(
  year: number,
  mode: TimelineMode,
  data: PopulationData = populationData,
): { value: number; confidence?: Confidence; note?: string } | null {
  if (mode === "whatIf" && year >= DIVERGENCE_YEAR) {
    const hit = interpolatePopulation(data.scenario, year);
    if (!hit) return null;
    return { value: hit.value, confidence: "speculative", note: hit.point.reasoning };
  }

  // Before divergence, What If shares actual history
  const hit = interpolatePopulation(data.actual, year);
  if (!hit) return null;
  if (year < 1878 && hit.value < 20) return { value: hit.value, confidence: hit.point.confidence, note: hit.point.note };
  return {
    value: hit.value,
    confidence: hit.point.confidence,
    note: hit.point.note,
  };
}

export function populationLabel(year: number, mode: TimelineMode): string | null {
  const pop = populationAtYear(year, mode);
  if (!pop) return null;

  if (mode === "whatIf" && year >= DIVERGENCE_YEAR) {
    return `Scenario population: ${pop.value.toLocaleString()}`;
  }

  if (year < 1878) {
    return `Population: ~${pop.value.toLocaleString()} (pre-town estimate)`;
  }

  const conf =
    pop.confidence === "documented"
      ? ""
      : pop.confidence === "approximate"
        ? " (estimate)"
        : "";

  if (year >= 2006) {
    return `Population: ~${pop.value.toLocaleString()} locality${conf}`;
  }

  return `Population: ~${pop.value.toLocaleString()}${conf}`;
}

/** 0–1 activity strength for parcel illumination from population curve. */
export function populationActivityStrength(
  year: number,
  mode: TimelineMode,
): number {
  const pop = populationAtYear(year, mode);
  if (!pop) return 0;
  if (mode === "whatIf" && year >= DIVERGENCE_YEAR) {
    return Math.min(1, pop.value / 3000);
  }
  // Actual peak ~600
  return Math.min(1, pop.value / 600);
}

export function countVisibleStructures(
  year: number,
  mode: TimelineMode,
  buildings: { features: { properties: Record<string, unknown> | null }[] },
  alternate: { features: { properties: Record<string, unknown> | null }[] },
): number {
  let n = 0;
  for (const f of buildings.features) {
    const lifecycle = buildingLifecycle(f.properties ?? {}, year);
    // Count what the default map shows: living stock + surviving ruins
    if (!lifecycleShowsOnMap(lifecycle, { includeLostGhosts: false })) {
      continue;
    }
    if (lifecycle === "planned" && year !== 1878) continue;
    n++;
  }
  if (mode === "whatIf" && year >= DIVERGENCE_YEAR) {
    for (const f of alternate.features) {
      const p = f.properties ?? {};
      if (p.type === "population_marker") continue;
      const start = Number(p.startYear ?? p.year ?? 0);
      const end = Number(p.endYear ?? 9999);
      if (year >= start && year <= end) n++;
    }
  }
  return n;
}

export function structuresLabel(count: number, mode: TimelineMode): string {
  const prefix = mode === "whatIf" ? "~" : "~";
  return `${prefix}${count.toLocaleString()} structures visible`;
}

/**
 * Whether a photograph marker should appear at this timeline year.
 * Remnant photos use activeFrom = ruin/heritage era (not only the capture year),
 * so modern ruin shots appear whenever that remnant fabric is on the map.
 */
export function photoVisibleAtYear(photo: PhotoRecord, year: number): boolean {
  if (year < photo.activeFrom || year > photo.activeTo) return false;
  return true;
}

/** Remnant photos linked to buildings still shown as ruin/restored at this year. */
export function remnantPhotosForYear(
  photos: PhotoRecord[],
  year: number,
  buildings: { features: { properties: Record<string, unknown> | null }[] },
): PhotoRecord[] {
  const remnantBuildingIds = new Set<string>();
  for (const f of buildings.features) {
    const p = f.properties ?? {};
    const lifecycle = buildingLifecycle(p, year);
    if (
      lifecycle === "ruin" ||
      lifecycle === "restored" ||
      (lifecycle === "abandoned" && Boolean(p.survivesAsRuin))
    ) {
      remnantBuildingIds.add(String(p.id));
    }
  }

  return photos.filter((ph) => {
    if (!photoVisibleAtYear(ph, year)) return false;
    if (ph.subject === "remnant") {
      if (!ph.buildingIds?.length) return true;
      return ph.buildingIds.some((id) => remnantBuildingIds.has(id));
    }
    return true;
  });
}
