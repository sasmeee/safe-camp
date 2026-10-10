import { Button } from "../ui/Button";

const R = 68;
const C = 2 * Math.PI * R;

type Props = { percent: number; stuck: boolean; onReset: () => void };

export function ModelLoader({ percent, stuck, onReset }: Props) {
  const dash = (Math.min(Math.max(percent, 0), 100) / 100) * C;

  return (
    <section className="flex flex-col gap-4">
      <div
        role="status"
        className="flex flex-col items-center gap-3.5 pb-2 pt-7 text-center"
      >
        <div className="relative size-40">
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            fill="none"
            aria-hidden="true"
            className="-rotate-90"
          >
            <circle cx="80" cy="80" r={R} stroke="#dfe3d8" strokeWidth="10" />
            <circle
              cx="80"
              cy="80"
              r={R}
              stroke="#1b382b"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${C}`}
              className="transition-[stroke-dasharray] duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[34px] font-medium">
            {percent}%
          </div>
        </div>
        <p className="text-xl font-semibold tracking-tight">
          Preparing offline model
        </p>
        <p className="max-w-70 text-sm leading-relaxed text-muted">
          First time needs internet. After this, SafeCamp works with no signal.
        </p>
      </div>

      {stuck && (
        <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-3.5">
          <p className="text-sm font-semibold">Taking too long?</p>
          <p className="text-[13px] leading-relaxed text-muted">
            Open the browser console (F12) to see errors, or reset the app
            cache. Your downloaded model is kept.
          </p>
          <Button variant="outline" onClick={onReset}>
            Reset app cache
          </Button>
        </div>
      )}
    </section>
  );
}
