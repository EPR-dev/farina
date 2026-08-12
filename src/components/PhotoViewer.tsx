"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PhotoRecord } from "@/types/farina";

interface PhotoViewerProps {
  photo: PhotoRecord | null;
  onClose: () => void;
}

export default function PhotoViewer({ photo, onClose }: PhotoViewerProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photo?.id]);

  const showImage =
    Boolean(photo?.imageUrl) &&
    photo?.displayMode !== "view_at_source" &&
    !failed;

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="photo-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.figure
            className="photo-modal"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={photo.title}
          >
            <button
              type="button"
              className="panel-close"
              onClick={onClose}
              aria-label="Close photo"
            >
              ×
            </button>

            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.imageUrl!}
                alt={`${photo.title}, ${photo.date}. ${photo.description}`}
                onError={() => setFailed(true)}
              />
            ) : (
              <div className="photo-placeholder">
                <p>
                  {failed
                    ? "Image failed to load from the archive host."
                    : "Image not displayed here."}
                </p>
                <p className="small">
                  {failed
                    ? "Open the archival record to view the photograph."
                    : "Reproduction rights unclear or restricted."}
                </p>
                <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
                  VIEW AT SOURCE
                </a>
              </div>
            )}

            <figcaption>
              <h2>{photo.title}</h2>
              <p>
                {photo.date}
                {photo.photographer ? ` · ${photo.photographer}` : ""}
                {photo.subject === "remnant" ? " · Remnant / heritage photo" : ""}
              </p>
              <p>{photo.description}</p>
              <p className="small">
                {photo.collection} · {photo.rights}
              </p>
              <p className="small">
                Location: {photo.location}
                {photo.locationPrecision === "approximate"
                  ? " — Approximate photograph location"
                  : ""}
              </p>
              <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
                Open archival record
              </a>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
