"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Alternative = {
  name: string;
  note: string;
};

type Recommendation = {
  primary: string;
  hmo: string;
  monthlyCost: string;
  reason: string;
  watchOut: string;
  alternatives: Alternative[];
  enrollUrl?: string;
};

export default function ResultPage() {
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("recommendation");
      if (!stored) {
        setError("No recommendation found. Please retake the quiz.");
        setLoading(false);
        return;
      }
      setRec(JSON.parse(stored));
    } catch {
      setError("Could not load your recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers that block clipboard without user gesture
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="laima" className="h-[35px] w-[94px] object-cover" />
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center bg-[#e8603c] text-white text-[14px] px-5 py-2 rounded-[48px]"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          {loading && <LoadingState />}

          {error && (
            <div className="text-center space-y-4 py-16">
              <p className="text-red-500">{error}</p>
              <Link
                href="/quiz"
                className="inline-block text-[#1B4F8A] underline underline-offset-4"
              >
                Retake the quiz
              </Link>
            </div>
          )}

          {!loading && !error && rec && (
            <>
              <div className="text-center space-y-1 pb-2">
                <p className="text-sm font-medium uppercase tracking-widest text-[#E67E22]">
                  Your recommended plan
                </p>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-figtree)" }}>{rec.primary}</h1>
                <p className="text-[#1B4F8A] font-medium">{rec.hmo}</p>
              </div>

              {/* Cost badge */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Estimated monthly cost
                  </p>
                  <p className="text-2xl font-bold text-[#1B4F8A]">{rec.monthlyCost}</p>
                </div>
                <div className="text-4xl">🩺</div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <h2 className="font-semibold text-gray-800" style={{ fontFamily: "var(--font-figtree)" }}>Why this plan fits you</h2>
                <p className="text-gray-600 leading-relaxed">{rec.reason}</p>
              </div>

              {/* Watch out */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 space-y-1">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  One thing to watch out for
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">{rec.watchOut}</p>
              </div>

              {/* Alternatives */}
              {rec.alternatives && rec.alternatives.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-semibold text-gray-800" style={{ fontFamily: "var(--font-figtree)" }}>Also worth considering</h2>
                  <div className="flex flex-col gap-3">
                    {rec.alternatives.map((alt, i) => (
                      <div
                        key={i}
                        className="border border-gray-200 rounded-xl px-5 py-4 space-y-1"
                      >
                        <p className="font-medium text-gray-900">{alt.name}</p>
                        <p className="text-sm text-gray-500">{alt.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex flex-col gap-3 pt-2">
                {rec.enrollUrl ? (
                  <a
                    href={rec.enrollUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center bg-[#E67E22] hover:bg-[#d4731f] text-white font-semibold py-4 rounded-2xl transition-colors duration-200"
                  >
                    Enroll Now
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full text-center bg-[#E67E22] opacity-50 text-white font-semibold py-4 rounded-2xl cursor-not-allowed"
                  >
                    Enroll Now
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="w-full text-center border-2 border-[#1B4F8A] text-[#1B4F8A] hover:bg-blue-50 font-semibold py-4 rounded-2xl transition-colors duration-200"
                >
                  {copied ? "Link copied!" : "Share My Result"}
                </button>
              </div>

              <p className="text-center">
                <Link
                  href="/quiz"
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-4"
                >
                  Start Over
                </Link>
              </p>

              <p className="text-xs text-gray-400 text-center pb-4">
                This recommendation is AI-generated and for guidance only.
                Verify coverage details with your HMO before enrolling.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-5 text-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-[#1B4F8A] animate-spin"></div>
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-gray-800">Analysing your profile…</p>
        <p className="text-sm text-gray-400">
          Matching you with the best plans available in your state.
        </p>
      </div>
    </div>
  );
}
