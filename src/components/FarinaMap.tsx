"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, MapLayerMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createMap, createNavigationControl } from "@/lib/maplibre";
import { createBaseStyle } from "@/lib/mapStyle";
import { ensureFarinaLayers, updateFarinaLayers } from "@/lib/mapLayers";
import { FARINA_CENTER, INITIAL_CAMERA } from "@/lib/constants";
import { buildingLifecycle } from "@/lib/temporal";
import { photoById } from "@/lib/loadData";
import type {
  CameraState,
  PhotoRecord,
  SelectedFeature,
  TimelineMode,
} from "@/types/farina";

interface FarinaMapProps {
  year: number;
  mode: TimelineMode;
  layers: Record<string, boolean>;
  camera: CameraState;
  planOpacity: number;
  interactive?: boolean;
  className?: string;
  onFeatureSelect?: (feature: SelectedFeature | null) => void;
  onPhotoSelect?: (photo: PhotoRecord) => void;
  mapRef?: React.MutableRefObject<MapLibreMap | null>;
  onStats?: (stats: {
    buildings: number;
    alternate: number;
    present: number;
    year: number;
  }) => void;
  /** Show React-driven year HUD (does not depend on MapLibre setData). */
  showYearHud?: boolean;
}

export default function FarinaMap({
  year,
  mode,
  layers,
  camera,
  planOpacity,
  interactive = true,
  className,
  onFeatureSelect,
  onPhotoSelect,
  mapRef,
  onStats,
  showYearHud = false,
}: FarinaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<MapLibreMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const callbacksRef = useRef({
    onFeatureSelect,
    onPhotoSelect,
    onStats,
    year,
  });
  callbacksRef.current = { onFeatureSelect, onPhotoSelect, onStats, year };

  useEffect(() => {
    if (!containerRef.current || mapInstance.current) return;

    let cancelled = false;
    let map: MapLibreMap;

    try {
      map = createMap({
        container: containerRef.current,
        style: createBaseStyle(),
        center: INITIAL_CAMERA.center,
        zoom: INITIAL_CAMERA.zoom,
        pitch: INITIAL_CAMERA.pitch,
        bearing: INITIAL_CAMERA.bearing,
        attributionControl: true,
        interactive,
        maxPitch: 60,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[FarinaMap] Map constructor failed", err);
      setInitError(message);
      return;
    }

    map.addControl(
      createNavigationControl({ visualizePitch: true }),
      "top-right",
    );

    map.on("error", (e) => {
      console.error("[FarinaMap] map error", e?.error ?? e);
    });

    const finishInit = () => {
      if (cancelled) return;
      try {
        ensureFarinaLayers(map);
        const stats = updateFarinaLayers(
          map,
          callbacksRef.current.year,
          mode,
          layers,
        );
        callbacksRef.current.onStats?.(stats);
      } catch (err) {
        console.error("[FarinaMap] layer init failed", err);
        setInitError(err instanceof Error ? err.message : String(err));
      }
      setMapReady(true);
    };

    if (map.isStyleLoaded()) finishInit();
    else map.once("load", finishInit);

    const pickable = [
      "beacon-fill",
      "present-fill",
      "present-markers",
      "present-labels",
      "buildings-fill",
      "buildings-markers",
      "buildings-labels",
      "alternate-fill",
      "alternate-markers",
      "alternate-labels",
      "photos-circle",
      "water-point",
      "railway-station",
    ];

    map.on("click", (e: MapLayerMouseEvent) => {
      const existing = pickable.filter((id) => Boolean(map.getLayer(id)));
      const feats = map.queryRenderedFeatures(e.point, { layers: existing });
      if (!feats.length) {
        callbacksRef.current.onFeatureSelect?.(null);
        return;
      }
      const f = feats[0];
      const prop = f.properties ?? {};
      if (f.layer?.id === "photos-circle") {
        const photo = photoById(String(prop.id));
        if (photo) callbacksRef.current.onPhotoSelect?.(photo);
        return;
      }
      callbacksRef.current.onFeatureSelect?.({
        id: String(prop.id ?? prop.name ?? "feature"),
        name: String(prop.name ?? "Feature"),
        type: String(prop.type ?? "unknown"),
        confidence:
          (prop.confidence as SelectedFeature["confidence"]) ?? "approximate",
        whatWasHere: prop.whatWasHere
          ? String(prop.whatWasHere)
          : prop.reasoning
            ? String(prop.reasoning)
            : undefined,
        startYear:
          prop.startYear != null
            ? Number(prop.startYear)
            : prop.year != null
              ? Number(prop.year)
              : undefined,
        endYear: prop.endYear != null ? Number(prop.endYear) : undefined,
        lifecycle:
          prop.scenario === "present_day"
            ? undefined
            : (buildingLifecycle(prop, callbacksRef.current.year) ?? undefined),
        sourceIds:
          typeof prop.sourceIds === "string"
            ? JSON.parse(prop.sourceIds)
            : prop.sourceIds,
        photoIds:
          typeof prop.photoIds === "string"
            ? JSON.parse(prop.photoIds)
            : prop.photoIds,
        people:
          typeof prop.people === "string"
            ? JSON.parse(prop.people)
            : prop.people,
        scenario: prop.scenario ? String(prop.scenario) : undefined,
        reasoning: prop.reasoning ? String(prop.reasoning) : undefined,
        scenarioPopulation:
          prop.scenarioPopulation != null
            ? Number(prop.scenarioPopulation)
            : undefined,
        label: prop.status
          ? String(prop.status).replace(/_/g, " ")
          : prop.label
            ? String(prop.label)
            : undefined,
        placeholder: Boolean(prop.placeholder),
        dateConfidence: prop.dateConfidence
          ? String(prop.dateConfidence)
          : undefined,
      });
    });

    mapInstance.current = map;
    if (mapRef) mapRef.current = map;
    if (typeof window !== "undefined") {
      (window as unknown as { __farinaMap?: MapLibreMap }).__farinaMap = map;
    }

    return () => {
      cancelled = true;
      setMapReady(false);
      if (typeof window !== "undefined") {
        const w = window as unknown as { __farinaMap?: MapLibreMap };
        if (w.__farinaMap === map) delete w.__farinaMap;
      }
      map.remove();
      mapInstance.current = null;
      if (mapRef) mapRef.current = null;
    };
    // Intentionally mount once; year/mode/layers update in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!mapReady || !map) return;
    try {
      const stats = updateFarinaLayers(map, year, mode, layers);
      callbacksRef.current.onStats?.(stats);
    } catch (err) {
      console.error("[FarinaMap] updateFarinaLayers failed", err);
    }
  }, [mapReady, year, mode, layers]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!mapReady || !map) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.easeTo({
      center: camera.center ?? FARINA_CENTER,
      zoom: Math.max(camera.zoom, 14.5),
      pitch: camera.pitch,
      bearing: camera.bearing,
      duration: reduced ? 0 : 800,
    });
  }, [mapReady, camera]);

  void planOpacity;

  return (
    <div className={className ?? "absolute inset-0 z-0 h-full w-full"}>
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full"
        role="application"
        aria-label="Interactive historical map of Farina, South Australia"
      />
      {showYearHud && (
        <div
          className="map-year-hud"
          aria-live="polite"
          title="React year prop — independent of MapLibre"
        >
          {mode === "today" ? "NOW" : year}
          <span className="map-year-hud-mode">
            {mode === "whatIf"
              ? "What If"
              : mode === "today"
                ? "Today"
                : "Actual"}
          </span>
        </div>
      )}
      {initError && (
        <div className="map-init-error" role="alert">
          Map failed to start: {initError}
        </div>
      )}
    </div>
  );
}
