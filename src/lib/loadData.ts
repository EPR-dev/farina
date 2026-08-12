import type { FeatureCollection } from "geojson";
import type {
  PhotoRecord,
  PopulationData,
  SourceRecord,
  TimelineData,
} from "@/types/farina";

import timeline from "@data/timeline.json";
import sources from "@data/sources.json";
import photos from "@data/photos.json";
import newspapers from "@data/newspapers.json";
import population from "@data/population.json";
import buildings from "@data/buildings.json";
import streetGrid from "@data/street_grid.json";
import parcels from "@data/parcels.json";
import railway from "@data/railway.json";
import water from "@data/water.json";
import alternate from "@data/alternate_farina.json";
import present from "@data/present_farina.json";

export const timelineData = timeline as TimelineData;
export const sourcesData = sources as SourceRecord[];
export const photosData = photos as PhotoRecord[];
export const newspapersData = newspapers;
export const populationData = population as PopulationData;

export const buildingsData = buildings as FeatureCollection;
export const streetGridData = streetGrid as FeatureCollection;
export const parcelsData = parcels as FeatureCollection;
export const railwayData = railway as FeatureCollection;
export const waterData = water as FeatureCollection;
export const alternateData = alternate as FeatureCollection;
export const presentData = present as FeatureCollection;

export function sourceById(id: string): SourceRecord | undefined {
  return sourcesData.find((s) => s.id === id);
}

export function photoById(id: string): PhotoRecord | undefined {
  return photosData.find((p) => p.id === id);
}
