import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-2xl mx-auto">
          <span className="text-[#1B4F8A] font-semibold text-lg tracking-tight">
            HealthNav <span className="text-[#E67E22]">Nigeria</span>
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1B4F8A] text-sm font-medium px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            Free · No registration required
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Find the right health insurance plan{" "}
            <span className="text-[#1B4F8A]">for you</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-gray-600 leading-relaxed">
            Answer 7 quick questions about your health and budget. Get a
            personalised recommendation from the best HMOs operating in Nigeria
            — in plain English.
          </p>

          {/* CTA */}
          <div className="pt-2">
            <Link
              href="/quiz"
              className="inline-block bg-[#E67E22] hover:bg-[#d4731f] text-white font-semibold text-lg px-10 py-4 rounded-2xl shadow-md transition-colors duration-200 active:scale-95"
            >
              Find My Plan
            </Link>
          </div>

          <p className="text-sm text-gray-400">Takes about 2 minutes</p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-gray-400 mb-8">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Tell us about yourself",
                desc: "Age, state, family size, and health history.",
              },
              {
                step: "2",
                title: "Set your budget",
                desc: "We only show plans you can actually afford.",
              },
              {
                step: "3",
                title: "Get your recommendation",
                desc: "A tailored plan with clear reasons why it fits you.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B4F8A] text-white flex items-center justify-center font-bold text-lg">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          Recommendations are AI-generated and for guidance only. Always verify
          with your HMO before enrolling.
        </p>
      </footer>
    </main>
  );
}
