"use client";

import type { PlanResult } from "@/lib/planner";

/**
 * A schematic of the planned system — units drawn to scale within the space,
 * so the fit result is something you can see rather than only read.
 *
 * Plain SVG, no WebGL, no canvas. It redraws from the plan on every change,
 * which is cheap because there are never more than a few dozen rectangles.
 */
export function SystemDiagram({ plan, label }: { plan: PlanResult; label: string }) {
  const { fit } = plan;
  if (fit.belowMinimum || fit.units === 0) return null;

  // Lay the planned units out on a grid whose proportions follow the space.
  const cols = Math.max(1, Math.ceil(Math.sqrt(fit.units * 1.4)));
  const rows = Math.ceil(fit.units / cols);

  const cell = 46;
  const gap = 9;
  const pad = 18;
  const w = cols * cell + (cols - 1) * gap + pad * 2;
  const h = rows * cell + (rows - 1) * gap + pad * 2;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full max-w-[420px]"
      role="img"
      aria-label={label}
    >
      {/* The space itself */}
      <rect
        x="1"
        y="1"
        width={w - 2}
        height={h - 2}
        rx="6"
        className="fill-none stroke-current opacity-25"
        strokeDasharray="5 5"
      />

      {Array.from({ length: fit.units }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = pad + col * (cell + gap);
        const y = pad + row * (cell + gap);
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={cell}
              height={cell}
              rx="3"
              className="fill-current opacity-[0.14]"
            />
            {/* Growing tiers inside each unit */}
            {Array.from({ length: Math.min(fit.traysPerUnit, 4) }, (_, t) => (
              <rect
                key={t}
                x={x + 7}
                y={y + 8 + t * ((cell - 16) / Math.min(fit.traysPerUnit, 4))}
                width={cell - 14}
                height="3.5"
                rx="1.75"
                className="fill-current opacity-70"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
