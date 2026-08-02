"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CaretDown, Warning, Plus, X } from "@phosphor-icons/react";
import { getHospitalsByState } from "@/lib/hospitals";
import { getCitiesByState } from "@/lib/locations";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const INPUT_CLASS =
  "w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#e8603c] focus:ring-2 focus:ring-[#e8603c]/20 transition-colors duration-150";
const INPUT_ERROR_CLASS = "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-100";

type Answers = {
  age: string;
  coverage: string;
  state: string;
  city: string;
  budget: string;
  conditions: string[];
  customConditions: string[];
  preferredHospital: string;
  priority: string;
};

type FieldKey = "age" | "coverage" | "location" | "budget" | "conditions" | "priority";

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({
    age: "",
    coverage: "",
    state: "",
    city: "",
    budget: "",
    conditions: [],
    customConditions: [],
    preferredHospital: "",
    priority: "",
  });
  const [invalidFields, setInvalidFields] = useState<Set<FieldKey>>(new Set());

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
  }

  function addCustomCondition(value: string) {
    setAnswers((prev) =>
      prev.customConditions.some((c) => c.toLowerCase() === value.toLowerCase())
        ? prev
        : { ...prev, customConditions: [...prev.customConditions, value] }
    );
  }

  function removeCustomCondition(value: string) {
    setAnswers((prev) => ({
      ...prev,
      customConditions: prev.customConditions.filter((c) => c !== value),
    }));
  }

  function validate(): Set<FieldKey> {
    const invalid = new Set<FieldKey>();
    if (!(answers.age.trim() !== "" && Number(answers.age) > 0)) invalid.add("age");
    if (answers.coverage === "") invalid.add("coverage");
    const locationValid =
      answers.state !== "" &&
      (answers.coverage === "individual" ? answers.city !== "" : true);
    if (!locationValid) invalid.add("location");
    if (answers.budget === "") invalid.add("budget");
    if (answers.conditions.length === 0) invalid.add("conditions");
    if (answers.priority === "") invalid.add("priority");
    return invalid;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validate();
    setInvalidFields(invalid);
    if (invalid.size > 0) {
      return;
    }
    const { customConditions, ...rest } = answers;
    const presetConditions = answers.conditions.filter((c) => c !== "other");
    const allConditions = [...presetConditions, ...customConditions];
    const submissionData = {
      ...rest,
      conditions: allConditions.join(", ") || "none",
    };
    sessionStorage.removeItem("recommendation");
    sessionStorage.setItem("userAnswers", JSON.stringify(submissionData));
    router.push("/result");
  }

  const locationInvalid = invalidFields.has("location");

  return (
    <main className="min-h-screen flex flex-col bg-[#FCFCFC]">
      {/* Nav */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-xl mx-auto flex items-center">
          <Link href="/">
            <Image src="/logo.png" alt="laima" width={94} height={35} className="object-cover" />
          </Link>
        </div>
      </header>

      <section className="flex-1 flex justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-6 sm:p-10">
            <div className="space-y-1 mb-7">
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]"
                style={{ fontFamily: "var(--font-figtree)" }}
              >
                Let&apos;s find your plan
              </h1>
              <p className="text-[15px] text-[#555]">
                A few quick questions and we&apos;ll match you to the right health insurance in Nigeria.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <FormField label="How old are you?" invalid={invalidFields.has("age")}>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={answers.age}
                  onChange={(e) => update("age", e.target.value)}
                  placeholder="e.g. 32"
                  className={`${INPUT_CLASS} ${invalidFields.has("age") ? INPUT_ERROR_CLASS : ""}`}
                />
              </FormField>

              <FormField
                label="Is this plan for just you, or your family too?"
                invalid={invalidFields.has("coverage")}
              >
                <RadioBoxGroup
                  columns={3}
                  options={[
                    { value: "individual", label: "Just me" },
                    { value: "couple", label: "Me and my spouse" },
                    { value: "family", label: "Me and my family" },
                  ]}
                  selected={answers.coverage}
                  onSelect={(v) => update("coverage", v)}
                />
              </FormField>

              <FormField label="Where are you located?" invalid={locationInvalid}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* State */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-500">State</label>
                    <div className="relative">
                      <select
                        value={answers.state}
                        onChange={(e) => update("state", e.target.value)}
                        className={`${INPUT_CLASS} appearance-none pr-12 ${locationInvalid ? INPUT_ERROR_CLASS : ""}`}
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
                        className={`${INPUT_CLASS} appearance-none pr-12 ${
                          !answers.state
                            ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : locationInvalid
                              ? INPUT_ERROR_CLASS
                              : ""
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
                  <p className="text-xs text-gray-400 mt-2">
                    Skip the city if your family is in a different location. State is still required.
                  </p>
                )}
              </FormField>

              <FormField
                label="What is your monthly budget for health insurance?"
                invalid={invalidFields.has("budget")}
              >
                <RadioBoxGroup
                  columns={2}
                  options={[
                    { value: "under_5k", label: "Under ₦5,000" },
                    { value: "5k_10k", label: "₦5,000 – ₦10,000" },
                    { value: "10k_20k", label: "₦10,000 – ₦20,000" },
                    { value: "above_20k", label: "Above ₦20,000" },
                  ]}
                  selected={answers.budget}
                  onSelect={(v) => update("budget", v)}
                />
              </FormField>

              <FormField
                label="Do you have any existing health conditions?"
                hint="Select all that apply."
                invalid={invalidFields.has("conditions")}
              >
                <TagGroup
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
                  <OtherConditionInput
                    value={answers.customConditions}
                    onAdd={addCustomCondition}
                    onRemove={removeCustomCondition}
                  />
                )}
              </FormField>

              <FormField
                label="Is there a specific hospital you would prefer to use?"
                hint="Optional — leave blank if you have no preference."
              >
                <HospitalSearch
                  state={answers.state}
                  city={answers.city}
                  value={answers.preferredHospital}
                  onChange={(v) => update("preferredHospital", v)}
                />
              </FormField>

              <FormField
                label="What matters most to you in a health plan?"
                invalid={invalidFields.has("priority")}
              >
                <RadioBoxGroup
                  columns={2}
                  options={[
                    { value: "routine", label: "Routine visits and checkups" },
                    { value: "hospitalisation", label: "Hospitalisation and surgery" },
                    { value: "maternity", label: "Maternity and family planning" },
                    { value: "emergency", label: "Emergency coverage" },
                  ]}
                  selected={answers.priority}
                  onSelect={(v) => update("priority", v)}
                />
              </FormField>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-[#e8603c] hover:bg-[#d4501f] text-white font-semibold py-3.5 rounded-xl transition-colors duration-150 active:scale-[0.98]"
                >
                  Get My Recommendation
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function FormField({
  label, hint, invalid, children,
}: {
  label: string;
  hint?: string;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-[15px] font-bold text-gray-900" style={{ fontFamily: "var(--font-figtree)" }}>
        {label}
      </h2>
      {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
      {children}
      {invalid && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
          <Warning size={14} weight="fill" />
          This field is required.
        </p>
      )}
    </div>
  );
}

function RadioBoxGroup({
  options, selected, onSelect, columns = 2,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  columns?: 2 | 3;
}) {
  const gridClass = columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid grid-cols-1 ${gridClass} gap-3`}>
      {options.map(({ value, label }) => {
        const isSelected = selected === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={`flex items-center gap-3 text-left rounded-xl border px-4 py-3 text-sm font-medium transition-colors duration-150 ${
              isSelected
                ? "border-[#e8603c] bg-[#FDF3F0] text-[#1a1a1a]"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <span
              className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                isSelected ? "border-[#e8603c]" : "border-gray-300"
              }`}
            >
              {isSelected && <span className="w-2 h-2 rounded-full bg-[#e8603c]" />}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TagGroup({
  options, selected, onToggle,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => {
        const isSelected = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={`inline-flex items-center gap-2 rounded-full border pl-3.5 pr-2 py-1.5 text-sm font-medium transition-colors duration-150 ${
              isSelected
                ? "border-[#e8603c] bg-[#fdf3f0] text-[#e8603c]"
                : "border-[#e5e5e5] bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {label}
            <span
              className={`flex items-center justify-center w-4 h-4 rounded-full ${
                isSelected ? "bg-[#e8603c] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {isSelected ? <X size={10} weight="bold" /> : <Plus size={10} weight="bold" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

type ConditionSearchResponse = [number, string[], unknown, string[][]];

function useConditionSearch(query: string) {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(
        `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${encodeURIComponent(trimmed)}&maxList=8`
      )
        .then((res) => res.json())
        .then((data: ConditionSearchResponse) => {
          if (cancelled) return;
          setResults((data[3] ?? []).map((row) => row[0]));
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  return { results, loading };
}

function OtherConditionInput({
  value, onAdd, onRemove,
}: {
  value: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { results, loading } = useConditionSearch(query);

  const alreadyAdded = new Set(value.map((v) => v.toLowerCase()));
  const filtered = results.filter((s) => !alreadyAdded.has(s.toLowerCase()));

  function addCondition(text: string) {
    const trimmed = text.trim();
    if (!trimmed || alreadyAdded.has(trimmed.toLowerCase())) return;
    onAdd(trimmed);
    setQuery("");
    setShowDropdown(false);
  }

  return (
    <div className="mt-3 space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((condition) => (
            <span
              key={condition}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8603c] bg-[#fdf3f0] pl-3.5 pr-2 py-1.5 text-sm font-medium text-[#e8603c]"
            >
              {condition}
              <button
                type="button"
                onClick={() => onRemove(condition)}
                className="flex items-center justify-center w-4 h-4 rounded-full bg-[#e8603c] text-white"
                aria-label={`Remove ${condition}`}
              >
                <X size={10} weight="bold" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCondition(query);
            }
          }}
          placeholder="Type a condition and press Enter to add"
          className={INPUT_CLASS}
        />
        {showDropdown && query.trim().length > 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white ring-1 ring-gray-100 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
            {loading && filtered.length === 0 && (
              <p className="px-4 py-2.5 text-sm text-gray-400">Searching...</p>
            )}
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#fff1ec] hover:text-[#e8603c] transition-colors"
                onMouseDown={(e) => { e.preventDefault(); addCondition(s); }}
              >
                {s}
              </button>
            ))}
            {!loading && filtered.length === 0 && (
              <p className="px-4 py-2.5 text-sm text-gray-400">
                No matches — press Enter to add &quot;{query.trim()}&quot;
              </p>
            )}
          </div>
        )}
      </div>
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
      <div className="flex items-center gap-3 border border-[#e8603c] bg-[#fdf3f0] rounded-xl px-4 py-3">
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
          className={INPUT_CLASS}
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
        className={INPUT_CLASS}
      />
      {showDropdown && query.trim().length > 0 && (
        <div className="absolute z-20 w-full mt-2 bg-white ring-1 ring-gray-100 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
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
            <p className="px-4 py-3 text-sm text-gray-400">No hospitals found matching &quot;{query}&quot;</p>
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
            My hospital isn&apos;t listed &mdash; type name manually
          </button>
        </div>
      )}
    </div>
  );
}
