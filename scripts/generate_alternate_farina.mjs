/**
 * Rule-based counterfactual Farina growth engine.
 * Places speculative buildings along the surveyed grid — not random scatter.
 * Output: data/alternate_farina.json
 *
 * Density: scenario population / personsPerDwelling ≈ dwelling count.
 * CRS: EPSG:4326 (placeholder geometry until survey georeference).
 *
 * After regenerating, run `npm run align:osm` so legacy hardcoded anchors
 * in this file are shifted into the OpenStreetMap-validated town frame.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const population = JSON.parse(
  fs.readFileSync(path.join(root, "data", "population.json"), "utf8"),
);
const parcels = JSON.parse(
  fs.readFileSync(path.join(root, "data", "parcels.json"), "utf8"),
);

const PPD = population.personsPerDwelling || 2.6;
const DIVERGENCE = 1884;

function rect(lng, lat, w, h) {
  return [
    [
      [lng, lat],
      [lng + w, lat],
      [lng + w, lat + h],
      [lng, lat + h],
      [lng, lat],
    ],
  ];
}

function scenarioPop(year) {
  const series = population.scenario;
  const sorted = [...series].sort((a, b) => a.year - b.year);
  if (year <= sorted[0].year) return sorted[0].value;
  if (year >= sorted[sorted.length - 1].year)
    return sorted[sorted.length - 1].value;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (year >= a.year && year <= b.year) {
      const t = (year - a.year) / (b.year - a.year || 1);
      return Math.round(a.value + t * (b.value - a.value));
    }
  }
  return sorted[sorted.length - 1].value;
}

const features = [];

function addPoly(props, lng, lat, w, h) {
  features.push({
    type: "Feature",
    properties: {
      scenario: "counterfactual",
      confidence: "speculative",
      endYear: 9999,
      label: "What if story",
      sourceIds: ["comparison_inland_sa"],
      ...props,
    },
    geometry: { type: "Polygon", coordinates: rect(lng, lat, w, h) },
  });
}

function addPoint(props, coords) {
  features.push({
    type: "Feature",
    properties: {
      scenario: "counterfactual",
      confidence: "speculative",
      endYear: 9999,
      label: "Imagined town size",
      sourceIds: ["comparison_inland_sa"],
      ...props,
    },
    geometry: { type: "Point", coordinates: coords },
  });
}

/** Civic / commercial anchors by era — planning logic, not fantasy megastructures. */
const anchors = [
  {
    id: "alt_depot_1885",
    name: "Regional rail depot",
    shortName: "Rail depot",
    year: 1885,
    type: "railway_industrial",
    lng: 138.2776,
    lat: -30.0751,
    w: 0.0007,
    h: 0.0004,
    reasoning: "Immediate post-divergence: Farina keeps a freight depot role.",
  },
  {
    id: "alt_commercial_1890",
    name: "Twelfth Street shops",
    shortName: "Shops",
    year: 1890,
    type: "commercial",
    lng: 138.2755,
    lat: -30.0752,
    w: 0.001,
    h: 0.00022,
    reasoning: "Twelfth Street remains commercial spine after divergence.",
  },
  {
    id: "alt_yards_1890",
    name: "Stock & goods yards",
    shortName: "Rail yards",
    year: 1890,
    type: "railway_industrial",
    lng: 138.2778,
    lat: -30.07525,
    w: 0.00085,
    h: 0.00045,
    reasoning: "Retained freight/stock role instead of becoming a minor stop.",
  },
  {
    id: "alt_school_1910",
    name: "Farina District School",
    shortName: "School",
    year: 1910,
    type: "school",
    lng: 138.2764,
    lat: -30.07555,
    w: 0.0005,
    h: 0.00035,
    reasoning: "Larger school for growing service-town catchment.",
  },
  {
    id: "alt_institute_1930",
    name: "Town hall",
    shortName: "Town hall",
    year: 1930,
    type: "civic",
    lng: 138.27615,
    lat: -30.07495,
    w: 0.00035,
    h: 0.00028,
    reasoning: "Civic facility typical of established inland towns.",
  },
  {
    id: "alt_ag_1930",
    name: "Agricultural merchants",
    shortName: "Ag merchants",
    year: 1930,
    type: "industrial",
    lng: 138.2785,
    lat: -30.07585,
    w: 0.0007,
    h: 0.00045,
    reasoning: "Pastoral/agricultural service function beside rail.",
  },
  {
    id: "alt_commercial_1930",
    name: "Main street shops",
    shortName: "Shops",
    year: 1930,
    type: "commercial",
    lng: 138.27535,
    lat: -30.07518,
    w: 0.00125,
    h: 0.00026,
    reasoning: "Main street intensifies with regional trade.",
  },
  {
    id: "alt_clinic_1950",
    name: "Farina Regional Clinic",
    shortName: "Clinic",
    year: 1950,
    type: "health",
    lng: 138.27475,
    lat: -30.07415,
    w: 0.00045,
    h: 0.00035,
    reasoning: "Post-war health service modelled on comparable inland towns.",
  },
  {
    id: "alt_servo_1950",
    name: "Service station",
    shortName: "Servo",
    year: 1950,
    type: "service",
    lng: 138.27415,
    lat: -30.07545,
    w: 0.00035,
    h: 0.0003,
    reasoning: "Road-era fuel stop on Lyndhurst–Marree corridor.",
  },
  {
    id: "alt_school_1950",
    name: "Farina Area School",
    shortName: "Area school",
    year: 1950,
    type: "school",
    lng: 138.27625,
    lat: -30.07605,
    w: 0.0007,
    h: 0.00045,
    reasoning: "Larger campus for regional catchment.",
  },
  {
    id: "alt_hospital_1980",
    name: "Farina Regional Hospital",
    shortName: "Hospital",
    year: 1980,
    type: "health",
    lng: 138.2744,
    lat: -30.07375,
    w: 0.0006,
    h: 0.00045,
    reasoning: "Modelled from comparable surviving inland service towns.",
  },
  {
    id: "alt_supermarket_1980",
    name: "Supermarket",
    shortName: "Supermarket",
    year: 1980,
    type: "commercial",
    lng: 138.27575,
    lat: -30.07555,
    w: 0.0005,
    h: 0.0004,
    reasoning: "Grocery anchor for small regional centre.",
  },
  {
    id: "alt_sports_1980",
    name: "Sporting grounds",
    shortName: "Sports",
    year: 1980,
    type: "recreation",
    lng: 138.2734,
    lat: -30.07345,
    w: 0.001,
    h: 0.0007,
    reasoning: "Expanded from historic cricket oval tradition as living-town facility.",
  },
  {
    id: "alt_industrial_1980",
    name: "Agri-industrial precinct",
    shortName: "Industry",
    year: 1980,
    type: "industrial",
    lng: 138.2788,
    lat: -30.07625,
    w: 0.001,
    h: 0.0007,
    reasoning: "Machinery, stock, freight services beside rail.",
  },
  {
    id: "alt_heritage_2000",
    name: "Railway heritage precinct",
    shortName: "Heritage",
    year: 2000,
    type: "heritage",
    lng: 138.27725,
    lat: -30.07495,
    w: 0.0007,
    h: 0.00045,
    reasoning: "Historic core retained within living town.",
  },
  {
    id: "alt_visitor_2000",
    name: "Visitor centre",
    shortName: "Visitor centre",
    year: 2000,
    type: "tourism",
    lng: 138.27395,
    lat: -30.07655,
    w: 0.00055,
    h: 0.0004,
    reasoning: "Tourism layer similar to Quorn/Hawker pattern.",
  },
  {
    id: "alt_solar_2026",
    name: "Community solar array",
    shortName: "Solar",
    year: 2026,
    type: "energy",
    lng: 138.2805,
    lat: -30.0776,
    w: 0.0012,
    h: 0.0008,
    reasoning: "A modern outback town might add renewable power at the edge of town.",
  },
  {
    id: "alt_plaza_2026",
    name: "Main street plaza",
    shortName: "Plaza",
    year: 2026,
    type: "commercial",
    lng: 138.27555,
    lat: -30.07512,
    w: 0.00065,
    h: 0.00038,
    reasoning: "Modernised commercial centre on original grid.",
  },
  {
    id: "alt_health_2026",
    name: "Health & aged care campus",
    shortName: "Health campus",
    year: 2026,
    type: "health",
    lng: 138.27425,
    lat: -30.07365,
    w: 0.00075,
    h: 0.00055,
    reasoning: "Service retention key to inland town survival comparisons.",
  },
];

function useClassFor(type) {
  if (type === "residential") return "dwelling";
  if (type === "commercial" || type === "service" || type === "tourism")
    return "commercial";
  if (
    type === "school" ||
    type === "civic" ||
    type === "health" ||
    type === "heritage" ||
    type === "recreation"
  )
    return "civic";
  if (type === "industrial" || type === "energy") return "industrial";
  if (type === "railway_industrial") return "railway";
  return "other";
}

for (const a of anchors) {
  const uc = useClassFor(a.type);
  addPoly(
    {
      id: a.id,
      name: a.name,
      shortName: a.shortName,
      type: a.type,
      year: a.year,
      startYear: a.year,
      reasoning: a.reasoning,
      labelRank: 1,
      mapKind: uc === "dwelling" ? "dwelling" : "landmark",
      useClass: uc,
    },
    a.lng,
    a.lat,
    a.w,
    a.h,
  );
}

/** Individual shop parcels along Twelfth Street (commercial spine). */
const TWELFTH_LAT = -30.06742; // OSM-aligned main street
const shopEras = [
  { year: 1890, count: 6 },
  { year: 1910, count: 10 },
  { year: 1930, count: 14 },
  { year: 1950, count: 16 },
  { year: 1980, count: 18 },
  { year: 2026, count: 22 },
];
let shopsPlaced = 0;
for (const era of shopEras) {
  while (shopsPlaced < era.count) {
    const i = shopsPlaced;
    const side = i % 2 === 0 ? -1 : 1; // north / south frontage
    const lng = 138.2746 + Math.floor(i / 2) * 0.00028;
    const lat = TWELFTH_LAT + side * 0.0001;
    shopsPlaced++;
    addPoly(
      {
        id: `alt_shop_${String(shopsPlaced).padStart(3, "0")}`,
        name: "Shop",
        shortName: "Shop",
        type: "commercial",
        year: era.year,
        startYear: era.year,
        reasoning:
          "Twelfth Street retail frontage — commercial spine distinct from residential side streets.",
        labelRank: 2,
        mapKind: "landmark",
        useClass: "commercial",
      },
      lng,
      lat,
      0.00022,
      0.00015,
    );
  }
}

/**
 * Residential growth rings keyed to scenario eras.
 * Dwelling counts derived from population / PPD, capped per era for map readability.
 */
const eras = [
  { year: 1890, maxDwellings: 80, rings: 1 },
  { year: 1910, maxDwellings: 160, rings: 2 },
  { year: 1930, maxDwellings: 280, rings: 3 },
  { year: 1950, maxDwellings: 420, rings: 4 },
  { year: 1980, maxDwellings: 550, rings: 5 },
  { year: 2026, maxDwellings: 700, rings: 6 },
];

const parcelCentroids = parcels.features.map((f) => {
  const ring = f.geometry.coordinates[0];
  let sx = 0;
  let sy = 0;
  for (const [x, y] of ring) {
    sx += x;
    sy += y;
  }
  const n = ring.length - 1 || 1;
  return {
    lng: sx / n,
    lat: sy / n,
    id: f.properties.id,
  };
});

// Prefer residential parcels OFF the Twelfth Street commercial corridor
const CORRIDOR = 0.0002;
const CENTER = [138.27665, -30.06642]; // OSM Farina locality / ruin precinct
parcelCentroids.sort((a, b) => {
  const aOff = Math.abs(a.lat - TWELFTH_LAT) > CORRIDOR ? 0 : 1;
  const bOff = Math.abs(b.lat - TWELFTH_LAT) > CORRIDOR ? 0 : 1;
  if (aOff !== bOff) return aOff - bOff;
  const da = (a.lng - CENTER[0]) ** 2 + (a.lat - CENTER[1]) ** 2;
  const db = (b.lng - CENTER[0]) ** 2 + (b.lat - CENTER[1]) ** 2;
  return da - db;
});

let dwellingId = 1;
const placedKeys = new Set();

for (const era of eras) {
  const pop = scenarioPop(era.year);
  const target = Math.min(era.maxDwellings, Math.round(pop / PPD));

  // Place on parcel centroids first (side streets / surveyed lots off main road)
  let placed = 0;
  for (const p of parcelCentroids) {
    if (Math.abs(p.lat - TWELFTH_LAT) <= CORRIDOR) continue; // keep spine commercial
    if (placed >= Math.min(target, Math.floor(target * 0.35))) break;
    if (placedKeys.has(p.id)) continue;
    placedKeys.add(p.id);
    addPoly(
      {
        id: `alt_res_parcel_${String(dwellingId++).padStart(4, "0")}`,
        name: "House",
        shortName: "House",
        type: "residential",
        year: era.year,
        startYear: era.year,
        reasoning:
          "Residential allotment off Twelfth Street — dwellings kept clear of the commercial spine.",
        label: "What if story",
        labelRank: 3,
        mapKind: "dwelling",
        useClass: "dwelling",
      },
      p.lng - 0.000055,
      p.lat - 0.000045,
      0.00011,
      0.00009,
    );
    placed++;
  }

  // Expansion rings south/west — residential only, never on main-street latitude
  const remaining = target - placed;
  const cols = 8 + era.rings * 2;
  const rows = 3 + era.rings;
  const originLng = 138.2732 - era.rings * 0.00035;
  const originLat = -30.0765 - era.rings * 0.00028;
  const cellW = 0.00032;
  const cellH = 0.00024;
  let ringPlaced = 0;

  for (let r = 0; r < rows && ringPlaced < remaining; r++) {
    for (let c = 0; c < cols && ringPlaced < remaining; c++) {
      if (era.rings > 2 && r < 1 && c < 3) continue;
      const lng = originLng + c * (cellW + 0.00008);
      const lat = originLat + r * (cellH + 0.00006);
      if (Math.abs(lat - TWELFTH_LAT) <= CORRIDOR) continue;
      if ((r * 17 + c * 13 + era.year) % 100 < 45) continue;

      addPoly(
        {
          id: `alt_res_${era.year}_${String(dwellingId++).padStart(4, "0")}`,
          name: "House",
          shortName: "House",
          type: "residential",
          year: era.year,
          startYear: era.year,
          reasoning:
            "Side-street / expansion residential fabric; smaller footprints than Twelfth Street shops.",
          label: "What if story",
          labelRank: 3,
          mapKind: "dwelling",
          useClass: "dwelling",
        },
        lng,
        lat,
        0.00012,
        0.0001,
      );
      ringPlaced++;
    }
  }
}

// Population markers at scenario anchors
for (const p of population.scenario) {
  addPoint(
    {
      id: `alt_pop_${p.year}`,
      name: "Imagined town size",
      type: "population_marker",
      year: p.year,
      startYear: p.year,
      endYear: p.year + 25,
      scenarioPopulation: p.value,
      reasoning:
        p.reasoning ||
        "A story estimate inspired by towns like Quorn, Hawker and Marree — not a census figure.",
      label: `About ${p.value.toLocaleString()} people`,
    },
    [138.276, -30.0732 - (p.year - DIVERGENCE) * 0.000002],
  );
}

const fc = {
  type: "FeatureCollection",
  name: "alternate_farina",
  properties: {
    scenario: "counterfactual",
    divergenceYear: DIVERGENCE,
    targetPopulation2026: 3000,
    personsPerDwelling: PPD,
    notes:
      "What-if story features. Generated by scripts/generate_alternate_farina.mjs from population.json + parcel grid. Keep separate from documented historical layers.",
  },
  features,
};

const out = path.join(root, "data", "alternate_farina.json");
fs.writeFileSync(out, JSON.stringify(fc, null, 2));
console.log(
  `Wrote ${features.length} alternate features → ${out} (2026 scenario pop ${scenarioPop(2026)})`,
);
