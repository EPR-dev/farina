import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "..", "data", "buildings.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

function rect(lng, lat, w = 0.00018, h = 0.00014) {
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

const extras = [
  {
    id: "bldg_grain_store",
    name: "Grain Store",
    type: "commerce",
    startYear: 1882,
    endYear: 1920,
    ruinVisibleFrom: 1920,
    survivesAsRuin: false,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "Grain store among peak-era businesses (FRG history inventory). Footprint approximate; exact site uncertain.",
    sourceIds: ["source_frg_history"],
    photoIds: [],
    geometry: rect(138.27635, -30.07515, 0.00022, 0.00016),
  },
  {
    id: "bldg_bank",
    name: "Bank (site)",
    type: "commerce",
    startYear: 1884,
    endYear: 1930,
    ruinVisibleFrom: 1930,
    survivesAsRuin: false,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "Bank listed among heyday institutions (FRG / secondary inventories). Exact bank name and footprint not yet confirmed from titles.",
    sourceIds: ["source_frg_history", "source_wiki_farina"],
    photoIds: [],
    geometry: rect(138.27595, -30.0749, 0.0002, 0.00015),
  },
  {
    id: "bldg_brewery_1",
    name: "Brewery (site A)",
    type: "brewery",
    startYear: 1883,
    endYear: 1910,
    ruinVisibleFrom: 1910,
    survivesAsRuin: false,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "One of two breweries noted in peak-era inventories (FRG). Location approximate — not a surveyed footprint.",
    sourceIds: ["source_frg_history"],
    photoIds: [],
    geometry: rect(138.2746, -30.0757, 0.00025, 0.00018),
  },
  {
    id: "bldg_brewery_2",
    name: "Brewery (site B)",
    type: "brewery",
    startYear: 1884,
    endYear: 1905,
    ruinVisibleFrom: 1905,
    survivesAsRuin: false,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "Second brewery from peak-era inventories (FRG). Location approximate.",
    sourceIds: ["source_frg_history"],
    photoIds: [],
    geometry: rect(138.2749, -30.0759, 0.00022, 0.00016),
  },
  {
    id: "bldg_blacksmith_2",
    name: "Blacksmith (site 2)",
    type: "blacksmith",
    startYear: 1883,
    endYear: 1925,
    ruinVisibleFrom: 1925,
    survivesAsRuin: false,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "FRG notes five blacksmiths at peak. Additional sites are approximate placements to reflect documented trade density — not named workshops.",
    sourceIds: ["source_frg_history"],
    photoIds: [],
    geometry: rect(138.2752, -30.0757, 0.00016, 0.00012),
  },
  {
    id: "bldg_blacksmith_3",
    name: "Blacksmith (site 3)",
    type: "blacksmith",
    startYear: 1884,
    endYear: 1915,
    ruinVisibleFrom: 1915,
    survivesAsRuin: false,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "Approximate additional blacksmith among five documented at peak (FRG).",
    sourceIds: ["source_frg_history"],
    photoIds: [],
    geometry: rect(138.27575, -30.07565, 0.00016, 0.00012),
  },
  {
    id: "bldg_blacksmith_4",
    name: "Blacksmith (site 4)",
    type: "blacksmith",
    startYear: 1885,
    endYear: 1912,
    ruinVisibleFrom: 1912,
    survivesAsRuin: false,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "Approximate additional blacksmith among five documented at peak (FRG).",
    sourceIds: ["source_frg_history"],
    photoIds: [],
    geometry: rect(138.2762, -30.0757, 0.00016, 0.00012),
  },
  {
    id: "bldg_blacksmith_5",
    name: "Blacksmith (site 5)",
    type: "blacksmith",
    startYear: 1886,
    endYear: 1908,
    ruinVisibleFrom: 1908,
    survivesAsRuin: false,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "Approximate additional blacksmith among five documented at peak (FRG).",
    sourceIds: ["source_frg_history"],
    photoIds: [],
    geometry: rect(138.27655, -30.07575, 0.00016, 0.00012),
  },
  {
    id: "bldg_goods_shed",
    name: "Railway Goods Shed",
    type: "railway",
    startYear: 1882,
    endYear: 1980,
    ruinVisibleFrom: 1980,
    survivesAsRuin: true,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "Goods shed in railway precinct (FRG navigating notes). Exact footprint approximate.",
    sourceIds: ["source_frg_navigating", "source_frg_history"],
    photoIds: [],
    geometry: rect(138.2776, -30.07505, 0.00035, 0.0002),
  },
  {
    id: "bldg_water_tower",
    name: "Railway Water Tower",
    type: "railway",
    startYear: 1882,
    endYear: 1980,
    ruinVisibleFrom: 1980,
    survivesAsRuin: true,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "Water tower in railway precinct (FRG). Supports locomotive supply narrative.",
    sourceIds: ["source_frg_navigating"],
    photoIds: ["photo_004"],
    geometry: rect(138.278, -30.07455, 0.00014, 0.00014),
  },
  {
    id: "bldg_fettlers",
    name: "Fettlers' Cottages",
    type: "railway",
    startYear: 1882,
    endYear: 1960,
    ruinVisibleFrom: 1960,
    survivesAsRuin: true,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "Fettlers' cottages in railway precinct (FRG Wells/railway trail notes).",
    sourceIds: ["source_frg_navigating"],
    photoIds: [],
    geometry: rect(138.2783, -30.0742, 0.0004, 0.00022),
  },
  {
    id: "bldg_stockyards",
    name: "Sheep & Cattle Yards",
    type: "railway",
    startYear: 1882,
    endYear: 1980,
    ruinVisibleFrom: 1980,
    survivesAsRuin: true,
    status: "documented",
    confidence: "approximate",
    dateConfidence: "approximate",
    whatWasHere:
      "Stock loading yards — Farina remained a livestock dispatch point well into the 20th century (FRG).",
    sourceIds: ["source_frg_navigating", "source_frg_history"],
    photoIds: ["photo_003"],
    geometry: rect(138.2785, -30.0753, 0.00055, 0.00035),
  },
];

for (const f of data.features) {
  if (f.properties.id === "bldg_school") {
    f.properties.startYear = 1879;
    f.properties.endYear = 1957;
    f.properties.dateConfidence = "documented";
    f.properties.whatWasHere =
      "Farina school operating 1879–1957 (secondary/Wikipedia inventory; refine with Education Dept records). Footprint approximate.";
    f.properties.sourceIds = ["source_frg_history", "source_wiki_farina"];
  }
}

const existing = new Set(data.features.map((f) => f.properties.id));
for (const e of extras) {
  if (existing.has(e.id)) continue;
  const { geometry, ...props } = e;
  data.features.push({
    type: "Feature",
    properties: { ...props, placeholder: true },
    geometry: { type: "Polygon", coordinates: geometry },
  });
}

const houseOrigins = [
  [138.2742, -30.076],
  [138.2748, -30.0762],
  [138.2753, -30.07635],
  [138.276, -30.0764],
  [138.2768, -30.0763],
  [138.2739, -30.074],
  [138.2744, -30.0739],
  [138.275, -30.07385],
];
const closures = [1910, 1915, 1920, 1925, 1930, 1935, 1940, 1945, 1950, 1955];
let n = 1;
for (const [oLng, oLat] of houseOrigins) {
  for (let i = 0; i < 5; i++) {
    const id = `bldg_house_approx_${String(n).padStart(2, "0")}`;
    if (!existing.has(id)) {
      const lng = oLng + (i % 3) * 0.00028;
      const lat = oLat + Math.floor(i / 3) * 0.00022;
      const start = 1882 + (n % 8);
      const end = closures[n % closures.length];
      data.features.push({
        type: "Feature",
        properties: {
          id,
          name: "Dwelling (approximate)",
          type: "house",
          startYear: start,
          endYear: end,
          ruinVisibleFrom: end,
          survivesAsRuin: n % 4 === 0,
          status: "approximate",
          confidence: "approximate",
          dateConfidence: "approximate",
          placeholder: true,
          whatWasHere:
            "Illustrative occupancy density based on peak population (~600), not a named land title or documented resident. Location approximate on surveyed grid.",
          sourceIds: ["source_frg_history", "source_frg_land_titles"],
          photoIds: [],
        },
        geometry: {
          type: "Polygon",
          coordinates: rect(lng, lat, 0.00014, 0.00011),
        },
      });
    }
    n++;
  }
}

data.properties.notes =
  "Footprints are approximate placeholders aligned to FRG town guide narrative. Peak-era unnamed dwellings illustrate occupancy density only. Replace with surveyed footprints.";

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log("buildings features:", data.features.length);
