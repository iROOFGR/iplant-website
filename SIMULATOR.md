# Fit My Space — simulator handoff

The planner at `/virtual-farm`. Two modes over one deterministic engine.

---

## 1. What it does

| Mode | Audience | Question it answers |
|---|---|---|
| **A new system** | Restaurants, hotels, offices, schools, homes, retail | "What could I grow in this space?" |
| **I already grow** | Farmers and growers | "What would control and lighting add to what I have?" |

Both end in a pre-filled enquiry, so a lead arrives already scoped instead of "I'd like more information".

---

## 2. Architecture

`lib/planner/` is **pure TypeScript with zero framework imports** — no React, no Next, no browser API. It can be unit-tested, run in Node, or lifted into another product unchanged.

```
lib/planner/
├── types.ts        Framework-free contracts
├── data.ts         Typed accessors over content/growdata.json
├── fit.ts          Unit packing — three geometries
├── production.ts   Plant density and harvest
├── resources.ts    Water, open-field comparison, electricity
├── uplift.ts       Grower mode
└── index.ts        plan() and computeUplift()
```

Both entry points are **deterministic**: no randomness, no clock, no network. Identical input always yields identical output, asserted in the test script. That is what lets a result be rendered on the server, cached, and reproduced in an enquiry email without drift.

### The data is the source of truth

`content/growdata.json` drives everything. Changing a yield, a dimension, a tariff or an assumption **needs no code change**. Every figure carries a provenance flag:

| Flag | Meaning |
|---|---|
| `ASSUMPTION` | Invented to make the model work. Review these first. |
| `INDICATIVE_PENDING_AS_BUILT` | A real dimension, not yet confirmed against what was built. |
| `DEFAULT` | Published literature, not an iPlant measurement. |
| `TO_CONFIRM` | A real external figure that needs its exact source cited. |

The UI surfaces them under "What this estimate assumes". Nothing is hidden.

---

## 3. The maths

### Fit

```
usable area   = gross area × usable_area_fraction
area per unit = footprint + width × clearance × 0.5     (HUG, rooftop)
              = gutter length × row pitch                (greenhouse)
max units     = floor(usable ÷ area per unit)
```

Clearance is **halved** because one aisle serves the rows on both sides. Charging every unit the full clearance roughly halves capacity.

Greenhouse gutters take no separate clearance — the row pitch already contains the walkway.

### Production

```
plants per m²  = plants_per_tray ÷ 0.77       (the HUG tray, the density reference)
plants         = plants per m² × element area × elements
kg per cycle   = plants × harvest_g_per_plant ÷ 1000
cycles / year  = 365 ÷ cycle_days
```

`harvest_g_per_plant` is a **low/high band**, so every output is a range by construction. That is the honest shape for a biological yield and it stops the result reading as a promise.

Density derives from growing area rather than being tied to one system's tray, which is what lets a 2.4 m² gutter and a 0.77 m² tray share one crop library.

### Water

```
system litres  = elements × water_l_per_cycle_per_tray × area scale × cycles
conventional   = harvested kg × conventional_water_l_per_kg
saving         = conventional − system
```

Note the asymmetry that makes this honest: conventional demand is derived from **the same harvested mass the system produces**. It answers "what would this much produce have cost in open field", not a comparison of two unrelated numbers.

It lands at **75–89%** across realistic inputs, which corroborates the "up to 90% less water" claim rather than assuming it.

### Uplift (grower mode)

```
cycles / year  = (productive months ÷ 12) × (365 ÷ cycle_days)
yield          = plants × harvest_g × cycles × quality factor
lighting kWh   = (W/m² ÷ 1000) × area × hours/day × months × 30.4
```

**Why months and not Daily Light Integral.** The rigorous way to model supplemental lighting is DLI: take the site's month-by-month solar radiation, subtract it from the crop's target, light the shortfall. That needs real solar climatology for the specific site, which this project does not have — and inventing it would produce a number that looks precise and is not.

Productive months is coarser but a grower can state it from experience and correct it. When real DLI data arrives, `uplift.ts` is the only file that changes.

---

## 4. Every assumption, in one place

These were invented to ship. **Review before this goes in front of a client.**

| Assumption | Value | Location |
|---|---|---|
| Usable area — indoor | 75% | `environments.indoor` |
| Usable area — retail/dining | 60% | `environments.retail` |
| Usable area — rooftop | 55% | `environments.rooftop` |
| Usable area — greenhouse | 80% | `environments.greenhouse` |
| Typical units — restaurant / hotel / office / school / home / retail / farm | 2 / 4 / 2 / 3 / 1 / 3 / 12 | `settings[].typical_units` |
| Rooftop bed | 2.0 × 1.0 m, 0.8 m clearance | `systems.rooftop` |
| Greenhouse gutter | 12 m long, 0.3 m row pitch | `systems.greenhouse` |
| Clearance share per unit | 0.5 | `lib/planner/fit.ts` |
| Productive months — passive / controlled / lit | 7 / 10 / 12 | `uplift.*_months` |
| Quality gain from control | ×1.15 | `uplift.control_yield_factor` |
| Supplemental lighting | 90 W/m², 5 h/day, 4 months | `uplift.supplemental_light_*` |

**Weakest links, in order:**

1. **As-built HUG capacity.** If `4 tiers × 1 tray` or the tray dimensions are wrong, every harvest figure moves with them.
2. **Rooftop bed geometry** — a pure placeholder. There was no rooftop system geometry in the source data at all.
3. **Productive months** — the whole grower-mode story rests on 7 → 10 → 12. A grower will have a firmer number than this.
4. **Crop yields** — literature defaults, flagged `DEFAULTS_PENDING_FIELD_VALIDATION`. iPlant has deployed sites; those should replace these.

The 0.3 m gutter pitch suits leafy crops and herbs. Fruiting crops need roughly 0.8 m — add a per-crop pitch when the library grows beyond leafy.

---

## 5. Deliberately not built

**No ROI, CAPEX or payback.** Those need validated tariffs, labour rates and as-built costs. A payback figure that cannot be defended to a government partner is a liability, not a feature.

The tariff block already sits in `growdata.json` (`tariffs.amman`, both `TO_CONFIRM`), and a prior project — FarmSim at `Desktop/farmsim` — already has a working `economics.ts` with CAPEX/OPEX/ROI. The economics layer bolts on the moment the figures are confirmed.

**No live weather.** The engine is offline and deterministic by design. TERRA at `Desktop/app` has Open-Meteo and NASA POWER providers wired if a future version wants real climate.

**No AI.** Pure arithmetic. Every number on screen traces to a constant a human approved.

---

## 6. Extending it

**Add a crop** — append to `crops[]` in `growdata.json` with `plants_per_tray` expressed against the 0.77 m² HUG tray. Add its name to `planner.crops` in both content files. No code change.

**Add a system** — add to `systems`, add an `environments` entry pointing at it, give it a `growing_area_m2_per_element`. If its geometry is neither cabinet, bed nor gutter, extend the branch in `fit.ts`.

**Add a language** — the planner reads entirely from `content.<locale>.json`. Structural parity is enforced by `npm run validate:content`.

**Correct an assumption** — edit `growdata.json`. That is the whole procedure.

---

## 7. Verifying a change

```bash
npm run check    # content parity, link integrity, media, types, lint
npm run build    # production build
```

There is a scratch engine harness used during development that prints a table of scenarios and asserts determinism. It is not committed; recreate it by calling `plan()` and `computeUplift()` directly with `npx tsx`.

**Two traps, both already handled but worth knowing:**

- Dev writes to `.next-dev`, builds write to `.next`. They used to share `.next`, which meant running a build while the dev server was live corrupted it and every request failed with `Cannot find module './vendor-chunks/*.js'`. Configured in `next.config.mjs`.
- Arabic text must never be split per character for animation — it is a connected script. The planner does not animate text, but the rest of the site does; see `HANDOFF.md §2`.
