"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HERO_SCENES, type Locale } from "@/config/site";
import { resolveHref, type Content } from "@/lib/content";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { AnimatedText } from "@/components/ui/AnimatedText";
import {
  gsap,
  ScrollTrigger,
  isMobileLike,
  prefersReducedData,
  prefersReducedMotion,
  registerGsap,
} from "@/lib/gsap";

/** Fraction of a chapter over which it dissolves into the next. */
const SEAM = 0.06;
/** Point in a chapter at which the following clip starts downloading. */
const PRELOAD_AT = 0.68;
/** Scroll fraction over which the opening title lifts away. */
const TITLE_EXIT = 0.075;

const TOTAL_VH = HERO_SCENES.reduce((sum, scene) => sum + scene.vh, 0);

const STARTS = (() => {
  const out: number[] = [];
  let running = 0;
  for (const scene of HERO_SCENES) {
    out.push(running / TOTAL_VH);
    running += scene.vh;
  }
  return out;
})();

const SPANS = HERO_SCENES.map((scene) => scene.vh / TOTAL_VH);

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * Accent colour per chapter. The sequence tracks the story rather than
 * decorating it: aqua while the film is about water, leaf once it reaches
 * the root zone and canopy, sand when it arrives at food on a plate.
 */
const SCENE_ACCENT = [
  "text-aqua",
  "text-aqua",
  "text-leaf",
  "text-leaf",
  "text-sand",
] as const;

export function CinematicHero({
  locale,
  content,
}: {
  locale: Locale;
  content: Content;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<"scrub" | "play" | "static" | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || prefersReducedData()) setMode("static");
    else if (isMobileLike()) setMode("play");
    else setMode("scrub");
  }, []);

  useLayoutEffect(() => {
    if (!mode || mode === "static" || !rootRef.current) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const videos = videoRefs.current;
      const layers = layerRefs.current;
      const captions = captionRefs.current;

      /** Per-chapter word spans, so copy can rise on a scroll-driven stagger. */
      const words = captions.map((caption) =>
        caption
          ? Array.from(caption.querySelectorAll<HTMLElement>("[data-word-inner]"))
          : [],
      );

      layers.forEach((layer, i) => layer && gsap.set(layer, { opacity: i === 0 ? 1 : 0 }));
      words.forEach((set) => gsap.set(set, { yPercent: 115, opacity: 0 }));
      if (endRef.current) gsap.set(endRef.current, { opacity: 0, y: 24 });

      let lastIndex = -1;
      const loaded = new Set<number>([0]);

      const ensureLoaded = (index: number) => {
        if (index < 0 || index >= videos.length || loaded.has(index)) return;
        const video = videos[index];
        if (!video) return;
        video.preload = "auto";
        video.load();
        loaded.add(index);
      };

      const applyFrame = (video: HTMLVideoElement | null, seconds: number) => {
        if (!video || !video.duration || Number.isNaN(video.duration)) return;
        const target = Math.min(seconds, video.duration - 0.05);
        if (Math.abs(video.currentTime - target) < 1 / 50) return;
        video.currentTime = target;
      };

      const trigger = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = self.progress;

          // --- Opening title lifts away as the first chapter takes over ---
          const exit = clamp01(p / TITLE_EXIT);
          if (titleRef.current) {
            gsap.set(titleRef.current, {
              opacity: 1 - exit,
              yPercent: -exit * 32,
              filter: `blur(${exit * 6}px)`,
            });
          }
          if (hintRef.current) gsap.set(hintRef.current, { opacity: 1 - clamp01(p / 0.02) });

          // --- Chapter resolution ---
          let index = HERO_SCENES.length - 1;
          for (let i = 0; i < HERO_SCENES.length; i += 1) {
            const start = STARTS[i] ?? 0;
            const span = SPANS[i] ?? 1;
            if (p < start + span) {
              index = i;
              break;
            }
          }

          const start = STARTS[index] ?? 0;
          const span = SPANS[index] ?? 1;
          const local = span === 0 ? 0 : clamp01((p - start) / span);
          const scene = HERO_SCENES[index];

          ensureLoaded(index);
          if (local > PRELOAD_AT) ensureLoaded(index + 1);

          if (mode === "scrub") {
            applyFrame(videos[index] ?? null, local * (scene?.duration ?? 0));
          }

          const isLast = index === HERO_SCENES.length - 1;
          const blend = !isLast && local > 1 - SEAM ? (local - (1 - SEAM)) / SEAM : 0;

          layers.forEach((layer, i) => {
            if (!layer) return;
            let opacity = 0;
            if (i === index) opacity = 1 - blend;
            else if (i === index + 1) opacity = blend;
            gsap.set(layer, { opacity });
          });

          // --- Scroll-driven word stagger, per chapter ---
          words.forEach((set, i) => {
            if (!set.length) return;
            if (i !== index) {
              gsap.set(set, { yPercent: 115, opacity: 0 });
              return;
            }
            // Copy is fully up by ~28% and starts leaving at 72%, so it is
            // never legible across a dissolve between two chapters.
            const inP = clamp01(local / 0.28);
            const outP = clamp01((local - 0.72) / 0.18);
            set.forEach((word, w) => {
              const offset = w * 0.075;
              const wp = clamp01((inP - offset) / (1 - offset || 1));
              gsap.set(word, {
                yPercent: (1 - wp) * 115 - outP * 60,
                opacity: Math.min(wp, 1 - outP),
              });
            });
          });

          if (endRef.current) {
            const reveal = isLast ? clamp01((local - 0.72) / 0.2) : 0;
            gsap.set(endRef.current, {
              opacity: reveal,
              y: (1 - reveal) * 24,
              pointerEvents: reveal > 0.6 ? "auto" : "none",
            });
          }

          if (index !== lastIndex) {
            videos.forEach((video, i) => {
              if (!video) return;
              if (i === index) {
                if (mode === "play") {
                  video.currentTime = 0;
                  void video.play().catch(() => {});
                }
              } else {
                if (!video.paused) video.pause();
                if (mode === "play") video.currentTime = 0;
              }
            });
            lastIndex = index;
          }
        },
      });

      return () => trigger.kill();
    }, rootRef);

    return () => ctx.revert();
  }, [mode]);

  const hero = content.hero;

  // The first render is a poster only. This prevents reduced-data and
  // reduced-motion visitors from downloading the first film before their
  // preference has been resolved on the client.
  if (mode === null) {
    return (
      <section aria-label={content.a11y.heroRegion} className="grain relative min-h-[100dvh] overflow-hidden bg-ink text-paper">
        <Image src={`/media/hero/${HERO_SCENES[0]?.file}-poster.webp`} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/68" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[100dvh] max-w-[1400px] items-center px-5 pt-24 md:px-10">
          <div>
            <h1 className="display max-w-[15ch]">{hero.headline}</h1>
            <p className="lead measure mt-6 text-paper/76">{hero.supporting}</p>
          </div>
        </div>
      </section>
    );
  }

  /* ------------------------------------------------- reduced motion / data */
  if (mode === "static") {
    return (
      <section aria-label={content.a11y.heroRegion} className="relative bg-ink text-paper">
        {/* A composed hero, not a contact sheet. Reduced motion removes the
            scrub — it must not demote the page to a stack of photographs.
            One lead still carries the headline exactly as the film would. */}
        <div className="grain relative flex min-h-[78vh] items-center overflow-hidden">
          <Image
            src={`/media/hero/${HERO_SCENES[0]?.file}-poster.webp`}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/60"
            aria-hidden="true"
          />
          <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-10 pt-32 md:px-10 md:pt-40">
            <h1 className="display max-w-[15ch]">
              {(() => {
                const parts = hero.headline.split(" ").filter(Boolean);
                const from = parts.length - 2;
                return parts.map((word, i) => (
                  <span key={`${word}-${i}`} className={i >= from ? "text-aqua" : ""}>
                    {word}
                    {i < parts.length - 1 ? " " : ""}
                  </span>
                ));
              })()}
            </h1>
            <p className="lead measure mt-6 text-paper/80">{hero.supporting}</p>
            <div className="mt-9">
              <HeroActions locale={locale} content={content} bare />
            </div>
          </div>
        </div>

        {/* The remaining beats as a compact strip — the story stays readable
            without four more full-bleed images. */}
        <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-20">
          <ol className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {HERO_SCENES.slice(1).map((scene, i) => (
              <li key={scene.id}>
                <div className="grain relative aspect-4/3 overflow-hidden rounded-sm">
                  <Image
                    src={`/media/hero/${scene.file}-poster.webp`}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <p className="h3 mt-4 text-paper">
                  <span className={SCENE_ACCENT[i + 1] ?? "text-aqua"}>
                    {hero.scenes[i + 1]?.label}
                  </span>
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-12 text-sm text-paper/45">{content.a11y.heroStaticNotice}</p>
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------- cinematic */
  return (
    <div
      ref={rootRef}
      style={{ height: `${TOTAL_VH}vh` }}
      aria-label={content.a11y.heroRegion}
      className="relative bg-ink"
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        {HERO_SCENES.map((scene, i) => (
          <div
            key={scene.id}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            className="absolute inset-0"
            style={{ opacity: i === 0 ? 1 : 0 }}
            aria-hidden="true"
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              className="size-full object-cover"
              poster={`/media/hero/${scene.file}-poster.webp`}
              // `mode` is null until measured on the client. Until then nothing
              // may be fetched: a reduced-motion or data-saver visitor would
              // otherwise have already pulled clip 1 before the static path
              // takes over and drops video entirely.
              preload={mode !== null && i === 0 ? "auto" : "none"}
              muted
              playsInline
              loop={mode === "play"}
              disablePictureInPicture
              tabIndex={-1}
            >
              {mode === "play" ? (
                <source src={`/media/hero/${scene.file}-mobile.mp4`} type="video/mp4" />
              ) : (
                <>
                  <source src={`/media/hero/${scene.file}.webm`} type="video/webm" />
                  <source src={`/media/hero/${scene.file}.mp4`} type="video/mp4" />
                </>
              )}
            </video>
          </div>
        ))}

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/60"
          aria-hidden="true"
        />
        <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* Opening title. Words rise out of their masks on load, then the whole
            block lifts and blurs away as the first chapter takes over. */}
        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-0 flex items-center will-change-transform"
        >
          <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
            <AnimatedText
              as="h1"
              trigger="load"
              delay={0.15}
              text={hero.headline}
              className="display max-w-[20ch] text-paper"
              accentWords={2}
              accentClassName="text-aqua"
            />
            <AnimatedText
              trigger="load"
              delay={0.5}
              stagger={0.02}
              text={hero.supporting}
              className="lead measure mt-7 block text-paper/75"
            />
          </div>
        </div>

        {/* Per-chapter copy, at display scale rather than tucked in a corner. */}
        {HERO_SCENES.map((scene, i) => (
          <div
            key={scene.id}
            ref={(el) => {
              captionRefs.current[i] = el;
            }}
            className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-20 md:px-10 md:pb-24"
          >
            <div className="mx-auto max-w-[1400px]">
              <p className="h1 max-w-[16ch] text-paper">
                {(() => {
                  const label = hero.scenes[i]?.label ?? "";
                  const parts = label.split(" ").filter(Boolean);
                  // Accent the tail of the line — it carries the payload in
                  // both scripts ("…matters." / "…متغيّر.").
                  const from = parts.length - (parts.length > 3 ? 2 : 1);
                  return parts.map((word, w) => (
                    // Real space between words, outside the mask — see the
                    // note in AnimatedText. Anything else breaks either the
                    // visual gap or the accessible text.
                    <span key={`${word}-${w}`}>
                      <span
                        data-word-mask
                        className="inline-block overflow-hidden pb-[0.14em] mb-[-0.14em] align-bottom"
                      >
                        <span
                          data-word-inner
                          className={`inline-block will-change-transform ${
                            w >= from ? SCENE_ACCENT[i] ?? "text-aqua" : ""
                          }`}
                        >
                          {word}
                        </span>
                      </span>
                      {w < parts.length - 1 ? " " : null}
                    </span>
                  ));
                })()}
              </p>
            </div>
          </div>
        ))}

        <div
          ref={hintRef}
          className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
          aria-hidden="true"
        >
          <span className="eyebrow animate-pulse text-paper/50">
            {content.a11y.scrollHint}
          </span>
        </div>

        <div
          ref={endRef}
          className="absolute inset-0 flex items-center justify-center px-5 text-center"
          style={{ opacity: 0 }}
        >
          <div>
            <p className="display text-paper">{hero.endHeadline}</p>
            <div className="mt-10">
              <HeroActions locale={locale} content={content} centered />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroActions({
  locale,
  content,
  centered = false,
  bare = false,
}: {
  locale: Locale;
  content: Content;
  centered?: boolean;
  /** No padding of its own — for callers that already control layout. */
  bare?: boolean;
}) {
  const { primaryCta, secondaryCta } = content.hero;
  const layout = bare ? "" : centered ? "justify-center" : "px-5 pb-20 md:px-10";
  return (
    <div className={`flex flex-wrap gap-3 ${layout}`}>
      <MagneticLink
        href={resolveHref(primaryCta.href, locale)}
        className="btn bg-aqua text-ink"
      >
        {primaryCta.label}
      </MagneticLink>
      <MagneticLink
        href={resolveHref(secondaryCta.href, locale)}
        className="inline-block btn border border-paper/35 text-paper hover:border-aqua hover:text-aqua"
      >
        {secondaryCta.label}
      </MagneticLink>
    </div>
  );
}
