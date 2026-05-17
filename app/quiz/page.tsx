"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react";
import { getHospitalsByState } from "@/lib/hospitals";
import { getCitiesByState } from "@/lib/locations";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

// Q1: Age | Q2: Coverage | Q3: Location (state+city) | Q4: Budget
// Q5: Conditions | Q6: Hospital | Q7: Priority
const CONTEXTUAL_MESSAGES = [
  null,
  { headline: "Let's find your plan", subtext: "A few quick questions and we'll match you to the right health insurance in Nigeria." },
  { message: "Coverage needs change depending on who you're protecting." },
  { message: "Your location helps us show only plans with hospitals near you." },
  { message: "We'll only recommend plans that actually fit what you can spend." },
  { message: "This helps us flag any exclusions or waiting periods that could affect you." },
  { message: "If you have a trusted hospital, we'll make sure it's in the network." },
  { message: "Last one. This tells us what matters most so we can weight your recommendation correctly." },
];

type Answers = {
  age: string;
  coverage: string;
  state: string;
  city: string;
  budget: string;
  conditions: string[];
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
    coverage: "",
    state: "",
    city: "",
    budget: "",
    conditions: [],
    conditionsOther: "",
    preferredHospital: "",
    priority: "",
  });
  const [error, setError] = useState("");

  function update(field: Exclude<keyof Answers, "conditions">, value: string) {
    setAnswers((prev) => {
      const updated = { ...prev, [field]: value } as Answers;
      // Clear dependent fields when state changes
      if (field === "state") {
        updated.city = "";
        updated.preferredHospital = "";
      }
      return updated;
    });
    setError("");
  }

  function toggleCondition(value: string) {
    setAnswers((prev) => {
      const current = prev.conditions;
      if (value === "none") {
        return { ...prev, conditions: current.includes("none") ? [] : ["none"] };
      }
      const without = current.filter((c) => c !== "none" && c !== value);
      if (current.includes(value)) return { ...prev, conditions: without };
      return { ...prev, conditions: [...without, value] };
    });
    setError("");
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1: return answers.age.trim() !== "" && Number(answers.age) > 0;
      case 2: return answers.coverage !== "";
      case 3:
        if (answers.state === "") return false;
        if (answers.coverage === "individual") return answers.city !== "";
        return true;
      case 4: return answers.budget !== "";
      case 5: return answers.conditions.length > 0;
      case 6: return true;
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

  function handleSubmit() {
    if (!canAdvance()) {
      setError("Please answer this question to continue.");
      return;
    }
    const submissionData = {
      ...answers,
      conditions: answers.conditions.join(", ") || "none",
    };
    sessionStorage.removeItem("recommendation");
    sessionStorage.setItem("userAnswers", JSON.stringify(submissionData));
    router.push("/result");
  }

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-xl mx-auto flex items-center">
          <Link href="/">
            <img src="/logo.png" alt="laima" className="h-[35px] w-[94px] object-cover" />
          </Link>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-1 bg-[#0f766e] transition-all duration-500"
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
            toggleCondition={toggleCondition}
            error={error}
          />

          <div className="pt-2">
            {step < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                className="w-full bg-[#e8603c] hover:bg-[#d4501f] text-white font-semibold py-4 rounded-full transition-colors duration-200 active:scale-95"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="w-full bg-[#e8603c] hover:bg-[#d4501f] text-white font-semibold py-4 rounded-full transition-colors duration-200 active:scale-95"
              >
                Get My Recommendation
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
  toggleCondition,
  error,
}: {
  step: number;
  answers: Answers;
  update: (field: Exclude<keyof Answers, "conditions">, value: string) => void;
  toggleCondition: (value: string) => void;
  error: string;
}) {
  const ctx = CONTEXTUAL_MESSAGES[step];

  return (
    <div className="space-y-6">
      {ctx && (
        <div className="space-y-2">
          {"headline" in ctx ? (
            <>
              <h1 className="text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: "var(--font-figtree)" }}>
                {ctx.headline}
              </h1>
              <p className="text-[15px] text-[#555] leading-relaxed">{ctx.subtext}</p>
            </>
          ) : (
            <p className="text-[15px] font-medium text-[#1a1a1a]">{ctx.message}</p>
          )}
        </div>
      )}

      {/* Q1 — Age */}
      {step === 1 && (
        <Question label="How old are you?">
          <input
            type="number"
            min={1}
            max={120}
            value={answers.age}
            onChange={(e) => update("age", e.target.value)}
            placeholder="e.g. 32"
            className="w-full border-2 border-gray-200 focus:border-[#e8603c] rounded-xl px-4 py-3 text-lg outline-none transition-colors"
          />
        </Question>
      )}

      {/* Q2 — Coverage */}
      {step === 2 && (
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

      {/* Q3 — Location: state + city */}
      {step === 3 && (
        <Question label="Where are you located?">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* State */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-500">State</label>
              <div className="relative">
                <select
                  value={answers.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="w-full appearance-none border-2 border-gray-200 focus:border-[#e8603c] rounded-xl pl-4 pr-12 py-3 text-base outline-none bg-white transition-colors"
                >
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <CaretDown size={20} color="#888888" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* City — always visible, disabled until state is selected */}
            <div className="flex flex-col gap-1">
              <label className={`text-sm font-medium ${answers.state ? "text-gray-500" : "text-gray-300"}`}>
                City or area
              </label>
              <div className="relative">
                <select
                  value={answers.city}
                  onChange={(e) => update("city", e.target.value)}
                  disabled={!answers.state}
                  className={`w-full appearance-none border-2 rounded-xl pl-4 pr-12 py-3 text-base outline-none transition-colors ${
                    answers.state
                      ? "border-gray-200 focus:border-[#e8603c] bg-white text-gray-900"
                      : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {!answers.state ? (
                    <option value="">Select a state first</option>
                  ) : (
                    <>
                      <option value="">Select your city or area</option>
                      {getCitiesByState(answers.state).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </>
                  )}
                </select>
                <CaretDown
                  size={20}
                  color={answers.state ? "#888888" : "#d1d5db"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Helper for family/couple */}
          {answers.coverage !== "individual" && answers.state && (
            <p className="text-sm text-gray-400 mt-2">
              Skip the city if your family is in a different location. State is still required.
            </p>
          )}
        </Question>
      )}

      {/* Q4 — Budget */}
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

      {/* Q5 — Conditions (tile grid, multi-select) */}
      {step === 5 && (
        <Question label="Do you have any existing health conditions?">
          <p className="text-sm text-gray-400 -mt-1">Select all that apply.</p>
          <MultiOptionGroup
            options={[
              { value: "none", label: "None" },
              { value: "hypertension", label: "Hypertension" },
              { value: "diabetes", label: "Diabetes" },
              { value: "asthma", label: "Asthma" },
              { value: "sickle_cell", label: "Sickle Cell" },
              { value: "kidney_disease", label: "Kidney Disease" },
              { value: "heart_condition", label: "Heart Condition" },
              { value: "cancer", label: "Cancer" },
              { value: "hiv", label: "HIV" },
              { value: "other", label: "Other" },
            ]}
            selected={answers.conditions}
            onToggle={toggleCondition}
          />
          {answers.conditions.includes("other") && (
            <input
              type="text"
              value={answers.conditionsOther}
              onChange={(e) => update("conditionsOther", e.target.value)}
              placeholder="Please describe your condition"
              className="mt-3 w-full border-2 border-gray-200 focus:border-[#e8603c] rounded-xl px-4 py-3 outline-none transition-colors"
            />
          )}
        </Question>
      )}

      {/* Q6 — Hospital autocomplete */}
      {step === 6 && (
        <Question
          label="Is there a specific hospital you would prefer to use?"
          hint="Optional — leave blank if you have no preference."
        >
          <HospitalSearch
            state={answers.state}
            city={answers.city}
            value={answers.preferredHospital}
            onChange={(v) => update("preferredHospital", v)}
          />
        </Question>
      )}

      {/* Q7 — Priority */}
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

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}

function Question({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-gray-900 leading-snug" style={{ fontFamily: "var(--font-figtree)" }}>
        {label}
      </h2>
      {hint && <p className="text-sm text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

function OptionGroup({
  options, selected, onSelect,
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
              ? "border-[#e8603c] bg-[#fff1ec] text-[#e8603c]"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }`}
        >
          {selected === value && <span className="mr-2 text-[#e8603c]">✓</span>}
          {label}
        </button>
      ))}
    </div>
  );
}

function MultiOptionGroup({
  options, selected, onToggle,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const mainOptions = options.filter((o) => o.value !== "other");
  const otherOption = options.find((o) => o.value === "other");

  function tileClass(isSelected: boolean) {
    return `flex items-center justify-center text-center px-2 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
      isSelected
        ? "border-[#e8603c] bg-[#fdf3f0] text-[#e8603c]"
        : "border-[#e5e5e5] bg-white text-gray-700 hover:border-gray-300"
    }`;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {mainOptions.map(({ value, label }) => (
          <button key={value} onClick={() => onToggle(value)} className={tileClass(selected.includes(value))}>
            {label}
          </button>
        ))}
      </div>
      {otherOption && (
        <button onClick={() => onToggle("other")} className={`w-full ${tileClass(selected.includes("other"))}`}>
          {otherOption.label}
        </button>
      )}
    </div>
  );
}

function HospitalSearch({
  state, city, value, onChange,
}: {
  state: string;
  city: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [mode, setMode] = useState<"search" | "selected" | "manual">(
    value ? "selected" : "search"
  );
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [manualText, setManualText] = useState("");

  const hospitals = state ? getHospitalsByState(state) : [];
  const filtered = query.trim().length > 0
    ? hospitals
        .filter(
          (h) =>
            h.name.toLowerCase().includes(query.toLowerCase()) ||
            h.city.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => {
          if (city) {
            const aMatch = a.city.toLowerCase() === city.toLowerCase();
            const bMatch = b.city.toLowerCase() === city.toLowerCase();
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
          }
          return 0;
        })
        .slice(0, 7)
    : [];

  // Pill: hospital was selected from the list
  if (mode === "selected" && value) {
    return (
      <div className="flex items-center gap-3 border-2 border-[#e8603c] bg-[#fff1ec] rounded-xl px-4 py-3">
        <span className="flex-1 text-[#e8603c] font-medium text-base">{value}</span>
        <button
          type="button"
          onClick={() => { onChange(""); setMode("search"); setQuery(""); }}
          className="text-[#e8603c] hover:text-[#c0392b] text-xl font-bold leading-none"
          aria-label="Remove hospital"
        >
          ×
        </button>
      </div>
    );
  }

  // Manual text entry
  if (mode === "manual") {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={manualText}
          onChange={(e) => { setManualText(e.target.value); onChange(e.target.value); }}
          placeholder="Type your hospital name..."
          className="w-full border-2 border-gray-200 focus:border-[#e8603c] rounded-xl px-4 py-3 text-lg outline-none transition-colors"
          autoFocus
        />
        <button
          type="button"
          onClick={() => { setMode("search"); onChange(""); setManualText(""); }}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Search from list instead
        </button>
      </div>
    );
  }

  // Search mode
  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Search for your hospital..."
        className="w-full border-2 border-gray-200 focus:border-[#e8603c] rounded-xl px-4 py-3 text-lg outline-none transition-colors"
      />
      {showDropdown && query.trim().length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {filtered.map((h) => (
            <button
              key={h.id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(h.name);
                setMode("selected");
                setQuery("");
                setShowDropdown(false);
              }}
            >
              <p className="font-medium text-gray-900 text-sm">{h.name}</p>
              <p className="text-xs text-gray-500">{h.city}, {h.state}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">No hospitals found matching "{query}"</p>
          )}
          <button
            type="button"
            className="w-full text-left px-4 py-3 text-sm text-[#e8603c] hover:bg-[#fff1ec] transition-colors border-t border-gray-100"
            onMouseDown={(e) => {
              e.preventDefault();
              setMode("manual");
              setShowDropdown(false);
              setQuery("");
            }}
          >
            My hospital isn't listed — type name manually
          </button>
        </div>
      )}
    </div>
  );
}
