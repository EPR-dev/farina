/**
 * MapLibre GL v4 is published as CJS. Named ESM imports fail:
 *   import { Map } from "maplibre-gl"  → Map is undefined / SyntaxError
 * Always construct via the default export.
 */
import maplibrePackage from "maplibre-gl";
import type { Map as MapLibreMap, MapOptions } from "maplibre-gl";

type MaplibreNamespace = {
  Map: new (options: MapOptions) => MapLibreMap;
  NavigationControl: new (options?: {
    showCompass?: boolean;
    showZoom?: boolean;
    visualizePitch?: boolean;
  }) => { onRemove: () => void };
};

const maplibregl = ((maplibrePackage as unknown as { default?: MaplibreNamespace })
  .default ?? maplibrePackage) as unknown as MaplibreNamespace;

export type { MapLibreMap };

export function createMap(options: MapOptions): MapLibreMap {
  if (typeof maplibregl.Map !== "function") {
    throw new Error(
      "maplibre-gl Map constructor missing — default import interop failed",
    );
  }
  return new maplibregl.Map(options);
}

export function createNavigationControl(options?: {
  showCompass?: boolean;
  showZoom?: boolean;
  visualizePitch?: boolean;
}) {
  return new maplibregl.NavigationControl(options);
}

export default maplibregl;
