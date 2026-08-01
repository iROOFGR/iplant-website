"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion, registerGsap } from "@/lib/gsap";

/**
 * Image that wipes open on entry and drifts inside its frame as it passes.
 *
 * The wipe is clip-path on the frame while the image itself scales down from
 * 1.18 — the two moving against each other is what makes it feel like film
 * rather than a fade. Both are compositor-friendly.
 */
export function RevealImage({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  sizes = "100vw",
  priority = false,
  parallax = 8,
}: {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Percentage of drift across the whole scroll pass. 0 disables. */
  parallax?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;

    const arabic = document.documentElement.lang === "ar";
    if (arabic || prefersReducedMotion()) {
      gsap.set(frame, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(img, { scale: 1, yPercent: 0 });
      return;
    }

    registerGsap();
    const ctx = gsap.context(() => {
      gsap.set(frame, { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(img, { scale: 1.18 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: frame, start: "top 88%", once: true },
      });
      tl.to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.25, ease: "power4.inOut" })
        .to(img, { scale: 1, duration: 1.6, ease: "power2.out" }, 0);

      // Slow vertical drift while the frame crosses the viewport.
      if (parallax > 0) {
        gsap.fromTo(
          img,
          { yPercent: -parallax / 2 },
          {
            yPercent: parallax / 2,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    }, frameRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.trigger === frame && t.kill());
    };
  }, [parallax]);

  return (
    <div ref={frameRef} className={`relative overflow-hidden ${className}`}>
      <div ref={imgRef} className="absolute inset-0 will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover ${imgClassName}`}
        />
      </div>
    </div>
  );
}
