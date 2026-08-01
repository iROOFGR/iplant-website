/**
 * Water and energy.
 *
 * The water comparison is the site's headline claim, so the arithmetic is
 * kept explicit and one-directional:
 *
 *   system litres    = trays × water_l_per_cycle_per_tray × cycles/year
 *   conventional     = harvested kg × conventional_water_l_per_kg
 *   saving           = conventional − system
 *
 * Note the asymmetry that makes this honest: the conventional figure is
 * derived from the SAME harvested mass the system produces, so it answers
 * "what would this much produce have cost in open field" rather than
 * comparing two unrelated numbers.
 *
 * A high yield means more conventional water displaced, so the saving range
 * pairs the system's fixed draw against the yield band — low yield with the
 * low conventional figure gives the conservative end.
 */

import { getCrop, getSystem, growdata } from "./data";
import type { CropId, CropYield, EnergyResult, Range, SystemId, WaterResult } from "./types";

const DAYS_PER_YEAR = 365;
const REFERENCE_AREA_M2 = growdata.meta.density_reference.reference_area_m2;

/**
 * `water_l_per_cycle_per_tray` is likewise authored against the HUG tray, so
 * it is scaled by the element's growing area for other systems.
 */
export function computeWater(
  yields: CropYield[],
  elementAreaM2: number = REFERENCE_AREA_M2,
): WaterResult {
  const areaScale = elementAreaM2 / REFERENCE_AREA_M2;
  let litresPerYear = 0;
  let conventionalLow = 0;
  let conventionalHigh = 0;

  for (const y of yields) {
    const c = getCrop(y.crop as CropId);
    const cyclesPerYear = DAYS_PER_YEAR / c.cycle_days;

    litresPerYear += y.traysAllocated * c.water_l_per_cycle_per_tray * areaScale * cyclesPerYear;

    // Conventional demand scales with how much was actually harvested.
    conventionalLow += y.kgPerYear.low * c.conventional_water_l_per_kg.value;
    conventionalHigh += y.kgPerYear.high * c.conventional_water_l_per_kg.value;
  }

  const totalKg = yields.reduce(
    (acc, y) => ({ low: acc.low + y.kgPerYear.low, high: acc.high + y.kgPerYear.high }),
    { low: 0, high: 0 },
  );

  const conventional: Range = { low: conventionalLow, high: conventionalHigh };
  const saved: Range = {
    low: Math.max(conventional.low - litresPerYear, 0),
    high: Math.max(conventional.high - litresPerYear, 0),
  };

  const savedPercent: Range = {
    low: conventional.low > 0 ? (saved.low / conventional.low) * 100 : 0,
    high: conventional.high > 0 ? (saved.high / conventional.high) * 100 : 0,
  };

  const litresPerKg: Range = {
    // Higher yield for the same water draw means fewer litres per kg, so the
    // bounds cross over: the high yield produces the LOW litres-per-kg.
    low: totalKg.high > 0 ? litresPerYear / totalKg.high : 0,
    high: totalKg.low > 0 ? litresPerYear / totalKg.low : 0,
  };

  return {
    litresPerYear: Math.round(litresPerYear),
    conventionalLitresPerYear: roundRange(conventional, 0),
    savedLitresPerYear: roundRange(saved, 0),
    savedPercent: roundRange(savedPercent, 0),
    litresPerKg: roundRange(litresPerKg, 0),
  };
}

export function computeEnergy(
  yields: CropYield[],
  system: SystemId,
  elementAreaM2: number = REFERENCE_AREA_M2,
): EnergyResult {
  const areaScale = elementAreaM2 / REFERENCE_AREA_M2;
  const s = getSystem(system);
  const isDaylight = s.lighting === "daylight";

  // A daylight system draws no grow-lighting energy. Pump and control draw is
  // real but is not characterised in the source data, so it is reported as
  // zero rather than invented.
  if (isDaylight) return { kwhPerYear: 0, isDaylight: true };

  let kwhPerYear = 0;
  for (const y of yields) {
    const c = getCrop(y.crop as CropId);
    const cyclesPerYear = DAYS_PER_YEAR / c.cycle_days;
    kwhPerYear += y.traysAllocated * c.kwh_per_cycle_per_tray * areaScale * cyclesPerYear;
  }

  return { kwhPerYear: Math.round(kwhPerYear), isDaylight: false };
}

function roundRange(r: Range, dp: number): Range {
  const f = 10 ** dp;
  return { low: Math.round(r.low * f) / f, high: Math.round(r.high * f) / f };
}
