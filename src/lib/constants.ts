/** Farina, SA — WGS84 (EPSG:4326). Display in Web Mercator via MapLibre. */
export const FARINA_CENTER: [number, number] = [138.2766492, -30.0664189];

export const DIVERGENCE_YEAR = 1884;

export const INITIAL_CAMERA = {
  center: FARINA_CENTER,
  zoom: 15.2,
  pitch: 50,
  bearing: -18,
};

/** Esri World Imagery — satellite aesthetic; attribution required. */
export const BASEMAP_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export const BASEMAP_ATTRIBUTION =
  "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community · Map data © OpenStreetMap contributors";

export const DEFAULT_LAYERS: Record<string, boolean> = {
  buildings: true,
  // Off by default: vanished sites should read as absence, not markers
  lostBuildings: false,
  streetGrid: true,
  parcels: true,
  railway: true,
  photographs: true,
  water: true,
  counterfactual: true,
  presentDay: true,
  newspapers: false,
};

export const LAYER_DEFS = [
  { id: "buildings", label: "Documented buildings" },
  { id: "lostBuildings", label: "Vanished sites (ghosts)" },
  { id: "streetGrid", label: "Street grid" },
  { id: "parcels", label: "Land parcels" },
  { id: "railway", label: "Railway" },
  { id: "photographs", label: "Historic photos" },
  { id: "water", label: "Water" },
  { id: "counterfactual", label: "Counterfactual development" },
  { id: "presentDay", label: "Today — FRG sites" },
  { id: "newspapers", label: "Newspaper stories" },
] as const;
