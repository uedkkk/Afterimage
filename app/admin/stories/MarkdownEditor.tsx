"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function renderMarkdown(text: string): string {
  const lines = text.split("\n");
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) { html.push("<ul>"); inList = true; }
      html.push(`<li>${inlineFormat(line.slice(2))}</li>`);
    } else if (line.trim() === "") {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push("");
    } else {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push(`<p>${inlineFormat(line)}</p>`);
    }
  }
  if (inList) html.push("</ul>");
  return html.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineFormat(text: string): string {
  let result = escapeHtml(text);
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return result;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  return (
    <div className="space-y-2">
      <div className="flex gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("edit")}
          className={cn(
            "px-3 py-1 text-sm rounded-md",
            mobileTab === "edit" ? "bg-ink text-bg" : "border border-faint text-dim"
          )}
        >
          编辑
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={cn(
            "px-3 py-1 text-sm rounded-md",
            mobileTab === "preview" ? "bg-ink text-bg" : "border border-faint text-dim"
          )}
        >
          预览
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={20}
          className={cn(
            "w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink font-mono",
            mobileTab !== "edit" && "hidden md:block"
          )}
          placeholder="在此输入 Markdown 内容..."
        />
        <div
          className={cn(
            "border border-faint rounded-md px-3 py-2 text-sm bg-paper text-ink overflow-y-auto",
            "prose prose-sm max-w-none",
            mobileTab !== "preview" && "hidden md:block"
          )}
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(value) || '<p class="text-dim">预览区域</p>',
          }}
        />
      </div>
    </div>
  );
}
