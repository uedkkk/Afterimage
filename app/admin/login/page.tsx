"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push(redirectPath);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "登录失败");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <h1 className="font-display text-3xl font-bold text-center mb-8">
          Afterimage
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-accent bg-accent/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm text-dim mb-1">
              用户名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-faint bg-paper px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-dim mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-faint bg-paper px-3 py-2 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-bg px-3 py-2 rounded-md"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-dim hover:text-ink no-underline"
          >
            ← 返回前台
          </Link>
        </div>
      </div>
    </div>
  );
}
