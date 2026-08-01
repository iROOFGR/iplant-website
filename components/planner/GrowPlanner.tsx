"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/config/site";
import type { Content } from "@/lib/content";
import {
  MAX_AREA_M2,
  cropsForEnvironment,
  environmentsForSetting,
  plan as computePlan,
  type CropId,
  type EnvironmentId,
  type PlanResult,
  type Range,
  type SettingId,
} from "@/lib/planner";
import { SystemDiagram } from "./SystemDiagram";

const SETTINGS: SettingId[] = ["restaurant", "hotel", "office", "school", "home", "retail"];

/** Numbers stay in Western digits in both locales — the Levant commercial norm. */
const fmt = (n: number) => n.toLocaleString("en-US");
const fmtRange = (r: Range) => `${fmt(r.low)}–${fmt(r.high)}`;

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));
}

export function GrowPlanner({ locale, content }: { locale: Locale; content: Content }) {
  const t = content.planner;

  const [areaM2, setAreaM2] = useState(40);
  const [setting, setSetting] = useState<SettingId>("restaurant");
  const [environment, setEnvironment] = useState<EnvironmentId>("indoor");
  const [crops, setCrops] = useState<CropId[]>(["lettuce", "basil"]);
  /** Null means "follow the typical deployment"; a number is an explicit choice. */
  const [units, setUnits] = useState<number | null>(null);
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Changing the setting can invalidate the environment, and changing the
  // environment can invalidate a crop. Resolve both before planning rather
  // than letting an impossible combination reach the engine.
  const allowedEnvironments = environmentsForSetting(setting) as EnvironmentId[];
  const env: EnvironmentId = allowedEnvironments.includes(environment)
    ? environment
    : (allowedEnvironments[0] as EnvironmentId);

  const availableCrops = useMemo(() => cropsForEnvironment(env), [env]);

  // Memoised because it is a useMemo dependency below — rebuilding the array
  // each render would recompute the whole plan on every keystroke.
  const effectiveCrops = useMemo<CropId[]>(() => {
    const active = crops.filter((c) => availableCrops.some((a) => a.id === c));
    return active.length ? active : [availableCrops[0]!.id];
  }, [crops, availableCrops]);

  const result: PlanResult = useMemo(
    () =>
      computePlan({
        areaM2,
        environment: env,
        setting,
        crops: effectiveCrops,
        units: units ?? undefined,
      }),
    [areaM2, env, setting, effectiveCrops, units],
  );

  const { fit, totals, water, energy } = result;

  /** Carry the plan into the enquiry so the first reply can be specific. */
  const enquiryHref = useMemo(() => {
    const summary = [
      `${areaM2} m² ${t.environments[env]}`,
      `${fit.units} × ${fit.system === "hug" ? "HUG" : t.environments.rooftop}`,
      effectiveCrops.map((c) => t.crops[c]).join(", "),
      `~${fmtRange(totals.kgPerMonth)} ${t.results.harvestUnit}`,
    ].join(" · ");
    const params = new URLSearchParams({
      type: fit.system === "hug" ? "hug" : "project",
      plan: summary,
    });
    return `/${locale}/contact?${params.toString()}`;
  }, [areaM2, env, fit, effectiveCrops, totals, t, locale]);

  function toggleCrop(id: CropId) {
    setCrops((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function reset() {
    setAreaM2(40);
    setSetting("restaurant");
    setEnvironment("indoor");
    setCrops(["lettuce", "basil"]);
    setUnits(null);
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
        {/* ─────────────────────────── Inputs ─────────────────────────── */}
        <form className="space-y-9" onSubmit={(e) => e.preventDefault()}>
          {/* Space */}
          <fieldset>
            <legend className="eyebrow text-forest">{t.steps.space}</legend>
            <label htmlFor="planner-area" className="mt-3 block text-sm text-ink/75">
              {t.labels.area}
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="planner-area"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_AREA_M2}
                value={areaM2}
                onChange={(e) => setAreaM2(Math.max(1, Number(e.target.value) || 1))}
                dir="ltr"
                className="w-32 rounded-sm border border-line bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-forest"
              />
              <span className="text-ink/60">{t.labels.areaUnit}</span>
            </div>
            <input
              type="range"
              min={2}
              max={400}
              step={1}
              value={Math.min(areaM2, 400)}
              onChange={(e) => setAreaM2(Number(e.target.value))}
              aria-label={t.labels.area}
              className="mt-4 w-full accent-forest"
            />
            <p className="mt-2 text-sm text-ink/55">{t.labels.areaHelp}</p>
          </fieldset>

          {/* Setting */}
          <fieldset>
            <legend className="eyebrow text-forest">{t.steps.setting}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {SETTINGS.map((s) => (
                <Chip
                  key={s}
                  active={setting === s}
                  onClick={() => setSetting(s)}
                  label={t.settings[s]}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {allowedEnvironments.map((e) => (
                <Chip
                  key={e}
                  active={env === e}
                  onClick={() => setEnvironment(e)}
                  label={t.environments[e]}
                  subtle
                />
              ))}
            </div>
          </fieldset>

          {/* Crops */}
          <fieldset>
            <legend className="eyebrow text-forest">{t.steps.crops}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableCrops.map((c) => (
                <Chip
                  key={c.id}
                  active={effectiveCrops.includes(c.id)}
                  onClick={() => toggleCrop(c.id)}
                  label={t.crops[c.id]}
                  pressed
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-ink/55">{t.labels.cropsHelp}</p>
          </fieldset>

          {/* Scale */}
          {!fit.belowMinimum && (
            <fieldset>
              <legend className="eyebrow text-forest">{t.steps.scale}</legend>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="h2 text-forest">
                  <bdi>{fit.units}</bdi>
                </span>
                <span className="text-sm text-ink/60">
                  {fill(t.labels.unitsOf, { max: fit.maxUnits })}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(fit.maxUnits, 1)}
                step={1}
                value={fit.units}
                onChange={(e) => setUnits(Number(e.target.value))}
                aria-label={t.labels.units}
                className="mt-3 w-full accent-forest"
              />
              {units === null && (
                <p className="mt-2 text-sm text-ink/55">
                  <bdi>{fit.typicalUnits}</bdi> — {t.labels.typical}
                </p>
              )}
            </fieldset>
          )}
        </form>

        {/* ─────────────────────────── Results ────────────────────────── */}
        <div>
          {fit.belowMinimum ? (
            <div className="rounded-sm border border-line bg-white p-8">
              <h2 className="h3">{t.tooSmall.title}</h2>
              <p className="measure mt-3 text-ink/75">{t.tooSmall.body}</p>
              <Link href={`/${locale}/contact?type=hug`} className="btn mt-6 bg-forest text-paper">
                {content.faas.secondaryCta.label}
              </Link>
            </div>
          ) : (
            <div className="rounded-sm bg-white p-7 md:p-9">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="eyebrow text-ink/50">{t.results.systemLabel}</p>
                  <p className="h2 mt-1.5">
                    {fit.system === "hug" ? "HUG" : t.environments.rooftop}
                  </p>
                  <p className="mt-2 text-ink/70">
                    <bdi>{fit.units}</bdi> {t.results.unitsLabel.toLowerCase()} ·{" "}
                    <bdi>{fit.trays}</bdi> {t.results.traysLabel.toLowerCase()}
                  </p>
                </div>
                <div className="text-forest">
                  <SystemDiagram plan={result} label={t.results.systemLabel} />
                </div>
              </div>

              {/* Headline figure */}
              <div className="mt-8 border-t border-line pt-7">
                <p className="eyebrow text-ink/50">{t.results.harvestLabel}</p>
                <p className="display mt-2 text-forest">
                  <bdi>{fmtRange(totals.kgPerMonth)}</bdi>
                </p>
                <p className="text-ink/70">{t.results.harvestUnit}</p>
                <p className="mt-1 text-sm text-ink/55">
                  <bdi>
                    {fill(t.results.harvestYear, {
                      low: fmt(totals.kgPerYear.low),
                      high: fmt(totals.kgPerYear.high),
                    })}
                  </bdi>
                </p>
              </div>

              {/* Water + energy */}
              <div className="mt-7 grid gap-6 border-t border-line pt-7 sm:grid-cols-2">
                <div>
                  <p className="eyebrow text-ink/50">{t.results.waterLabel}</p>
                  <p className="h3 mt-2 text-forest">
                    <bdi>
                      {fill(t.results.waterSaved, {
                        low: water.savedPercent.low,
                        high: water.savedPercent.high,
                      })}
                    </bdi>
                  </p>
                  <p className="mt-1.5 text-sm text-ink/65">
                    <bdi>{fill(t.results.waterUse, { value: fmt(water.litresPerYear) })}</bdi>
                  </p>
                  <p className="text-sm text-ink/65">
                    <bdi>
                      {fill(t.results.waterPerKg, {
                        low: water.litresPerKg.low,
                        high: water.litresPerKg.high,
                      })}
                    </bdi>
                  </p>
                </div>
                <div>
                  <p className="eyebrow text-ink/50">{t.results.energyLabel}</p>
                  <p className="h3 mt-2">
                    {energy.isDaylight ? (
                      t.results.energyDaylight
                    ) : (
                      <bdi>{fill(t.results.energyUse, { value: fmt(energy.kwhPerYear) })}</bdi>
                    )}
                  </p>
                </div>
              </div>

              {/* Per crop */}
              <div className="mt-7 border-t border-line pt-7">
                <p className="eyebrow text-ink/50">{t.results.perCrop}</p>
                <ul className="mt-4 space-y-3">
                  {result.yields.map((y) => (
                    <li key={y.crop} className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">{t.crops[y.crop]}</span>
                      <span className="text-sm text-ink/65">
                        <bdi>{fmtRange(y.kgPerMonth)}</bdi> {t.results.harvestUnit} ·{" "}
                        <bdi>{fill(t.results.plants, { value: fmt(y.plants) })}</bdi> ·{" "}
                        <bdi>{fill(t.results.cycles, { value: y.cyclesPerYear })}</bdi>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Assumptions — collapsed, never hidden */}
              <div className="mt-7 border-t border-line pt-6">
                <button
                  type="button"
                  onClick={() => setShowAssumptions((v) => !v)}
                  aria-expanded={showAssumptions}
                  className="eyebrow text-forest underline-offset-4 hover:underline"
                >
                  {showAssumptions ? t.assumptions.toggleHide : t.assumptions.toggle}
                </button>
                {showAssumptions && (
                  <ul className="mt-4 space-y-2 text-sm text-ink/65">
                    <li>
                      {fill(t.assumptions.usableArea, {
                        value: `${Math.round(fit.usableFraction * 100)}%`,
                      })}
                    </li>
                    <li>{t.assumptions.typicalUnits}</li>
                    <li>{t.assumptions.dimensions}</li>
                    <li>{t.assumptions.conventionalWater}</li>
                    <li>{t.assumptions.yields}</li>
                  </ul>
                )}
              </div>

              {/* Next step */}
              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-7">
                <Link href={enquiryHref} className="btn bg-forest text-paper">
                  {t.cta.label}
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm text-ink/60 underline-offset-4 hover:text-forest hover:underline"
                >
                  {t.cta.secondary}
                </button>
              </div>
              <p className="mt-3 text-sm text-ink/55">{t.cta.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  subtle = false,
  pressed = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  subtle?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...(pressed ? { "aria-pressed": active } : {})}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        active
          ? subtle
            ? "bg-forest/12 text-forest"
            : "bg-forest text-paper"
          : "border border-line text-ink/70 hover:border-forest hover:text-forest"
      }`}
    >
      {label}
    </button>
  );
}
