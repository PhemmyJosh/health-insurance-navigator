"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Warning } from "@phosphor-icons/react";

type PlanCard = {
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

type Recommendation = {
  candidates: PlanCard[];
};

const LOADING_MESSAGES = [
  "Reviewing your health profile...",
  "Checking available plans across Nigeria...",
  "Comparing coverage options for your budget...",
  "Matching you with the right HMO...",
  "Checking hospital networks near you...",
  "Almost ready — putting it all together...",
];

export default function ResultPage() {
  const [order, setOrder] = useState<PlanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("recommendation");
    if (stored) {
      try {
        const data: Recommendation = JSON.parse(stored);
        setOrder(data.candidates);
      } catch {
        setError("Could not load your recommendation. Please try again.");
      }
      setLoading(false);
      return;
    }

    const answersStr = sessionStorage.getItem("userAnswers");
    if (!answersStr) {
      setError("No quiz answers found. Please retake the quiz.");
      setLoading(false);
      return;
    }

    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: answersStr,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data: Recommendation) => {
        sessionStorage.setItem("recommendation", JSON.stringify(data));
        setOrder(data.candidates);
        setLoading(false);
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      });
  }, []);

  function promote(index: number) {
    if (index === 0) return;
    setOrder((prev) => {
      const clicked = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [clicked, ...rest];
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers that block clipboard without user gesture
    }
  }

  if (loading) return <FullPageLoader />;

  const primary = order[0];
  const alternatives = order.slice(1);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-[480px] mx-auto flex items-center">
          <Link href="/">
            <Image src="/logo.png" alt="laima" width={94} height={35} className="object-cover" />
          </Link>
        </div>
      </header>

      <section className="flex-1 px-6 py-10">
        <div className="max-w-[480px] mx-auto space-y-6">
          {error && (
            <div className="text-center space-y-4 py-16">
              <p className="text-red-500">{error}</p>
              <Link
                href="/quiz"
                className="inline-block text-[#e8632a] underline underline-offset-4"
              >
                Retake the quiz
              </Link>
            </div>
          )}

          {!error && primary && (
            <>
              <PlanCardView plan={primary} />

              {alternatives.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Also worth considering
                  </p>
                  <div className="flex flex-col gap-3">
                    {alternatives.map((alt, i) => (
                      <button
                        key={alt.planId}
                        type="button"
                        onClick={() => promote(i + 1)}
                        className="text-left border-[0.5px] border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium text-gray-900">{alt.planName}</p>
                          <p className="font-semibold text-gray-900 whitespace-nowrap">
                            ₦{alt.monthlyPremium.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{alt.hmo}</p>
                        <p className="text-sm text-gray-500">{alt.altNote}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <a
                  href={primary.enrollUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-[#e8632a] hover:bg-[#d4551f] text-white font-semibold py-3.5 rounded-xl transition-colors duration-150"
                >
                  Enroll in {primary.planName} →
                </a>

                <button
                  onClick={handleShare}
                  className="w-full text-center border-[0.5px] border-[#e8632a] text-[#e8632a] hover:bg-orange-50 font-semibold py-3.5 rounded-xl transition-colors duration-150"
                >
                  {copied ? "Link copied!" : "Share my result"}
                </button>

                <Link
                  href="/quiz"
                  className="text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Start over
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function PlanCardView({ plan }: { plan: PlanCard }) {
  return (
    <div className="bg-white border-[0.5px] border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h1
          className="text-2xl font-bold text-gray-900 leading-snug"
          style={{ fontFamily: "var(--font-figtree)" }}
        >
          {plan.planName}
        </h1>
        <span className="shrink-0 rounded-full bg-[#EBFFFD] text-[#0f766e] text-xs font-medium px-3 py-1">
          {plan.hmo}
        </span>
      </div>

      {/* Price */}
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-900">
          ₦{plan.monthlyPremium.toLocaleString()}
        </span>
        <span className="text-sm text-gray-400">/ month</span>
      </p>

      {/* Trust tags */}
      {(plan.confirmedTags.length > 0 || plan.caveatTags.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {plan.confirmedTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full text-xs font-medium px-3 py-1"
              style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
            >
              {tag}
            </span>
          ))}
          {plan.caveatTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full text-xs font-medium px-3 py-1"
              style={{ backgroundColor: "#FAEEDA", color: "#854F0B" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stat bar */}
      <div className="grid grid-cols-3 divide-x divide-gray-200 border-y-[0.5px] border-gray-200 mt-5 py-4">
        <Stat label="Annual limit" value={plan.annualBenefitLimit} />
        <Stat label="Hospitals" value={String(plan.hospitalsCount)} />
        <Stat label={plan.dynamicStat.label} value={plan.dynamicStat.value} />
      </div>

      {/* Why section */}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Why this fits you
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-1.5">{plan.reason}</p>
      </div>

      {/* Watch out */}
      <div
        className="flex items-start gap-2.5 rounded-lg px-4 py-3.5 mt-4"
        style={{ backgroundColor: "#FAEEDA" }}
      >
        <Warning size={16} weight="fill" color="#854F0B" className="shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#854F0B" }}>
            One thing to watch out for
          </p>
          <p className="text-sm leading-relaxed mt-0.5" style={{ color: "#854F0B" }}>
            {plan.watchOut}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center px-2">
      <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
      <p className="text-[11px] text-gray-400 uppercase tracking-wide mt-0.5 truncate">{label}</p>
    </div>
  );
}

function FullPageLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length),
      2500
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <style>{`
        @keyframes loader-slide {
          0%   { left: -40%; }
          100% { left: 110%; }
        }
        .loader-bar-inner {
          animation: loader-slide 1.6s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col items-center gap-8 max-w-sm w-full text-center">
        <Link href="/">
          <Image src="/logo.png" alt="laima" width={94} height={35} className="object-cover" />
        </Link>

        {/* Animated progress bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden relative">
          <div className="loader-bar-inner absolute h-full w-2/5 bg-[#0f766e] rounded-full" />
        </div>

        {/* Cycling message */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e8603c] animate-pulse shrink-0" />
            <p
              className="text-[18px] font-bold text-[#1a1a1a]"
              style={{ fontFamily: "var(--font-figtree)" }}
            >
              {LOADING_MESSAGES[msgIndex]}
            </p>
          </div>
          <p className="text-[14px] text-[#888888]">
            This usually takes less than 10 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
