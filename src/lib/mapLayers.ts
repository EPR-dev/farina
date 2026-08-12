import type { Map, GeoJSONSource, FilterSpecification } from "maplibre-gl";
import type { Feature, FeatureCollection, Polygon, Position } from "geojson";
import {
  alternateData,
  buildingsData,
  parcelsData,
  photosData,
  presentData,
  railwayData,
  streetGridData,
  waterData,
} from "@/lib/loadData";
import {
  buildingLifecycle,
  lifecycleOpacity,
  lifecycleShowsOnMap,
  populationActivityStrength,
  remnantPhotosForYear,
} from "@/lib/temporal";
import { enrichLabelProps } from "@/lib/structureLabels";
import type { TimelineMode } from "@/types/farina";
import { DIVERGENCE_YEAR } from "@/lib/constants";

const EMPTY: FeatureCollection = { type: "FeatureCollection", features: [] };

function polygonCentroid(coords: Position[][]): Position {
  const ring = coords[0];
  let sx = 0;
  let sy = 0;
  const n = Math.max(ring.length - 1, 1);
  for (let i = 0; i < n; i++) {
    sx += ring[i][0];
    sy += ring[i][1];
  }
  return [sx / n, sy / n];
}

function toCentroids(fc: FeatureCollection): FeatureCollection {
  const features: Feature[] = [];
  for (const f of fc.features) {
    if (!f.geometry) continue;
    const props = enrichLabelProps((f.properties ?? {}) as Record<string, unknown>);
    if (props.type === "population_marker") {
      features.push({ ...f, properties: props });
      continue;
    }
    if (f.geometry.type === "Polygon") {
      features.push({
        type: "Feature",
        properties: props,
        geometry: {
          type: "Point",
          coordinates: polygonCentroid((f.geometry as Polygon).coordinates),
        },
      });
    } else if (f.geometry.type === "Point") {
      features.push({ ...f, properties: props });
    }
  }
  return { type: "FeatureCollection", features };
}

function enrichBuildings(
  year: number,
  includeLostGhosts: boolean,
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: buildingsData.features
      .map((f) => {
        const props = f.properties ?? {};
        const lifecycle = buildingLifecycle(props, year);
        if (!lifecycleShowsOnMap(lifecycle, { includeLostGhosts })) {
          return null;
        }
        if (lifecycle === "planned" && year < 1878) return null;

        const labeled = enrichLabelProps({
          ...props,
          lifecycle,
          opacity: lifecycleOpacity(lifecycle),
        });

        // In decline, suppress ordinary dwelling labels; keep landmark ruins
        if (
          (lifecycle === "ruin" ||
            lifecycle === "abandoned" ||
            lifecycle === "lost") &&
          Number(labeled.labelRank ?? 3) >= 3
        ) {
          labeled.labelRank = 4;
        }

        return { ...f, properties: labeled };
      })
      .filter(Boolean) as Feature[],
  };
}

function filterByYear(
  fc: FeatureCollection,
  year: number,
  startKeys: string[] = ["startYear", "year", "activeFrom"],
  endKeys: string[] = ["endYear", "activeTo"],
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: fc.features.filter((f) => {
      const p = f.properties ?? {};
      const start = Number(
        startKeys.map((k) => p[k]).find((v) => v != null) ?? 0,
      );
      const end = Number(
        endKeys.map((k) => p[k]).find((v) => v != null) ?? 9999,
      );
      return year >= start && year <= end;
    }),
  };
}

/** Year beacon — huge, impossible to miss; colour shifts with the timeline. */
function yearBeacon(year: number, mode: TimelineMode): FeatureCollection {
  const color =
    mode === "today"
      ? "#c4d4e0"
      : mode === "whatIf" && year >= DIVERGENCE_YEAR
        ? "#2dffc8"
        : year < 1882
          ? "#ffdd66"
          : year < 1900
            ? "#ff9933"
            : year < 1950
              ? "#cc7744"
              : "#886644";

  // ~250m radius circle around Farina centre
  const cx = 138.276;
  const cy = -30.0751;
  const r = 0.0022;
  const ring: Position[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    ring.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.85]);
  }
  ring.push(ring[0]);

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { year, color, mode, name: `Year ${year}` },
        geometry: { type: "Polygon", coordinates: [ring] },
      },
      {
        type: "Feature",
        properties: { year, color, mode, name: String(year), kind: "label" },
        geometry: { type: "Point", coordinates: [cx, cy] },
      },
    ],
  };
}

function setSourceData(map: Map, id: string, data: FeatureCollection): void {
  const source = map.getSource(id) as GeoJSONSource | undefined;
  if (!source) {
    console.warn(`[FarinaMap] missing source: ${id}`);
    return;
  }
  source.setData(data);
}

function addLayerSafe(map: Map, layer: Parameters<Map["addLayer"]>[0]): void {
  if (map.getLayer(layer.id)) return;
  try {
    map.addLayer(layer);
  } catch (err) {
    console.warn(`[FarinaMap] addLayer ${layer.id} failed`, err);
  }
}

export function ensureFarinaLayers(map: Map): void {
  const addSource = (id: string, data: FeatureCollection) => {
    if (!map.getSource(id)) {
      map.addSource(id, { type: "geojson", data });
    }
  };

  addSource("beacon", yearBeacon(1878, "actual"));
  addSource("street-grid", EMPTY);
  addSource("parcels", EMPTY);
  addSource("buildings", EMPTY);
  addSource("buildings-points", EMPTY);
  addSource("railway", EMPTY);
  addSource("water", EMPTY);
  addSource("alternate", EMPTY);
  addSource("alternate-points", EMPTY);
  addSource("photos", EMPTY);
  addSource("present", EMPTY);
  addSource("present-points", EMPTY);

  // Beacon first — proves timeline→map wiring works
  addLayerSafe(map, {
    id: "beacon-fill",
    type: "fill",
    source: "beacon",
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": 0.35,
    },
  });
  addLayerSafe(map, {
    id: "beacon-outline",
    type: "line",
    source: "beacon",
    filter: ["==", ["geometry-type"], "Polygon"],
    paint: {
      "line-color": ["get", "color"],
      "line-width": 4,
      "line-opacity": 0.95,
    },
  });
  addLayerSafe(map, {
    id: "beacon-label",
    type: "symbol",
    source: "beacon",
    filter: ["==", ["get", "kind"], "label"],
    layout: {
      "text-field": ["concat", ["get", "name"], ""],
      "text-size": 28,
      // Single stack — Protomaps glyphs host does not composite fallbacks
      "text-font": ["Noto Sans Medium"],
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-color": "#000000",
      "text-halo-width": 2.5,
    },
  });

  addLayerSafe(map, {
    id: "parcels-fill",
    type: "fill",
    source: "parcels",
    paint: {
      "fill-color": "#e8c98a",
      "fill-opacity": [
        "interpolate",
        ["linear"],
        ["coalesce", ["get", "activityStrength"], 0.3],
        0,
        0.08,
        1,
        0.32,
      ],
    },
  });
  addLayerSafe(map, {
    id: "parcels-line",
    type: "line",
    source: "parcels",
    paint: { "line-color": "#f0d9a8", "line-width": 1, "line-opacity": 0.6 },
  });

  addLayerSafe(map, {
    id: "street-grid-line",
    type: "line",
    source: "street-grid",
    paint: {
      "line-color": "#ffe6b0",
      "line-width": 3.5,
      "line-opacity": 0.95,
    },
    layout: { "line-cap": "round", "line-join": "round" },
  });

  addLayerSafe(map, {
    id: "water-line",
    type: "line",
    source: "water",
    filter: ["==", ["geometry-type"], "LineString"],
    paint: { "line-color": "#7ec8d4", "line-width": 4, "line-opacity": 0.9 },
  });
  addLayerSafe(map, {
    id: "water-point",
    type: "circle",
    source: "water",
    filter: ["==", ["geometry-type"], "Point"],
    paint: {
      "circle-radius": 8,
      "circle-color": "#9ee0ea",
      "circle-stroke-color": "#103038",
      "circle-stroke-width": 2,
    },
  });

  addLayerSafe(map, {
    id: "railway-line",
    type: "line",
    source: "railway",
    filter: ["==", ["geometry-type"], "LineString"],
    paint: { "line-color": "#ff6b45", "line-width": 6, "line-opacity": 1 },
    layout: { "line-cap": "round", "line-join": "round" },
  });
  addLayerSafe(map, {
    id: "railway-station",
    type: "circle",
    source: "railway",
    filter: ["==", ["geometry-type"], "Point"],
    paint: {
      "circle-radius": 11,
      "circle-color": "#ffd7a0",
      "circle-stroke-color": "#ff6b45",
      "circle-stroke-width": 3,
    },
  });

  addLayerSafe(map, {
    id: "buildings-fill",
    type: "fill",
    source: "buildings",
    paint: {
      // Land use first (homes vs shops), lifecycle still modulates opacity
      "fill-color": [
        "match",
        ["get", "useClass"],
        "dwelling",
        "#d4b37a",
        "commercial",
        "#ffcc66",
        "civic",
        "#f0d9a0",
        "railway",
        "#e8a050",
        "industrial",
        "#e09848",
        "#ffcc66",
      ],
      "fill-opacity": ["coalesce", ["get", "opacity"], 0.85],
    },
  });
  addLayerSafe(map, {
    id: "buildings-outline",
    type: "line",
    source: "buildings",
    paint: {
      "line-color": [
        "match",
        ["get", "useClass"],
        "dwelling",
        "#c4a06a",
        "commercial",
        "#fff6df",
        "#fff6df",
      ],
      "line-width": [
        "match",
        ["get", "useClass"],
        "dwelling",
        1.25,
        "commercial",
        2.75,
        "civic",
        2.25,
        2,
      ],
      "line-opacity": ["coalesce", ["get", "opacity"], 1],
    },
  });
  // Glow: shops / civic / rail — not small dwellings
  addLayerSafe(map, {
    id: "buildings-glow",
    type: "circle",
    source: "buildings-points",
    filter: [
      "all",
      ["in", ["get", "lifecycle"], ["literal", ["active", "closed"]]],
      ["!=", ["get", "useClass"], "dwelling"],
    ],
    paint: {
      "circle-radius": 18,
      "circle-color": "#ffb020",
      "circle-opacity": 0.35,
      "circle-blur": 0.6,
    },
  });
  addLayerSafe(map, {
    id: "buildings-markers",
    type: "circle",
    source: "buildings-points",
    paint: {
      "circle-radius": [
        "match",
        ["get", "useClass"],
        "dwelling",
        4,
        "commercial",
        8,
        "civic",
        7,
        "railway",
        8,
        "industrial",
        7.5,
        6,
      ],
      "circle-color": [
        "match",
        ["get", "useClass"],
        "dwelling",
        "#e8d2a8",
        "commercial",
        "#ffe29a",
        "civic",
        "#f5e6c0",
        "railway",
        "#ffc078",
        "#ffe29a",
      ],
      "circle-opacity": ["coalesce", ["get", "opacity"], 0.9],
      "circle-stroke-color": [
        "match",
        ["get", "useClass"],
        "dwelling",
        "#5c4a3a",
        "#3a2810",
      ],
      "circle-stroke-width": [
        "match",
        ["get", "useClass"],
        "dwelling",
        1.25,
        "commercial",
        2.25,
        1.75,
      ],
    },
  });
  addLayerSafe(map, {
    id: "buildings-labels",
    type: "symbol",
    source: "buildings-points",
    minzoom: 13,
    filter: [
      "all",
      ["<=", ["get", "labelRank"], 2],
      ["!=", ["get", "useClass"], "dwelling"],
      [
        "in",
        ["get", "lifecycle"],
        ["literal", ["active", "closed", "ruin", "restored"]],
      ],
    ],
    layout: {
      "text-field": ["get", "shortName"],
      "text-size": [
        "match",
        ["get", "useClass"],
        "commercial",
        13,
        12,
      ],
      "text-offset": [0, 1.2],
      "text-anchor": "top",
      "text-font": ["Noto Sans Regular"],
      "text-allow-overlap": false,
    },
    paint: {
      "text-color": "#fff4d6",
      "text-halo-color": "#1a1208",
      "text-halo-width": 2,
      "text-opacity": ["coalesce", ["get", "opacity"], 1],
    },
  });

  addLayerSafe(map, {
    id: "alternate-fill",
    type: "fill",
    source: "alternate",
    filter: ["==", ["geometry-type"], "Polygon"],
    paint: {
      "fill-color": [
        "match",
        ["get", "useClass"],
        "dwelling",
        "#6fa898",
        "commercial",
        "#2dffc8",
        "civic",
        "#5ee0c8",
        "railway",
        "#3dcfb0",
        "industrial",
        "#3dcfb0",
        "#3dcfb0",
      ],
      "fill-opacity": [
        "match",
        ["get", "useClass"],
        "dwelling",
        0.7,
        "commercial",
        0.9,
        0.85,
      ],
    },
  });
  addLayerSafe(map, {
    id: "alternate-outline",
    type: "line",
    source: "alternate",
    filter: ["==", ["geometry-type"], "Polygon"],
    paint: {
      "line-color": [
        "match",
        ["get", "useClass"],
        "dwelling",
        "#a8d4c8",
        "#e8fff8",
      ],
      "line-width": [
        "match",
        ["get", "useClass"],
        "dwelling",
        1.2,
        "commercial",
        2.75,
        2.2,
      ],
    },
  });
  addLayerSafe(map, {
    id: "alternate-glow",
    type: "circle",
    source: "alternate-points",
    filter: [
      "all",
      ["!=", ["get", "type"], "population_marker"],
      ["!=", ["get", "useClass"], "dwelling"],
    ],
    paint: {
      "circle-radius": 16,
      "circle-color": "#2dffc8",
      "circle-opacity": 0.35,
      "circle-blur": 0.65,
    },
  });
  addLayerSafe(map, {
    id: "alternate-markers",
    type: "circle",
    source: "alternate-points",
    filter: ["!=", ["get", "type"], "population_marker"],
    paint: {
      "circle-radius": [
        "match",
        ["get", "useClass"],
        "dwelling",
        3.5,
        "commercial",
        8,
        "civic",
        7,
        6.5,
      ],
      "circle-color": [
        "match",
        ["get", "useClass"],
        "dwelling",
        "#8fc4b4",
        "commercial",
        "#b8ffe8",
        "#b8ffe8",
      ],
      "circle-stroke-color": "#0a2e28",
      "circle-stroke-width": [
        "match",
        ["get", "useClass"],
        "dwelling",
        1,
        "commercial",
        2.25,
        1.75,
      ],
    },
  });
  addLayerSafe(map, {
    id: "alternate-labels",
    type: "symbol",
    source: "alternate-points",
    minzoom: 13,
    filter: [
      "all",
      ["!=", ["get", "type"], "population_marker"],
      ["!=", ["get", "useClass"], "dwelling"],
      ["<=", ["get", "labelRank"], 2],
    ],
    layout: {
      "text-field": ["get", "shortName"],
      "text-size": [
        "match",
        ["get", "useClass"],
        "commercial",
        13,
        12,
      ],
      "text-offset": [0, 1.2],
      "text-anchor": "top",
      "text-font": ["Noto Sans Regular"],
    },
    paint: {
      "text-color": "#e8fff6",
      "text-halo-color": "#06241e",
      "text-halo-width": 2,
    },
  });

  addLayerSafe(map, {
    id: "photos-circle",
    type: "circle",
    source: "photos",
    paint: {
      "circle-radius": [
        "match",
        ["get", "subject"],
        "remnant",
        9,
        8,
      ],
      "circle-color": [
        "match",
        ["get", "subject"],
        "remnant",
        "#e8c98a",
        "#f7e7c8",
      ],
      "circle-stroke-color": [
        "match",
        ["get", "subject"],
        "remnant",
        "#5c4a3a",
        "#2a2218",
      ],
      "circle-stroke-width": 2,
    },
  });

  // Present-day FRG layer (Today mode)
  addLayerSafe(map, {
    id: "present-fill",
    type: "fill",
    source: "present",
    filter: ["==", ["geometry-type"], "Polygon"],
    paint: {
      "fill-color": [
        "match",
        ["get", "status"],
        "active_site",
        "#8eb4c8",
        "restored_seasonal",
        "#a8c4d4",
        "under_construction",
        "#d4b896",
        "stabilised_ruin",
        "#9a8b78",
        "ruins",
        "#7a6e60",
        "#8eb4c8",
      ],
      "fill-opacity": 0.55,
    },
  });
  addLayerSafe(map, {
    id: "present-outline",
    type: "line",
    source: "present",
    filter: ["==", ["geometry-type"], "Polygon"],
    paint: {
      "line-color": "#e8f0f6",
      "line-width": 2.5,
      "line-opacity": 0.95,
    },
  });
  addLayerSafe(map, {
    id: "present-markers",
    type: "circle",
    source: "present-points",
    paint: {
      "circle-radius": [
        "match",
        ["get", "status"],
        "active_site",
        8,
        "restored_seasonal",
        9,
        "under_construction",
        8,
        6.5,
      ],
      "circle-color": "#dce8f0",
      "circle-stroke-color": "#2a3844",
      "circle-stroke-width": 2,
    },
  });
  addLayerSafe(map, {
    id: "present-labels",
    type: "symbol",
    source: "present-points",
    minzoom: 12.5,
    filter: ["<=", ["get", "labelRank"], 2],
    layout: {
      "text-field": ["get", "shortName"],
      "text-size": 12,
      "text-offset": [0, 1.25],
      "text-anchor": "top",
      "text-font": ["Noto Sans Regular"],
      "text-allow-overlap": false,
    },
    paint: {
      "text-color": "#eef4f8",
      "text-halo-color": "#1a242c",
      "text-halo-width": 2,
    },
  });
}

export function updateFarinaLayers(
  map: Map,
  year: number,
  mode: TimelineMode,
  layerVisibility: Record<string, boolean>,
): { buildings: number; alternate: number; present: number; year: number } {
  if (!map.getSource("buildings")) {
    ensureFarinaLayers(map);
  }

  const isToday = mode === "today";
  const viewYear = isToday ? 2026 : year;

  // Always update beacon first — visible proof of year wiring
  setSourceData(map, "beacon", yearBeacon(viewYear, mode));

  const popStrength = isToday ? 0.12 : populationActivityStrength(viewYear, mode);
  setSourceData(map, "parcels", {
    type: "FeatureCollection",
    features: parcelsData.features.map((f, i) => {
      const p = f.properties ?? {};
      const activityFrom = Number(p.activityFrom ?? 1878);
      const activityTo = Number(p.activityTo ?? 1950);
      let titleStrength = viewYear >= 1878 ? 0.15 : 0;
      if (viewYear >= activityFrom && viewYear <= activityTo) titleStrength = 0.6;
      else if (viewYear > activityTo) titleStrength = 0.18;
      if (isToday) titleStrength = 0.1;
      const lotBoost =
        !isToday &&
        viewYear >= 1878 &&
        (i * 17) % 100 < popStrength * 100
          ? popStrength * 0.5
          : 0;
      return {
        ...f,
        properties: {
          ...p,
          activityStrength: Math.min(1, titleStrength + lotBoost),
        },
      };
    }),
  });

  // Lost sites only as optional ghosts — default story is: absences + surviving ruins
  let buildings = enrichBuildings(
    viewYear,
    Boolean(layerVisibility.lostBuildings) && !isToday,
  );
  // Today: keep only remnant fabric as quiet context under FRG sites
  if (isToday) {
    buildings = {
      ...buildings,
      features: buildings.features.filter((f) => {
        const lc = String(f.properties?.lifecycle ?? "");
        return lc === "ruin" || lc === "restored" || lc === "abandoned";
      }),
    };
  }
  setSourceData(map, "buildings", buildings);
  setSourceData(map, "buildings-points", toCentroids(buildings));

  setSourceData(map, "railway", {
    type: "FeatureCollection",
    features: railwayData.features.filter((f) => {
      const p = f.properties ?? {};
      const start = Number(p.startYear ?? 0);
      const end = Number(p.endYear ?? 9999);
      if (viewYear < start || viewYear > end) return false;
      if (p.segment === "north_extension" && viewYear < 1884) return false;
      if (p.segment === "standard_gauge" && viewYear < 1957) return false;
      return true;
    }),
  });

  setSourceData(map, "water", filterByYear(waterData, viewYear));
  setSourceData(map, "street-grid", viewYear >= 1878 ? streetGridData : EMPTY);

  const showAlt = mode === "whatIf" && viewYear >= DIVERGENCE_YEAR;
  let altCount = 0;
  if (showAlt) {
    const alt = {
      type: "FeatureCollection" as const,
      features: filterByYear(
        alternateData,
        viewYear,
        ["startYear", "year"],
        ["endYear"],
      ).features.map((f) => ({
        ...f,
        properties: enrichLabelProps({ ...(f.properties ?? {}) }),
      })),
    };
    altCount = alt.features.length;
    setSourceData(map, "alternate", alt);
    setSourceData(map, "alternate-points", toCentroids(alt));
  } else {
    setSourceData(map, "alternate", EMPTY);
    setSourceData(map, "alternate-points", EMPTY);
  }

  const showPresent = isToday && layerVisibility.presentDay !== false;
  let presentCount = 0;
  if (showPresent) {
    const present = {
      type: "FeatureCollection" as const,
      features: presentData.features.map((f) => ({
        ...f,
        properties: enrichLabelProps({
          ...(f.properties ?? {}),
          scenario: "present_day",
          confidence: f.properties?.confidence ?? "approximate",
        }),
      })),
    };
    presentCount = present.features.length;
    setSourceData(map, "present", present);
    setSourceData(map, "present-points", toCentroids(present));
  } else {
    setSourceData(map, "present", EMPTY);
    setSourceData(map, "present-points", EMPTY);
  }

  const visiblePhotos = layerVisibility.photographs
    ? remnantPhotosForYear(photosData, viewYear, buildingsData)
    : [];

  setSourceData(map, "photos", {
    type: "FeatureCollection",
    features: visiblePhotos.map((ph) => ({
      type: "Feature" as const,
      properties: {
        id: ph.id,
        title: ph.title,
        subject: ph.subject ?? "historic",
        date: ph.date,
      },
      geometry: {
        type: "Point" as const,
        coordinates: ph.coordinates,
      },
    })),
  });

  const vis = (id: string, on: boolean) => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", on ? "visible" : "none");
    }
  };

  const showBuildings =
    layerVisibility.buildings || layerVisibility.lostBuildings;
  const showCounter = layerVisibility.counterfactual && showAlt;

  vis("street-grid-line", layerVisibility.streetGrid && viewYear >= 1878);
  vis("parcels-fill", layerVisibility.parcels && viewYear >= 1878 && !isToday);
  vis("parcels-line", layerVisibility.parcels && viewYear >= 1878 && !isToday);
  vis("buildings-fill", showBuildings);
  vis("buildings-outline", showBuildings);
  vis("buildings-glow", showBuildings && !isToday);
  vis("buildings-markers", showBuildings);
  vis("buildings-labels", showBuildings && !isToday);
  vis("railway-line", layerVisibility.railway && viewYear >= 1882);
  vis("railway-station", layerVisibility.railway && viewYear >= 1882);
  vis("water-line", layerVisibility.water);
  vis("water-point", layerVisibility.water);
  vis("alternate-fill", showCounter);
  vis("alternate-outline", showCounter);
  vis("alternate-glow", showCounter);
  vis("alternate-markers", showCounter);
  vis("alternate-labels", showCounter);
  vis("present-fill", showPresent);
  vis("present-outline", showPresent);
  vis("present-markers", showPresent);
  vis("present-labels", showPresent);
  vis("photos-circle", layerVisibility.photographs);
  // Beacon always on
  vis("beacon-fill", true);
  vis("beacon-outline", true);
  vis("beacon-label", true);

  // Default story: absences + surviving ruins. Optional ghosts = fully lost sites.
  if (map.getLayer("buildings-fill")) {
    const onlyGhosts =
      !layerVisibility.buildings && layerVisibility.lostBuildings;
    const lifeFilter: FilterSpecification | null = onlyGhosts
      ? ["==", ["get", "lifecycle"], "lost"]
      : layerVisibility.lostBuildings
        ? null
        : ["!=", ["get", "lifecycle"], "lost"];

    for (const id of [
      "buildings-fill",
      "buildings-outline",
      "buildings-markers",
    ]) {
      if (map.getLayer(id)) map.setFilter(id, lifeFilter);
    }

    if (map.getLayer("buildings-labels")) {
      map.setFilter(
        "buildings-labels",
        onlyGhosts
          ? ["==", ["get", "lifecycle"], "lost"]
          : [
              "all",
              ["<=", ["get", "labelRank"], 2],
              ["!=", ["get", "useClass"], "dwelling"],
              [
                "in",
                ["get", "lifecycle"],
                ["literal", ["active", "closed", "ruin", "restored"]],
              ],
            ],
      );
    }
  }

  // Force a redraw after data swaps (MapLibre GeoJSON race workaround)
  map.triggerRepaint();

  return {
    buildings: buildings.features.length,
    alternate: altCount,
    present: presentCount,
    year: viewYear,
  };
}
