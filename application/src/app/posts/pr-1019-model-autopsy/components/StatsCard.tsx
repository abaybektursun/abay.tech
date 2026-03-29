interface StatsCardProps {
  label: string;
  value: string;
  unit?: string;
}

export default function StatsCard({ label, value, unit }: StatsCardProps) {
  return (
    <div className="bg-zinc-50 border border-zinc-100 rounded-lg px-4 py-3">
      <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
      <p className="text-lg font-semibold text-zinc-900 tabular-nums">
        {value}
        {unit && (
          <span className="text-xs font-normal text-zinc-400">
            {"\u2009"}{unit}
          </span>
        )}
      </p>
    </div>
  );
}
