/**
 * Typed accessors over content/growdata.json.
 *
 * The JSON is the editable source of truth — updating a yield or a dimension
 * there needs no code change. This module only gives it types and lookup
 * helpers; it must not reinterpret or hard-code any figure.
 */

import raw from "@/content/growdata.json";
import type { CropId, EnvironmentId, SettingId, SystemId } from "./types";

export const growdata = raw;

export interface CropRecord {
  id: CropId;
  name_en: string;
  name_ar: string;
  plants_per_tray: number;
  cycle_days: number;
  harvest_g_per_plant: { low: number; high: number };
  water_l_per_cycle_per_tray: number;
  kwh_per_cycle_per_tray: number;
  conventional_water_l_per_kg: { value: number; status: string; source: string };
  market_price_jd_per_kg_default: number;
  environments: string[];
}

export const CROPS = raw.crops as unknown as CropRecord[];

export const CROP_IDS = CROPS.map((c) => c.id);

export function getCrop(id: CropId): CropRecord {
  const crop = CROPS.find((c) => c.id === id);
  // A missing crop means the JSON and the union type have drifted apart —
  // fail loudly here rather than silently producing a zeroed estimate.
  if (!crop) throw new Error(`Unknown crop id: ${id}`);
  return crop;
}

export function getEnvironment(id: EnvironmentId) {
  const env = raw.environments[id];
  if (!env) throw new Error(`Unknown environment id: ${id}`);
  return env;
}

export function getSystem(id: SystemId) {
  const system = raw.systems[id];
  if (!system) throw new Error(`Unknown system id: ${id}`);
  return system;
}

/** Which system serves a given environment. */
export function systemForEnvironment(id: EnvironmentId): SystemId {
  return getEnvironment(id).system as SystemId;
}

/** Crops that can be grown in a given environment. */
export function cropsForEnvironment(id: EnvironmentId): CropRecord[] {
  return CROPS.filter((c) => c.environments.includes(id));
}

export function getSetting(id: SettingId) {
  const setting = raw.settings.find((s) => s.id === id);
  if (!setting) throw new Error(`Unknown setting id: ${id}`);
  return setting;
}

/** Environments this setting can realistically host. */
export function environmentsForSetting(id: SettingId): string[] {
  return getSetting(id).environments;
}

export const DISCLAIMER = {
  en: raw.meta.disclaimer_en,
  ar: raw.meta.disclaimer_ar,
};
