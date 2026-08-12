"use client";

import { useState } from "react";
import { LAYER_DEFS } from "@/lib/constants";
import type { TimelineMode } from "@/types/farina";

interface LayerControlProps {
  layers: Record<string, boolean>;
  onChange: (id: string, value: boolean) => void;
  mode: TimelineMode;
  year: number;
  planOpacity: number;
  onPlanOpacity: (v: number) => void;
}

export default function LayerControl({
  layers,
  onChange,
  mode,
  year,
  planOpacity,
  onPlanOpacity,
}: LayerControlProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="layer-control">
      <button
        type="button"
        className="floating-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="layer-menu"
      >
        Layers
      </button>
      {open && (
        <div id="layer-menu" className="layer-menu" role="group" aria-label="Map layers">
          {LAYER_DEFS.map((layer) => {
            if (layer.id === "counterfactual" && mode !== "whatIf") return null;
            if (layer.id === "presentDay" && mode !== "today") return null;
            if (layer.id === "lostBuildings" && mode === "today") return null;
            if (layer.id === "railway" && year < 1882 && mode !== "today")
              return null;
            return (
              <label key={layer.id} className="layer-item">
                <input
                  type="checkbox"
                  checked={Boolean(layers[layer.id])}
                  onChange={(e) => onChange(layer.id, e.target.checked)}
                />
                <span>{layer.label}</span>
              </label>
            );
          })}

          {year >= 1878 && year <= 1890 && (
            <div className="plan-slider">
              <div className="plan-slider-labels">
                <span>Modern map</span>
                <span>1878 plan</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={planOpacity}
                onChange={(e) => onPlanOpacity(Number(e.target.value))}
                aria-label="Historical plan opacity"
              />
              <p className="small">
                Placeholder parchment overlay until the Surveyor-General plan is georeferenced.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
