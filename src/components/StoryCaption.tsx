"use client";

import { AnimatePresence, motion } from "framer-motion";

interface StoryCaptionProps {
  text: string;
  speculative?: boolean;
}

export default function StoryCaption({ text, speculative }: StoryCaptionProps) {
  if (!text) return null;

  return (
    <div className="story-caption-wrap" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          className={`story-caption ${speculative ? "speculative" : ""}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.55 }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
