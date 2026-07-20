"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [previewing, setPreviewing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 420)}px`;
    }
  }, []);

  useEffect(() => {
    if (!previewing) requestAnimationFrame(adjustHeight);
  }, [value, adjustHeight, previewing]);

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || "文字";
    const newValue =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + before.length;
      textarea.setSelectionRange(pos, pos + selected.length);
    });
  };

  const prependLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  };

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.slice(0, start) + text + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          wrapSelection("**", "**");
          break;
        case "i":
          e.preventDefault();
          wrapSelection("*", "*");
          break;
        case "k":
          e.preventDefault();
          wrapSelection("[", "](https://)");
          break;
        case "p":
          e.preventDefault();
          setPreviewing((p) => !p);
          break;
      }
    }
    if (e.key === "Tab") {
      e.preventDefault();
      insertText("  ");
    }
  };

  const ToolButton = ({
    onClick,
    title,
    children,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="px-2 py-1 text-sm text-dim hover:text-ink hover:bg-faint/40 rounded transition-colors"
    >
      {children}
    </button>
  );

  const Divider = () => <span className="w-px h-4 bg-faint mx-0.5" />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border border-faint rounded-md px-1.5 py-1 bg-paper">
        <div className="flex items-center gap-0.5">
          <ToolButton onClick={() => prependLine("# ")} title="一级标题">
            <span className="font-bold">H1</span>
          </ToolButton>
          <ToolButton onClick={() => prependLine("## ")} title="二级标题">
            <span className="font-bold">H2</span>
          </ToolButton>
          <ToolButton onClick={() => prependLine("### ")} title="三级标题">
            <span className="font-bold">H3</span>
          </ToolButton>
          <Divider />
          <ToolButton onClick={() => wrapSelection("**", "**")} title="粗体 (Ctrl+B)">
            <span className="font-bold">B</span>
          </ToolButton>
          <ToolButton onClick={() => wrapSelection("*", "*")} title="斜体 (Ctrl+I)">
            <span className="italic">I</span>
          </ToolButton>
          <Divider />
          <ToolButton onClick={() => prependLine("> ")} title="引用">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21c3 0 7-1 7-8V5c0-1-1-2-2-2H4c-1 0-2 1-2 2v6c0 1 1 2 2 2h3" />
              <path d="M14 21c3 0 7-1 7-8V5c0-1-1-2-2-2h-4c-1 0-2 1-2 2v6c0 1 1 2 2 2h3" />
            </svg>
          </ToolButton>
          <ToolButton onClick={() => prependLine("- ")} title="无序列表">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="3.5" cy="6" r="1.5" fill="currentColor" />
              <circle cx="3.5" cy="12" r="1.5" fill="currentColor" />
              <circle cx="3.5" cy="18" r="1.5" fill="currentColor" />
            </svg>
          </ToolButton>
          <Divider />
          <ToolButton onClick={() => wrapSelection("[", "](https://)")} title="链接 (Ctrl+K)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </ToolButton>
          <ToolButton onClick={() => insertText("![描述|500](https://)")} title="图片">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </ToolButton>
          <ToolButton onClick={() => insertText("\n```\n代码\n```\n")} title="代码块">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </ToolButton>
          <Divider />
          <ToolButton onClick={() => insertText("---\n")} title="分割线">
            <span className="text-xs">—</span>
          </ToolButton>
        </div>

        <button
          type="button"
          onClick={() => setPreviewing((p) => !p)}
          className={cn(
            "px-3 py-1 text-sm rounded-md transition-colors",
            previewing
              ? "bg-ink text-bg"
              : "border border-faint text-dim hover:text-ink"
          )}
        >
          {previewing ? "编辑" : "预览"}
        </button>
      </div>

      {previewing ? (
        <div
          className="border border-faint rounded-md px-4 py-3 bg-paper text-ink overflow-y-auto prose prose-sm max-w-none min-h-[420px]"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(value) || '<p class="text-dim">预览区域</p>',
          }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          className="w-full border border-faint rounded-md px-3 py-2 text-sm bg-bg text-ink font-mono leading-relaxed min-h-[420px] resize-none focus:outline-none focus:border-slate"
          placeholder="在此输入 Markdown 内容..."
          spellCheck={false}
        />
      )}

      <p className="text-xs text-dim">
        快捷键：Ctrl+B 粗体 · Ctrl+I 斜体 · Ctrl+K 链接 · Ctrl+P 预览 · Tab 缩进
      </p>
    </div>
  );
}
