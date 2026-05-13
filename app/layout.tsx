import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
