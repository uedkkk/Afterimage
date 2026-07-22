"use client";

import { useEffect } from "react";

export function KgToggleScript() {
  useEffect(() => {
    const toggles = document.querySelectorAll<HTMLElement>(".kg-toggle-card");
    const cleanups: (() => void)[] = [];

    toggles.forEach((toggle) => {
      const heading = toggle.querySelector<HTMLElement>(".kg-toggle-heading");
      if (!heading) return;

      const handler = () => {
        const state = toggle.getAttribute("data-kg-toggle-state");
        toggle.setAttribute(
          "data-kg-toggle-state",
          state === "open" ? "close" : "open"
        );
      };

      heading.addEventListener("click", handler);
      cleanups.push(() => heading.removeEventListener("click", handler));
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
