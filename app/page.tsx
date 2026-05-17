import Link from "next/link";
import Image from "next/image";

const imgLogo = "/logo.png";
const imgHero = "/hero.png";

export default function LandingPage() {
  return (
    <div className="bg-[#fcfcfc] min-h-screen flex flex-col">
      {/* Nav */}
      <div className="pt-6 px-4 md:px-[142px]">
        <nav className="flex items-center justify-between h-[50px]">
          <Link href="/">
            <Image
              src={imgLogo}
              alt="laima"
              width={94}
              height={35}
              className="object-cover"
            />
          </Link>
          <Link
            href="/quiz"
            className="hidden md:inline-flex items-center justify-center bg-[#e8603c] text-white text-[14px] px-5 py-2 rounded-[48px]"
          >
            Get Started
          </Link>
        </nav>
      </div>

      {/* Hero */}
      <section className="flex flex-col md:flex-row md:items-start px-4 md:px-[144px] mt-8 md:mt-16 flex-1 gap-8 md:gap-0">
        {/* Text content */}
        <div className="flex flex-col gap-4 md:w-[533px] md:shrink-0">
          <div className="inline-flex items-center gap-2 bg-[#ebfffd] border border-[#0f766e] px-4 py-2 rounded-full self-start">
            <span className="w-2 h-2 rounded-full bg-[#0f766e] shrink-0" />
            <span className="text-[#0f766e] text-[14px]">
              Free · No registration required
            </span>
          </div>

          <div className="flex flex-col gap-6 md:gap-10">
            <div className="flex flex-col gap-4">
              <h1
                className="text-[36px] md:text-[64px] font-bold text-[#1a1a1a] leading-[1.1] tracking-[-1.28px]"
                style={{ fontFamily: "var(--font-figtree)" }}
              >
                We&apos;ll find the right health insurance for&nbsp;you
              </h1>
              <p className="text-[16px] md:text-[18px] text-[#444] md:w-[350px] leading-normal">
                No endless comparison tables. Just a plan that fits your needs.
              </p>
            </div>

            <Link
              href="/quiz"
              className="relative overflow-hidden inline-flex items-center justify-center w-full md:w-auto md:self-start bg-[#e8603c] text-white text-[16px] px-8 py-4 rounded-[48px]"
            >
              <span className="absolute rounded-full w-[140px] h-[140px] bg-white/10 -left-[142px] top-1/2 -translate-y-1/2" />
              <span className="relative">Find My Plan</span>
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <div className="w-full md:flex-1 md:flex md:justify-end">
          <div
            className="relative overflow-hidden rounded-[24px] md:rounded-[34px] bg-[rgba(255,241,202,0.68)] w-full md:w-[514px] md:h-[530px]"
            style={{ aspectRatio: "514/530" }}
          >
            <Image
              alt=""
              src={imgHero}
              fill
              sizes="(max-width: 768px) 100vw, 514px"
              className="object-cover object-center pointer-events-none"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 mt-8 md:mt-auto">
        <p className="text-[16px] text-[rgba(68,68,68,0.5)]">
          Not affiliated with any HMO. © 2026
        </p>
      </footer>
    </div>
  );
}
