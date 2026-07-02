import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAllSettings } from "@/lib/db/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings();
  const title = settings["nav.title"] ?? "Afterimage";
  return { title: `${title} · 后台` };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
