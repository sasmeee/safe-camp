import type { Verdict } from "./aggregate";

export type ImageQuality = {
  tooDark: boolean;
  tooBlurry: boolean;
};

export type ToWorker =
  | { type: "load" }
  | { type: "classify"; id: number; image: Blob };

export type FromWorker =
  | { type: "progress"; percent: number }
  | { type: "ready" }
  | {
      type: "result";
      id: number;
      verdict: Verdict;
      ms: number;
      quality: ImageQuality;
    }
  | { type: "error"; message: string };
