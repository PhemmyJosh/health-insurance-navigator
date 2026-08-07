import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { PLANS, type Plan, LEADWAY_CAT_A_HOSPITALS } from "@/lib/plans";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a knowledgeable, honest health insurance advisor helping Nigerians find the right health plan.
You speak in clear, warm, everyday Nigerian English. Never use insurance jargon without immediately explaining it.
You are honest — you surface limitations and gaps, not just benefits.
You genuinely care about helping this person make the right decision.

CRITICAL RULES:
Never recommend a plan without verified data.
Every claim (confirmedTags, caveatTags) must be grounded in the actual fields of that plan as given below — never invent a benefit, number, or waiting period that isn't in the data.
If a field is marked VERIFY, flag it in watchOut and tell them to confirm with the HMO directly.
Never hide exclusions relevant to the user.
If a user has a condition and the plan has a waiting period, say so clearly.
All prices in the plans below are ANNUAL. The user states their budget in monthly terms (how Nigerians normally think about it), but you have already been given its annual equivalent — always match plans against that annual figure. Never state, imply, or calculate a monthly premium anywhere in your reasoning — always refer to the annual amount.
The plans list below has ALREADY been filtered to only plans this user is eligible for (age, condition, hospital, and budget rules already applied) — every plan given is a valid option, just pick the best fits from what's here.
Sound like a helpful friend, not a brochure.
Use everyday Nigerian English throughout.`;

const CANDIDATE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    planId: { type: SchemaType.STRING },
    reason: { type: SchemaType.STRING },
    altNote: { type: SchemaType.STRING },
    watchOut: { type: SchemaType.STRING },
    confirmedTags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    caveatTags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ["planId", "reason", "altNote", "watchOut", "confirmedTags", "caveatTags"],
};

function responseSchemaFor(candidateCount: number): Schema {
  return {
    type: SchemaType.OBJECT,
    properties: {
      candidates: {
        type: SchemaType.ARRAY,
        items: CANDIDATE_SCHEMA,
        minItems: candidateCount,
        maxItems: candidateCount,
      },
    },
    required: ["candidates"],
  };
}

type UserProfile = {
  age: string;
  coverage: string;
  state: string;
  city: string;
  budget: string;
  conditions: string;
  preferredHospital: string;
  priority: string;
};

type GeminiCandidate = {
  planId: string;
  reason: string;
  altNote: string;
  watchOut: string;
  confirmedTags: string[];
  caveatTags: string[];
};

export type PlanCard = {
  planId: string;
  hmo: string;
  planName: string;
  // Always annual. null only when price varies by hospital category or age — see priceNote.
  annualPremium: number | null;
  priceNote?: string;
  enrollUrl: string;
  reason: string;
  altNote: string;
  watchOut: string;
  confirmedTags: string[];
  caveatTags: string[];
};

// ── Budget: quiz asks monthly, plans are priced annually ────────────────────
// We convert ×12 here so both the rules engine and Gemini always compare
// against the annual equivalent. This conversion is never shown in the UI —
// the quiz keeps asking for a monthly figure (users think in monthly terms).
const BUDGET_MONTHLY_LABELS: Record<string, string> = {
  under_5k: "under ₦5,000 per month",
  "5k_10k": "₦5,000–₦10,000 per month",
  "10k_20k": "₦10,000–₦20,000 per month",
  above_20k: "above ₦20,000 per month",
};

const BUDGET_ANNUAL_RANGE: Record<string, { min: number; max: number }> = {
  under_5k: { min: 0, max: 60000 },
  "5k_10k": { min: 60000, max: 120000 },
  "10k_20k": { min: 120000, max: 240000 },
  above_20k: { min: 240000, max: Infinity },
};

function budgetLabel(key: string): string {
  const monthly = BUDGET_MONTHLY_LABELS[key];
  const range = BUDGET_ANNUAL_RANGE[key];
  if (!monthly || !range) return key;
  const annual =
    range.max === Infinity
      ? `above ₦${range.min.toLocaleString()} per year`
      : range.min === 0
        ? `under ₦${range.max.toLocaleString()} per year`
        : `₦${range.min.toLocaleString()}–₦${range.max.toLocaleString()} per year`;
  return `${monthly} (annual equivalent: ${annual})`;
}

const COVERAGE_LABELS: Record<string, string> = {
  individual: "individual only",
  couple: "individual and spouse",
  family: "individual and family",
};

const PRIORITY_LABELS: Record<string, string> = {
  routine: "routine visits and checkups",
  hospitalisation: "hospitalisation and surgery",
  maternity: "maternity and family planning",
  emergency: "emergency coverage",
};

// ── Recommendation engine rules ──────────────────────────────────────────────
// These are HARD filters applied to the plan list BEFORE the Gemini prompt is
// built. Gemini only ever sees plans that already passed every rule below — it
// is never asked to apply these rules itself, and cannot reference an
// excluded plan since excluded plans are never in its context.

const LEADWAY_RETAIL_IDS = new Set([
  "leadway_strawberry", "leadway_cranberry", "leadway_blueberry",
  "leadway_blackberry", "leadway_raspberry",
]);

const CANCER_ALLOWED_IDS = new Set([
  "hygeia_senior_midi", "hygeia_senior_premium", "hygeia_senior_exclusive",
  "leadway_mrcare", "leadway_mrcare_premium",
]);

const AXA_BRONZE_PLAN = PLANS.find((p) => p.id === "axa_bronze");
const AXA_BRONZE_ANNUAL =
  AXA_BRONZE_PLAN?.source === "verified" && AXA_BRONZE_PLAN.annualPremium !== null
    ? AXA_BRONZE_PLAN.annualPremium
    : 89500;

const LEADWAY_CAT_A_HOSPITALS_LOWER = LEADWAY_CAT_A_HOSPITALS.map((h) => h.toLowerCase());

type EligibilityContext = {
  age: number | null;
  hasCondition: boolean;
  hasCancer: boolean;
  wantsReddingtonOrEvercare: boolean;
  wantsLagoon: boolean;
  wantsLeadwayCatAHospital: boolean;
  budgetAnnualMax: number;
  needsImmediateCoverage: boolean;
};

function buildEligibilityContext(profile: UserProfile): EligibilityContext {
  const parsedAge = Number(profile.age);
  const conditions = (profile.conditions || "").trim().toLowerCase();
  const hospital = (profile.preferredHospital || "").toLowerCase();
  const hasCondition = conditions !== "" && conditions !== "none";

  return {
    age: Number.isFinite(parsedAge) ? parsedAge : null,
    hasCondition,
    hasCancer: conditions.includes("cancer"),
    wantsReddingtonOrEvercare: hospital.includes("reddington") || hospital.includes("evercare"),
    wantsLagoon: hospital.includes("lagoon"),
    wantsLeadwayCatAHospital:
      hospital !== "" && LEADWAY_CAT_A_HOSPITALS_LOWER.some((name) => hospital.includes(name)),
    budgetAnnualMax: BUDGET_ANNUAL_RANGE[profile.budget]?.max ?? Infinity,
    // "Pre-existing condition" is the standard insurance term for any condition
    // the user already has — any stated condition qualifies, not just severe ones.
    needsImmediateCoverage: profile.priority === "maternity" || hasCondition,
  };
}

type ExclusionRecord = { id: string; rule: string };

function filterEligiblePlans(
  plans: Plan[],
  ctx: EligibilityContext
): { eligible: Plan[]; excluded: ExclusionRecord[] } {
  const excluded: ExclusionRecord[] = [];
  let pool = plans;

  function drop(predicate: (p: Plan) => boolean, rule: string) {
    pool = pool.filter((p) => {
      if (predicate(p)) {
        excluded.push({ id: p.id, rule });
        return false;
      }
      return true;
    });
  }

  // Rule 3 — cancer routing overrides the general chronic-condition rule (2):
  // only these 5 plans are ever eligible for a user with a cancer history.
  if (ctx.hasCancer) {
    drop(
      (p) => !CANCER_ALLOWED_IDS.has(p.id),
      "Rule 3: cancer history — only Hygeia Senior Midi/Premium/Exclusive and Leadway MRCare/MRCare Premium cover cancer"
    );
  } else if (ctx.hasCondition) {
    // Rule 2 — any chronic condition excludes Hygeia's two entry tiers.
    drop(
      (p) => p.id === "hygeia_hyease" || p.id === "hygeia_hybasic",
      "Rule 2: chronic condition — minimum Hygeia plan is HyPrime"
    );
  }

  // Rule 4 — age over 60 excludes Leadway retail plans and all Avon plans.
  if (ctx.age !== null && ctx.age > 60) {
    drop(
      (p) => LEADWAY_RETAIL_IDS.has(p.id),
      "Rule 4: age over 60 — Leadway retail plans are capped at age 60"
    );
    drop((p) => p.hmo === "Avon HMO", "Rule 4: age over 60 — Avon plans excluded");
  }

  // Rule 5 — age over 64 excludes all AXA Mansard plans.
  if (ctx.age !== null && ctx.age > 64) {
    drop(
      (p) => p.hmo === "AXA Mansard Health",
      "Rule 5: age over 64 — AXA Mansard plans are capped at age 64"
    );
  }

  // Rule 6 — age over 79 excludes all Leadway senior plans.
  if (ctx.age !== null && ctx.age > 79) {
    drop(
      (p) => p.source === "verified" && p.hmo === "Leadway Health" && p.planType === "senior",
      "Rule 6: age over 79 — Leadway senior plans are capped at age 79"
    );
  }

  // Additional age-eligibility rules (not in the original 12, added on request):
  // hard floors/ceilings for plans whose own eligibility window wasn't otherwise enforced.
  if (ctx.age !== null) {
    // Hygeia Senior tiers: 51–85 only.
    if (ctx.age < 51 || ctx.age > 85) {
      drop(
        (p) => p.source === "verified" && p.hmo === "Hygeia HMO" && p.planType === "senior",
        "Age rule: Hygeia Senior plans require age 51-85"
      );
    }
    // Leadway Senior tiers: 55–79 only (floor; the 79 ceiling is Rule 6 above).
    if (ctx.age < 55) {
      drop(
        (p) => p.source === "verified" && p.hmo === "Leadway Health" && p.planType === "senior",
        "Age rule: Leadway Senior plans require age 55-79"
      );
    }
    // Hygeia individual tiers (HyEase through HyPrime Exclusive): capped at 60.
    if (ctx.age > 60) {
      drop(
        (p) => p.source === "verified" && p.hmo === "Hygeia HMO" && p.planType === "individual",
        "Age rule: Hygeia individual plans are capped at age 60"
      );
    }
  }

  // Rule 7 — Reddington/Evercare preference: minimum AXA plan is Rhodium.
  if (ctx.wantsReddingtonOrEvercare) {
    drop(
      (p) => p.hmo === "AXA Mansard Health" && p.id !== "axa_rhodium",
      "Rule 7: Reddington/Evercare preferred — minimum AXA Mansard plan is Rhodium"
    );
  }

  // Rule 8 — Lagoon Hospital preference: minimum AXA plan is Platinum Plus.
  if (ctx.wantsLagoon) {
    drop(
      (p) => p.hmo === "AXA Mansard Health" && p.id !== "axa_platinum_plus" && p.id !== "axa_rhodium",
      "Rule 8: Lagoon Hospital preferred — minimum AXA Mansard plan is Platinum Plus"
    );
  }

  // Rule 9 — exclude AXA entirely if even the top of the user's stated budget
  // band can't reach AXA's cheapest tier (Bronze).
  if (ctx.budgetAnnualMax < AXA_BRONZE_ANNUAL) {
    drop(
      (p) => p.hmo === "AXA Mansard Health",
      `Rule 9: stated budget cannot reach AXA Mansard's lowest tier (Bronze, ₦${AXA_BRONZE_ANNUAL.toLocaleString()}/yr)`
    );
  }

  // Rule 10 — cancer history excludes all 5 Leadway retail plans (explicit,
  // even though Rule 3's allowlist already has the same effect).
  if (ctx.hasCancer) {
    drop(
      (p) => LEADWAY_RETAIL_IDS.has(p.id),
      "Rule 10: cancer history — no Leadway retail plan covers cancer"
    );
  }

  // Rule 11 — the 95 Cat A hospitals on Leadway's MRCare provider list aren't
  // accessible on any Leadway retail or senior plan; MRCare is the minimum tier.
  if (ctx.wantsLeadwayCatAHospital) {
    drop(
      (p) => p.hmo === "Leadway Health" && (LEADWAY_RETAIL_IDS.has(p.id) ||
        (p.source === "verified" && p.planType === "senior")),
      "Rule 11: preferred hospital is Leadway Cat A — minimum Leadway plan is MRCare"
    );
  }

  // Rule 12 — a user who needs immediate maternity/pre-existing coverage gets
  // only AXA Rhodium among AXA plans, since every other tier has a 12-month
  // moratorium on exactly those two things.
  if (ctx.needsImmediateCoverage) {
    drop(
      (p) => p.hmo === "AXA Mansard Health" && p.id !== "axa_rhodium",
      "Rule 12: needs immediate maternity/pre-existing coverage — only AXA Rhodium has no moratorium"
    );
  }

  return { eligible: pool, excluded };
}

// Deterministic, code-enforced notes — never left to Gemini's discretion.
function applyDeterministicNotes(card: PlanCard, plan: Plan, ctx: EligibilityContext): PlanCard {
  const extraConfirmed: string[] = [];
  const extraCaveats: string[] = [];

  // Rule 9 (second half) — always flag AXA's annual-only payment requirement.
  if (plan.hmo === "AXA Mansard Health") {
    extraCaveats.push("Annual payment only — no monthly option");
  }

  // Rule 12 (second half) — always highlight Rhodium's unique no-moratorium status.
  if (plan.id === "axa_rhodium") {
    extraConfirmed.push("No moratorium — maternity & pre-existing covered from day 1");
  }

  // Leadway Senior 70-79: standard rate applies 55-69, but 70-79 is subject to
  // medical underwriting — always surface this regardless of what Gemini writes.
  if (
    plan.source === "verified" && plan.hmo === "Leadway Health" && plan.planType === "senior" &&
    ctx.age !== null && ctx.age >= 70 && ctx.age <= 79
  ) {
    extraCaveats.push("Age 70-79 subject to medical underwriting");
  }

  if (extraConfirmed.length === 0 && extraCaveats.length === 0) return card;

  return {
    ...card,
    confirmedTags: Array.from(new Set([...card.confirmedTags, ...extraConfirmed])),
    caveatTags: Array.from(new Set([...card.caveatTags, ...extraCaveats])),
  };
}

function buildUserPrompt(profile: UserProfile, eligiblePlans: Plan[], candidateCount: number): string {
  const location = [profile.state, profile.city].filter(Boolean).join(", ");
  const hospital = profile.preferredHospital || "None specified";
  const conditions = profile.conditions || "none";

  return `Here is the user profile:
- Age: ${profile.age}
- Location: ${location}
- Coverage type: ${COVERAGE_LABELS[profile.coverage] ?? profile.coverage}
- Budget: ${budgetLabel(profile.budget)}
- Existing conditions: ${conditions}
- Preferred hospital: ${hospital}
- Top priority: ${PRIORITY_LABELS[profile.priority] ?? profile.priority}

Here are the plans this user is eligible for (all prices are annual):
${JSON.stringify(eligiblePlans, null, 2)}

Recommend the best ${candidateCount} plan(s) for this person, ranked best fit first.`;
}

function priceRangeNote(
  prices: { annualPremium: number }[],
  variesBy: "hospital category" | "age"
): string {
  const values = prices.map((p) => p.annualPremium);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return `₦${min.toLocaleString()} – ₦${max.toLocaleString()}/year depending on ${variesBy}`;
}

function mergeCandidate(
  candidate: GeminiCandidate, plan: Plan, ctx: EligibilityContext, isFamily: boolean
): PlanCard {
  const base = {
    planId: plan.id,
    hmo: plan.hmo,
    planName: plan.planName,
    enrollUrl: plan.enrollUrl,
    reason: candidate.reason,
    altNote: candidate.altNote,
    watchOut: candidate.watchOut,
    confirmedTags: candidate.confirmedTags,
    caveatTags: candidate.caveatTags,
  };

  let card: PlanCard;
  if (plan.source === "placeholder") {
    card = { ...base, annualPremium: plan.monthlyPremium * 12 };
  } else if (isFamily && plan.familyPricing) {
    // Family-eligible plans (Hygeia HyBasic/HyPrime): use the family-of-4 rate.
    // Plans with no familyPricing (HyPrime Plus/Exclusive, all AXA, all Leadway)
    // charge per head, so the individual price is already correct for family
    // coverage and falls through to the branches below.
    const familyOf4 = plan.familyPricing.find((f) => f.size === 4) ?? plan.familyPricing[0];
    card = { ...base, annualPremium: familyOf4.annualPremium };
  } else if (plan.annualPremium === null && plan.pricingByHospitalCategory) {
    card = {
      ...base,
      annualPremium: null,
      priceNote: priceRangeNote(plan.pricingByHospitalCategory, "hospital category"),
    };
  } else if (plan.annualPremium === null && plan.ageBandPricing) {
    card = {
      ...base,
      annualPremium: null,
      priceNote: priceRangeNote(plan.ageBandPricing, "age"),
    };
  } else {
    card = { ...base, annualPremium: plan.annualPremium };
  }

  return applyDeterministicNotes(card, plan, ctx);
}

export async function POST(req: NextRequest) {
  try {
    const profile: UserProfile = await req.json();

    if (!profile.age || !profile.state || !profile.coverage || !profile.budget) {
      return NextResponse.json(
        { error: "Incomplete profile data." },
        { status: 400 }
      );
    }

    const ctx = buildEligibilityContext(profile);
    const isFamily = profile.coverage === "family";
    const { eligible } = filterEligiblePlans(PLANS, ctx);

    if (eligible.length === 0) {
      return NextResponse.json(
        {
          error:
            "None of our current plans match this profile's requirements. Please speak with a licensed insurance advisor directly.",
        },
        { status: 422 }
      );
    }

    const candidateCount = Math.min(3, eligible.length);

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchemaFor(candidateCount),
      },
    });

    const result = await model.generateContent(buildUserPrompt(profile, eligible, candidateCount));
    const text = result.response.text();
    const parsed: { candidates: GeminiCandidate[] } = JSON.parse(text);

    if (!Array.isArray(parsed.candidates) || parsed.candidates.length !== candidateCount) {
      throw new Error(`Model did not return exactly ${candidateCount} candidate(s).`);
    }

    const candidates = parsed.candidates.map((candidate) => {
      const plan = eligible.find((p) => p.id === candidate.planId);
      if (!plan) {
        throw new Error(`Model returned ineligible or unknown planId "${candidate.planId}".`);
      }
      return mergeCandidate(candidate, plan, ctx, isFamily);
    });

    return NextResponse.json({ candidates });
  } catch (err) {
    console.error("Recommendation error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate recommendation: ${message}` },
      { status: 500 }
    );
  }
}
