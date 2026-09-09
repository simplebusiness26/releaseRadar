import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resale Radar",
  description: "Spot potentially underpriced resale listings and estimate the margin before you buy.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
