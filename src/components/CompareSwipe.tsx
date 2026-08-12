"use client";

import { useEffect, useRef, useState } from "react";
import FarinaMap from "@/components/FarinaMap";
import { DEFAULT_LAYERS } from "@/lib/constants";
import type { CameraState } from "@/types/farina";

interface CompareSwipeProps {
  open: boolean;
  onClose: () => void;
}

const CAMERA_2026: CameraState = {
  center: [138.2765, -30.075],
  zoom: 14.2,
  pitch: 48,
  bearing: -15,
};

export default function CompareSwipe({ open, onClose }: CompareSwipeProps) {
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const pct = (e.clientX / window.innerWidth) * 100;
      setSplit(Math.min(Math.max(pct, 8), 92));
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [open]);

  if (!open) return null;

  const actualLayers = {
    ...DEFAULT_LAYERS,
    counterfactual: false,
    parcels: false,
    photographs: false,
  };
  const altLayers = {
    ...DEFAULT_LAYERS,
    counterfactual: true,
    lostBuildings: false,
    photographs: false,
  };

  return (
    <div className="compare-overlay" role="dialog" aria-label="Compare 2026 Farina">
      <div className="compare-header">
        <div>
          <strong>COMPARE 2026</strong>
          <span className="compare-sub">
            Left: Actual Farina · Right: Counterfactual scenario
          </span>
        </div>
        <button type="button" className="floating-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="compare-stage">
        <div className="compare-map compare-right">
          <FarinaMap
            year={2026}
            mode="whatIf"
            layers={altLayers}
            camera={CAMERA_2026}
            planOpacity={0}
            interactive={false}
          />
          <div className="compare-label right">
            Alternate Farina 2026
            <em>Illustrative reconstruction</em>
          </div>
        </div>
        <div className="compare-map compare-left" style={{ width: `${split}%` }}>
          <div className="compare-map-inner">
            <FarinaMap
              year={2026}
              mode="actual"
              layers={actualLayers}
              camera={CAMERA_2026}
              planOpacity={0}
              interactive={false}
            />
          </div>
          <div className="compare-label left">Actual Farina 2026</div>
        </div>
        <div
          className="compare-divider"
          style={{ left: `${split}%` }}
          onPointerDown={() => {
            dragging.current = true;
          }}
          role="slider"
          aria-valuemin={8}
          aria-valuemax={92}
          aria-valuenow={Math.round(split)}
          aria-label="Comparison divider"
          tabIndex={0}
        >
          <span />
        </div>
      </div>
    </div>
  );
}
