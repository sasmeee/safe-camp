import { HAZARDS, HARMLESS_PROMPTS } from "./hazards";

export const LABELS: { prompt: string; owner: string }[] = [
  ...HAZARDS.flatMap((h) =>
    h.prompts.map((prompt) => ({ prompt, owner: h.id })),
  ),
  ...HARMLESS_PROMPTS.map((prompt) => ({ prompt, owner: "harmless" })),
];

export type Verdict =
  | { status: "match" | "unsure"; hazardId: string; confidence: number }
  | { status: "none"; confidence: number };

export const MATCH_THRESHOLD = 0.5; // tune with your outdoor test photos

export function decide(scored: { label: string; score: number }[]): Verdict {
  const byOwner = new Map<string, number>();
  for (const { label, score } of scored) {
    const owner = LABELS.find((l) => l.prompt === label)?.owner;
    if (owner) byOwner.set(owner, (byOwner.get(owner) ?? 0) + score);
  }
  const top = [...byOwner.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top || top[0] === "harmless") {
    return { status: "none", confidence: top?.[1] ?? 0 };
  }
  return {
    status: top[1] >= MATCH_THRESHOLD ? "match" : "unsure",
    hazardId: top[0],
    confidence: top[1],
  };
}
