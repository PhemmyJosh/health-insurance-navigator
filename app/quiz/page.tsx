"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

type Answers = {
  age: string;
  state: string;
  coverage: string;
  budget: string;
  conditions: string;
  conditionsOther: string;
  preferredHospital: string;
  priority: string;
};

const TOTAL_STEPS = 7;

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    age: "",
    state: "",
    coverage: "",
    budget: "",
    conditions: "",
    conditionsOther: "",
    preferredHospital: "",
    priority: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1: return answers.age.trim() !== "" && Number(answers.age) > 0;
      case 2: return answers.state !== "";
      case 3: return answers.coverage !== "";
      case 4: return answers.budget !== "";
      case 5: return answers.conditions !== "";
      case 6: return true; // optional
      case 7: return answers.priority !== "";
      default: return false;
    }
  }

  function handleNext() {
    if (!canAdvance()) {
      setError("Please answer this question to continue.");
      return;
    }
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    if (!canAdvance()) {
      setError("Please answer this question to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      // Pass recommendation via sessionStorage to avoid long query strings
      sessionStorage.setItem("recommendation", JSON.stringify(data));
      sessionStorage.setItem("userAnswers", JSON.stringify(answers));
      router.push("/result");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <span className="text-[#1B4F8A] font-semibold">
            HealthNav <span className="text-[#E67E22]">Nigeria</span>
          </span>
          <span className="text-sm text-gray-400 font-medium">
            {step} of {TOTAL_STEPS}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-1 bg-[#1B4F8A] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question area */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl space-y-8">
          <StepContent
            step={step}
            answers={answers}
            update={update}
            error={error}
          />

          {/* Navigation */}
          <div className="pt-2">
            {step < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                className="w-full bg-[#1B4F8A] hover:bg-[#163f6e] text-white font-semibold py-4 rounded-2xl transition-colors duration-200 active:scale-95"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#E67E22] hover:bg-[#d4731f] disabled:opacity-60 text-white font-semibold py-4 rounded-2xl transition-colors duration-200 active:scale-95"
              >
                {loading ? "Getting your recommendation…" : "Get My Recommendation"}
              </button>
            )}
          </div>

          {step > 1 && (
            <button
              onClick={() => { setStep((s) => s - 1); setError(""); }}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function StepContent({
  step,
  answers,
  update,
  error,
}: {
  step: number;
  answers: Answers;
  update: (field: keyof Answers, value: string) => void;
  error: string;
}) {
  return (
    <div className="space-y-6">
      {step === 1 && (
        <Question label="How old are you?">
          <input
            type="number"
            min={1}
            max={120}
            value={answers.age}
            onChange={(e) => update("age", e.target.value)}
            placeholder="e.g. 32"
            className="w-full border-2 border-gray-200 focus:border-[#1B4F8A] rounded-xl px-4 py-3 text-lg outline-none transition-colors"
          />
        </Question>
      )}

      {step === 2 && (
        <Question label="Which state are you in?">
          <select
            value={answers.state}
            onChange={(e) => update("state", e.target.value)}
            className="w-full border-2 border-gray-200 focus:border-[#1B4F8A] rounded-xl px-4 py-3 text-lg outline-none bg-white transition-colors"
          >
            <option value="">Select your state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Question>
      )}

      {step === 3 && (
        <Question label="Is this plan for just you, or your family too?">
          <OptionGroup
            options={[
              { value: "individual", label: "Just me" },
              { value: "couple", label: "Me and my spouse" },
              { value: "family", label: "Me and my family" },
            ]}
            selected={answers.coverage}
            onSelect={(v) => update("coverage", v)}
          />
        </Question>
      )}

      {step === 4 && (
        <Question label="What is your monthly budget for health insurance?">
          <OptionGroup
            options={[
              { value: "under_5k", label: "Under ₦5,000" },
              { value: "5k_10k", label: "₦5,000 – ₦10,000" },
              { value: "10k_20k", label: "₦10,000 – ₦20,000" },
              { value: "above_20k", label: "Above ₦20,000" },
            ]}
            selected={answers.budget}
            onSelect={(v) => update("budget", v)}
          />
        </Question>
      )}

      {step === 5 && (
        <Question label="Do you have any existing health conditions?">
          <OptionGroup
            options={[
              { value: "none", label: "None" },
              { value: "hypertension", label: "Hypertension" },
              { value: "diabetes", label: "Diabetes" },
              { value: "asthma", label: "Asthma" },
              { value: "other", label: "Other" },
            ]}
            selected={answers.conditions}
            onSelect={(v) => update("conditions", v)}
          />
          {answers.conditions === "other" && (
            <input
              type="text"
              value={answers.conditionsOther}
              onChange={(e) => update("conditionsOther", e.target.value)}
              placeholder="Please describe your condition"
              className="mt-3 w-full border-2 border-gray-200 focus:border-[#1B4F8A] rounded-xl px-4 py-3 outline-none transition-colors"
            />
          )}
        </Question>
      )}

      {step === 6 && (
        <Question
          label="Is there a specific hospital you would prefer to use?"
          hint="Optional — leave blank if you have no preference."
        >
          <input
            type="text"
            value={answers.preferredHospital}
            onChange={(e) => update("preferredHospital", e.target.value)}
            placeholder="e.g. Lagos Island General Hospital"
            className="w-full border-2 border-gray-200 focus:border-[#1B4F8A] rounded-xl px-4 py-3 text-lg outline-none transition-colors"
          />
        </Question>
      )}

      {step === 7 && (
        <Question label="What matters most to you in a health plan?">
          <OptionGroup
            options={[
              { value: "routine", label: "Routine visits and checkups" },
              { value: "hospitalisation", label: "Hospitalisation and surgery" },
              { value: "maternity", label: "Maternity and family planning" },
              { value: "emergency", label: "Emergency coverage" },
            ]}
            selected={answers.priority}
            onSelect={(v) => update("priority", v)}
          />
        </Question>
      )}

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}

function Question({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-gray-900 leading-snug">{label}</h2>
      {hint && <p className="text-sm text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

function OptionGroup({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-150 ${
            selected === value
              ? "border-[#1B4F8A] bg-blue-50 text-[#1B4F8A]"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}
        >
          {selected === value && (
            <span className="mr-2 text-[#1B4F8A]">✓</span>
          )}
          {label}
        </button>
      ))}
    </div>
  );
}
