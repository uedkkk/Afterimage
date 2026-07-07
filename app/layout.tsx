import type { Metadata } from "next";
import { Sofia_Sans } from "next/font/google";
import { getAllSettings } from "@/lib/db/queries";
import "./globals.css";

const sofiaSans = Sofia_Sans({
  subsets: ["latin"],
  variable: "--font-sofia-sans",
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
    <html lang="zh-CN" className={sofiaSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
