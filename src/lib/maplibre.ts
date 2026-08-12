/**
 * MapLibre GL v4 is published as CJS. Named ESM imports fail:
 *   import { Map } from "maplibre-gl"  → Map is undefined / SyntaxError
 * Always construct via the default export.
 */
import maplibrePackage from "maplibre-gl";
import type {
  IControl,
  Map as MapLibreMap,
  MapOptions,
  NavigationControlOptions,
} from "maplibre-gl";

type MaplibreNamespace = {
  Map: new (options: MapOptions) => MapLibreMap;
  NavigationControl: new (options?: NavigationControlOptions) => IControl;
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

export function createNavigationControl(
  options?: NavigationControlOptions,
): IControl {
  return new maplibregl.NavigationControl(options);
}

export default maplibregl;
