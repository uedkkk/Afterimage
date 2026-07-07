interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-stadium border border-dust bg-lifted p-5 shadow-card">
      <p className="text-sm text-slate">{label}</p>
      <p className="text-3xl font-medium text-ink mt-1">{value}</p>
      {hint && <p className="text-xs text-slate mt-1">{hint}</p>}
    </div>
  );
}
