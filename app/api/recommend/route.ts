import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type UserProfile = {
  age: string;
  state: string;
  coverage: string;
  budget: string;
  conditions: string;
  conditionsOther: string;
  preferredHospital: string;
  priority: string;
};

const COVERAGE_LABELS: Record<string, string> = {
  individual: "individual only",
  couple: "individual and spouse",
  family: "individual and family",
};

const BUDGET_LABELS: Record<string, string> = {
  under_5k: "under ₦5,000 per month",
  "5k_10k": "₦5,000–₦10,000 per month",
  "10k_20k": "₦10,000–₦20,000 per month",
  above_20k: "above ₦20,000 per month",
};

const PRIORITY_LABELS: Record<string, string> = {
  routine: "routine visits and checkups",
  hospitalisation: "hospitalisation and surgery",
  maternity: "maternity and family planning",
  emergency: "emergency coverage",
};

function buildPrompt(profile: UserProfile): string {
  const condition =
    profile.conditions === "other" && profile.conditionsOther
      ? profile.conditionsOther
      : profile.conditions === "none"
      ? "no existing conditions"
      : profile.conditions;

  const hospital = profile.preferredHospital
    ? `They prefer to use ${profile.preferredHospital} as their hospital.`
    : "They have no preferred hospital.";

  return `You are a health insurance advisor specialising in the Nigerian health insurance market.

A user has completed a health profile questionnaire. Based on their answers, recommend the single best health insurance plan available from HMOs operating in Nigeria.

USER PROFILE:
- Age: ${profile.age} years old
- State: ${profile.state}
- Coverage needed: ${COVERAGE_LABELS[profile.coverage] ?? profile.coverage}
- Monthly budget: ${BUDGET_LABELS[profile.budget] ?? profile.budget}
- Health conditions: ${condition}
- ${hospital}
- Top priority: ${PRIORITY_LABELS[profile.priority] ?? profile.priority}

INSTRUCTIONS:
1. Recommend one specific plan from a real Nigerian HMO (e.g. Hygeia HMO, Reliance HMO, AXA Mansard, Leadway Health, Total Health Trust, Avon HMO, Clearline HMO, etc.).
2. The plan must be realistic — it must fit within the user's stated budget.
3. Consider the user's state: if they are outside Lagos/Abuja, check that the HMO has coverage in that state.
4. Write the reason in plain, warm, direct English — 3–4 sentences. Avoid insurance jargon.
5. Flag one genuine limitation or watch-out for this plan.
6. Suggest two alternative plans with a one-line note each.

RESPOND IN THIS EXACT JSON FORMAT (no markdown, no extra text):
{
  "primary": "Plan name here",
  "hmo": "HMO name here",
  "monthlyCost": "₦X,XXX – ₦X,XXX",
  "reason": "Plain English explanation of why this plan suits this specific user.",
  "watchOut": "One genuine limitation or thing to verify before enrolling.",
  "alternatives": [
    { "name": "Alternative plan 1 (HMO name)", "note": "One-line note." },
    { "name": "Alternative plan 2 (HMO name)", "note": "One-line note." }
  ],
  "enrollUrl": "https://hmo-website.com/enroll or null if unknown"
}`;
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

    const prompt = buildPrompt(profile);

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any accidental markdown fences before parsing
    const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    const recommendation = JSON.parse(cleaned);

    return NextResponse.json(recommendation);
  } catch (err) {
    console.error("Recommendation error:", err);
    return NextResponse.json(
      { error: "Failed to generate recommendation. Please try again." },
      { status: 500 }
    );
  }
}
