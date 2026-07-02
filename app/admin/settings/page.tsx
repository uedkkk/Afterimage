"use client";

import { useState, useEffect } from "react";

const KNOWN_SETTINGS = [
  { key: "site.title", label: "站点标题", type: "text" },
  { key: "site.description", label: "站点描述", type: "text" },
  { key: "site.hero_title", label: "首页大标题（第一行）", type: "text" },
  { key: "site.hero_subtitle", label: "首页大标题（第二行，斜体强调）", type: "text" },
  { key: "about.content", label: "关于页内容", type: "textarea" },
  { key: "about.gear", label: "器材列表（每行一项）", type: "textarea" },
  { key: "nav.title", label: "浏览器标签页标题", type: "text" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  function handleChange(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="text-dim text-sm">加载中...</p>
      </div>
    );
  }

  const knownKeys = new Set(KNOWN_SETTINGS.map((s) => s.key));
  const extraKeys = Object.keys(settings).filter((k) => !knownKeys.has(k));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="text-dim mt-1 text-sm">管理站点配置</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        {KNOWN_SETTINGS.map((field) => (
          <div key={field.key}>
            <label className="block text-sm text-dim mb-1">
              {field.label}
              <span className="text-faint ml-2 text-xs">{field.key}</span>
            </label>
            {field.type === "textarea" ? (
              <textarea
                value={settings[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                rows={field.key === "about.content" ? 8 : 5}
                className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
              />
            ) : (
              <input
                type="text"
                value={settings[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
              />
            )}
          </div>
        ))}

        {extraKeys.length > 0 && (
          <div className="border-t border-faint pt-4 space-y-4">
            <h2 className="text-sm font-semibold text-dim">其他设置</h2>
            {extraKeys.map((key) => (
              <div key={key}>
                <label className="block text-sm text-dim mb-1">
                  <span className="text-faint text-xs">{key}</span>
                </label>
                <input
                  type="text"
                  value={settings[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-ink text-bg px-4 py-2 rounded-md text-sm hover:bg-dim disabled:opacity-50"
          >
            {saving ? "..." : "保存设置"}
          </button>
          {saved && (
            <span className="text-sm text-ink">设置已保存</span>
          )}
        </div>
      </form>
    </div>
  );
}
