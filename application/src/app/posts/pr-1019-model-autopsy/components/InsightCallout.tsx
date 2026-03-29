interface Props {
  children: React.ReactNode;
}

export default function InsightCallout({ children }: Props) {
  return (
    <div className="bg-zinc-50 border border-zinc-100 rounded-lg px-5 py-4 mt-8">
      <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1">Key Insight</p>
      <div className="text-sm leading-relaxed text-zinc-600">
        {children}
      </div>
    </div>
  );
}
