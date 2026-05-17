import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { PLANS } from "@/lib/plans";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a knowledgeable, honest health insurance advisor helping Nigerians find the right health plan.
You speak in clear, warm, everyday Nigerian English. Never use insurance jargon without immediately explaining it.
You are honest — you surface limitations and gaps, not just benefits.
You genuinely care about helping this person make the right decision.

CRITICAL RULES:
Never recommend a plan without verified data.
If a field is marked VERIFY, flag it in watchOut and tell them to confirm with the HMO directly.
Never hide exclusions relevant to the user.
If a user has a condition and the plan has a waiting period, say so clearly.
Sound like a helpful friend, not a brochure.
Use everyday Nigerian English throughout.`;

const RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    primary: {
      type: SchemaType.OBJECT,
      properties: {
        hmo: { type: SchemaType.STRING },
        planName: { type: SchemaType.STRING },
        monthlyPremium: { type: SchemaType.NUMBER },
        enrollUrl: { type: SchemaType.STRING },
      },
      required: ["hmo", "planName", "monthlyPremium", "enrollUrl"],
    },
    reason: { type: SchemaType.STRING },
    watchOut: { type: SchemaType.STRING },
    alternatives: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          hmo: { type: SchemaType.STRING },
          planName: { type: SchemaType.STRING },
          note: { type: SchemaType.STRING },
        },
        required: ["hmo", "planName", "note"],
      },
    },
  },
  required: ["primary", "reason", "watchOut", "alternatives"],
};

type UserProfile = {
  age: string;
  coverage: string;
  state: string;
  city: string;
  budget: string;
  conditions: string;
  conditionsOther: string;
  preferredHospital: string;
  priority: string;
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
  const conditions =
    profile.conditions === "other" && profile.conditionsOther
      ? profile.conditionsOther
      : profile.conditions || "none";

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

Recommend the best plan for this person.`;
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
    const recommendation = JSON.parse(text);

    return NextResponse.json(recommendation);
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
