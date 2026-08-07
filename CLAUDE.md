# Laima — Health Insurance Navigator Nigeria

## What this project is

A solo side project branded **Laima**. A user answers 7 questions about their health profile and budget. The app sends their answers to the Google Gemini API. Gemini selects the best match from a curated list of Nigerian HMO plans and returns a personalised recommendation in plain English. The recommendation is shown on a result screen with enrolment and share options.

No database. No authentication. No scope beyond what is described here.

**Live URL:** [trylaima.vercel.app](https://trylaima.vercel.app)
Auto-deploys from the `master` branch via Vercel.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15.5.18 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 |
| AI | Google Gemini API via `@google/generative-ai` |
| Model | `gemini-3.1-flash-lite` |
| Icons | Phosphor Icons (`@phosphor-icons/react`) |
| Image export | `html2canvas` — loaded at runtime from cdnjs, **not** an npm dependency |
| Deploy | Vercel (auto-deploy from GitHub) |
| Node | 26.x |

---

## Design system

**Colour palette**

| Token | Hex | Usage |
|---|---|---|
| Coral | `#E8603C` | Primary CTA buttons, selected states, active pill |
| Teal | `#0F766E` | Progress bar, trust badge border, green dot |
| Teal light | `#EBFFFD` | Trust badge background |
| Near-black | `#1A1A1A` | All headlines (Figtree) |
| Body grey | `#444444` | Body copy |
| Warm white | `#FCFCFC` | Landing page background |
| Amber-50 | `#FFFBEB` | Watch-out callout background |
| Coral light | `#FDF3F0` | Selected tile / option background |
| Input border | `#E5E5E5` | Unselected condition tile border |
| Enroll orange | `#E8632A` | Result-page enroll/share buttons, start-over modal primary button (distinct from Coral, used only on `/result`) |
| Trust tag green | bg `#EAF3DE` / text `#3B6D11` | Confirmed-benefit tags on the result plan card |
| Trust tag amber | bg `#FAEEDA` / text `#854F0B` | Caveat tags + "one thing to watch out for" callout on the result plan card |

**Typography**

| Font | Weight | Usage |
|---|---|---|
| Figtree | 700 (Bold) | All `h1`, `h2` headlines |
| Manrope | 400 / 500 / 600 / 700 | Body text, labels, buttons, captions |

Both loaded via `next/font/google` in `app/layout.tsx` as CSS variables `--font-figtree` and `--font-manrope`. Applied globally via `body` className.

**Layout**
- Landing: full-width two-column hero, max content width `max-w-2xl`.
- Quiz: centred single column, `max-w-xl`.
- Result: centred single column, `max-w-[480px]` — cards use `border-[0.5px]` hairline borders and `rounded-xl`, no shadows or gradients anywhere on the page.
- Logo: `laima` image from `/public/logo.png` (94×35px), linked to `/`.
- Nav buttons: `rounded-[48px]` pill shape.
- Quiz single-select fields: `RadioBoxGroup` — boxed cards (`rounded-xl`) with a circular radio indicator, coral border + `#FDF3F0` fill when selected.
- Quiz multi-select fields: `TagGroup` — pill chips (`rounded-full`) with a small `+`/`×` icon badge, coral when selected.
- Quiz is a single page (no step wizard, no progress bar) — form sits in a white card (`rounded-2xl`, `ring-1 ring-gray-100`, `shadow-sm`) on the warm-white page background.

---

## File structure

```
health-insurance-navigator/
├── app/
│   ├── globals.css              # @import (Google Fonts) must precede @tailwind directives
│   ├── layout.tsx               # Root layout — fonts, metadata, body className
│   ├── page.tsx                 # / — Landing page (Figma-matched design)
│   ├── quiz/
│   │   └── page.tsx             # /quiz — single-page quiz form
│   ├── result/
│   │   └── page.tsx             # /result — Recommendation display + full-page loader
│   └── api/
│       └── recommend/
│           └── route.ts         # POST /api/recommend — Gemini API call
├── lib/
│   ├── plans.ts                 # 5 HMO placeholder plans (NEEDS real data)
│   ├── hospitals.ts             # 455 Nigerian hospitals across all 37 states
│   └── locations.ts             # All 36 states + FCT with major cities/areas
├── public/
│   ├── logo.png                 # Laima brand logo (downloaded from Figma)
│   └── hero.png                 # Hero image — woman with umbrella (from Figma)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── .env.local                   # Gitignored — contains GEMINI_API_KEY
├── .env.local.example           # Template for env vars
└── CLAUDE.md                    # This file
```

---

## Pages

### `/` — Landing page (`app/page.tsx`)

Rebuilt from a Figma frame (node `17-131`). Two-column desktop layout:

**Left column:**
- Teal trust badge: "Free · No registration required"
- Hero headline: "We'll find the right health insurance for you" (Figtree 64px)
- Subtext: "No endless comparison tables. Just a plan that fits your needs."
- Coral CTA: "Find My Plan" → `/quiz`

**Right column:**
- Warm-yellow rounded card (`rgba(255,241,202,0.68)`, `rounded-[34px]`)
- Hero photo (woman with umbrella) fills card via `object-cover`

**Nav:**
- Laima logo (left, linked to `/`)
- "Get Started" coral pill button (right) → `/quiz`

**Footer:** "Not affiliated with any HMO. © 2026"

---

### `/quiz` — Quiz form (`app/quiz/page.tsx`)

Client component. **Single-page form** — all fields render at once (no step wizard, no progress bar). Validates on submit; invalid fields get a red border/ring + inline "This field is required." warning message (no top-level summary banner).

**Fields (in order):**

| Field | Component | Notes |
|---|---|---|
| `age` | Number input | Boxy `rounded-xl` input |
| `coverage` | `RadioBoxGroup` (3 columns) | individual / couple / family |
| `state` + `city` | Two `<select>`s side by side | City disabled until state selected; city required for individual, optional for family |
| `budget` | `RadioBoxGroup` (2 columns) | under_5k / 5k_10k / 10k_20k / above_20k |
| `conditions` | `TagGroup` (multi-select pill chips) | 10 presets (incl. "None"); selecting "Other" reveals `OtherConditionInput` |
| `preferredHospital` | Autocomplete search | Filters `lib/hospitals.ts` by state; shows pill on selection; manual fallback |
| `priority` | `RadioBoxGroup` (2 columns) | routine / hospitalisation / maternity / emergency |

**"Other" health conditions (`OtherConditionInput`):**
- Live autocomplete via the NLM Clinical Tables API — `GET https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms={query}&maxList=8` (public, no key/registration needed). Debounced 250ms, fires from 1 character (`useConditionSearch` hook).
- Response shape is `[count, codes, extraData, displayStrings[][]]` — titles are `displayStrings.map(row => row[0])`.
- Selected suggestions (or freeform typed text via Enter) become individually removable coral chips — supports adding multiple custom conditions, not just one.
- Falls back to "No matches — press Enter to add '...'" if the API returns nothing or is unreachable, so manual entry always works.

**Submission flow:**
1. Merge preset `conditions` (excluding the `"other"` marker) with `customConditions` into one comma-separated string.
2. Clear stale `recommendation` from sessionStorage.
3. Save `userAnswers` to sessionStorage.
4. `router.push("/result")` — API call happens on the result page.

---

### `/result` — Result screen (`app/result/page.tsx`)

Client component. On mount: checks sessionStorage for a cached `recommendation` (`{ candidates: PlanCard[] }`), or calls `/api/recommend` with saved `userAnswers` and caches the response.

**Full-page loader** (shown while API call is in progress):
- Laima logo centered
- Animated teal sliding progress bar
- Pulsing coral dot + cycling message (6 messages, 2.5s interval, Figtree bold)
- "This usually takes less than 10 seconds" (Manrope, `#888888`)

**Plan card** (`PlanCardView`, once loaded) — `order[0]` is always rendered as primary:
- Header: plan name (`h1`, Figtree) + HMO name as a plain muted subtitle below it (no pill/badge) + price (`₦X,XXX/month`) stacked on the left; two ghost icon buttons top-right — `ArrowUUpLeft` (start over) and `Share` (share), 20px, muted `text-gray-400` → `hover:text-gray-900`, no background/border ever.
- Trust tags: green (`confirmedTags`) and amber (`caveatTags`) pill chips, Gemini-generated but grounded in that plan's real fields.
- Hairline `border-t-[0.5px]` divider, then "WHY THIS FITS YOU" label + `reason` paragraph.
- Amber "ONE THING TO WATCH OUT FOR" callout (`watchOut`) — lives inside the card, not a separate box below it.
- No stat bar — `annualBenefitLimit`, `hospitalsCount`, and `dynamicStat` are still returned by the API but currently unused on the page (removed from the UI; kept in the schema in case it comes back).

**Alternatives** ("ALSO WORTH CONSIDERING"):
- `order.slice(1)` — always the two plans not currently primary.
- Each is a clickable card (plan name, muted HMO, one-line `altNote`, right-aligned price). Clicking calls `promote(index)`, which reorders `order` so the clicked plan becomes index 0 (pure client-side state — no extra API call, since every candidate already carries full detail from the one Gemini call) and smooth-scrolls to top (`window.scrollTo({ top: 0, behavior: "smooth" })`).

**Start-over modal** (`StartOverModal`):
- Triggered by the header's back-arrow icon. Rendered in **normal document flow, not `position: fixed`** — a `min-h-[500px]` block with a `bg-black/60` overlay, swapped in for the plan card/alternatives/buttons rather than layered on top.
- "Yes, start over" (orange `#E8632A`) clears `recommendation` from sessionStorage and `router.push("/quiz")`; "Cancel" closes the modal.

**Share flow** (`handleShare`):
- A hidden 400×500px card (absolutely positioned off-screen at `left: -9999px`, hardcoded hex colors, not CSS variables) renders the Laima wordmark, "MY HEALTH PLAN" label, plan name, HMO, price, up to 4 green trust tags, and the first sentence of `reason` — captured via `html2canvas` (loaded dynamically from cdnjs on first use, see Tech stack).
- Tries `navigator.share({ files: [pngFile], title: "My Laima health plan" })` first; if unsupported, or the user cancels (`AbortError`), it does nothing further; on any other failure it falls back to downloading `laima-plan.png`.
- Triggered from both the header share icon and the bottom "Share my result" button.

**Buttons:** "Enroll in [Plan Name] →" (orange `#E8632A`, primary) and "Share my result" (outlined). The old "Start Over" ghost link and bottom disclaimer line were removed — start-over now lives in the header modal.

---

### `POST /api/recommend` (`app/api/recommend/route.ts`)

Receives `UserProfile` JSON, calls Gemini with structured JSON output enforced via `responseSchema`, then **merges Gemini's picks with real `Plan` records** from `lib/plans.ts` before responding — pricing, `enrollUrl`, `annualBenefitLimit`, and `hospitalsCount` (`keyHospitals.length`) always come from our own data, never from the model.

**Model:** `process.env.GEMINI_MODEL` (default: `gemini-3.1-flash-lite`)

**System prompt:** Honest Nigerian health insurance advisor. Warm, plain English. Always surfaces limitations and VERIFY flags. Every trust tag / stat must be grounded in that plan's actual fields — instructed never to invent a benefit, number, or waiting period.

**User prompt:** Profile fields + full `PLANS` array (including each plan's `id`) from `lib/plans.ts` as JSON. Asks for exactly 3 ranked candidates.

**Gemini's raw output (`GeminiCandidate`, validated against `PLANS` ids):**
```ts
{
  candidates: [
    {
      planId: string          // must match a real Plan.id
      reason: string           // 2–4 sentences, why this plan fits (shown when primary)
      altNote: string          // one sentence, shown when demoted to an alternative
      watchOut: string         // one sentence — the key caveat to verify
      confirmedTags: string[]  // 2–4 short green-chip phrases
      caveatTags: string[]     // 1–3 short amber-chip phrases
      dynamicStatLabel: string
      dynamicStatValue: string
    }
    // × 3, ranked best fit first
  ]
}
```
If the model returns anything other than exactly 3 candidates, or a `planId` that doesn't match `lib/plans.ts`, the route throws and returns a 500 — no silent fallback.

**Final response (`{ candidates: PlanCard[] }`, after merging with `PLANS`):**
```ts
{
  planId, hmo, planName, monthlyPremium, enrollUrl,   // from the matched Plan
  annualBenefitLimit, hospitalsCount,                 // from the matched Plan
  dynamicStat: { label, value },                      // from Gemini
  reason, altNote, watchOut, confirmedTags, caveatTags // from Gemini
}
```

---

## Data files

### `lib/plans.ts` — HMO plans (PLACEHOLDER)

Five plans covering the full budget spectrum. **All pricing and coverage details are placeholders — must be replaced with verified data before launch.**

| ID | HMO | Plan | Tier | Monthly |
|---|---|---|---|---|
| `bastion_jade` | Bastion HMO | Jade | budget | ₦1,958 (₦23,500/yr) |
| `reliance_classic` | Reliance HMO | Classic | mid | ₦6,500 |
| `avon_plus` | Avon HMO | Avon Plus | mid | ₦11,000 |
| `hygeia_coreplus` | Hygeia HMO | HygeiaCorePlus | upper-mid | ₦18,500 |
| `axa_gold` | AXA Mansard Health | Gold Health | premium | ₦32,000 |

Each plan has: `statesCovered`, `keyHospitals`, `outpatientCover`, `inpatientCover`, `maternityCover`, `chronicConditionPolicy`, `preExistingWaitingPeriodMonths`, `topFor`, `enrollUrl`.

### `lib/hospitals.ts`

455 Nigerian hospitals across all 36 states + FCT. Types: `federal` | `state` | `private` | `mission`.

Exports: `HOSPITALS`, `getHospitalsByState(state)`, `getHospitalsByCity(state, city)`, `getCitiesByState(state)`

### `lib/locations.ts`

All 36 states + FCT with 8–16 major cities/areas each.

Exports: `LOCATIONS`, `getCitiesByState(state)`

---

## Environment variables

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key — never commit |
| `GEMINI_MODEL` | Model name (default: `gemini-3.1-flash-lite`) |

```bash
cp .env.local.example .env.local
# Add your GEMINI_API_KEY to .env.local
```

Add `GEMINI_API_KEY` and `GEMINI_MODEL` in Vercel project settings → Environment Variables.

---

## State handoff: quiz → result

```
quiz page
  → saves userAnswers to sessionStorage
  → router.push("/result")
     → result page reads userAnswers
     → POST /api/recommend
     → saves recommendation to sessionStorage
     → renders result card
```

Answers and recommendations are ephemeral (sessionStorage). No database, no persistence across tabs or sessions.

---

## Current status

- [x] Laima branding — logo, coral/teal palette, Figtree/Manrope fonts
- [x] Landing page rebuilt from Figma design (node 17-131)
- [x] Consistent navbar across all pages (logo only on quiz/result)
- [x] Quiz rebuilt as a single one-page form — no step wizard, no progress bar
- [x] Quiz dashboard-style redesign — boxy `rounded-xl` inputs, `RadioBoxGroup` single-selects, `TagGroup` multi-selects, inline per-field validation
- [x] Location field — state + city side by side, city disabled until state selected
- [x] Conditions field — tag-chip multi-select (10 presets); "Other" adds unlimited custom conditions via live NLM Clinical Tables API autocomplete
- [x] Hospital field — autocomplete from 455-hospital dataset, pill on select, manual fallback
- [x] Full-page recommendation loader with cycling messages
- [x] Result page redesigned — grounded plan card (trust tags/reason/watch-out sourced from real `Plan` data via Gemini, never invented), header start-over/share icons, alternatives swap-to-primary on click with scroll-to-top
- [x] Start-over confirmation modal on `/result` — in-flow (no `position: fixed`), dark overlay
- [x] Share-as-image on `/result` — hidden branded card captured via `html2canvas` (CDN, no npm install), shared via Web Share API with a download fallback
- [x] `/api/recommend` returns 3 full candidates merged with real plan data instead of one primary + light-detail alternatives
- [x] Gemini 3.1 Flash Lite API connected with structured JSON output
- [x] Five HMO placeholder plans in `lib/plans.ts`
- [x] 455 hospitals in `lib/hospitals.ts`
- [x] Cities/areas for all 37 jurisdictions in `lib/locations.ts`
- [x] Next.js upgraded to 15.5.18 (security fix)
- [x] ESLint clean — all entities escaped, `<img>` → `<Image>`
- [x] Live on Vercel at **trylaima.vercel.app**
- [x] Auto-deploys on push to `master`

**Pending — next session:**
- [ ] Replace placeholder HMO data with verified plans and pricing
- [ ] Real hospital network data per HMO plan
- [ ] Mobile responsiveness pass on landing page (currently desktop-optimised)
- [ ] Click-test the result-page share flow (`html2canvas` + `navigator.share`) in a real browser — implemented and type/build-checked, but never driven end-to-end since no browser automation tool was available in-session
- [ ] Consider trimming `annualBenefitLimit` / `hospitalsCount` / `dynamicStat` from the Gemini schema now that the stat bar is gone from the UI — still generated per candidate but currently unrendered

---

## Constraints — do not add

- No database (no Prisma, no Supabase, no SQLite)
- No authentication (no NextAuth, no Clerk, no sessions)
- No additional pages beyond `/`, `/quiz`, `/result`
- No additional npm packages without a clear reason

---

## Commit message format

```
type: short description in imperative mood
```

Types: `feat`, `fix`, `style`, `refactor`, `chore`, `docs`

---

## Running locally

```bash
npm install
cp .env.local.example .env.local
# Add GEMINI_API_KEY to .env.local
npm run dev
```

App runs at `http://localhost:3000` (or 3001 if 3000 is in use).

---

## Deploying to Vercel

Push to `master` — Vercel auto-deploys. To set up from scratch:

1. Import repo in Vercel dashboard
2. Add `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-3.1-flash-lite` as environment variables
3. Deploy — Vercel auto-detects Next.js
