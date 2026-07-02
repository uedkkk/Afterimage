"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  variant?: "default" | "danger";
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  onConfirm,
  variant = "default",
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      setError("操作失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        className="cursor-pointer inline-block"
      >
        {trigger}
      </span>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center">
          <div className="bg-paper p-6 rounded-lg max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            {description && (
              <p className="text-sm text-dim mb-4">{description}</p>
            )}
            {error && (
              <p className="text-sm text-accent mb-4">{error}</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-sm border border-faint rounded-md text-dim hover:bg-faint"
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={cn(
                  "px-4 py-2 text-sm rounded-md text-bg",
                  variant === "danger" ? "bg-accent" : "bg-ink"
                )}
              >
                {loading ? "..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
