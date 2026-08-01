"use client";

import { useLayoutEffect, useRef } from "react";
import type { Locale } from "@/config/site";
import type { Content } from "@/lib/content";
import { Eyebrow } from "@/components/ui/Section";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { RevealImage } from "@/components/ui/RevealImage";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { gsap, ScrollTrigger, prefersReducedMotion, registerGsap } from "@/lib/gsap";

/**
 * Flagship case studies as editorial spreads.
 *
 * Each is a full-width plate with an oversized index numeral riding over its
 * bottom edge, the title spanning wide underneath, and the challenge →
 * solution → result narrative as three columns that draw themselves in.
 */
export function ProjectsShowcase({
  content,
  locale,
  variant = "full",
  limit,
}: {
  content: Content;
  locale: Locale;
  /**
   * "compact" is the homepage treatment: three cards that tease the work and
   * hand off to /projects. Four full-width editorial spreads ran to seven and
   * a half screens on the homepage, which buried everything after it.
   */
  variant?: "full" | "compact";
  limit?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    registerGsap();

    const isRtl = document.documentElement.dir === "rtl";

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-project]").forEach((article) => {
        // The three narrative columns draw their rule and rise together.
        const steps = article.querySelectorAll<HTMLElement>("[data-step]");
        gsap.from(steps, {
          opacity: 0,
          y: 34,
          duration: 0.85,
          stagger: 0.11,
          ease: "power3.out",
          scrollTrigger: { trigger: steps[0] ?? article, start: "top 88%", once: true },
        });

        const rules = article.querySelectorAll<HTMLElement>("[data-rule]");
        gsap.from(rules, {
          scaleX: 0,
          // `transformOrigin` is physical and GSAP writes it inline, so it
          // beats any `rtl:origin-right` class. The rule has to draw from
          // the side the reader starts on, which flips in Arabic.
          transformOrigin: isRtl ? "right center" : "left center",
          duration: 1,
          stagger: 0.11,
          ease: "power3.inOut",
          scrollTrigger: { trigger: steps[0] ?? article, start: "top 88%", once: true },
        });

        // The numeral drifts against the plate as it passes.
        const numeral = article.querySelector<HTMLElement>("[data-numeral]");
        if (numeral) {
          gsap.fromTo(
            numeral,
            { yPercent: 18 },
            {
              yPercent: -18,
              ease: "none",
              scrollTrigger: {
                trigger: article,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }

        const meta = article.querySelectorAll<HTMLElement>("[data-meta]");
        gsap.from(meta, {
          opacity: 0,
          y: 20,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: article, start: "top 62%", once: true },
        });
      });
    }, rootRef);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const projects = content.projects;

  const items = limit ? projects.items.slice(0, limit) : projects.items;

  if (variant === "compact") {
    return (
      <section
        id="projects"
        aria-labelledby="projects-heading"
        className="bg-paper text-ink"
        ref={rootRef}
      >
        <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-24">
          <Eyebrow>{projects.eyebrow}</Eyebrow>
          <AnimatedText
            as="h2"
            id="projects-heading"
            text={projects.heading}
            className="h1 mt-4 block max-w-[26ch]"
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3 md:grid-rows-[auto_auto_auto_auto]">
            {items.map((item) => (
              <article key={item.id} data-project className="md:grid md:row-span-4 md:grid-rows-subgrid md:gap-0">
                <RevealImage
                  src={item.image}
                  alt={item.title}
                  className="grain aspect-4/3 w-full rounded-sm"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  parallax={12}
                />
                {/* Partner lines vary from one line to three, so the slot is
                    reserved at a fixed height — otherwise the card titles sit
                    at three different baselines across the row. */}
                <p data-meta className="eyebrow mt-5 self-start text-forest">
                  {item.partnerLine}
                </p>
                <h3 className="h3 mt-2 self-start">{item.title}</h3>
                <p className="mt-2 self-start text-ink/70">{item.location}</p>
              </article>
            ))}
          </div>

          <div className="mt-12">
            <MagneticLink href={`/${locale}/projects`} className="btn bg-forest text-paper">
              {projects.allLabel}
            </MagneticLink>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="bg-paper text-ink"
      ref={rootRef}
    >
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
        <Eyebrow>{projects.eyebrow}</Eyebrow>
        <AnimatedText
          as="h2"
          id="projects-heading"
          text={projects.heading}
          className="h1 mt-4 block max-w-[26ch]"
        />
      </div>

      <div className="space-y-24 pb-24 md:space-y-40 md:pb-32">
        {items.map((item, index) => (
          <article key={item.id} data-project className="relative">
            {/* Plate */}
            <div className="mx-auto max-w-[1400px] px-5 md:px-10">
              <div className="relative">
                {"video" in item && item.video ? (
                  // The CEA room is the one project we have moving footage
                  // of - the three units in the clip are that room - so it
                  // leads with the plate alive rather than a still.
                  <div className="grain relative aspect-4/3 w-full overflow-hidden rounded-sm md:aspect-16/7">
                    <LoopVideo
                      src={item.video}
                      webm={"videoWebm" in item ? item.videoWebm : undefined}
                      poster={"poster" in item && item.poster ? item.poster : item.image}
                      className="size-full object-cover"
                      alt={item.title}
                    />
                  </div>
                ) : (
                  <RevealImage
                    src={item.image}
                    alt={item.title}
                    className="aspect-4/3 w-full rounded-sm md:aspect-16/7"
                    sizes="(max-width: 1400px) 100vw, 1400px"
                    parallax={20}
                  />
                )}
                {/* Oversized index, riding the bottom edge of the plate. */}
                <span
                  data-numeral
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-6 start-2 select-none font-mono text-[clamp(4rem,11vw,10rem)] font-medium leading-none text-paper mix-blend-difference md:-bottom-10 md:start-6"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Title + meta */}
            <div className="mx-auto mt-12 max-w-[1400px] px-5 md:mt-16 md:px-10">
              <div className="grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-end">
                <div>
                  {/* Partner names lead. UNDP and the Royal Scientific Society
                      are the most credible signals on the site; they were
                      previously buried in an 11px metadata row. */}
                  <p data-meta className="h3 text-forest">
                    {item.partnerLine}
                  </p>
                  <AnimatedText
                    as="h3"
                    text={item.title}
                    className="h2 mt-3 block"
                    stagger={0.045}
                  />
                </div>
                <dl className="md:pb-2" data-meta>
                  <dt className="eyebrow opacity-50">{projects.labels.location}</dt>
                  <dd className="mt-1.5 text-ink/80">{item.location}</dd>
                </dl>
              </div>

              {/* Narrative: three columns, each drawing its own rule. */}
              <div className="mt-12 grid gap-x-10 gap-y-8 md:mt-16 md:grid-cols-3">
                {(
                  [
                    [projects.labels.challenge, item.challenge],
                    [projects.labels.solution, item.solution],
                    [projects.labels.result, item.result],
                  ] as const
                ).map(([label, body]) => (
                  <div key={label} data-step>
                    <span
                      data-rule
                      className="block h-px w-full bg-forest/35 rtl:origin-right"
                      aria-hidden="true"
                    />
                    <p className="eyebrow mt-4 text-forest">{label}</p>
                    <p className="mt-3 text-ink/80">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
