"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion, registerGsap } from "@/lib/gsap";

/**
 * Masked word reveal.
 *
 * Words — never characters. Arabic is a connected script: splitting it per
 * character breaks the joins and renders it as disconnected letterforms.
 * Word boundaries are safe in both scripts, and a per-word rise out of an
 * overflow mask reads better at display sizes than per-character anyway.
 */
export function AnimatedText({
  text,
  className = "",
  as: Tag = "span",
  id,
  delay = 0,
  stagger = 0.055,
  trigger = "scroll",
  accentClassName,
  accentWords = 0,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /**
   * Required whenever a section points at this heading with
   * `aria-labelledby` — without it the reference dangles and the landmark
   * loses its accessible name.
   */
  id?: string;
  delay?: number;
  stagger?: number;
  /** "load" fires immediately (hero); "scroll" waits for the element. */
  trigger?: "load" | "scroll";
  /** Colour applied to the final `accentWords` words. */
  accentClassName?: string;
  /**
   * How many trailing words to accent. Trailing rather than a hard-coded
   * index so it lands on the meaningful word in both scripts — English
   * "…a changing climate." and Arabic "…لمناخ متغيّر." both carry their
   * payload at the end.
   */
  accentWords?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const inners = el.querySelectorAll<HTMLElement>("[data-word-inner]");
    if (!inners.length) return;

    // Arabic glyphs have deep descenders and contextual forms that are easy
    // to clip inside per-word overflow masks. Keep Arabic headings fully
    // visible and correctly joined; the surrounding section can still reveal.
    const arabic = el.dataset.script === "arabic";
    if (arabic || prefersReducedMotion()) {
      gsap.set(inners, { clearProps: "transform,opacity", yPercent: 0, opacity: 1 });
      return;
    }

    registerGsap();
    const ctx = gsap.context(() => {
      gsap.set(inners, { yPercent: 118, opacity: 0 });
      const tween = gsap.to(inners, {
        yPercent: 0,
        opacity: 1,
        duration: 1.05,
        stagger,
        delay,
        ease: "power3.out",
        ...(trigger === "scroll"
          ? { scrollTrigger: { trigger: el, start: "top 85%", once: true } }
          : {}),
      });
      return () => tween.kill();
    }, ref);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.trigger === el && t.kill());
    };
  }, [text, delay, stagger, trigger]);

  const isArabicText = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/.test(text);
  const words = text.split(/\s+/).filter(Boolean);
  const accentFrom = accentWords > 0 ? words.length - accentWords : Infinity;

  return (
    <Tag ref={ref as never} id={id} data-script={isArabicText ? "arabic" : "latin"} className={className}>
      {words.map((word, i) => (
        // The separator is a REAL space text node, and it sits outside the
        // mask. Inside the inline-block it would be collapsed away (words run
        // together); replaced by a margin it would look right but leave
        // `textContent` as one unbroken string — which is what a screen
        // reader announces and what a copy-paste yields. It has to be a space.
        <span key={`${word}-${i}`}>
          <span
            data-word-mask
            className={isArabicText
              ? "inline align-baseline"
              : "inline-block overflow-hidden pb-[0.14em] mb-[-0.14em] align-bottom"
            }
          >
            <span
              data-word-inner
              className={`${isArabicText ? "inline" : "inline-block will-change-transform"} ${
                i >= accentFrom && accentClassName ? accentClassName : ""
              }`}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
