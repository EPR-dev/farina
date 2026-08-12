"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import FarinaMap from "@/components/FarinaMap";
import Timeline from "@/components/Timeline";
import StoryCaption from "@/components/StoryCaption";
import FeaturePanel from "@/components/FeaturePanel";
import PhotoViewer from "@/components/PhotoViewer";
import LayerControl from "@/components/LayerControl";
import ModeToggle from "@/components/ModeToggle";
import IntroOverlay from "@/components/IntroOverlay";
import CompareSwipe from "@/components/CompareSwipe";
import { DEFAULT_LAYERS, DIVERGENCE_YEAR } from "@/lib/constants";
import {
  timelineData,
  photoById,
  buildingsData,
  alternateData,
  presentData,
} from "@/lib/loadData";
import {
  captionForMilestone,
  countVisibleStructures,
  milestonesForMode,
  populationLabel,
  structuresLabel,
} from "@/lib/temporal";
import type {
  PhotoRecord,
  SelectedFeature,
  TimelineMode,
} from "@/types/farina";

export default function Experience() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<TimelineMode>("actual");
  const [year, setYear] = useState(1878);
  const [playing, setPlaying] = useState(false);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [planOpacity, setPlanOpacity] = useState(0.55);
  const [feature, setFeature] = useState<SelectedFeature | null>(null);
  const [photo, setPhoto] = useState<PhotoRecord | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [mapStats, setMapStats] = useState<{
    buildings: number;
    alternate: number;
    present: number;
    year: number;
  } | null>(null);

  const milestones = useMemo(
    () => milestonesForMode(timelineData.milestones, mode),
    [mode],
  );

  const activeMilestone = useMemo(() => {
    return (
      milestones.find((m) => m.year === year) ??
      milestones.reduce((best, m) =>
        Math.abs(m.year - year) < Math.abs(best.year - year) ? m : best,
      )
    );
  }, [milestones, year]);

  const caption = captionForMilestone(activeMilestone, mode);
  const pop = mode === "today" ? null : populationLabel(year, mode);
  const speculative = mode === "whatIf" && year >= DIVERGENCE_YEAR;
  const isToday = mode === "today";
  const structureCount = useMemo(
    () =>
      isToday
        ? presentData.features.length
        : countVisibleStructures(year, mode, buildingsData, alternateData),
    [year, mode, isToday],
  );
  const structures = isToday
    ? `${presentData.features.length} FRG / present sites`
    : structuresLabel(structureCount, mode);
  const denseScenario = speculative && year >= 1910;

  const handleModeChange = (next: TimelineMode) => {
    setMode(next);
    setPlaying(false);
    setFeature(null);
    if (next === "whatIf") {
      setYear(1910);
    } else if (next === "today") {
      setYear(2026);
    }
  };

  return (
    <main className="experience">
      <FarinaMap
        year={year}
        mode={mode}
        layers={layers}
        camera={activeMilestone.camera}
        planOpacity={
          !isToday && year >= 1878 && year <= 1890 ? planOpacity : 0
        }
        onFeatureSelect={setFeature}
        onPhotoSelect={setPhoto}
        onStats={setMapStats}
        showYearHud
      />

      <div className="vignette" aria-hidden />

      <AnimatePresence>
        {!started && (
          <IntroOverlay key="intro" onBegin={() => setStarted(true)} />
        )}
      </AnimatePresence>

      {started && (
        <>
          <header className="top-bar">
            <div className="brand">
              <span className="brand-title">Farina</span>
              <span className="brand-sub">Being Made Again</span>
            </div>
            <ModeToggle
              mode={mode}
              onChange={handleModeChange}
              pastDivergence={year >= DIVERGENCE_YEAR}
            />
            <div className="top-actions">
              {!isToday && (
                <button
                  type="button"
                  className="floating-btn"
                  onClick={() => {
                    setYear(2026);
                    setCompareOpen(true);
                    setPlaying(false);
                  }}
                >
                  Compare 2026
                </button>
              )}
              <a
                className="floating-btn"
                href="https://farinarestoration.com/"
                target="_blank"
                rel="noreferrer"
              >
                FRG website
              </a>
              <LayerControl
                layers={layers}
                onChange={(id, value) =>
                  setLayers((prev) => ({ ...prev, [id]: value }))
                }
                mode={mode}
                year={year}
                planOpacity={planOpacity}
                onPlanOpacity={setPlanOpacity}
              />
            </div>
          </header>

          <StoryCaption text={caption} speculative={speculative} />

          <div className="stat-chips">
            {pop && (
              <div className={`pop-chip ${speculative ? "speculative" : ""}`}>
                {pop}
              </div>
            )}
            {(year >= 1878 || isToday) && (
              <div
                className={`pop-chip ${speculative ? "speculative" : ""} ${isToday ? "today" : ""}`}
              >
                {structures}
              </div>
            )}
            {mapStats && (
              <div className="pop-chip" title="Live features drawn on the map">
                {isToday
                  ? `Map: ${mapStats.present} today · ${mapStats.buildings} ruins`
                  : `Map: ${mapStats.buildings} hist${
                      mapStats.alternate > 0
                        ? ` · ${mapStats.alternate} alt`
                        : ""
                    }`}
              </div>
            )}
          </div>

          {speculative && (
            <div
              className={`scenario-banner ${denseScenario ? "dense" : ""}`}
              role="status"
            >
              {denseScenario
                ? "Counterfactual scenario — illustrative reconstruction of continued regional development"
                : "Speculative scenario based on continued regional development"}
            </div>
          )}

          {isToday && (
            <div className="scenario-banner today" role="status">
              Present day — sourced from farinarestoration.com · geometry
              approximate · not a survey plan
            </div>
          )}

          <FeaturePanel
            feature={feature}
            onClose={() => setFeature(null)}
            onOpenPhoto={(id) => {
              const ph = photoById(id);
              if (ph) setPhoto(ph);
            }}
          />

          <PhotoViewer photo={photo} onClose={() => setPhoto(null)} />

          {!isToday ? (
            <Timeline
              milestones={milestones}
              year={year}
              playing={playing}
              onYearChange={(y) => {
                setYear(y);
                setFeature(null);
              }}
              onPlayingChange={setPlaying}
              divergenceYear={DIVERGENCE_YEAR}
              mode={mode}
            />
          ) : (
            <div className="timeline-shell today-bar" role="status">
              <div className="today-bar-inner">
                <strong>TODAY</strong>
                <span>
                  Walking trails & campground open year-round · Bakery/cafe
                  seasonal (May–July works) ·{" "}
                  <a
                    href="https://farinarestoration.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    farinarestoration.com
                  </a>
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <CompareSwipe open={compareOpen} onClose={() => setCompareOpen(false)} />
    </main>
  );
}
