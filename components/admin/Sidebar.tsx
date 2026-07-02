"use client";

import { type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "仪表盘", href: "/admin", exact: true },
  { label: "相册", href: "/admin/albums" },
  { label: "照片", href: "/admin/photos" },
  { label: "上传", href: "/admin/upload" },
  { label: "故事", href: "/admin/stories" },
  { label: "分类", href: "/admin/categories" },
  { label: "设置", href: "/admin/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string, exact?: boolean): boolean {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function handleLogout(e: FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <aside className="sticky top-0 h-screen w-16 md:w-56 border-r border-faint bg-paper flex flex-col">
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center md:justify-start px-2 md:px-3 py-2 rounded-md text-sm no-underline",
                active
                  ? "bg-ink text-bg"
                  : "text-dim hover:bg-faint hover:text-ink"
              )}
            >
              <span className="md:hidden">{item.label[0]}</span>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-faint p-2 flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center justify-center md:justify-start px-2 md:px-3 py-2 rounded-md text-sm text-dim hover:bg-faint hover:text-ink no-underline"
        >
          <span className="md:hidden">查</span>
          <span className="hidden md:inline">查看前台 ↗</span>
        </Link>
        <form onSubmit={handleLogout}>
          <button
            type="submit"
            className="w-full flex items-center justify-center md:justify-start px-2 md:px-3 py-2 rounded-md text-sm text-dim hover:bg-faint hover:text-ink"
          >
            <span className="md:hidden">退</span>
            <span className="hidden md:inline">退出</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
