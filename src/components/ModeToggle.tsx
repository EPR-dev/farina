"use client";

import type { TimelineMode } from "@/types/farina";

interface ModeToggleProps {
  mode: TimelineMode;
  onChange: (mode: TimelineMode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle" role="group" aria-label="Map story mode">
      <button
        type="button"
        className={mode === "actual" ? "active" : ""}
        onClick={() => onChange("actual")}
      >
        Actual history
      </button>
      <button
        type="button"
        className={mode === "today" ? "active today" : ""}
        onClick={() => onChange("today")}
      >
        Today
      </button>
      <button
        type="button"
        className={mode === "whatIf" ? "active whatif" : ""}
        onClick={() => onChange("whatIf")}
      >
        What if?
      </button>
    </div>
  );
}
