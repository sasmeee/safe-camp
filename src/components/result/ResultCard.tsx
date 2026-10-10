import type { Verdict } from "@/lib/aggregate";
import { HAZARDS, type Hazard } from "@/lib/hazards";
import type { ImageQuality } from "@/lib/messages";
import { ActionList } from "./ActionList";
import { NONE_TONE, RISK, type Tone } from "@/lib/risk";
import { Icon } from "../ui/Icon";
import { RiskMeter } from "./RiskMeter";
import { ScoreRow } from "./ScoreRow";
import { WhyPanel } from "./WhyPanel";

type Props = { verdict: Verdict; quality: ImageQuality | null };

type View = {
  tone: Tone;
  bandLabel: string;
  title: string;
  notes: string[];
  actionsTitle: string;
  scoreLabel: string;
};

function describe(
  verdict: Verdict,
  hazard: Hazard | undefined,
  also: Hazard | undefined,
  quality: ImageQuality | null,
): View {
  if (verdict.status === "none") {
    const poor = !!(quality?.tooDark || quality?.tooBlurry);
    return {
      tone: NONE_TONE,
      bandLabel: "No known hazard",
      title: quality?.tooDark
        ? "Too dark to judge"
        : quality?.tooBlurry
          ? "Too blurry to judge"
          : verdict.seen
            ? `Looks like: ${verdict.seen}`
            : "No known hazard matched",
      notes: [
        poor
          ? "Retake the photo before relying on this result."
          : "No hazard spotted in this photo. Still check the whole site.",
      ],
      actionsTitle: "",
      scoreLabel: "Everyday-scene score",
    };
  }

  const alsoNote = also
    ? [`Could also be: ${also.name}. Treat both with the same care.`]
    : [];

  if (verdict.status === "unsure") {
    return {
      tone: RISK.caution,
      bandLabel: "Not sure, be careful",
      title: `Possible: ${hazard?.name ?? "a hazard"}`,
      notes: ["Treat with caution.", ...alsoNote],
      actionsTitle: "What to do",
      scoreLabel: "Match score",
    };
  }

  if (hazard?.risk === "good") {
    return {
      tone: RISK.good,
      bandLabel: "Looks favorable",
      title: "No hazard spotted in this photo",
      notes: ["Still check the whole site.", ...alsoNote],
      actionsTitle: "Keep in mind",
      scoreLabel: "Match score",
    };
  }

  const tone = RISK[hazard?.risk ?? "caution"];
  return {
    tone,
    bandLabel: `Risk: ${tone.label}`,
    title: hazard?.name ?? "Possible hazard",
    notes: alsoNote,
    actionsTitle: "What to do",
    scoreLabel: "Match score",
  };
}

export function ResultCard({ verdict, quality }: Props) {
  const hazard =
    verdict.status !== "none"
      ? HAZARDS.find((h) => h.id === verdict.hazardId)
      : undefined;
  const also =
    verdict.status !== "none" && verdict.alsoId
      ? HAZARDS.find((h) => h.id === verdict.alsoId)
      : undefined;

  const view = describe(verdict, hazard, also, quality);
  const { tone } = view;

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-white">
      <div
        className={`flex items-center justify-between px-4 py-2.75 lg:px-6 lg:py-3.5 ${tone.band}`}
      >
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] lg:gap-2.5 lg:text-[13px]">
          <Icon name={tone.icon} size={20} strokeWidth={2} />
          {view.bandLabel}
        </p>
        <RiskMeter
          level={tone.level}
          onClass={tone.meterOn}
          offClass={tone.meterOff}
        />
      </div>

      <div className="flex flex-col gap-3 p-4 lg:gap-4 lg:p-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-bold leading-[1.15] tracking-tight lg:text-[32px] lg:leading-[1.1]">
            {view.title}
          </h2>
          {view.notes.map((note) => (
            <p
              key={note}
              className="text-[13px] leading-snug text-muted lg:text-sm"
            >
              {note}
            </p>
          ))}
        </div>

        {hazard && (
          <p className="text-[15px] leading-normal lg:text-base">
            {hazard.summary}
          </p>
        )}

        {hazard && hazard.actions.length > 0 && (
          <ActionList
            title={view.actionsTitle}
            items={hazard.actions}
            stepClass={tone.step}
          />
        )}

        <div className="flex flex-col gap-2 border-t border-line pt-3 lg:pt-4">
          <ScoreRow
            label={`${view.scoreLabel} (relative, not a probability)`}
            value={verdict.confidence}
            barClass={tone.bar}
          />
          <WhyPanel breakdown={verdict.breakdown} barClass={tone.bar} />
        </div>
      </div>
    </article>
  );
}
