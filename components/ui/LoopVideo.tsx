"use client";

import { useEffect, useRef } from "react";
import { prefersReducedData, prefersReducedMotion } from "@/lib/gsap";

/**
 * Short muted loop that only downloads and plays while on screen. Falls back
 * to its poster entirely under reduced motion or a metered connection, so no
 * video bytes are fetched at all in those cases.
 */
export function LoopVideo({
  src,
  webm,
  poster,
  className = "",
  alt = "",
}: {
  src: string;
  webm?: string;
  poster: string;
  className?: string;
  alt?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (prefersReducedMotion() || prefersReducedData()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          video.preload = "auto";
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      preload="none"
      muted
      loop
      playsInline
      disablePictureInPicture
      aria-label={alt || undefined}
      role={alt ? "img" : undefined}
    >
      {webm && <source src={webm} type="video/webm" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
