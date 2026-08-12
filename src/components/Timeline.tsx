"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { TimelineMilestone } from "@/types/farina";

interface TimelineProps {
  milestones: TimelineMilestone[];
  year: number;
  playing: boolean;
  onYearChange: (year: number) => void;
  onPlayingChange: (playing: boolean) => void;
  divergenceYear: number;
  mode: "actual" | "whatIf" | "today";
}

export default function Timeline({
  milestones,
  year,
  playing,
  onYearChange,
  onPlayingChange,
  divergenceYear,
  mode,
}: TimelineProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const index = useMemo(() => {
    const i = milestones.findIndex((m) => m.year === year);
    if (i >= 0) return i;
    // nearest
    let best = 0;
    let dist = Infinity;
    milestones.forEach((m, idx) => {
      const d = Math.abs(m.year - year);
      if (d < dist) {
        dist = d;
        best = idx;
      }
    });
    return best;
  }, [milestones, year]);

  const go = useCallback(
    (delta: number) => {
      const next = Math.min(Math.max(index + delta, 0), milestones.length - 1);
      onYearChange(milestones[next].year);
    },
    [index, milestones, onYearChange],
  );

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      if (index >= milestones.length - 1) {
        onPlayingChange(false);
        return;
      }
      onYearChange(milestones[index + 1].year);
    }, 2800);
    return () => window.clearInterval(id);
  }, [playing, index, milestones, onYearChange, onPlayingChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === " ") {
        e.preventDefault();
        onPlayingChange(!playing);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onPlayingChange, playing]);

  const yearFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el || milestones.length < 2) return;
    const rect = el.getBoundingClientRect();
    const t = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const idx = Math.round(t * (milestones.length - 1));
    onYearChange(milestones[idx].year);
  };

  return (
    <div className="timeline-shell" role="region" aria-label="Historical timeline">
      <div className="timeline-controls">
        <button
          type="button"
          className="tl-btn"
          onClick={() => go(-1)}
          aria-label="Previous year"
        >
          ‹
        </button>
        <button
          type="button"
          className="tl-btn play"
          onClick={() => onPlayingChange(!playing)}
          aria-label={playing ? "Pause timeline" : "Play timeline"}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          className="tl-btn"
          onClick={() => go(1)}
          aria-label="Next year"
        >
          ›
        </button>
        <div className="tl-year" aria-live="polite">
          {milestones[index]?.label ?? year}
        </div>
      </div>

      <div
        className="timeline-track"
        ref={trackRef}
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          yearFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          yearFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        role="slider"
        aria-valuemin={milestones[0]?.year}
        aria-valuemax={milestones[milestones.length - 1]?.year}
        aria-valuenow={year}
        aria-label="Timeline year"
        tabIndex={0}
      >
        <div className="timeline-rail" />
        {mode === "whatIf" && (
          <div
            className="timeline-divergence"
            style={{
              left: `${(milestones.findIndex((m) => m.year === divergenceYear) /
                Math.max(milestones.length - 1, 1)) *
                100}%`,
            }}
            title="What if starts here — the story of what could have been"
          />
        )}
        <div
          className="timeline-progress"
          style={{
            width: `${(index / Math.max(milestones.length - 1, 1)) * 100}%`,
          }}
        />
        <div className="timeline-marks">
          {milestones.map((m, i) => (
            <button
              key={m.id}
              type="button"
              className={`timeline-mark ${m.year === year ? "active" : ""} ${
                mode === "whatIf" && m.year >= divergenceYear ? "alt" : ""
              }`}
              style={{ left: `${(i / Math.max(milestones.length - 1, 1)) * 100}%` }}
              onClick={() => onYearChange(m.year)}
              aria-label={`Go to ${m.label}`}
            >
              <span className="mark-dot" />
              <span className="mark-label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
