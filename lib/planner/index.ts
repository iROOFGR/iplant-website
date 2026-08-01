/**
 * Fit My Space — planner entry point.
 *
 * `plan()` is pure and deterministic: identical input always yields identical
 * output, there is no randomness, no clock, and no network. That is what lets
 * the result be rendered on the server, cached, and reproduced in an enquiry
 * email without drift.
 */

import { getCrop, getEnvironment, getSystem, growdata } from "./data";
import { computeFit } from "./fit";
import { allocateTrays, computeYield, sumRanges } from "./production";
import { computeEnergy, computeWater } from "./resources";
import type { Assumption, CropId, PlanInput, PlanResult } from "./types";

export * from "./types";
export {
  CROPS,
  cropsForEnvironment,
  getCrop,
  getSetting,
  environmentsForSetting,
  systemForEnvironment,
  DISCLAIMER,
} from "./data";

/** Smallest area worth planning for. Below this the answer is "talk to us". */
export const MIN_AREA_M2 = 2;
export const MAX_AREA_M2 = 5000;

export function plan(input: PlanInput): PlanResult {
  const areaM2 = clamp(input.areaM2, 0, MAX_AREA_M2);
  const fit = computeFit(areaM2, input.environment, input.setting, input.units);

  const crops = input.crops.length ? input.crops : (["lettuce"] as CropId[]);
  const allocation = allocateTrays(fit.trays, crops.length);
  const yields = crops.map((crop, i) => computeYield(crop, allocation[i] ?? 0));

  const totals = {
    kgPerMonth: sumRanges(yields.map((y) => y.kgPerMonth)),
    kgPerYear: sumRanges(yields.map((y) => y.kgPerYear)),
  };

  const water = computeWater(yields);
  const energy = computeEnergy(yields, fit.system);

  return {
    input: { ...input, areaM2, units: fit.units },
    fit,
    yields,
    totals: {
      kgPerMonth: roundRange(totals.kgPerMonth),
      kgPerYear: roundRange(totals.kgPerYear),
    },
    water,
    energy,
    assumptions: collectAssumptions(input, fit.system),
  };
}

/**
 * Surface every figure the result leaned on that is not yet field-validated.
 * The UI renders these so nobody mistakes a modelled estimate for a
 * measurement.
 */
function collectAssumptions(input: PlanInput, systemId: PlanResult["fit"]["system"]): Assumption[] {
  const env = getEnvironment(input.environment);
  const system = getSystem(systemId);
  const out: Assumption[] = [
    {
      id: "usableArea",
      status: "ASSUMPTION",
      value: `${Math.round(env.usable_area_fraction.value * 100)}%`,
    },
    { id: "dimensions", status: system.dimensions_status as Assumption["status"] },
  ];

  for (const cropId of input.crops) {
    const c = getCrop(cropId);
    out.push({
      id: `conventionalWater.${cropId}`,
      status: c.conventional_water_l_per_kg.status as Assumption["status"],
      value: `${c.conventional_water_l_per_kg.value} L/kg`,
    });
  }

  out.push({ id: "yields", status: growdata.meta.status as Assumption["status"] });
  return out;
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

function roundRange(r: { low: number; high: number }) {
  return { low: Math.round(r.low * 10) / 10, high: Math.round(r.high * 10) / 10 };
}
