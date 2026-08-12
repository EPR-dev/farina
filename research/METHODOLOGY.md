# Methodology

## Decision / operational outcome

This application supports exploration of a counterfactual planning question: **what if Farina had retained regional transport importance after 1884?** It separates documented historical geography from illustrative reconstruction so users can evaluate decline drivers without confusing speculation for fact.

## Geometry types

| Layer | Geometry | CRS | Units |
| --- | --- | --- | --- |
| Buildings / ruins | Polygon (footprints) + Point (labels) | EPSG:4326 (WGS84) for storage; Web Mercator for display | Degrees stored; metres only after projection |
| Street grid / parcels | LineString / Polygon | EPSG:4326 | Degrees |
| Railway | LineString | EPSG:4326 | Degrees |
| Photos | Point | EPSG:4326 | Degrees |
| Alternate development | Polygon / Point | EPSG:4326 | Degrees |

**Never assume CRS equality** when swapping in survey plans or Data SA layers — reproject explicitly.

## Temporal model

Every feature carries `startYear` / `endYear` (or `activeFrom` / `activeTo`) and optional lifecycle derived at render time. The map filters by selected year. Status progression for documented buildings:

`ACTIVE → CLOSED → ABANDONED → RUIN → LOST`

Unknown closure years are marked `dateConfidence: "approximate"`.

## Confidence levels

| Level | Meaning | Visual cue |
| --- | --- | --- |
| `documented` | Archival evidence + reasonable location | Solid fill / full opacity |
| `approximate` | Evidence exists; location/date uncertain | Reduced outline opacity |
| `speculative` | Counterfactual or interpretive | Distinct teal palette + labels |

## Population model

Source of truth: [`data/population.json`](../data/population.json).  
UI interpolates linearly between anchors via `populationAtYear()` in `src/lib/temporal.ts`.

### Actual (historical estimates)

| Year | Value | Confidence | Notes |
| --- | --- | --- | --- |
| 1878 | ~50 | approximate | Town proclaimed |
| 1882 | ~250 | approximate | Railhead boom begins |
| 1890 | **~600** | approximate | FRG / secondary peak |
| 1927 | ~280 | approximate | Mining closing era |
| 1957 | ~80 | approximate | School closes |
| 1980 | ~5 | approximate | Effective abandonment |
| 2021 | **15** | documented | ABS locality (includes surrounds) |

Peak ~600 is a widely repeated secondary estimate (FRG, Wikipedia, Australian Geographic) — not a named census extract for the township alone. Modern ABS figures are **locality** counts, not “town proper” occupied dwellings.

### Scenario (counterfactual — always labelled)

| Year | Scenario population | Role |
| --- | --- | --- |
| 1884 | 450 | Divergence (shared history) |
| 1910 | 1,200 | Inland transport / ag service centre |
| 1930 | 1,800 | Established regional town |
| 1950 | 2,300 | Post-war consolidation |
| 1980 | 2,700 | Small regional centre |
| **2026** | **3,000** | Quorn-plus service town |

**Never display scenario numbers as “Population:”** — always **Scenario population:**.

### Comparable towns (sizing rationale)

| Town | Why comparable | Caution |
| --- | --- | --- |
| Quorn (~1,150 in 2021) | Rail-era service town, Flinders hinterland | Better water/highway access today — upper realism floor |
| Hawker (~226) | Inland pastoral service | Smaller; tourism component |
| Marree | Northern rail/track junction near Farina | Remained small — junction alone ≠ growth |
| Oodnadatta | Remote rail/track town | Warns against over-ambition |
| Leigh Creek | Nearby later mining growth | Not a pure railhead analogue |

Farina alternate 2026 is modelled as a **small regional centre (~3,000)**, not a city. Prior MVP (~4,500) was revised down for climate/water constraints.

### Density rule

- `personsPerDwelling` ≈ **2.6**
- Scenario dwellings ≈ `scenarioPopulation / 2.6`, capped per era for map readability
- Generator: `npm run generate:alternate` → [`scripts/generate_alternate_farina.mjs`](../scripts/generate_alternate_farina.mjs)

## Documented buildings

Inventory in [`data/buildings.json`](../data/buildings.json) from FRG town guide + history:

- Named hotels, stores, civic, church, school (1879–1957), railway precinct elements
- Up to five blacksmith sites (four approximate density placements)
- Peak-era unnamed **Dwelling (approximate)** features illustrate occupancy density only — **not** named titles

## Divergence logic (WHAT IF?)

- **Shared history:** before 1884 both modes show the same layers.
- **Divergence year:** 1884 — railway extension north of Farina.
- **Actual:** Farina becomes a through-stop; decline with drought, agricultural failure beyond Goyder’s Line, service consolidation.
- **Counterfactual:** Farina retains regional service-centre role. Expansion follows surveyed grid outward from Twelfth Street / railway precinct — commercial on main street, industry by rail, residential rings south/west.

All post-divergence alternate features live in `alternate_farina.json` with `"scenario": "counterfactual"`.

## Placeholder data rule

MVP geometries for the town grid, parcels, and railway are **approximate placeholders** aligned to modern Farina (~30.075°S, 138.276°E). Replace with georeferenced Surveyor-General plans and measured railway alignments.

Label in data: `"placeholder": true`.

## Validation checklist

1. Feature count at 1890 (actual) should be higher than at 1960.
2. No counterfactual features visible in ACTUAL mode.
3. Every clickable feature shows confidence + sourceIds.
4. Population chip says **Scenario population** in What If after 1884.
5. Alternate 2026 scenario population reads **3,000**.
6. Compare 2026 swipe uses identical camera for both sides.

## Failure modes

- Treating land-title transfers as occupied buildings.
- Presenting scenario population as census fact.
- Treating approximate peak dwellings as named historical houses.
- Distance/area math in geographic CRS without geodesic methods.
- Hosting archive images without clear reuse rights.

## Deferred (next research pass)

- Georeferenced 1910 Surveyor-General plan
- FRG land-title database import
- Full 432 + 88 cadastral lots
