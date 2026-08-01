"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Register once, on the client only. No ScrollSmoother, no Lenis — the hero
 * scrub reads native scroll position directly, and layering a smoothing
 * library over it introduces lag between the scroll and the video frame.
 */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
  if (process.env.NODE_ENV === "development") {
    Object.assign(window, { gsap, ScrollTrigger });
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Coarse pointer and small viewport together are a good proxy for "device
 * that will struggle with aggressive scroll seeking".
 */
export function isMobileLike(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 860px), (pointer: coarse)").matches;
}

/**
 * Data-saver, where the browser exposes it. Used to fall back to posters
 * rather than pulling megabytes of video onto a metered connection.
 */
export function prefersReducedData(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";
}

export { gsap, ScrollTrigger };
