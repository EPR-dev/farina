export type TimelineMode = "actual" | "whatIf" | "today";

export type Confidence = "documented" | "approximate" | "speculative";

export type BuildingLifecycle =
  | "planned"
  | "active"
  | "closed"
  | "abandoned"
  | "ruin"
  | "lost"
  | "restored";

export interface CameraState {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface TimelineMilestone {
  id: string;
  year: number;
  label: string;
  mode: "both" | "actual" | "whatIf" | "today";
  caption?: string;
  captionActual?: string;
  captionWhatIf?: string;
  captionToday?: string;
  camera: CameraState;
  storyBeat?: string;
  scenarioPopulation?: number;
}

export interface TimelineData {
  divergenceYear: number;
  milestones: TimelineMilestone[];
}

export interface SourceRecord {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
  type: string;
  notes: string;
}

export interface PhotoRecord {
  id: string;
  title: string;
  date: string;
  photographer: string;
  collection: string;
  sourceUrl: string;
  imageUrl: string | null;
  rights: string;
  location: string;
  coordinates: [number, number];
  locationPrecision: "documented" | "approximate";
  description: string;
  sourceIds: string[];
  /** Timeline years when the photo marker is eligible (for remnants: from ruin era, not only capture year). */
  activeFrom: number;
  activeTo: number;
  /** historic = documentary era scene; remnant = surviving fabric / heritage interpretation */
  subject?: "historic" | "remnant";
  /** Documented buildings this photograph depicts or stands at */
  buildingIds?: string[];
  displayMode?: "view_at_source";
  sensitivity?: string;
  thenNowPairId?: string;
}

export interface LayerId {
  id:
    | "buildings"
    | "lostBuildings"
    | "streetGrid"
    | "parcels"
    | "railway"
    | "photographs"
    | "water"
    | "counterfactual"
    | "presentDay"
    | "newspapers";
  label: string;
}

export interface SelectedFeature {
  id: string;
  name: string;
  type: string;
  confidence: Confidence;
  whatWasHere?: string;
  startYear?: number;
  endYear?: number;
  lifecycle?: BuildingLifecycle;
  sourceIds?: string[];
  photoIds?: string[];
  people?: string[];
  scenario?: string;
  reasoning?: string;
  scenarioPopulation?: number;
  label?: string;
  placeholder?: boolean;
  dateConfidence?: string;
}

export interface PopulationPoint {
  year: number;
  value: number;
  confidence?: Confidence;
  sourceIds?: string[];
  note?: string;
  label?: string;
  reasoning?: string;
}

export interface PopulationData {
  personsPerDwelling: number;
  notes: string;
  actual: PopulationPoint[];
  scenario: PopulationPoint[];
}

export interface AppState {
  started: boolean;
  year: number;
  mode: TimelineMode;
  playing: boolean;
  layers: Record<string, boolean>;
  planOpacity: number;
  selectedFeature: SelectedFeature | null;
  selectedPhoto: PhotoRecord | null;
  compareOpen: boolean;
  photosEnabled: boolean;
}
