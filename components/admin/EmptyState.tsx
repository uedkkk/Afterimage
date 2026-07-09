import { type ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="py-20 text-center">
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      {description && <p className="text-sm text-slate mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
