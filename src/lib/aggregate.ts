import { HAZARDS, HARMLESS_PROMPTS } from "./hazards";

export const LABELS: { prompt: string; owner: string }[] = [
  ...HAZARDS.flatMap((h) =>
    h.prompts.map((prompt) => ({ prompt, owner: h.id })),
  ),
  ...HARMLESS_PROMPTS.map((prompt) => ({ prompt, owner: "harmless" })),
];

const RISK_OF = new Map(HAZARDS.map((h) => [h.id, h.risk]));

export type Verdict = (
  | { status: "match" | "unsure"; hazardId: string }
  | { status: "none" }
) & {
  confidence: number;
  breakdown: { id: string; score: number }[];
};

export const MATCH_THRESHOLD = 0.6;
export const UNSURE_THRESHOLD = 0.3;

export function decide(scored: { label: string; score: number }[]): Verdict {
  const byOwner = new Map<string, number>();
  for (const { label, score } of scored) {
    const owner = LABELS.find((l) => l.prompt === label)?.owner;
    if (owner) byOwner.set(owner, (byOwner.get(owner) ?? 0) + score);
  }

  const sorted = [...byOwner.entries()].sort((a, b) => b[1] - a[1]);
  const breakdown = sorted.slice(0, 4).map(([id, score]) => ({ id, score }));
  const harmless = byOwner.get("harmless") ?? 0;

  const topRisk = sorted.find(
    ([id]) => id !== "harmless" && RISK_OF.get(id) !== "good",
  );
  const topGood = sorted.find(([id]) => RISK_OF.get(id) === "good");

  // real hazards always win over good signs
  if (topRisk && topRisk[1] >= UNSURE_THRESHOLD) {
    return {
      status: topRisk[1] >= MATCH_THRESHOLD ? "match" : "unsure",
      hazardId: topRisk[0],
      confidence: topRisk[1],
      breakdown,
    };
  }
  if (topGood && topGood[1] >= MATCH_THRESHOLD) {
    return {
      status: "match",
      hazardId: topGood[0],
      confidence: topGood[1],
      breakdown,
    };
  }
  return { status: "none", confidence: harmless, breakdown };
}
