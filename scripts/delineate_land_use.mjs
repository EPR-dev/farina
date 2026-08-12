/**
 * Rescale Actual footprints and nudge approximate dwellings off the
 * Twelfth Street commercial corridor so homes vs businesses read clearly.
 *
 * CRS: EPSG:4326 placeholders. Does not invent new land uses — only
 * geometry size/placement of existing features.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const file = path.join(root, "data", "buildings.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const TWELFTH_LAT = -30.06742; // OSM-aligned Twelfth / bakery–hotel corridor
const CORRIDOR = 0.00018;

const COMMERCIAL = new Set([
  "hotel",
  "general_store",
  "bakery",
  "commerce",
  "brewery",
  "blacksmith",
]);
const CIVIC = new Set(["post_telegraph", "police", "church", "school"]);
const RAILWAY = new Set(["railway"]);
const DWELLING = new Set(["house"]);

function useClass(type) {
  if (DWELLING.has(type)) return "dwelling";
  if (COMMERCIAL.has(type)) return "commercial";
  if (CIVIC.has(type)) return "civic";
  if (RAILWAY.has(type)) return "railway";
  return "other";
}

/** Target footprint degrees [w, h] by class — businesses larger, houses smaller. */
function targetSize(cls, type) {
  if (cls === "dwelling") return [0.00011, 0.00009];
  if (type === "hotel") return [0.00038, 0.00026];
  if (cls === "commercial") return [0.00028, 0.0002];
  if (cls === "civic") return [0.00026, 0.00022];
  if (cls === "railway") return [0.00042, 0.00028];
  return [0.00022, 0.00018];
}

function centroid(ring) {
  let sx = 0;
  let sy = 0;
  const n = Math.max(ring.length - 1, 1);
  for (let i = 0; i < n; i++) {
    sx += ring[i][0];
    sy += ring[i][1];
  }
  return [sx / n, sy / n];
}

function rectAround(lng, lat, w, h) {
  const x0 = lng - w / 2;
  const y0 = lat - h / 2;
  return [
    [
      [x0, y0],
      [x0 + w, y0],
      [x0 + w, y0 + h],
      [x0, y0 + h],
      [x0, y0],
    ],
  ];
}

function inCorridor(lat) {
  return Math.abs(lat - TWELFTH_LAT) <= CORRIDOR;
}

/** Side-street residential rows (north & south of Twelfth). */
const RES_SLOTS = [];
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 12; col++) {
    // South of main street
    RES_SLOTS.push([
      138.2741 + col * 0.00032,
      -30.07555 - row * 0.00024,
    ]);
    // North of main street (skip rail-heavy east)
    RES_SLOTS.push([
      138.2741 + col * 0.0003,
      -30.07455 + row * 0.00022,
    ]);
  }
}

let slot = 0;
let moved = 0;
let resized = 0;

for (const f of data.features) {
  if (f.geometry?.type !== "Polygon") continue;
  const p = f.properties;
  const cls = useClass(p.type);
  p.useClass = cls;
  p.mapKind = cls === "dwelling" ? "dwelling" : "landmark";

  const ring = f.geometry.coordinates[0];
  let [lng, lat] = centroid(ring);
  const [w, h] = targetSize(cls, p.type);

  // Approximate dwellings on the commercial spine → side streets
  const approxHouse =
    cls === "dwelling" &&
    (p.status === "approximate" ||
      String(p.name).includes("approximate") ||
      String(p.id).includes("house_approx"));

  if (approxHouse && inCorridor(lat)) {
    const [nlng, nlat] = RES_SLOTS[slot % RES_SLOTS.length];
    slot++;
    lng = nlng;
    lat = nlat;
    moved++;
    p.placementNote =
      "Nudged off Twelfth Street commercial corridor onto residential side street (illustrative).";
  }

  // Keep named houses / documented sites; only ensure commercial sits on spine
  // if it is a small commerce type already near main street — gently snap lat
  if (
    cls === "commercial" &&
    p.confidence === "approximate" &&
    !inCorridor(lat) &&
    Math.abs(lat - TWELFTH_LAT) < 0.00055
  ) {
    lat = TWELFTH_LAT + (lat > TWELFTH_LAT ? 0.00006 : -0.00006);
    p.placementNote =
      "Snapped toward Twelfth Street commercial spine (approximate site).";
    moved++;
  }

  f.geometry.coordinates = rectAround(lng, lat, w, h);
  resized++;
}

data.properties.notes =
  "Footprints are approximate placeholders. Houses sized/placed as residential fabric off Twelfth Street; commercial/civic larger on the main-street spine. Replace with surveyed footprints when georeferenced.";

fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
const pub = path.join(root, "public", "data", "buildings.json");
if (fs.existsSync(path.dirname(pub))) {
  fs.writeFileSync(pub, JSON.stringify(data, null, 2) + "\n");
}
console.log(
  `Land-use delineate: resized ${resized}, placement nudges ${moved} → ${file}`,
);
