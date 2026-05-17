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
  title: "Health Insurance Navigator Nigeria",
  description:
    "Answer 7 quick questions and get a personalised health insurance recommendation tailored to your needs and budget.",
  openGraph: {
    title: "Health Insurance Navigator Nigeria",
    description: "Find the right health insurance plan for you.",
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
