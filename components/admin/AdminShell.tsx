"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (pathname.match(/\/admin\/stories\/[^/]+\/editor$/)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="flex-1 overflow-auto px-4 py-8 md:px-10 md:py-10">
        {children}
      </main>
    </div>
  );
}
