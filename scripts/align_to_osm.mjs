/**
 * Align Farina placeholder geometry to OpenStreetMap surveyed features
 * (cross-checked against Nominatim / ExplorOz campground coords).
 *
 * CRS: WGS84 / EPSG:4326
 * Primary control: OSM ways/nodes in Farina township (historic=ruins, bakery, streets).
 * Wikipedia locality point (−30.075131, 138.276011) is ~800–900 m south of the
 * mapped ruins — do not use it as the town fabric centroid.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const pubDir = path.join(root, "public", "data");

/** OSM-derived control (lon, lat) — way centroids / nodes from api.openstreetmap.org */
const OSM = {
  town: [138.2766492, -30.0664189],
  transcontinental: [138.277253, -30.0674996],
  bakery: [138.2765714, -30.0673448],
  exchange: [138.2765622, -30.0656167],
  postOffice: [138.2772821, -30.0660112],
  moffatt: [138.2758388, -30.0660478],
  police: [138.2788311, -30.0655509],
  finn: [138.2751943, -30.0664706], // node
  campground: [138.2735649, -30.0620735],
  goodsShed: [138.283958, -30.0689161],
  stockYards: [138.2839116, -30.0669372], // node
  engineShed: [138.2836824, -30.0669926],
  fettlers: [138.2835425, -30.0768754],
  stationMaster: [138.2835282, -30.0696431],
  guards: [138.2834639, -30.0673227],
  gumsWaterhole: [138.2804974, -30.0594332],
  northTerrace: [138.2770109, -30.0654146],
  firstStreet: [138.2761749, -30.0662637],
  secondStreet: [138.2800585, -30.0668849],
};

/** Our previous centroids for the same sites (pre-alignment). */
const OLD = {
  transcontinental: [138.2756, -30.07485],
  bakery: [138.27595, -30.07515],
  exchange: [138.2752, -30.07455],
  postOffice: [138.27565, -30.07515],
  moffatt: [138.27575, -30.0741],
};

const pairs = ["transcontinental", "bakery", "exchange", "postOffice", "moffatt"];
let dLon = 0;
let dLat = 0;
for (const k of pairs) {
  dLon += OSM[k][0] - OLD[k][0];
  dLat += OSM[k][1] - OLD[k][1];
}
dLon /= pairs.length;
dLat /= pairs.length;

console.log(
  `Mean shift from control pairs: dLon=${dLon.toFixed(6)} dLat=${dLat.toFixed(6)} (~${Math.round(dLat * 111320)} m N, ~${Math.round(dLon * 111320 * Math.cos((-30.066 * Math.PI) / 180))} m E)`,
);

function rect(lon, lat, w, h) {
  const x0 = lon - w / 2;
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

function centroid(geom) {
  if (!geom) return null;
  if (geom.type === "Point") return [...geom.coordinates];
  if (geom.type === "Polygon") {
    const ring = geom.coordinates[0];
    let sx = 0;
    let sy = 0;
    const n = Math.max(ring.length - 1, 1);
    for (let i = 0; i < n; i++) {
      sx += ring[i][0];
      sy += ring[i][1];
    }
    return [sx / n, sy / n];
  }
  if (geom.type === "LineString") {
    const c = geom.coordinates;
    const mid = c[Math.floor(c.length / 2)];
    return [...mid];
  }
  return null;
}

function shiftCoord(c) {
  return [c[0] + dLon, c[1] + dLat];
}

function shiftGeometry(geom) {
  if (!geom) return geom;
  if (geom.type === "Point") {
    return { type: "Point", coordinates: shiftCoord(geom.coordinates) };
  }
  if (geom.type === "LineString") {
    return {
      type: "LineString",
      coordinates: geom.coordinates.map(shiftCoord),
    };
  }
  if (geom.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geom.coordinates.map((ring) => ring.map(shiftCoord)),
    };
  }
  if (geom.type === "MultiLineString") {
    return {
      type: "MultiLineString",
      coordinates: geom.coordinates.map((line) => line.map(shiftCoord)),
    };
  }
  return geom;
}

function writeBoth(rel, obj) {
  const json = JSON.stringify(obj, null, 2) + "\n";
  fs.writeFileSync(path.join(dataDir, rel), json);
  if (fs.existsSync(pubDir)) {
    fs.writeFileSync(path.join(pubDir, rel), json);
  }
}

// --- Buildings ---
const buildings = JSON.parse(
  fs.readFileSync(path.join(dataDir, "buildings.json"), "utf8"),
);

const snap = {
  bldg_transcontinental: { c: OSM.transcontinental, w: 0.00038, h: 0.00026 },
  bldg_exchange: { c: OSM.exchange, w: 0.00036, h: 0.00024 },
  bldg_bakery: { c: OSM.bakery, w: 0.00022, h: 0.00018 },
  bldg_post_office: { c: OSM.postOffice, w: 0.00026, h: 0.0002 },
  bldg_moffatt: { c: OSM.moffatt, w: 0.0002, h: 0.00016 },
  bldg_police: { c: OSM.police, w: 0.00028, h: 0.00022 },
  bldg_finn: { c: OSM.finn, w: 0.00018, h: 0.00014 },
  bldg_goods_shed: { c: OSM.goodsShed, w: 0.0004, h: 0.00025 },
  bldg_stockyards: { c: OSM.stockYards, w: 0.00055, h: 0.00035 },
  bldg_fettlers: { c: OSM.fettlers, w: 0.0004, h: 0.00022 },
  bldg_station: { c: OSM.stationMaster, w: 0.00045, h: 0.0003 },
  bldg_water_tower: {
    c: [OSM.goodsShed[0] - 0.00015, OSM.goodsShed[1] + 0.0002],
    w: 0.00014,
    h: 0.00014,
  },
  // Patterson House / VC — FRG: opposite bakery on Twelfth Street
  bldg_patterson: {
    c: [OSM.bakery[0] + 0.00005, OSM.bakery[1] + 0.00022],
    w: 0.00028,
    h: 0.00022,
  },
};

let snapped = 0;
let shifted = 0;
for (const f of buildings.features) {
  const id = f.properties?.id;
  if (snap[id]) {
    const { c, w, h } = snap[id];
    f.geometry = { type: "Polygon", coordinates: rect(c[0], c[1], w, h) };
    f.properties.geometrySource = "osm_aligned";
    f.properties.geometryConfidence = "approximate";
    f.properties.geometryNote =
      "Centroid snapped to OpenStreetMap historic feature (2026 extract); footprint size illustrative.";
    snapped++;
  } else if (f.geometry) {
    f.geometry = shiftGeometry(f.geometry);
    f.properties.geometrySource = "translated_to_osm_frame";
    f.properties.geometryConfidence = "approximate";
    shifted++;
  }
}
buildings.properties = {
  ...buildings.properties,
  alignment: {
    method: "osm_snap_plus_mean_translate",
    controlSource: "OpenStreetMap API map extract 2026",
    dLon,
    dLat,
    wikiLocalityPointRejected: {
      coordinates: [138.276011, -30.075131],
      reason:
        "Gazetteer/Wikipedia point lies ~800–900 m south of OSM-mapped township ruins and bakery",
    },
    osmTownPoint: OSM.town,
  },
};
writeBoth("buildings.json", buildings);
console.log(`buildings: snapped ${snapped}, translated ${shifted}`);

// --- Present day ---
const present = {
  type: "FeatureCollection",
  name: "farina_present_day_frg",
  properties: {
    scenario: "present_day",
    notes:
      "Present-day Farina aligned to OpenStreetMap feature locations + FRG site roles (farinarestoration.com). Footprints illustrative.",
    sourceIds: [
      "source_frg_site",
      "source_frg_navigating",
      "source_frg_town_guide",
      "source_frg_five_year",
      "source_osm_farina",
    ],
    alignment: "osm_2026",
  },
  features: [
    {
      type: "Feature",
      properties: {
        id: "now_early_settlement",
        name: "Early settlement / The Gums waterhole area",
        shortName: "Early settlement",
        type: "heritage_area",
        useClass: "civic",
        status: "ruins",
        confidence: "approximate",
        labelRank: 1,
        whatWasHere:
          "FRG: earliest settlement on rocky ground north of the present town / creek area. OSM maps The Gums Water Hole nearby — satellite structures north of the 1878 grid relate to this precinct and campground, not the main street ruins.",
        sourceIds: ["source_frg_navigating", "source_osm_farina"],
        frgRole: "interpretation",
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "Polygon",
        coordinates: rect(OSM.gumsWaterhole[0], OSM.gumsWaterhole[1], 0.0022, 0.0014),
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_campground",
        name: "Farina Station Campground",
        shortName: "Campground",
        type: "visitor",
        useClass: "commercial",
        status: "active_site",
        confidence: "documented",
        labelRank: 1,
        whatWasHere:
          "OSM/Nominatim/ExplorOz: Farina Station Campground. Open year-round per FRG; ~1.5 km north of the main ruin street.",
        sourceIds: ["source_frg_site", "source_osm_farina", "source_exploroz_camp"],
        frgRole: "visitor_facility",
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "Polygon",
        coordinates: rect(OSM.campground[0], OSM.campground[1], 0.0016, 0.0012),
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_war_memorial",
        name: "War Memorial",
        shortName: "War Memorial",
        type: "memorial",
        useClass: "civic",
        status: "active_site",
        confidence: "approximate",
        labelRank: 1,
        whatWasHere:
          "Dedicated 2010 (FRG). Placed near campground entrance / north precinct pending survey GPS.",
        sourceIds: ["source_frg_navigating"],
        frgRole: "memorial",
        yearBuilt: 2010,
        geometrySource: "approximate_relative_osm",
      },
      geometry: {
        type: "Point",
        coordinates: [OSM.campground[0] + 0.0008, OSM.campground[1] - 0.00035],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_wells_trail_start",
        name: "Wells Walking Trail (campground end)",
        shortName: "Wells Trail",
        type: "trail",
        useClass: "civic",
        status: "active_site",
        confidence: "approximate",
        labelRank: 2,
        whatWasHere:
          "FRG Navigating Farina: trail starts near campground entrance (well/stone tank) and links toward the railway bridge.",
        sourceIds: ["source_frg_navigating", "source_osm_farina"],
        frgRole: "trail",
        geometrySource: "approximate_relative_osm",
      },
      geometry: {
        type: "Point",
        coordinates: [OSM.campground[0] + 0.0012, OSM.campground[1] - 0.0002],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_bakery",
        name: "Scotch Oven Underground Bakery",
        shortName: "Bakery",
        type: "bakery",
        useClass: "commercial",
        status: "restored_seasonal",
        confidence: "documented",
        labelRank: 1,
        whatWasHere:
          "OSM: Farina Bakery. Restored 2010; seasonal operation during FRG works (May–July).",
        sourceIds: ["source_frg_site", "source_osm_farina"],
        frgRole: "flagship_attraction",
        linkedBuildingIds: ["bldg_bakery"],
        photoIds: ["photo_008"],
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "Polygon",
        coordinates: rect(OSM.bakery[0], OSM.bakery[1], 0.00022, 0.00018),
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_patterson_vc",
        name: "Patterson House — Visitor Centre",
        shortName: "Visitor Centre",
        type: "visitor",
        useClass: "civic",
        status: "active_site",
        confidence: "approximate",
        labelRank: 1,
        whatWasHere:
          "FRG: rebuilt 2017–2019; VC opened 2021 opposite bakery precinct on Twelfth Street. Location approximate relative to OSM bakery.",
        sourceIds: ["source_frg_five_year", "source_osm_farina"],
        frgRole: "visitor_centre",
        linkedBuildingIds: ["bldg_patterson"],
        geometrySource: "approximate_relative_osm",
      },
      geometry: {
        type: "Polygon",
        coordinates: rect(
          OSM.bakery[0] + 0.00005,
          OSM.bakery[1] + 0.00022,
          0.00028,
          0.00022,
        ),
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_ops_centre",
        name: "FRG Operations Centre",
        shortName: "Ops Centre",
        type: "workshop",
        useClass: "industrial",
        status: "active_site",
        confidence: "approximate",
        labelRank: 2,
        whatWasHere:
          "FRG: large shed west of the Underground Bakery (2014). Offset west of OSM bakery.",
        sourceIds: ["source_frg_five_year"],
        frgRole: "operations",
        geometrySource: "approximate_relative_osm",
      },
      geometry: {
        type: "Polygon",
        coordinates: rect(
          OSM.bakery[0] - 0.00045,
          OSM.bakery[1] - 0.00005,
          0.00035,
          0.00025,
        ),
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_transcontinental",
        name: "Transcontinental Hotel (stabilised ruin)",
        shortName: "Transcontinental",
        type: "hotel",
        useClass: "commercial",
        status: "stabilised_ruin",
        confidence: "documented",
        labelRank: 1,
        whatWasHere: "OSM historic=ruins Transcontinental Hotel — FRG stone priority site.",
        sourceIds: ["source_osm_farina", "source_frg_five_year"],
        frgRole: "stone_preservation",
        linkedBuildingIds: ["bldg_transcontinental"],
        photoIds: ["photo_007", "photo_013"],
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "Polygon",
        coordinates: rect(
          OSM.transcontinental[0],
          OSM.transcontinental[1],
          0.00038,
          0.00026,
        ),
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_exchange",
        name: "Exchange Hotel (stabilised ruin)",
        shortName: "Exchange",
        type: "hotel",
        useClass: "commercial",
        status: "stabilised_ruin",
        confidence: "documented",
        labelRank: 1,
        whatWasHere: "OSM historic=ruins Exchange Hotel (North Terrace precinct).",
        sourceIds: ["source_osm_farina", "source_frg_five_year"],
        frgRole: "stone_preservation",
        linkedBuildingIds: ["bldg_exchange"],
        photoIds: ["photo_009"],
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "Polygon",
        coordinates: rect(OSM.exchange[0], OSM.exchange[1], 0.00036, 0.00024),
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_post_office",
        name: "Post Office (stabilised)",
        shortName: "Post Office",
        type: "post_telegraph",
        useClass: "civic",
        status: "stabilised_ruin",
        confidence: "documented",
        labelRank: 1,
        whatWasHere: "OSM historic=ruins Post Office.",
        sourceIds: ["source_osm_farina", "source_frg_five_year"],
        frgRole: "stone_preservation",
        linkedBuildingIds: ["bldg_post_office"],
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "Polygon",
        coordinates: rect(OSM.postOffice[0], OSM.postOffice[1], 0.00026, 0.0002),
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_police",
        name: "Police Station & Cells (stabilised)",
        shortName: "Police",
        type: "police",
        useClass: "civic",
        status: "stabilised_ruin",
        confidence: "documented",
        labelRank: 2,
        whatWasHere: "OSM historic=ruins Police Station (east of North Terrace spine).",
        sourceIds: ["source_osm_farina", "source_frg_five_year"],
        frgRole: "stone_preservation",
        linkedBuildingIds: ["bldg_police"],
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "Polygon",
        coordinates: rect(OSM.police[0], OSM.police[1], 0.00028, 0.00022),
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_moffatt",
        name: "Moffatt House (preserved)",
        shortName: "Moffatt House",
        type: "house",
        useClass: "dwelling",
        status: "stabilised_ruin",
        confidence: "documented",
        labelRank: 2,
        whatWasHere: "OSM Moffat House ruin.",
        sourceIds: ["source_osm_farina", "source_frg_navigating"],
        frgRole: "stone_preservation",
        linkedBuildingIds: ["bldg_moffatt"],
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "Polygon",
        coordinates: rect(OSM.moffatt[0], OSM.moffatt[1], 0.0002, 0.00016),
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_railway_precinct",
        name: "Railway precinct (interpreted)",
        shortName: "Railway precinct",
        type: "railway",
        useClass: "railway",
        status: "active_site",
        confidence: "approximate",
        labelRank: 1,
        whatWasHere:
          "OSM places goods shed, stock yards, station master house and Ghan alignment east of the town grid (~138.283–138.284), not on Twelfth Street.",
        sourceIds: ["source_osm_farina", "source_frg_navigating"],
        frgRole: "railway_precinct",
        linkedBuildingIds: [
          "bldg_station",
          "bldg_goods_shed",
          "bldg_water_tower",
          "bldg_fettlers",
          "bldg_stockyards",
        ],
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [138.2828, -30.0704],
            [138.2852, -30.0704],
            [138.2852, -30.0664],
            [138.2828, -30.0664],
            [138.2828, -30.0704],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_goods_shed",
        name: "Goods Shed (NSU 62 shelter)",
        shortName: "Goods Shed",
        type: "railway",
        useClass: "railway",
        status: "under_construction",
        confidence: "approximate",
        labelRank: 1,
        whatWasHere:
          "OSM Goods Shed platform location; FRG building new shelter for locomotive NSU 62 on the historic goods-shed site.",
        sourceIds: ["source_osm_farina", "source_frg_site"],
        frgRole: "railway_project",
        linkedBuildingIds: ["bldg_goods_shed"],
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "Polygon",
        coordinates: rect(OSM.goodsShed[0], OSM.goodsShed[1], 0.0004, 0.00025),
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_cemetery",
        name: "Farina Cemetery",
        shortName: "Cemetery",
        type: "cemetery",
        useClass: "civic",
        status: "active_site",
        confidence: "approximate",
        labelRank: 1,
        whatWasHere:
          "FRG: about 1.3 km west of the campground. Position estimated from campground OSM centroid + 1.3 km west (not a surveyed grave GPS).",
        sourceIds: ["source_frg_navigating", "source_osm_farina"],
        frgRole: "cemetery",
        geometrySource: "estimated_from_frg_distance",
      },
      geometry: {
        type: "Point",
        // ~1.3 km west of campground
        coordinates: [OSM.campground[0] - 0.0135, OSM.campground[1]],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "now_info_boards",
        name: "Town information boards",
        shortName: "Info boards",
        type: "interpretation",
        useClass: "civic",
        status: "active_site",
        confidence: "approximate",
        labelRank: 2,
        whatWasHere: "FRG town guide stop near Twelfth Street / bakery precinct.",
        sourceIds: ["source_frg_town_guide"],
        frgRole: "interpretation",
        geometrySource: "approximate_relative_osm",
      },
      geometry: {
        type: "Point",
        coordinates: [OSM.bakery[0] + 0.00035, OSM.bakery[1] + 0.00005],
      },
    },
  ],
};
writeBoth("present_farina.json", present);
console.log(`present: ${present.features.length} features rewritten to OSM frame`);

// --- Street grid from OSM + Twelfth (main) through bakery/hotel ---
const twelfth = {
  type: "Feature",
  properties: {
    id: "st_twelfth",
    name: "Twelfth Street (Main Road)",
    type: "street",
    geometrySource: "osm_inferred",
    note: "Inferred E–W main street through OSM bakery & Transcontinental Hotel",
  },
  geometry: {
    type: "LineString",
    coordinates: [
      [138.2748, -30.06742],
      [OSM.bakery[0], OSM.bakery[1]],
      [OSM.transcontinental[0], OSM.transcontinental[1]],
      [138.2792, -30.06735],
    ],
  },
};
const streetGrid = {
  type: "FeatureCollection",
  name: "farina_street_grid_osm_aligned",
  properties: {
    notes:
      "Street centreline sketch from OSM First/Second/North Terrace + inferred Twelfth Street. Not a cadastral survey.",
    alignment: "osm_2026",
  },
  features: [
    twelfth,
    {
      type: "Feature",
      properties: {
        id: "st_first",
        name: "First Street",
        type: "street",
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [138.2749, OSM.firstStreet[1]],
          [OSM.firstStreet[0], OSM.firstStreet[1]],
          [138.2795, OSM.firstStreet[1]],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "st_second",
        name: "Second Street",
        type: "street",
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [138.2755, OSM.secondStreet[1]],
          [OSM.secondStreet[0], OSM.secondStreet[1]],
          [138.2825, OSM.secondStreet[1]],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "st_north_terrace",
        name: "North Terrace",
        type: "street",
        geometrySource: "osm_aligned",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [138.2752, OSM.northTerrace[1]],
          [OSM.northTerrace[0], OSM.northTerrace[1]],
          [OSM.police[0], OSM.northTerrace[1]],
          [138.2802, OSM.northTerrace[1]],
        ],
      },
    },
  ],
};
writeBoth("street_grid.json", streetGrid);

// --- Railway: shift old + snap key segments toward OSM Ghan/goods area ---
const railway = JSON.parse(
  fs.readFileSync(path.join(dataDir, "railway.json"), "utf8"),
);
for (const f of railway.features) {
  f.geometry = shiftGeometry(f.geometry);
  f.properties.geometrySource = "translated_to_osm_frame";
}
// Replace station point if present
for (const f of railway.features) {
  if (f.geometry?.type === "Point" || f.properties?.type === "station") {
    f.geometry = {
      type: "Point",
      coordinates: [...OSM.stationMaster],
    };
    f.properties.geometrySource = "osm_aligned";
  }
}
railway.properties = {
  ...(railway.properties ?? {}),
  alignment: "translated_plus_osm_station",
  note: "Linework translated into OSM frame; station node snapped to Station Master House vicinity. Prefer OSM Ghan ways for production.",
};
writeBoth("railway.json", railway);

// --- Water, parcels, photos, alternate: translate ---
for (const file of ["water.json", "parcels.json", "alternate_farina.json"]) {
  const fc = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
  for (const f of fc.features) {
    if (f.geometry) f.geometry = shiftGeometry(f.geometry);
  }
  fc.properties = {
    ...(fc.properties ?? {}),
    alignment: { dLon, dLat, method: "mean_translate_to_osm_frame" },
  };
  writeBoth(file, fc);
  console.log(`translated ${file}`);
}

const photos = JSON.parse(
  fs.readFileSync(path.join(dataDir, "photos.json"), "utf8"),
);
for (const ph of photos) {
  if (Array.isArray(ph.coordinates)) {
    ph.coordinates = shiftCoord(ph.coordinates);
  }
}
// Snap remnant photo coords to OSM buildings
const photoSnap = {
  photo_007: OSM.transcontinental,
  photo_013: OSM.transcontinental,
  photo_008: OSM.bakery,
  photo_009: OSM.exchange,
  photo_012: OSM.goodsShed,
  photo_015: OSM.stockYards,
};
for (const ph of photos) {
  if (photoSnap[ph.id]) {
    ph.coordinates = [...photoSnap[ph.id]];
    ph.locationPrecision = "approximate";
    ph.geometrySource = "osm_aligned";
  }
}
writeBoth("photos.json", photos);

// --- Constants ---
const constantsPath = path.join(root, "src", "lib", "constants.ts");
let constants = fs.readFileSync(constantsPath, "utf8");
constants = constants.replace(
  /export const FARINA_CENTER: \[number, number\] = \[[^\]]+\];/,
  `export const FARINA_CENTER: [number, number] = [${OSM.town[0]}, ${OSM.town[1]}];`,
);
fs.writeFileSync(constantsPath, constants);

// --- Timeline cameras: translate centers ---
const timeline = JSON.parse(
  fs.readFileSync(path.join(dataDir, "timeline.json"), "utf8"),
);
for (const m of timeline.milestones) {
  if (m.camera?.center) {
    m.camera.center = shiftCoord(m.camera.center);
  }
}
// Today camera: frame ruins + campground
const today = timeline.milestones.find((m) => m.id === "y2026_today");
if (today) {
  today.camera = {
    center: [138.2775, -30.0658],
    zoom: 14.2,
    pitch: 42,
    bearing: -8,
  };
}
writeBoth("timeline.json", timeline);

// Validation report
const report = {
  checkedAt: new Date().toISOString(),
  crs: "EPSG:4326",
  finding:
    "Placeholder town fabric was ~800–900 m south of OpenStreetMap-mapped Farina ruins. Wikipedia/gazetteer point (−30.075131, 138.276011) is not the ruin street centroid.",
  sources: [
    {
      id: "osm",
      title: "OpenStreetMap Farina historic features",
      url: "https://www.openstreetmap.org/#map=17/-30.0664/138.2766",
      role: "Primary geometry control for ruins, bakery, streets, campground, railway precinct",
    },
    {
      id: "nominatim",
      title: "Nominatim — Farina Station Campground / Transcontinental Hotel",
      url: "https://nominatim.openstreetmap.org/",
      role: "Cross-check place centroids",
    },
    {
      id: "exploroz",
      title: "ExplorOz Farina Campground",
      url: "https://www.exploroz.com/places/98830/sa+farina-campground",
      role: "Campground DEG −30.062469, 138.273491",
    },
    {
      id: "wikipedia",
      title: "Farina, South Australia coordinates",
      url: "https://en.wikipedia.org/wiki/Farina,_South_Australia",
      role: "Locality point — rejected as town-fabric anchor (offset south)",
    },
    {
      id: "frg",
      title: "Farina Restoration Group site notes",
      url: "https://farinarestoration.com/",
      role: "Relative layout (Twelfth Street, bakery opposite hotel, cemetery west of camp)",
    },
  ],
  controlPairs: pairs.map((k) => ({
    id: k,
    old: OLD[k],
    osm: OSM[k],
  })),
  meanShiftDegrees: { dLon, dLat },
  newTownCenter: OSM.town,
  residualNote:
    "Snapped landmarks match OSM centroids; approximate dwellings/parcels/alternate stock are rigidly translated and remain illustrative until cadastral georeference.",
};
writeBoth("geometry_validation.json", report);
console.log("Wrote geometry_validation.json");
console.log("Done. Restart/hard-refresh the map and check Today + Actual overlays on satellite.");
