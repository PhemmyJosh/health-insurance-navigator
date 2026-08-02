"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Warning, ArrowUUpLeft, Share } from "@phosphor-icons/react";

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

declare global {
  interface Window {
    html2canvas?: (
      element: HTMLElement,
      options?: Record<string, unknown>
    ) => Promise<HTMLCanvasElement>;
  }
}

const HTML2CANVAS_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
const HTML2CANVAS_SCRIPT_ID = "html2canvas-script";

const LOADING_MESSAGES = [
  "Reviewing your health profile...",
  "Checking available plans across Nigeria...",
  "Comparing coverage options for your budget...",
  "Matching you with the right HMO...",
  "Checking hospital networks near you...",
  "Almost ready — putting it all together...",
];

function loadHtml2Canvas(): Promise<NonNullable<Window["html2canvas"]>> {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) {
      resolve(window.html2canvas);
      return;
    }

    const onReady = () => {
      if (window.html2canvas) resolve(window.html2canvas);
      else reject(new Error("html2canvas failed to load"));
    };
    const onError = () => reject(new Error("html2canvas failed to load"));

    const existing = document.getElementById(HTML2CANVAS_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", onReady);
      existing.addEventListener("error", onError);
      return;
    }

    const script = document.createElement("script");
    script.id = HTML2CANVAS_SCRIPT_ID;
    script.src = HTML2CANVAS_SRC;
    script.async = true;
    script.onload = onReady;
    script.onerror = onError;
    document.body.appendChild(script);
  });
}

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]*[.!?]/);
  return (match ? match[0] : text).trim();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ResultPage() {
  const router = useRouter();
  const [order, setOrder] = useState<PlanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showStartOverModal, setShowStartOverModal] = useState(false);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

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

  function confirmStartOver() {
    sessionStorage.removeItem("recommendation");
    router.push("/quiz");
  }

  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    try {
      const node = shareCardRef.current;
      if (!node) return;

      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(node, {
        backgroundColor: "#FFFFFF",
        width: 400,
        height: 500,
      });
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      const file = new File([blob], "laima-plan.png", { type: "image/png" });
      const canUseShare =
        typeof navigator.share === "function" &&
        (typeof navigator.canShare !== "function" || navigator.canShare({ files: [file] }));

      if (canUseShare) {
        try {
          await navigator.share({ files: [file], title: "My Laima health plan" });
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          // fall through to download
        }
      }

      downloadBlob(blob, "laima-plan.png");
    } catch {
      // Image generation failed — nothing to share
    } finally {
      setSharing(false);
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

          {!error && primary && showStartOverModal && (
            <StartOverModal
              onConfirm={confirmStartOver}
              onCancel={() => setShowStartOverModal(false)}
            />
          )}

          {!error && primary && !showStartOverModal && (
            <>
              <PlanCardView
                plan={primary}
                onStartOver={() => setShowStartOverModal(true)}
                onShare={handleShare}
                sharing={sharing}
              />

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
                  className="block w-full text-center bg-[#e8632a] hover:bg-[#d4551f] text-white font-semibold py-3.5 rounded-xl transition-colors duration-150"
                >
                  Enroll in {primary.planName} →
                </a>

                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  className="w-full text-center border-[0.5px] border-[#e8632a] text-[#e8632a] hover:bg-orange-50 font-semibold py-3.5 rounded-xl transition-colors duration-150 disabled:opacity-50"
                >
                  {sharing ? "Preparing..." : "Share my result"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Hidden share card — captured to PNG via html2canvas, never shown on screen */}
      {primary && (
        <div
          ref={shareCardRef}
          className="absolute left-[-9999px] top-0"
          style={{
            width: 400,
            height: 500,
            backgroundColor: "#FFFFFF",
            padding: 32,
            boxSizing: "border-box",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            <span style={{ color: "#E8632A" }}>l</span>
            <span style={{ color: "#1A1A1A" }}>aima</span>
          </div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: "#888888",
              marginTop: 20,
              textTransform: "uppercase",
            }}
          >
            My health plan
          </p>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#1A1A1A", marginTop: 10 }}>
            {primary.planName}
          </p>
          <p style={{ fontSize: 14, color: "#666666", marginTop: 2 }}>{primary.hmo}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#1A1A1A", marginTop: 14 }}>
            ₦{primary.monthlyPremium.toLocaleString()}/month
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {primary.confirmedTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: "#EAF3DE",
                  color: "#3B6D11",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: 999,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#444444", marginTop: 18, lineHeight: 1.5 }}>
            {firstSentence(primary.reason)}
          </p>
          <p style={{ position: "absolute", left: 32, right: 32, bottom: 24, fontSize: 12, color: "#888888" }}>
            Find your plan at trylaima.vercel.app
          </p>
        </div>
      )}
    </main>
  );
}

function StartOverModal({
  onConfirm, onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="min-h-[500px] rounded-xl bg-black/60 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center space-y-4">
        <h2
          className="text-lg font-bold text-gray-900"
          style={{ fontFamily: "var(--font-figtree)" }}
        >
          Start over?
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          This will clear your current recommendation and take you back to the beginning.
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full bg-[#e8632a] hover:bg-[#d4551f] text-white font-semibold py-3 rounded-xl transition-colors duration-150"
          >
            Yes, start over
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full border-[0.5px] border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanCardView({
  plan, onStartOver, onShare, sharing,
}: {
  plan: PlanCard;
  onStartOver: () => void;
  onShare: () => void;
  sharing: boolean;
}) {
  return (
    <div className="bg-white border-[0.5px] border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900 leading-snug"
            style={{ fontFamily: "var(--font-figtree)" }}
          >
            {plan.planName}
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">{plan.hmo}</p>
          <p className="mt-2">
            <span className="text-2xl font-bold text-gray-900">
              ₦{plan.monthlyPremium.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400 ml-1">/month</span>
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onStartOver}
            aria-label="Start over"
            className="p-1 text-gray-400 hover:text-gray-900 transition-colors duration-150"
          >
            <ArrowUUpLeft size={20} />
          </button>
          <button
            type="button"
            onClick={onShare}
            disabled={sharing}
            aria-label="Share"
            className="p-1 text-gray-400 hover:text-gray-900 transition-colors duration-150 disabled:opacity-50"
          >
            <Share size={20} />
          </button>
        </div>
      </div>

      {/* Trust tags */}
      {(plan.confirmedTags.length > 0 || plan.caveatTags.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-4">
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

      {/* Why section */}
      <div className="border-t-[0.5px] border-gray-200 mt-5 pt-5">
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
