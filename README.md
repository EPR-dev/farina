# Farina — The City That Never Was

Full-screen interactive historical map exploring Farina, South Australia:

- **Actual history** — documented rise and decline  
- **Today** — Farina Restoration Group sites (trails, bakery, stabilised ruins)  
- **What if?** — clearly labelled counterfactual: what if Farina had succeeded?

**Repo:** [github.com/EPR-dev/farina](https://github.com/EPR-dev/farina)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Share online

**Live app:** [https://farina-lilac.vercel.app](https://farina-lilac.vercel.app)

Same pattern as other EPR-dev apps (GitHub → Vercel):

```bash
npx vercel --yes --prod
```

## Stack

- Next.js + TypeScript
- MapLibre GL JS
- GeoJSON temporal layers
- Turf.js (available for later spatial analysis)
- Framer Motion

## Project layout

- `data/` — timeline, sources, photos, GeoJSON (historical, `present_farina.json`, `alternate_farina.json`)
- `research/` — source notes, methodology, photo rights, geometry validation
- `src/components/` — map, timeline, panels, compare swipe
- `scripts/` — generate alternate town, land-use delineate, OSM align

## Useful scripts

```bash
npm run generate:alternate   # counterfactual stock from population.json
npm run align:osm            # snap/translate geometry to OSM control
```

## Important

- Named ruins/bakery/campground are **OSM-aligned**; many dwellings remain illustrative until the survey plan is georeferenced (see `data/geometry_validation.json`).
- Counterfactual features are always labelled speculative (**Scenario population**, never fake census).
- Historic photos: only remotely displayed when rights allow; otherwise **VIEW AT SOURCE**.
- Present-day layer cites [farinarestoration.com](https://farinarestoration.com/).

See `research/FARINA_SOURCES.md` and `research/METHODOLOGY.md`.
