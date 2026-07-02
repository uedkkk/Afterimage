interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-lg border border-faint bg-paper p-5">
      <p className="text-sm text-dim">{label}</p>
      <p className="font-display text-3xl font-bold text-ink mt-1">{value}</p>
      {hint && <p className="text-xs text-dim mt-1">{hint}</p>}
    </div>
  );
}
