import { HAZARDS } from "@/lib/hazards";
import { Icon } from "../ui/Icon";

type Props = {
  breakdown: { id: string; score: number }[];
  barClass: string;
};

function nameOf(id: string) {
  if (id === "harmless") return "Everyday scene";
  return HAZARDS.find((h) => h.id === id)?.name ?? id;
}

export function WhyPanel({ breakdown, barClass }: Props) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between py-1.5 text-sm font-semibold lg:text-[15px] [&::-webkit-details-marker]:hidden">
        Why this result?
        <Icon
          name="chevron"
          size={18}
          strokeWidth={2}
          className="transition-transform group-open:rotate-180"
        />
      </summary>
      <ul className="mt-2 flex flex-col gap-2 rounded-2xl bg-sand px-4 py-3.5">
        {breakdown.map((b, i) => {
          const pct = Math.round(b.score * 100);
          return (
            <li key={b.id} className="flex items-center gap-3 text-sm">
              <span className="min-w-0 flex-none basis-28 lg:basis-48">
                {nameOf(b.id)}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e1e4d9]">
                <div
                  className={`h-full ${i === 0 ? barClass : "bg-forest"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 flex-none text-right font-mono">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
