/**
 * Grower mode — what control and supplemental light add to an existing house.
 *
 * The audience here is different from the rest of the planner. A restaurant
 * asks "what could I grow?"; a grower already grows and asks "what would this
 * change?". So the output is a delta against what they run today, not an
 * absolute.
 *
 * ── Why season length and not DLI ──────────────────────────────────────────
 * The rigorous way to model supplemental lighting is Daily Light Integral:
 * take the site's month-by-month solar radiation, subtract it from the crop's
 * target DLI, and light the shortfall. That needs real solar climatology for
 * the specific site, which this project does not have — and inventing it would
 * produce a number that looks precise and is not.
 *
 * So the model is expressed in productive months per year instead. A grower
 * can state from experience how many months their house actually produces,
 * and correct the default. It is a coarser model that is honest about being
 * coarse, rather than a fine model resting on invented inputs.
 *
 * When real DLI data arrives this file is the only thing that changes.
 */

import { getCrop, growdata } from "./data";
import { plantsOnElement } from "./production";
import type {
  Assumption,
  ControlLevel,
  Range,
  UpliftInput,
  UpliftResult,
  UpliftStage,
} from "./types";

const MONTHS_PER_YEAR = 12;
const DAYS_PER_MONTH = 365 / 12;
const G_PER_KG = 1000;
const W_TO_KW = 1000;

const LEVELS: ControlLevel[] = ["none", "controlled", "lit"];

export function computeUplift(input: UpliftInput): UpliftResult {
  const u = growdata.uplift;
  const gh = growdata.systems.greenhouse;
  const env = growdata.environments.greenhouse;
  const crop = getCrop(input.crop);

  const areaM2 = Math.max(input.areaM2, 0);
  const growingAreaM2 = areaM2 * env.usable_area_fraction.value;

  // Gutter runs the house supports, and the plants on them.
  const areaPerGutter = gh.gutter_m.l * gh.gutter_pitch_m;
  const elements = Math.max(Math.floor(growingAreaM2 / areaPerGutter), 0);
  const plants = elements * plantsOnElement(input.crop, gh.growing_area_m2_per_element);

  const monthsFor: Record<ControlLevel, number> = {
    none: u.baseline_productive_months.value,
    controlled: u.with_climate_control_months.value,
    lit: u.with_supplemental_light_months.value,
  };

  // Lighting only runs in the months when natural light is short, and only
  // once the grower is actually lighting.
  const lightingKwh =
    (u.supplemental_light_w_per_m2.value / W_TO_KW) *
    growingAreaM2 *
    u.supplemental_light_hours_per_day.value *
    u.supplemental_light_months.value *
    DAYS_PER_MONTH;

  const stages: UpliftStage[] = LEVELS.map((level) => {
    const productiveMonths = monthsFor[level];
    const cyclesPerYear = (productiveMonths / MONTHS_PER_YEAR) * (365 / crop.cycle_days);

    // Control also improves each cycle, not just the number of them: holding
    // EC, pH and climate in range beats letting them drift.
    const qualityFactor = level === "none" ? 1 : u.control_yield_factor.value;

    const kgPerYear: Range = {
      low: (plants * crop.harvest_g_per_plant.low * cyclesPerYear * qualityFactor) / G_PER_KG,
      high: (plants * crop.harvest_g_per_plant.high * cyclesPerYear * qualityFactor) / G_PER_KG,
    };

    return {
      level,
      productiveMonths,
      cyclesPerYear: round(cyclesPerYear, 1),
      kgPerYear: roundRange(kgPerYear, 0),
      lightingKwhPerYear: level === "lit" ? Math.round(lightingKwh) : 0,
    };
  });

  const current = stages.find((s) => s.level === input.current) ?? stages[0]!;

  return {
    input: { ...input, areaM2 },
    current,
    stages,
    elements,
    plants,
    assumptions: [
      { id: "uplift.months", status: "ASSUMPTION", value: `${monthsFor.none} → ${monthsFor.lit}` },
      {
        id: "uplift.qualityFactor",
        status: "ASSUMPTION",
        value: `×${u.control_yield_factor.value}`,
      },
      {
        id: "uplift.lighting",
        status: "ASSUMPTION",
        value: `${u.supplemental_light_w_per_m2.value} W/m², ${u.supplemental_light_hours_per_day.value} h/day, ${u.supplemental_light_months.value} months`,
      },
      { id: "uplift.dimensions", status: gh.dimensions_status as Assumption["status"] },
      { id: "yields", status: growdata.meta.status as Assumption["status"] },
    ],
  };
}

function round(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

function roundRange(r: Range, dp: number): Range {
  const f = 10 ** dp;
  return { low: Math.round(r.low * f) / f, high: Math.round(r.high * f) / f };
}
