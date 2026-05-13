# Health Insurance Navigator Nigeria — Project Guide

## What this project is

A solo side project. A user answers 7 short questions about their health profile and budget. The app sends their answers to the Anthropic Claude API. Claude returns a personalised health insurance plan recommendation in plain English. The recommendation is shown on a clean result screen with a share option.

No database. No authentication. No scope beyond what is described here.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 |
| AI | Anthropic SDK (`@anthropic-ai/sdk`) |
| Deploy target | Vercel |
| Node version | 26.x (installed via winget) |

---

## Design rules

**Colour palette**

| Token | Hex | Usage |
|---|---|---|
| Brand blue | `#1B4F8A` | Primary actions, headings, links, progress bar |
| Brand orange | `#E67E22` | CTA buttons, accent highlights, logo dot |
| White | `#ffffff` | Page backgrounds |
| Gray-50 | `#f9fafb` | Section backgrounds (how-it-works strip) |
| Gray-200 | `#e5e7eb` | Input borders (unselected) |
| Amber-50 | `#fffbeb` | Watch-out callout background |

**Typography**
- Font: Inter (loaded from Google Fonts in `globals.css`)
- Fallback: `system-ui, sans-serif`

**Layout**
- Mobile-first. Max content width `max-w-xl` (quiz, result) or `max-w-2xl` (landing).
- All pages use the same header pattern: logo left, contextual label right.
- Rounded corners: inputs and cards use `rounded-xl` or `rounded-2xl`.
- Buttons: `rounded-2xl`, `py-4`, full-width on mobile.

**Tone**
- Warm, direct, plain English. Nigerian context. Not corporate.
- No insurance jargon in user-facing copy or in Claude's response prompt.

---

## File structure

```
health-insurance-navigator/
├── app/
│   ├── globals.css              # Tailwind directives + Inter font import
│   ├── layout.tsx               # Root layout, <html>, metadata
│   ├── page.tsx                 # / — Landing page
│   ├── quiz/
│   │   └── page.tsx             # /quiz — 7-question onboarding flow
│   ├── result/
│   │   └── page.tsx             # /result — Recommendation display screen
│   └── api/
│       └── recommend/
│           └── route.ts         # POST /api/recommend — calls Claude
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── .env.local.example           # Copy to .env.local and add API key
├── .gitignore
└── CLAUDE.md                    # This file
```

---

## Pages

### `/` — Landing page (`app/page.tsx`)
- Headline: "Find the right health insurance plan for you"
- Subheadline + trust badge ("Free · No registration required")
- CTA button → `/quiz`
- "How it works" 3-step strip
- Footer disclaimer

### `/quiz` — Quiz (`app/quiz/page.tsx`)
- Client component (`"use client"`)
- One question displayed at a time. Progress bar fills as steps advance.
- Answers held in local React state (`useState<Answers>`)
- On the final question, "Get My Recommendation" submits

**The 7 questions:**

| Step | Field | Type |
|---|---|---|
| 1 | `age` | Number input |
| 2 | `state` | Dropdown — all 36 states + FCT |
| 3 | `coverage` | Option group: `individual` / `couple` / `family` |
| 4 | `budget` | Option group: `under_5k` / `5k_10k` / `10k_20k` / `above_20k` |
| 5 | `conditions` | Option group: `none` / `hypertension` / `diabetes` / `asthma` / `other` + text input if `other` |
| 6 | `preferredHospital` | Text input (optional) |
| 7 | `priority` | Option group: `routine` / `hospitalisation` / `maternity` / `emergency` |

**Submission flow:**
1. POST answers to `/api/recommend`
2. Store response in `sessionStorage` under key `"recommendation"`
3. Store answers in `sessionStorage` under key `"userAnswers"`
4. `router.push("/result")`

### `/result` — Result screen (`app/result/page.tsx`)
- Client component (`"use client"`)
- On mount, reads `sessionStorage.getItem("recommendation")` and parses JSON
- Shows a spinner while `loading === true`
- Displays the structured recommendation once loaded

**Result card structure:**
- Plan name + HMO name
- Monthly cost badge
- "Why this plan fits you" (plain English, 3–4 sentences)
- "One thing to watch out for" (amber callout)
- "Also worth considering" — two alternatives
- "Enroll Now" button (links to `enrollUrl` if provided by Claude)
- "Share My Result" button — copies `window.location.href` to clipboard
- "Start Over" link → `/quiz`

### `POST /api/recommend` — API route (`app/api/recommend/route.ts`)
- Receives `UserProfile` JSON from the quiz
- Builds a prompt using `buildPrompt(profile)`
- Calls `claude-sonnet-4-6` with `max_tokens: 1024`
- Strips any accidental markdown fences from the response
- Parses the response as JSON and returns it

**Response shape Claude is prompted to return:**
```ts
{
  primary: string        // Plan name
  hmo: string            // HMO name
  monthlyCost: string    // e.g. "₦8,000 – ₦12,000"
  reason: string         // 3–4 sentence plain English explanation
  watchOut: string       // One limitation to verify
  alternatives: [        // Two alternatives
    { name: string, note: string },
    { name: string, note: string }
  ]
  enrollUrl: string | null  // Direct enroll link or null
}
```

---

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `.env.local` | Anthropic API key — never commit this |

`.env.local.example` exists in the repo root as a template.

---

## State handoff between quiz and result

Answers and recommendation travel via `sessionStorage`, not query strings or a database. This is intentional — simple, ephemeral, no infra required.

```
quiz page  →  POST /api/recommend  →  sessionStorage  →  result page
```

---

## Current status (as of scaffold)

- [x] Project scaffolded — all pages, API route, config files created
- [x] Node.js 26.1.0 installed via winget
- [ ] `npm install` not yet run
- [ ] `npm run dev` not yet run
- [ ] `.env.local` not yet created (copy `.env.local.example`)
- [ ] Anthropic API key not yet configured
- [ ] Real plan data / HMO reference list not yet added to the prompt
- [ ] API prompt not yet tuned or tested

**Next steps:**
1. Open a new terminal (so PATH picks up Node)
2. `npm install`
3. Copy `.env.local.example` → `.env.local`, add API key
4. `npm run dev` — verify pages render at `http://localhost:3000`
5. Test the full quiz → result flow end to end
6. Refine the prompt in `app/api/recommend/route.ts` with real plan data

---

## Constraints — do not add

- No database (no Prisma, no Supabase, no SQLite)
- No authentication (no NextAuth, no Clerk, no sessions)
- No additional pages beyond `/`, `/quiz`, `/result`
- No additional npm packages without a clear reason
- No feature flags, A/B tests, or analytics (for now)

---

## Commit message format

```
type: short description in imperative mood

Examples:
feat: add quiz progress bar animation
fix: handle empty preferredHospital in prompt builder
style: tighten result card spacing on mobile
chore: add ANTHROPIC_API_KEY to env example
```

Types: `feat`, `fix`, `style`, `refactor`, `chore`, `docs`

---

## Running locally

```bash
# First time
npm install
cp .env.local.example .env.local
# (edit .env.local — add your ANTHROPIC_API_KEY)
npm run dev
```

App runs at `http://localhost:3000`.

---

## Deploying to Vercel

1. Push repo to GitHub
2. Import project in Vercel dashboard
3. Add `ANTHROPIC_API_KEY` as an environment variable in Vercel project settings
4. Deploy — Vercel auto-detects Next.js, no config needed
