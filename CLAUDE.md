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

**Typography**

| Font | Weight | Usage |
|---|---|---|
| Figtree | 700 (Bold) | All `h1`, `h2` headlines |
| Manrope | 400 / 500 / 600 / 700 | Body text, labels, buttons, captions |

Both loaded via `next/font/google` in `app/layout.tsx` as CSS variables `--font-figtree` and `--font-manrope`. Applied globally via `body` className.

**Layout**
- Landing: full-width two-column hero, max content width `max-w-2xl`.
- Quiz / Result: centred single column, `max-w-xl`.
- Logo: `laima` image from `/public/logo.png` (94×35px), linked to `/`.
- Nav buttons: `rounded-[48px]` pill shape.
- Quiz option buttons: `rounded-xl`, coral selected state.
- Progress bar: `#0F766E` teal, transitions on step advance.

---

## File structure

```
health-insurance-navigator/
├── app/
│   ├── globals.css              # @import (Google Fonts) must precede @tailwind directives
│   ├── layout.tsx               # Root layout — fonts, metadata, body className
│   ├── page.tsx                 # / — Landing page (Figma-matched design)
│   ├── quiz/
│   │   └── page.tsx             # /quiz — 7-step quiz flow
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

### `/quiz` — Quiz flow (`app/quiz/page.tsx`)

Client component. One question per screen. Teal progress bar fills as steps advance. Context message shown above every question.

**Question order:**

| Step | Field | Type | Notes |
|---|---|---|---|
| 1 | `age` | Number input | — |
| 2 | `coverage` | Single-select options | individual / couple / family |
| 3 | `state` + `city` | Two dropdowns side by side | City disabled until state selected; city required for individual, optional for family |
| 4 | `budget` | Single-select options | under_5k / 5k_10k / 10k_20k / above_20k |
| 5 | `conditions` | **Multi-select tile grid** (3 per row) | 10 options; "Other" spans full width + reveals text input |
| 6 | `preferredHospital` | Autocomplete search | Filters `lib/hospitals.ts` by state; shows pill on selection; manual fallback |
| 7 | `priority` | Single-select options | routine / hospitalisation / maternity / emergency |

**Contextual messages per step:**
- Step 1: "Let's find your plan" headline + subtext
- Steps 2–7: short warm message above the question (see `CONTEXTUAL_MESSAGES` in quiz page)

**Navigation buttons:**
- "Next" / "Get My Recommendation" — coral, `rounded-full`, full width
- "← Back" — ghost text link

**Submission flow:**
1. Serialize answers (`conditions` array → comma-separated string)
2. Clear stale `recommendation` from sessionStorage
3. Save `userAnswers` to sessionStorage
4. `router.push("/result")` — API call happens on the result page

---

### `/result` — Result screen (`app/result/page.tsx`)

Client component. On mount: checks sessionStorage for a cached recommendation, or calls `/api/recommend` with saved answers.

**Full-page loader** (shown while API call is in progress):
- Laima logo centered
- Animated teal sliding progress bar
- Pulsing coral dot + cycling message (6 messages, 2.5s interval, Figtree bold)
- "This usually takes less than 10 seconds" (Manrope, `#888888`)

**Result card** (once loaded):
- "Your recommended plan" label
- Plan name (`h1`, Figtree)
- HMO name
- Monthly premium badge (teal background)
- "Why this plan fits you" section
- Amber "One thing to watch out for" callout
- "Also worth considering" — two alternatives (plan name + HMO + note)
- "Enroll Now" button (links to `enrollUrl`)
- "Share My Result" — copies URL to clipboard
- "Start Over" → `/quiz`

> **Next session:** Result page needs visual redesign in Figma before rework.

---

### `POST /api/recommend` (`app/api/recommend/route.ts`)

Receives `UserProfile` JSON, calls Gemini with structured JSON output enforced via `responseSchema`.

**Model:** `process.env.GEMINI_MODEL` (default: `gemini-3.1-flash-lite`)

**System prompt:** Honest Nigerian health insurance advisor. Warm, plain English. Always surfaces limitations and VERIFY flags.

**User prompt:** Profile fields + full `PLANS` array from `lib/plans.ts` as JSON.

**Response schema (enforced by Gemini):**
```ts
{
  primary: {
    hmo: string
    planName: string
    monthlyPremium: number
    enrollUrl: string
  }
  reason: string       // 3–4 sentence plain English
  watchOut: string     // One limitation to verify
  alternatives: [
    { hmo: string, planName: string, note: string },
    { hmo: string, planName: string, note: string }
  ]
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
- [x] Quiz — 7 questions in correct order with contextual messages
- [x] Location step — state + city side by side, city disabled until state selected
- [x] Conditions step — 10-option tile grid, multi-select, "Other" free text
- [x] Hospital step — autocomplete from 455-hospital dataset, pill on select, manual fallback
- [x] Full-page recommendation loader with cycling messages
- [x] Gemini 3.1 Flash Lite API connected with structured JSON output
- [x] Five HMO placeholder plans in `lib/plans.ts`
- [x] 455 hospitals in `lib/hospitals.ts`
- [x] Cities/areas for all 37 jurisdictions in `lib/locations.ts`
- [x] Next.js upgraded to 15.5.18 (security fix)
- [x] ESLint clean — all entities escaped, `<img>` → `<Image>`
- [x] Live on Vercel at **trylaima.vercel.app**
- [x] Auto-deploys on push to `master`

**Pending — next session:**
- [ ] Result page visual redesign (Figma design pending)
- [ ] Replace placeholder HMO data with verified plans and pricing
- [ ] Real hospital network data per HMO plan
- [ ] Mobile responsiveness pass on landing page (currently desktop-optimised)

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
