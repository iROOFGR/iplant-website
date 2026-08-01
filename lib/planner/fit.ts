/**
 * How many growing units the space allows, and how many to actually plan for.
 *
 * These are two different numbers and conflating them produces nonsense. A
 * 20 m² room geometrically holds ten HUG units; no restaurant installs ten.
 * So capacity is reported as a ceiling, and the planned figure defaults to
 * the typical deployment for the setting until the visitor says otherwise.
 *
 * The geometry itself is honest: a unit claims its own footprint plus a share
 * of the access clearance it needs to be worked on. Units pushed against each
 * other cannot be harvested from.
 */

import { getEnvironment, getSetting, getSystem, systemForEnvironment } from "./data";
import type { EnvironmentId, FitResult, SettingId } from "./types";

/**
 * Access clearance is shared between neighbouring rows — one aisle serves the
 * units on both sides — so each unit carries half. Charging every unit the
 * full clearance would roughly halve the capacity.
 */
const CLEARANCE_SHARE = 0.5;

export function computeFit(
  areaM2: number,
  environment: EnvironmentId,
  setting: SettingId,
  requestedUnits?: number,
): FitResult {
  const systemId = systemForEnvironment(environment);
  const system = getSystem(systemId);
  const env = getEnvironment(environment);
  const typicalUnits = getSetting(setting).typical_units.value;

  const usableFraction = env.usable_area_fraction.value;
  const usableAreaM2 = areaM2 * usableFraction;

  // HUG is a cabinet with a footprint; the rooftop system is laid out in beds.
  const footprint =
    "footprint_m" in system
      ? system.footprint_m.w * system.footprint_m.d
      : system.bed_m.l * system.bed_m.w;
  const width = "footprint_m" in system ? system.footprint_m.w : system.bed_m.l;

  const areaPerUnitM2 = footprint + width * system.access_clearance_m * CLEARANCE_SHARE;
  const maxUnits = Math.max(Math.floor(usableAreaM2 / areaPerUnitM2), 0);

  // Plan for what was asked, what is typical, or what fits — whichever is
  // smallest and still at least one unit when the space allows one.
  const units =
    maxUnits === 0
      ? 0
      : Math.min(Math.max(Math.round(requestedUnits ?? typicalUnits), 1), maxUnits);

  const traysPerUnit = "tiers" in system ? system.tiers * system.trays_per_tier : 1;

  return {
    system: systemId,
    grossAreaM2: areaM2,
    usableAreaM2: round(usableAreaM2, 1),
    usableFraction,
    areaPerUnitM2: round(areaPerUnitM2, 2),
    maxUnits,
    units,
    typicalUnits,
    trays: units * traysPerUnit,
    traysPerUnit,
    belowMinimum: maxUnits < 1,
  };
}

function round(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
