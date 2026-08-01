# Handoff entry point

This is the final master iPlant project.

Start with:

1. `README.md` — setup and project overview
2. `MASTER_HANDOFF.md` — final design and merge decisions
3. `LAUNCH_CHECKLIST.md` — production checklist
4. `CONTENT_CONFIRMATION.md` — facts requiring approval
5. `QA_REPORT.md` — completed validation and remaining tests

The source of truth is the code and content inside this package. Earlier V4–V11 ZIPs are superseded by this master handoff.

---

## 10. Fit My Space planner (`/virtual-farm`)

Replaces the four-tab explorer, which both reviews flagged as promising exploration and delivering a text panel. The explorer remains below the planner as the "how the systems relate" reference it always was.

### Architecture

`lib/planner/` is **pure TypeScript with zero framework imports** — no React, no Next, no browser API. It can be unit-tested, run in Node, or lifted into another product unchanged.

| File | Responsibility |
|---|---|
| `types.ts` | Framework-free contracts |
| `data.ts` | Typed accessors over `content/growdata.json` — must not reinterpret any figure |
| `fit.ts` | Unit packing: footprint + half the access clearance per unit |
| `production.ts` | `plants × harvest_g_per_plant × cycles/year` |
| `resources.ts` | Water draw, open-field comparison, electricity |
| `index.ts` | `plan()` orchestrator |

`plan()` is **deterministic** — no randomness, no clock, no network. Identical input always yields identical output, verified by a determinism assertion.

### The data is the source of truth

`content/growdata.json` drives everything. Changing a yield, a dimension or a tariff needs **no code change**. Every figure carries a provenance flag, and the UI surfaces them under "What this estimate assumes".

### Design decisions worth knowing

**Capacity and deployment are different numbers.** A 20 m² room geometrically holds ten HUG units; no restaurant installs ten. The first sanity check returned exactly that absurdity. So the planner reports capacity as a *ceiling* and defaults the planned count to a typical deployment for the setting, which the visitor can then change. Conflating the two produces confident nonsense.

**Access clearance is halved per unit.** One aisle serves the rows on both sides. Charging every unit the full clearance roughly halves the capacity estimate.

**The water comparison is derived from the same harvested mass** the system produces — it answers "what would this much produce have cost in open field", not a comparison of two unrelated numbers. The result lands at 75–89% saving from independent arithmetic, which *corroborates* the "up to 90%" claim rather than assuming it.

**No ROI, CAPEX or payback.** Deliberate. Those need validated tariffs, labour and as-built figures. Publishing a payback number that cannot be defended to a government partner is a real liability. The economics layer bolts on once the figures are confirmed — FarmSim's `economics.ts` already exists.

### Assumptions made without confirmation

These were invented to ship and **should be reviewed**:

| Assumption | Value | Where |
|---|---|---|
| Usable area — indoor | 75% | `environments.indoor` |
| Usable area — retail/dining | 60% | `environments.retail` |
| Usable area — rooftop | 55% | `environments.rooftop` |
| Typical units — restaurant / hotel / office / school / home / retail | 2 / 4 / 2 / 3 / 1 / 3 | `settings[].typical_units` |
| Rooftop bed | 2.0 × 1.0 m, 0.8 m clearance | `systems.rooftop` |
| Clearance share per unit | 0.5 | `lib/planner/fit.ts` |

The rooftop bed dimensions in particular are a placeholder — there was no rooftop system geometry in the source data.

Rooftop energy reports **zero**, not a guess: pump and control draw is real but uncharacterised in the source data, so it is reported as daylight-grown rather than invented.

### Still blocked on

Everything in §8 applies, plus: as-built HUG capacity is the single figure that most affects output. If `4 tiers × 1 tray` or the tray dimensions are wrong, every harvest number is wrong.
