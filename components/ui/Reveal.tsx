"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion, registerGsap } from "@/lib/gsap";

/**
 * Scroll-in reveal for everything below the hero. Deliberately restrained:
 * a short rise and fade, staggered across direct children.
 *
 * Movement is vertical only, so nothing here needs mirroring for RTL.
 */
export function Reveal({
  children,
  className = "",
  stagger = 0.08,
  y = 28,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  as?: "div" | "section" | "ul" | "ol" | "article";
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Arabic pages prioritize dependable legibility over decorative fades.
    // This also prevents content remaining transparent if a browser delays
    // ScrollTrigger initialization while the Arabic webfont is loading.
    const arabic = document.documentElement.lang === "ar";
    if (arabic || prefersReducedMotion()) {
      gsap.set(el.children, { clearProps: "transform,opacity", opacity: 1, y: 0 });
      return;
    }

    registerGsap();
    const ctx = gsap.context(() => {
      gsap.set(el.children, { opacity: 0, y });
      const tween = gsap.to(el.children, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });
      return () => {
        tween.kill();
        ScrollTrigger.getAll().forEach((t) => t.trigger === el && t.kill());
      };
    }, ref);

    return () => ctx.revert();
  }, [stagger, y]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
