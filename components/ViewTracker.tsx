"use client";

import { useEffect, useRef } from "react";

interface ViewTrackerProps {
  path: string;
  albumId?: string;
  photoId?: string;
}

export function ViewTracker({ path, albumId, photoId }: ViewTrackerProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, albumId, photoId }),
    }).catch(() => {});
  }, [path, albumId, photoId]);

  return null;
}
