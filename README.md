# BNS Section Finder

**"Describe what happened. Find potentially applicable BNS provisions."**

A fully static, client-side legal-information tool for the **Bharatiya Nyaya Sanhita, 2023 (BNS)**. It helps
someone describe an alleged incident in plain language (English, Hindi, or Hinglish) and explore which BNS
provisions may be **potentially applicable** — with statutory ingredients, punishment, classification
(cognizable/bailable/triable court), and facts that could change the outcome. It never states that anyone is
guilty and never predicts a probability of conviction.

Search runs entirely in the browser via [Fuse.js](https://fusejs.io/) against a bundled, verified dataset.
Nothing you type is ever sent to a server or to any AI model — there is no backend at all.

---

## Project status & dataset scope

This build ships **17 verified offence entries** covering the most commonly searched categories: theft,
robbery, criminal intimidation, forgery, cheating/fraud, murder, attempt to murder, hurt, grievous hurt,
house-trespass/house-breaking, kidnapping (general and aggravated), mischief/property damage, and rioting.
Every entry cites its source (India Code) and a verification date, and passes the automated data-quality
checks in `scripts/validateData.mjs` — a record that fails validation is excluded from search rather than
shown with missing or guessed information (see **Data quality gate** below).

The BNS has 358 sections in total. This dataset is intentionally curated rather than exhaustive — see
**Extending the dataset** for how to add more sections without touching any UI code.

## Build & deployment status

Live at **https://ank9999.github.io/github.com-new/**, deployed by the GitHub Actions workflow in
`.github/workflows/deploy-gh-pages.yml`. On every push to `main`, CI installs dependencies, runs
`npm run validate-data` (17/17 records pass), runs the full Vitest suite (28 tests), type-checks and builds
with Vite, and deploys to GitHub Pages.

No `package-lock.json` is committed yet, so CI uses `npm install` rather than `npm ci`. To pin exact
dependency versions, run `npm install` locally once, commit the generated `package-lock.json`, and switch
the workflow back to `npm ci`.

## Requirements

- Node.js 18+ and npm

## Local installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Opens the app with hot reload at `http://localhost:5173`.

## Validate the legal dataset

```bash
npm run validate-data
```

Runs the zero-dependency data-quality checks (duplicate IDs, missing titles/sources/punishment, malformed
URLs, missing verification dates, inconsistent classification values) and exits non-zero on any blocking
error. The same checks run automatically in dev mode (check your browser console) and are wired into the
`test` script logic (`src/lib/dataValidation.ts` / `src/tests/dataValidation.test.ts`).

## Tests

```bash
npm test
```

Vitest unit tests cover:
- `dataValidation.test.ts` — the dataset passes validation, duplicate IDs are caught, malformed records are
  excluded rather than shown.
- `searchEngine.test.ts` — every plain-language example query from the specification (theft, "maar peet",
  "chori", "online fraud", "attacked with knife", typo tolerance, empty query, very long input, special
  characters, etc.) resolves to the expected section(s), and every result always carries a defined
  Match-Strength label.

## Build

```bash
npm run build
```

Type-checks with `tsc -b`, then produces a static `dist/` folder via Vite. Preview it locally with:

```bash
npm run preview
```

## Deployment

The app is a plain static site (HTML/CSS/JS) — deploy `dist/` anywhere that serves static files. Client-side
routing (React Router) needs a rewrite rule so that direct links like `/section/303` don't 404; that's
pre-configured for all three options below.

### 1. Vercel (preferred)

`vercel.json` is included with a SPA rewrite and basic security headers. From the project root:

```bash
npm i -g vercel   # if you don't already have it
vercel --prod
```

Or connect the repo in the Vercel dashboard — it auto-detects the Vite build (`npm run build`, output `dist`).

### 2. Netlify

`netlify.toml` is included with the build command, publish directory, SPA redirect, and headers already set.
Either run `netlify deploy --prod` (Netlify CLI) or connect the repo in the Netlify dashboard.

### 3. GitHub Pages

A ready-to-use workflow lives at `.github/workflows/deploy-gh-pages.yml`. Before your first deploy:

1. In that file, set `VITE_BASE_PATH` to your repository name with slashes, e.g. `/bns-section-finder/` (currently `/github.com-new/`).
2. In the repo settings, set **Pages → Source → GitHub Actions**.
3. Push to `main` — the workflow installs dependencies, validates the dataset, runs tests, builds with the
   correct base path (`vite.config.ts` reads `VITE_BASE_PATH`; the router uses it as `basename`), copies
   `index.html` to `404.html` so deep links like `/section/303` work, and deploys.

If you deploy to a **custom domain** or to the domain root (Vercel/Netlify), leave `VITE_BASE_PATH` unset —
`vite.config.ts` defaults to `/`.

## Progressive Web App

`public/manifest.json` and `public/sw.js` (registered in `src/main.tsx`, production builds only) make the app
installable and cache the app shell, so a repeat visitor can search fully offline — the entire dataset is
bundled into the JS, so no network round-trip is needed for a search in the first place.

## Legal-data update process

1. Edit `src/data/bns_sections.json`. Each record follows the shape documented in `src/types/legal.ts`
   (`BnsSection`). Keep `source_url` pointing at India Code / an official government source wherever
   practical, and set `verified_date` to the day you actually checked the text.
2. Run `npm run validate-data`. Fix anything reported as an error — a record with an error is silently
   dropped from search at runtime by `getVerifiedEntries()` (`src/lib/dataValidation.ts`), so a failing
   record never reaches end users with fabricated or incomplete information.
3. Update `datasetVerifiedDate` in `src/data/config.ts` — this drives the "last verified" date shown in the
   footer and on the About page.
4. Add plain-language `keywords` / `aliases` / `hindi_aliases` / `hinglish_aliases` / `context_terms` so the
   entry is actually reachable by how people describe incidents, not just by legal terminology. Run
   `npm test` afterwards — add a case to `src/tests/searchEngine.test.ts` for any new common phrasing you
   expect people to use.

### Legal-source verification process

For each entry, cross-check against at least two of:
- [India Code — Bharatiya Nyaya Sanhita, 2023 (Act No. 45 of 2023)](https://www.indiacode.nic.in/handle/123456789/20062)
- [Ministry of Home Affairs — New Criminal Laws](https://www.mha.gov.in/en/new-criminal-laws)
- [Bharatiya Nagarik Suraksha Sanhita, 2023 — First Schedule](https://www.indiacode.nic.in/handle/123456789/20063) (for cognizable/bailable/triable-court classification only — this is procedural classification, not BNS itself, and is kept in separate fields for exactly that reason)

Never copy classification or punishment figures from a secondary blog/summary site as the *primary* source —
those are fine as a cross-check, not as the citation of record. Where a classification nuance is genuinely
unsettled without reading the full Schedule entry (e.g. a value-based threshold), say so explicitly in that
record's `classification_note` field rather than asserting a specific value.

## Extending the dataset toward full BNS coverage

The architecture is deliberately data-driven so this is additive, not a rewrite:

- Add more objects to `src/data/bns_sections.json` following the existing shape — no component needs to
  change.
- The search engine (`src/lib/searchEngine.ts`) and Browse page automatically pick up new entries, new
  `category` values, and new `chapter` values.
- If you want richer autocomplete phrasing, extend `src/data/crime_synonyms.json` — it's currently used as a
  reference/expansion list for suggestion phrasing conventions alongside the per-entry `keywords`.

## Project structure

```
src/
  components/     Header, SearchBox, SearchSuggestions, ResultCard, ClassificationBadge,
                   ClarificationPanel, Disclaimer, Footer, ThemeToggle
  pages/          Home, Browse, SectionDetail, About, Privacy, DisclaimerPage, NotFound
  data/           bns_sections.json, crime_synonyms.json, config.ts
  lib/            searchEngine.ts, dataValidation.ts, normalizer.ts, storage.ts
  types/          legal.ts
  tests/          searchEngine.test.ts, dataValidation.test.ts, setup.ts
public/
  manifest.json, sw.js, robots.txt, sitemap.xml, icons/
scripts/
  validateData.mjs   standalone, zero-dependency dataset validator (also usable in CI)
```

## Accessibility & SEO

Semantic HTML, labelled form controls, visible focus states, `aria-live`/`role="alert"` where relevant, a
skip-to-content link, and keyboard-navigable search suggestions/clarification chips are built in
(targeting WCAG AA where practical). `index.html` carries title/meta description/Open Graph/canonical tags;
`public/robots.txt` and `public/sitemap.xml` are included — update the placeholder domain in both files, in
`index.html`, and in `src/data/config.ts`'s source links if you deploy under your own domain.

## Security

No secret keys or API credentials are used anywhere in this project — it's 100% static and client-side.
User input (the search box) is only ever rendered as plain React text/JSX (React escapes it by default) or
passed to `URLSearchParams`; nothing is interpreted as HTML. `vercel.json` / `netlify.toml` set a baseline
Content-Security-Policy and standard security headers for their respective platforms.

## Disclaimer

This project is an independent legal-information tool and is **not** an official Government of India service.
It provides general informational assistance and does not constitute legal advice. See the in-app
[Disclaimer](/disclaimer) page for the full text. Accused persons are presumed innocent unless proved guilty
according to law.
