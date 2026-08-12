import type { StyleSpecification } from "maplibre-gl";
import { BASEMAP_ATTRIBUTION, BASEMAP_TILES } from "@/lib/constants";

/** Cinematic muted satellite basemap (MapLibre style). */
export function createBaseStyle(): StyleSpecification {
  return {
    version: 8,
    name: "Farina cinematic",
    // Protomaps-hosted fonts — reliable for Open Sans label stacks
    glyphs:
      "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sources: {
      satellite: {
        type: "raster",
        tiles: [BASEMAP_TILES],
        tileSize: 256,
        attribution: BASEMAP_ATTRIBUTION,
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#3a3224" },
      },
      {
        id: "satellite",
        type: "raster",
        source: "satellite",
        paint: {
          "raster-saturation": -0.35,
          "raster-contrast": 0.05,
          "raster-brightness-min": 0.15,
          "raster-brightness-max": 0.85,
          "raster-opacity": 1,
        },
      },
    ],
  };
}
