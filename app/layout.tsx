import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpeakUp — Speak with confidence",
  description: "AI communication coaching for real-world conversations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
