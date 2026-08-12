"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SelectedFeature } from "@/types/farina";
import { confidenceLabel } from "@/lib/temporal";
import { photoById, sourceById } from "@/lib/loadData";

interface FeaturePanelProps {
  feature: SelectedFeature | null;
  onClose: () => void;
  onOpenPhoto: (photoId: string) => void;
}

export default function FeaturePanel({
  feature,
  onClose,
  onOpenPhoto,
}: FeaturePanelProps) {
  return (
    <AnimatePresence>
      {feature && (
        <motion.aside
          className="feature-panel"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-label={feature.name}
        >
          <button type="button" className="panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>

          {feature.scenario === "counterfactual" && (
            <div className="badge speculative">What if</div>
          )}
          {feature.scenario === "present_day" && (
            <div className="badge today">Present day · FRG</div>
          )}
          {feature.placeholder && (
            <div className="badge approx">Placeholder geometry</div>
          )}

          <h2>{feature.name}</h2>
          <p className="meta">
            {feature.scenario === "present_day"
              ? (feature.label ?? "Farina Restoration Group site").toUpperCase()
              : feature.scenario === "counterfactual"
                ? "A glimpse of what could have been"
                : `${feature.startYear ?? "—"}${
                    feature.endYear && feature.endYear < 9000
                      ? ` → ${feature.endYear}`
                      : ""
                  }`}
            {feature.lifecycle && feature.scenario !== "counterfactual"
              ? ` · ${feature.lifecycle.toUpperCase()}`
              : ""}
          </p>

          {feature.scenarioPopulation != null && (
            <p className="scenario-pop">
              About {feature.scenarioPopulation.toLocaleString()} people in this
              story
            </p>
          )}

          <p className="body">{feature.whatWasHere ?? feature.reasoning ?? ""}</p>

          <dl className="detail-list">
            <div>
              <dt>Confidence</dt>
              <dd>{confidenceLabel(feature.confidence)}</dd>
            </div>
            {feature.dateConfidence && (
              <div>
                <dt>Date confidence</dt>
                <dd>{feature.dateConfidence}</dd>
              </div>
            )}
            {feature.people?.length ? (
              <div>
                <dt>People</dt>
                <dd>{feature.people.join(", ")}</dd>
              </div>
            ) : null}
          </dl>

          {feature.photoIds?.length ? (
            <div className="panel-photos">
              <h3>Photographs</h3>
              {feature.photoIds.map((id) => {
                const ph = photoById(id);
                if (!ph) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    className="photo-chip"
                    onClick={() => onOpenPhoto(id)}
                  >
                    {ph.title} · {ph.date}
                  </button>
                );
              })}
            </div>
          ) : null}

          {feature.sourceIds?.length ? (
            <div className="panel-sources">
              <h3>Sources</h3>
              <ul>
                {feature.sourceIds.map((id) => {
                  const s = sourceById(id);
                  if (!s) return <li key={id}>{id}</li>;
                  return (
                    <li key={id}>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer">
                          {s.title}
                        </a>
                      ) : (
                        s.title
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
