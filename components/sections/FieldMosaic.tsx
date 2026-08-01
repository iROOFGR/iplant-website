"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/config/site";
import { resolveHref, type Content } from "@/lib/content";
import { Eyebrow } from "@/components/ui/Section";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { MagneticLink } from "@/components/ui/MagneticLink";

/**
 * A curated field journal rather than a loose card mosaic.
 *
 * The previous version showed eight unrelated frames at different heights,
 * which made the section feel visually restless. This treatment uses one
 * large, consistent image stage and a clear five-step working sequence:
 * test → control → grow → harvest → deploy.
 */
export function FieldMosaic({ content, locale }: { content: Content; locale: Locale }) {
  const field = content.field;
  const items = field.items.slice(0, 5);
  const [active, setActive] = useState(0);
  const activeItem = items[active] ?? items[0];

  return (
    <section
      aria-labelledby="field-heading"
      className="bg-paper-warm text-ink"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.35fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <Eyebrow className="text-forest">{field.eyebrow}</Eyebrow>
            <AnimatedText
              as="h2"
              id="field-heading"
              text={field.headline}
              className="h1 mt-4 block max-w-[12ch]"
              accentWords={2}
              accentClassName="text-forest"
            />
            <p className="lead mt-6 max-w-[42ch] text-ink/70">{field.body}</p>

            <div
              role="tablist"
              aria-label={field.eyebrow}
              className="mt-10 border-y border-ink/12"
            >
              {items.map((item, index) => {
                const selected = index === active;
                return (
                  <button
                    key={item.src}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="field-image-panel"
                    onClick={() => setActive(index)}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    className={`group flex w-full items-center justify-between gap-5 border-b border-ink/10 py-4 text-start transition-colors last:border-b-0 md:py-5 ${
                      selected ? "text-forest" : "text-ink/55 hover:text-ink"
                    }`}
                  >
                    <span className="text-base font-medium leading-snug md:text-lg">
                      {item.caption}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`h-px shrink-0 transition-all duration-500 ${
                        selected ? "w-12 bg-aqua" : "w-5 bg-ink/25 group-hover:w-8"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-9">
              <MagneticLink
                href={resolveHref(content.aboutBand.cta.href, locale)}
                className="btn border border-ink/30 text-ink hover:border-forest hover:text-forest"
              >
                {content.aboutBand.cta.label}
              </MagneticLink>
            </div>
          </div>

          <div>
            <figure
              id="field-image-panel"
              role="tabpanel"
              className="relative"
              aria-live="polite"
            >
              <div className="grain relative aspect-[16/10] overflow-hidden bg-sand-soft">
                {items.map((item, index) => (
                  <Image
                    key={item.src}
                    src={item.src}
                    alt={index === active ? item.alt : ""}
                    fill
                    sizes="(max-width: 1024px) 100vw, 62vw"
                    priority={index === 0}
                    className={`object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      index === active
                        ? "scale-100 opacity-100"
                        : "pointer-events-none scale-[1.025] opacity-0"
                    }`}
                  />
                ))}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent"
                  aria-hidden="true"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 text-paper md:p-7">
                  <p className="h3 max-w-[24ch]">{activeItem?.caption}</p>
                  <span className="hidden text-sm text-paper/70 md:block">
                    iPlant · Amman
                  </span>
                </figcaption>
              </div>

              <div className="mt-5 grid gap-4 border-b border-ink/12 pb-5 sm:grid-cols-2">
                <p className="text-sm leading-relaxed text-ink/60">
                  {content.credibility.items[0]?.label}
                </p>
                <p className="text-sm leading-relaxed text-ink/60 sm:text-end">
                  {content.credibility.items[3]?.label}
                </p>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
