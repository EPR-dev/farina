"use client";

import { motion } from "framer-motion";

interface IntroOverlayProps {
  onBegin: () => void;
}

export default function IntroOverlay({ onBegin }: IntroOverlayProps) {
  return (
    <motion.div
      className="intro-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1 }}
    >
      <div className="intro-veil" />
      <div className="intro-content">
        <p className="intro-ack">
          We acknowledge the Aboriginal peoples of the Farina region and their
          continuing connection to Country. Traditional Owner associations for
          this specific locality require verification through Native Title
          resources and community guidance — this experience does not map
          cultural boundaries.
        </p>
        <h1>FARINA</h1>
        <h2>Being Made Again</h2>
        <p className="intro-years">1878 → 2026</p>
        <p className="intro-tag">
          It never became the city it was promised — but people are working hard
          to make it something again.
        </p>
        <button type="button" className="begin-btn" onClick={onBegin}>
          Begin
        </button>
      </div>
    </motion.div>
  );
}
