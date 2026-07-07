"use client";

import { useState, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
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

    try {
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
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <h1 className="text-3xl font-medium tracking-[-0.02em] text-center mb-8">
          Afterimage
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-signal bg-signal/10 px-3 py-2 rounded-button">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm text-slate mb-1">
              用户名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-dust bg-lifted px-3 py-2 rounded-button focus:outline-none focus:border-ink transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-slate mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-dust bg-lifted px-3 py-2 rounded-button focus:outline-none focus:border-ink transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-canvas px-3 py-2 rounded-button transition-colors hover:bg-charcoal"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate hover:text-ink no-underline transition-colors"
          >
            ← 返回前台
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <LoginForm />
    </Suspense>
  );
}
