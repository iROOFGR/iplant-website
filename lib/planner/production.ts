/**
 * Harvest estimate.
 *
 * Deliberately the simplest defensible chain:
 *
 *   plants        = trays × plants_per_tray
 *   kg per cycle  = plants × harvest_g_per_plant ÷ 1000
 *   cycles/year   = 365 ÷ cycle_days
 *
 * `harvest_g_per_plant` arrives as a low/high band, so the output is a range
 * by construction. That is the honest shape for a biological yield and it
 * stops the result reading as a promise.
 *
 * No growth model, no stress coefficients, no climate response. Those belong
 * in a full simulator; here they would add precision the input data cannot
 * support.
 */

import { getCrop, growdata } from "./data";
import type { CropId, CropYield, Range } from "./types";

/**
 * `plants_per_tray` is authored against the HUG tray, so plant density is
 * derived from it and then applied to whatever growing surface the chosen
 * system actually has. That is what lets a 2.4 m² gutter and a 0.77 m² tray
 * share one crop library instead of needing per-system plant counts.
 */
const REFERENCE_AREA_M2 = growdata.meta.density_reference.reference_area_m2;

export function plantsPerM2(crop: CropId): number {
  return getCrop(crop).plants_per_tray / REFERENCE_AREA_M2;
}

/** Plants on one growing element of the given surface area. */
export function plantsOnElement(crop: CropId, elementAreaM2: number): number {
  return Math.round(plantsPerM2(crop) * elementAreaM2);
}

const DAYS_PER_YEAR = 365;
const MONTHS_PER_YEAR = 12;
const G_PER_KG = 1000;

/**
 * Split trays across the chosen crops. Any remainder from uneven division
 * goes to the earlier crops rather than being dropped.
 */
export function allocateTrays(totalTrays: number, cropCount: number): number[] {
  if (cropCount <= 0) return [];
  const base = Math.floor(totalTrays / cropCount);
  let remainder = totalTrays % cropCount;
  return Array.from({ length: cropCount }, () => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return base + extra;
  });
}

export function computeYield(
  crop: CropId,
  traysAllocated: number,
  elementAreaM2: number = REFERENCE_AREA_M2,
): CropYield {
  const c = getCrop(crop);
  const plants = traysAllocated * plantsOnElement(crop, elementAreaM2);
  const cyclesPerYear = DAYS_PER_YEAR / c.cycle_days;

  const kgPerCycle: Range = {
    low: (plants * c.harvest_g_per_plant.low) / G_PER_KG,
    high: (plants * c.harvest_g_per_plant.high) / G_PER_KG,
  };

  const kgPerYear: Range = {
    low: kgPerCycle.low * cyclesPerYear,
    high: kgPerCycle.high * cyclesPerYear,
  };

  return {
    crop,
    traysAllocated,
    plants,
    cycleDays: c.cycle_days,
    cyclesPerYear: round(cyclesPerYear, 1),
    kgPerCycle: roundRange(kgPerCycle, 1),
    kgPerMonth: roundRange(
      { low: kgPerYear.low / MONTHS_PER_YEAR, high: kgPerYear.high / MONTHS_PER_YEAR },
      1,
    ),
    kgPerYear: roundRange(kgPerYear, 0),
  };
}

export function sumRanges(ranges: Range[]): Range {
  return ranges.reduce(
    (acc, r) => ({ low: acc.low + r.low, high: acc.high + r.high }),
    { low: 0, high: 0 },
  );
}

function round(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

function roundRange(r: Range, dp: number): Range {
  return { low: round(r.low, dp), high: round(r.high, dp) };
}
