"use client";

import type { PlanResult, SystemId } from "@/lib/planner";

/**
 * Sectional schematic of the planned system.
 *
 * Drawn in section rather than plan because a section is what actually shows
 * how the system works — tiers stacked under lights, water returning to a
 * tank, a controller watching it. A top-down rectangle shows only that
 * something occupies floor.
 *
 * SVG only: no WebGL, no canvas, no dependency. Motion is confined to a
 * flowing water dash and a slow light pulse, both dropped under
 * prefers-reduced-motion by the global CSS rule.
 */

const LEAF = "M0 0c3-5 8-6 11-1-3 5-8 6-11 1Z";

/** A small plant: stem plus two leaves, scaled to the row. */
function Plant({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0V-7" className="stroke-current" strokeWidth="1.1" strokeLinecap="round" />
      <path d={LEAF} transform="translate(0 -7) rotate(-28)" className="fill-current opacity-80" />
      <path d={LEAF} transform="translate(0 -6) rotate(150) scale(-1 1)" className="fill-current opacity-60" />
    </g>
  );
}

/** Dashed line that animates along its path — the nutrient loop. */
function FlowLine({ d, delay = 0 }: { d: string; delay?: number }) {
  return (
    <path
      d={d}
      className="fill-none stroke-current opacity-45 [animation:planner-flow_2.4s_linear_infinite] motion-reduce:[animation:none]"
      strokeWidth="1.4"
      strokeDasharray="4 5"
      strokeLinecap="round"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function ControllerBox({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="20" height="26" rx="3" className="fill-current opacity-15" />
      <rect
        width="20"
        height="26"
        rx="3"
        className="fill-none stroke-current opacity-70"
        strokeWidth="1.2"
      />
      <rect x="4" y="4" width="12" height="8" rx="1.5" className="fill-current opacity-55" />
      {[16, 20].map((cy, i) => (
        <circle
          key={cy}
          cx={6 + i * 8}
          cy={cy}
          r="1.6"
          className="fill-current [animation:planner-pulse_2.6s_ease-in-out_infinite] motion-reduce:[animation:none]"
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </g>
  );
}

/** LED bar with a soft downward glow. */
function LightBar({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height="2.6" rx="1.3" className="fill-current opacity-90" />
      <path
        d={`M2 3 L${w / 2} 13 L${w - 2} 3 Z`}
        className="fill-current opacity-[0.13] [animation:planner-pulse_3.4s_ease-in-out_infinite] motion-reduce:[animation:none]"
      />
    </g>
  );
}

/* ────────────────────────────────── HUG ────────────────────────────────── */

function HugSection({ tiers }: { tiers: number }) {
  const shown = Math.min(tiers, 4);
  const top = 16;
  const rowH = 34;
  const h = top + shown * rowH + 40;

  return (
    <svg viewBox={`0 0 220 ${h}`} className="h-auto w-full" role="presentation">
      {/* cabinet */}
      <rect
        x="18"
        y="8"
        width="184"
        height={shown * rowH + 44}
        rx="6"
        className="fill-current opacity-[0.06]"
      />
      <rect
        x="18"
        y="8"
        width="184"
        height={shown * rowH + 44}
        rx="6"
        className="fill-none stroke-current opacity-30"
        strokeWidth="1.3"
      />

      {Array.from({ length: shown }, (_, i) => {
        const y = top + i * rowH;
        return (
          <g key={i}>
            <LightBar x={30} y={y + 4} w={160} />
            {/* growing tray */}
            <rect x={30} y={y + 26} width="160" height="5" rx="2" className="fill-current opacity-45" />
            {Array.from({ length: 7 }, (_, p) => (
              <Plant key={p} x={40 + p * 24} y={y + 26} scale={0.95} />
            ))}
          </g>
        );
      })}

      {/* tank + return loop */}
      <rect
        x={30}
        y={top + shown * rowH + 6}
        width="90"
        height="18"
        rx="3"
        className="fill-current opacity-20"
      />
      <FlowLine d={`M126 ${top + shown * rowH + 15} H186 V${top + 6}`} />
      <ControllerBox x={172} y={top + shown * rowH - 4} />
    </svg>
  );
}

/* ─────────────────────────────── Greenhouse ────────────────────────────── */

function GreenhouseSection() {
  return (
    <svg viewBox="0 0 220 150" className="h-auto w-full" role="presentation">
      {/* arched glazing */}
      <path
        d="M14 118 V64 Q110 6 206 64 V118"
        className="fill-current opacity-[0.05]"
      />
      <path
        d="M14 118 V64 Q110 6 206 64 V118"
        className="fill-none stroke-current opacity-35"
        strokeWidth="1.4"
      />
      {/* glazing bars */}
      {[52, 84, 110, 136, 168].map((x) => (
        <path
          key={x}
          d={`M${x} 118 V${x < 110 ? 30 + (110 - x) * 0.22 : 30 + (x - 110) * 0.22}`}
          className="stroke-current opacity-15"
          strokeWidth="0.9"
        />
      ))}

      {/* supplemental lighting under the ridge */}
      <LightBar x={62} y={44} w={40} />
      <LightBar x={118} y={44} w={40} />

      {/* gutters on their pitch */}
      {[0, 1, 2, 3].map((i) => {
        const x = 30 + i * 42;
        return (
          <g key={i}>
            <rect x={x} y={104} width="34" height="5" rx="2" className="fill-current opacity-45" />
            <Plant x={x + 9} y={104} scale={1.05} />
            <Plant x={x + 25} y={104} scale={1.05} />
          </g>
        );
      })}

      {/* nutrient loop along the floor */}
      <FlowLine d="M22 118 H198" />
      <ControllerBox x={188} y={74} />
      <line x1="14" y1="118" x2="206" y2="118" className="stroke-current opacity-30" strokeWidth="1.3" />
    </svg>
  );
}

/* ──────────────────────────────── Rooftop ──────────────────────────────── */

function RooftopSection() {
  return (
    <svg viewBox="0 0 220 150" className="h-auto w-full" role="presentation">
      {/* sun */}
      <circle cx="182" cy="30" r="12" className="fill-current opacity-25" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={182 + Math.cos(a) * 17}
            y1={30 + Math.sin(a) * 17}
            x2={182 + Math.cos(a) * 22}
            y2={30 + Math.sin(a) * 22}
            className="stroke-current opacity-25"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        );
      })}

      {/* parapet + deck */}
      <path d="M12 122 H208" className="stroke-current opacity-35" strokeWidth="1.6" />
      <path d="M12 122 V104 M208 122 V104" className="stroke-current opacity-30" strokeWidth="1.6" />

      {/* beds */}
      {[0, 1, 2].map((i) => {
        const x = 30 + i * 58;
        return (
          <g key={i}>
            <rect x={x} y={104} width="46" height="14" rx="2.5" className="fill-current opacity-16" />
            <rect
              x={x}
              y={104}
              width="46"
              height="14"
              rx="2.5"
              className="fill-none stroke-current opacity-45"
              strokeWidth="1.1"
            />
            {[0, 1, 2].map((p) => (
              <Plant key={p} x={x + 10 + p * 13} y={104} scale={1.1} />
            ))}
          </g>
        );
      })}

      <FlowLine d="M20 130 H200" />
    </svg>
  );
}

export function SystemDiagram({
  plan,
  label,
  system,
}: {
  plan?: PlanResult;
  label: string;
  system?: SystemId;
}) {
  const id = system ?? plan?.fit.system;
  if (!id) return null;
  if (plan && (plan.fit.belowMinimum || plan.fit.units === 0)) return null;

  return (
    <figure className="w-full max-w-[300px]" aria-label={label} role="img">
      {id === "hug" && <HugSection tiers={plan?.fit.traysPerUnit ?? 4} />}
      {id === "greenhouse" && <GreenhouseSection />}
      {id === "rooftop" && <RooftopSection />}
    </figure>
  );
}
