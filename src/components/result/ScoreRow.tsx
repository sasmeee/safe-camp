type Props = { label: string; value: number; barClass: string };

export function ScoreRow({ label, value, barClass }: Props) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 text-[13px] lg:text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-[15px] font-medium lg:text-base">
          {pct}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#e8ebe2]">
        <div className={`h-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
