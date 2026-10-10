import { HAZARDS, HARMLESS } from "./hazards";

export const LABELS: { prompt: string; owner: string; name?: string }[] = [
  ...HAZARDS.flatMap((h) =>
    h.prompts.map((prompt) => ({ prompt, owner: h.id })),
  ),
  ...HARMLESS.map(({ prompt, name }) => ({
    prompt,
    owner: "harmless",
    name,
  })),
];

const RISK_OF = new Map(HAZARDS.map((h) => [h.id, h.risk]));
const FAMILY_OF = new Map(HAZARDS.map((h) => [h.id, h.family]));

export type Verdict = (
  | {
      status: "match" | "unsure";
      hazardId: string;
      // look-alike from the same family (e.g. bee vs wasp)
      alsoId?: string;
    }
  | { status: "none"; seen?: string }
) & {
  confidence: number;
  breakdown: { id: string; score: number }[];
};

export const MATCH_THRESHOLD = 0.6;
export const UNSURE_THRESHOLD = 0.3;
export const CRITICAL_UNSURE_THRESHOLD = 0.2;
const ALSO_THRESHOLD = 0.1;

function softmax(xs: number[]): number[] {
  const max = Math.max(...xs);
  const exps = xs.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

// score each class by its best prompt across all views, then softmax
export function decide(views: number[][]): Verdict {
  const best = new Map<string, number>();
  let seen: string | undefined; // best harmless match, for display
  let seenLogit = -Infinity;
  for (const logits of views) {
    logits.forEach((l, i) => {
      const owner = LABELS[i].owner;
      if (l > (best.get(owner) ?? -Infinity)) best.set(owner, l);
      if (owner === "harmless" && l > seenLogit) {
        seenLogit = l;
        seen = LABELS[i].name;
      }
    });
  }

  const owners = [...best.keys()];
  const probs = softmax(owners.map((o) => best.get(o)!));
  const ranked = owners
    .map((id, i) => [id, probs[i]] as const)
    .sort((a, b) => b[1] - a[1]);

  const breakdown = ranked.slice(0, 4).map(([id, score]) => ({ id, score }));
  const harmless = ranked.find(([id]) => id === "harmless")?.[1] ?? 0;

  const isRisk = (id: string) =>
    id !== "harmless" && RISK_OF.get(id) !== "good";
  const topRisk = ranked.find(([id]) => isRisk(id));
  const topGood = ranked.find(([id]) => RISK_OF.get(id) === "good");

  // hazards beat good signs
  if (topRisk) {
    const [id, p] = topRisk;
    let score = p;
    let alsoId: string | undefined;

    // pool family scores so split votes still count
    const family = FAMILY_OF.get(id);
    if (family) {
      for (const [other, op] of ranked) {
        if (other !== id && isRisk(other) && FAMILY_OF.get(other) === family) {
          score += op;
          if (!alsoId && op >= ALSO_THRESHOLD) alsoId = other;
        }
      }
    }

    const unsureThreshold =
      RISK_OF.get(id) === "critical"
        ? CRITICAL_UNSURE_THRESHOLD
        : UNSURE_THRESHOLD;

    if (score >= unsureThreshold) {
      const status = score >= MATCH_THRESHOLD ? "match" : "unsure";
      // unsure: show runner-up too
      if (status === "unsure" && !alsoId) {
        alsoId = ranked.find(
          ([other, op]) =>
            other !== id && isRisk(other) && op >= ALSO_THRESHOLD,
        )?.[0];
      }
      return {
        status,
        hazardId: id,
        alsoId,
        confidence: Math.min(score, 1),
        breakdown,
      };
    }
  }
  if (topGood && topGood[1] >= MATCH_THRESHOLD) {
    return {
      status: "match",
      hazardId: topGood[0],
      confidence: topGood[1],
      breakdown,
    };
  }
  return {
    status: "none",
    seen: harmless >= 0.5 ? seen : undefined,
    confidence: harmless,
    breakdown,
  };
}
