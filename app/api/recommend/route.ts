import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { PLANS, type Plan } from "@/lib/plans";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a knowledgeable, honest health insurance advisor helping Nigerians find the right health plan.
You speak in clear, warm, everyday Nigerian English. Never use insurance jargon without immediately explaining it.
You are honest — you surface limitations and gaps, not just benefits.
You genuinely care about helping this person make the right decision.

CRITICAL RULES:
Never recommend a plan without verified data.
Every claim (confirmedTags, caveatTags, dynamicStatLabel/Value) must be grounded in the actual fields of that plan as given below — never invent a benefit, number, or waiting period that isn't in the data.
If a field is marked VERIFY, flag it in watchOut and tell them to confirm with the HMO directly.
Never hide exclusions relevant to the user.
If a user has a condition and the plan has a waiting period, say so clearly.
Sound like a helpful friend, not a brochure.
Use everyday Nigerian English throughout.

You must return exactly 3 candidates, ranked best fit first, each referencing a distinct plan by its exact "id" field from the plans list.
For each candidate:
- planId: the exact "id" of one of the given plans.
- reason: 2–4 sentences on why this specific plan suits this specific user.
- altNote: exactly one short sentence, written as if this plan were being suggested as a secondary option.
- watchOut: one sentence — the single most important caveat to verify for this plan.
- confirmedTags: 2–4 short phrases (max ~6 words each) naming confirmed benefits, grounded in this plan's actual fields.
- caveatTags: 1–3 short phrases (max ~6 words each) naming caveats such as waiting periods or exclusions, grounded in this plan's actual fields.
- dynamicStatLabel + dynamicStatValue: pick whichever of maternityCover / chronicConditionPolicy / outpatientCover / inpatientCover is most relevant to this user's stated conditions and priority, and compress it into a short label (e.g. "Maternity cover") and a short value (e.g. "₦300k after 9-month wait") suitable for a compact stat column.`;

const CANDIDATE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    planId: { type: SchemaType.STRING },
    reason: { type: SchemaType.STRING },
    altNote: { type: SchemaType.STRING },
    watchOut: { type: SchemaType.STRING },
    confirmedTags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    caveatTags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    dynamicStatLabel: { type: SchemaType.STRING },
    dynamicStatValue: { type: SchemaType.STRING },
  },
  required: [
    "planId", "reason", "altNote", "watchOut",
    "confirmedTags", "caveatTags", "dynamicStatLabel", "dynamicStatValue",
  ],
};

const RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    candidates: { type: SchemaType.ARRAY, items: CANDIDATE_SCHEMA },
  },
  required: ["candidates"],
};

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
  dynamicStatLabel: string;
  dynamicStatValue: string;
};

export type PlanCard = {
  planId: string;
  hmo: string;
  planName: string;
  monthlyPremium: number;
  enrollUrl: string;
  annualBenefitLimit: string;
  hospitalsCount: number;
  dynamicStat: { label: string; value: string };
  reason: string;
  altNote: string;
  watchOut: string;
  confirmedTags: string[];
  caveatTags: string[];
};

const BUDGET_LABELS: Record<string, string> = {
  under_5k: "under ₦5,000 per month",
  "5k_10k": "₦5,000–₦10,000 per month",
  "10k_20k": "₦10,000–₦20,000 per month",
  above_20k: "above ₦20,000 per month",
};

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

function buildUserPrompt(profile: UserProfile): string {
  const location = [profile.state, profile.city].filter(Boolean).join(", ");
  const hospital = profile.preferredHospital || "None specified";
  const conditions = profile.conditions || "none";

  return `Here is the user profile:
- Age: ${profile.age}
- Location: ${location}
- Coverage type: ${COVERAGE_LABELS[profile.coverage] ?? profile.coverage}
- Monthly budget: ${BUDGET_LABELS[profile.budget] ?? profile.budget}
- Existing conditions: ${conditions}
- Preferred hospital: ${hospital}
- Top priority: ${PRIORITY_LABELS[profile.priority] ?? profile.priority}

Here are the available plans:
${JSON.stringify(PLANS, null, 2)}

Recommend the best 3 plans for this person, ranked best fit first.`;
}

function mergeCandidate(candidate: GeminiCandidate, plan: Plan): PlanCard {
  return {
    planId: plan.id,
    hmo: plan.hmo,
    planName: plan.planName,
    monthlyPremium: plan.monthlyPremium,
    enrollUrl: plan.enrollUrl,
    annualBenefitLimit: plan.annualBenefitLimit,
    hospitalsCount: plan.keyHospitals.length,
    dynamicStat: { label: candidate.dynamicStatLabel, value: candidate.dynamicStatValue },
    reason: candidate.reason,
    altNote: candidate.altNote,
    watchOut: candidate.watchOut,
    confirmedTags: candidate.confirmedTags,
    caveatTags: candidate.caveatTags,
  };
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

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const result = await model.generateContent(buildUserPrompt(profile));
    const text = result.response.text();
    const parsed: { candidates: GeminiCandidate[] } = JSON.parse(text);

    if (!Array.isArray(parsed.candidates) || parsed.candidates.length !== 3) {
      throw new Error("Model did not return exactly 3 candidates.");
    }

    const candidates = parsed.candidates.map((candidate) => {
      const plan = PLANS.find((p) => p.id === candidate.planId);
      if (!plan) {
        throw new Error(`Model returned unknown planId "${candidate.planId}".`);
      }
      return mergeCandidate(candidate, plan);
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
