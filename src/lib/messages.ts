import type { Verdict } from "./aggregate";

export type ToWorker =
  | { type: "load" }
  | { type: "classify"; id: number; image: Blob };

export type FromWorker =
  | { type: "progress"; percent: number }
  | { type: "ready" }
  | { type: "result"; id: number; verdict: Verdict; ms: number }
  | { type: "error"; message: string };
