/**
 * Framework-free contracts for the Fit My Space planner.
 *
 * Nothing in `lib/planner` may import React, Next or any browser API. The
 * engine is plain TypeScript so it can be unit-tested, run in Node, or lifted
 * into another product without change.
 */

export type EnvironmentId = "indoor" | "retail" | "rooftop" | "greenhouse";
export type SystemId = "hug" | "rooftop" | "greenhouse";
export type CropId = "lettuce" | "basil" | "mint";
export type SettingId =
  | "restaurant"
  | "hotel"
  | "office"
  | "school"
  | "home"
  | "retail"
  | "farm";

/** A low/high band. Every biological output is a range, never a point value. */
export interface Range {
  low: number;
  high: number;
}

export interface PlanInput {
  /** Floor or roof area in m². Either given directly or derived from w × d. */
  areaM2: number;
  environment: EnvironmentId;
  setting: SettingId;
  /** One or more crops, shared evenly across the available growing area. */
  crops: CropId[];
  /**
   * How many units to actually install. Omit to use the typical deployment
   * for the setting. Filling every square metre is what the space ALLOWS,
   * not what anyone installs — so capacity is the ceiling, not the answer.
   */
  units?: number;
}

/** How many units fit, and why that number and not another. */
export interface FitResult {
  system: SystemId;
  /** Area the visitor entered. */
  grossAreaM2: number;
  /** After the environment's usable-area assumption. */
  usableAreaM2: number;
  usableFraction: number;
  /** Footprint of one unit including its share of access clearance. */
  areaPerUnitM2: number;
  /** Most units the space could physically hold. */
  maxUnits: number;
  /** Units actually planned — what every downstream figure is based on. */
  units: number;
  /** Typical starting deployment for this setting. */
  typicalUnits: number;
  /** Growing trays (HUG) or beds (rooftop) across the planned units. */
  trays: number;
  traysPerUnit: number;
  /** Growing surface of one tray / bed / gutter, in m². */
  elementAreaM2: number;
  /** True when the area is too small for even one unit. */
  belowMinimum: boolean;
}

export interface CropYield {
  crop: CropId;
  traysAllocated: number;
  plants: number;
  cycleDays: number;
  /** Harvests per year from this crop's cycle length. */
  cyclesPerYear: number;
  kgPerCycle: Range;
  kgPerMonth: Range;
  kgPerYear: Range;
}

export interface WaterResult {
  /** Litres the system uses per year across all allocated trays. */
  litresPerYear: number;
  /** Litres open-field growing would need for the same annual harvest. */
  conventionalLitresPerYear: Range;
  /** Litres saved per year (conventional minus system). */
  savedLitresPerYear: Range;
  /** Saving as a percentage of the conventional figure. */
  savedPercent: Range;
  /** Litres of water per kg of produce, this system. */
  litresPerKg: Range;
}

export interface EnergyResult {
  /** kWh per year across all allocated trays. Zero for daylight systems. */
  kwhPerYear: number;
  /** Null when the system is daylight-driven and draws no grow lighting. */
  isDaylight: boolean;
}

/**
 * Every assumption the result rests on, surfaced rather than buried.
 * The UI renders these verbatim so a visitor can see what was taken on trust.
 */
export interface Assumption {
  id: string;
  /** Provenance of the underlying figure. */
  status: "ASSUMPTION" | "INDICATIVE_PENDING_AS_BUILT" | "DEFAULT" | "TO_CONFIRM";
  value?: string;
}

export interface PlanResult {
  input: PlanInput;
  fit: FitResult;
  yields: CropYield[];
  totals: {
    kgPerMonth: Range;
    kgPerYear: Range;
  };
  water: WaterResult;
  energy: EnergyResult;
  assumptions: Assumption[];
}

/* ────────────────────────────── Grower mode ───────────────────────────── */

/** What a grower already has in place. Each step adds to the one before it. */
export type ControlLevel = "none" | "controlled" | "lit";

export interface UpliftInput {
  /** Growing area under glass, m². */
  areaM2: number;
  crop: CropId;
  /** What they run today. */
  current: ControlLevel;
}

export interface UpliftStage {
  level: ControlLevel;
  /** Productive months per year at this level. */
  productiveMonths: number;
  cyclesPerYear: number;
  kgPerYear: Range;
  /** Added electricity for supplemental lighting, kWh/yr. Zero below "lit". */
  lightingKwhPerYear: number;
}

export interface UpliftResult {
  input: UpliftInput;
  /** Where they are now. */
  current: UpliftStage;
  /** Every stage, so the gap between them is visible rather than asserted. */
  stages: UpliftStage[];
  /** Growing elements the area supports. */
  elements: number;
  plants: number;
  assumptions: Assumption[];
}
