import type { Metadata } from "next";
import { Figtree, Manrope } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-figtree",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Laima — Find the Right Health Plan",
  description:
    "Get a personalised health insurance recommendation built around your life, budget, and health needs.",
  openGraph: {
    title: "Laima — Find the Right Health Plan",
    description:
      "Get a personalised health insurance recommendation built around your life, budget, and health needs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${figtree.variable} ${manrope.variable} ${manrope.className} min-h-screen bg-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
