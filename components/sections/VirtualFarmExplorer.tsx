"use client";

import Image from "next/image";
import { useState } from "react";
import type { Content } from "@/lib/content";

/**
 * Virtual Farm v1: a lightweight interactive explorer over the supplied media.
 * No WebGL, no 3D, and no invented live data — the note below the panel says
 * so explicitly, because a farm explorer that looks like a dashboard invites
 * the assumption that the numbers are real.
 */
export function VirtualFarmExplorer({ content }: { content: Content }) {
  const zones = content.virtualFarm.zones;
  const labels = content.virtualFarm.zoneLabels;
  const [activeId, setActiveId] = useState(zones[0]?.id ?? "");
  const active = zones.find((zone) => zone.id === activeId) ?? zones[0];

  if (!active) return null;

  const rows = [
    [labels.water, active.water],
    [labels.crop, active.crop],
    [labels.energy, active.energy],
    [labels.control, active.control],
  ] as const;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
      <div
        role="tablist"
        aria-label={content.virtualFarm.headline}
        className="flex flex-wrap gap-2"
      >
        {zones.map((zone) => {
          const selected = zone.id === active.id;
          return (
            <button
              key={zone.id}
              type="button"
              role="tab"
              id={`vf-tab-${zone.id}`}
              aria-selected={selected}
              aria-controls={`vf-panel-${zone.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(zone.id)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                event.preventDefault();
                const index = zones.findIndex((zone) => zone.id === active.id);
                // "Next" follows reading order, so the arrow keys swap under RTL.
                const rtl = document.documentElement.dir === "rtl";
                const forward = event.key === (rtl ? "ArrowLeft" : "ArrowRight");
                const next = (index + (forward ? 1 : -1) + zones.length) % zones.length;
                const target = zones[next];
                if (target) {
                  setActiveId(target.id);
                  document.getElementById(`vf-tab-${target.id}`)?.focus();
                }
              }}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
                selected
                  ? "bg-forest text-paper"
                  : "border border-line text-ink/70 hover:border-forest hover:text-forest"
              }`}
            >
              {zone.title}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`vf-panel-${active.id}`}
        aria-labelledby={`vf-tab-${active.id}`}
        className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start"
      >
        <div className="grain relative aspect-3/2 overflow-hidden rounded-sm">
          <Image
            key={active.image}
            src={active.image}
            alt={active.title}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        </div>

        <div>
          <h2 className="h2">{active.title}</h2>
          <dl className="mt-6 space-y-5">
            {rows.map(([label, body]) => (
              <div key={label} className="border-s-2 border-forest/25 ps-5">
                <dt className="eyebrow opacity-55">{label}</dt>
                <dd className="measure mt-1.5 text-ink/80">{body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <p className="mt-10 text-sm text-ink/55">{content.virtualFarm.note}</p>
    </div>
  );
}
