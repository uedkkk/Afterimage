import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Serif } from "next/font/google";
import { getAllSettings } from "@/lib/db/queries";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings();
  const title = settings["nav.title"] ?? "Afterimage";
  const description = settings["site.description"] ?? "摄影作品展示与管理系统";
  return { title, description };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${spaceGrotesk.variable} ${instrumentSerif.variable}`}>
      <body className="font-display antialiased">{children}</body>
    </html>
  );
}
