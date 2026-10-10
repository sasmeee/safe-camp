import { env, pipeline } from "@huggingface/transformers";
import { LABELS, decide } from "../lib/aggregate";
import type { FromWorker, ToWorker } from "../lib/messages";

env.allowLocalModels = false;
env.backends.onnx.wasm!.wasmPaths = "/ort/";

type Classifier = (
  image: string,
  labels: string[],
  opts?: { hypothesis_template?: string },
) => Promise<{ label: string; score: number }[]>;

const MODEL = "Xenova/clip-vit-base-patch32";
let classifier: Classifier | null = null;

const post = (m: FromWorker) =>
  (self as unknown as { postMessage: (m: FromWorker) => void }).postMessage(m);

async function load() {
  if (classifier) return;
  classifier = (await pipeline("zero-shot-image-classification", MODEL, {
    device: "wasm",
    dtype: "q8",
    progress_callback: (p) => {
      if (p.status === "progress_total")
        post({ type: "progress", percent: p.progress });
    },
  })) as unknown as Classifier;
}

self.onmessage = async (e: MessageEvent<ToWorker>) => {
  const msg = e.data;
  try {
    if (msg.type === "load") {
      await load();
      post({ type: "ready" });
    } else if (msg.type === "classify") {
      await load();
      const url = URL.createObjectURL(msg.image);
      const t0 = performance.now();
      try {
        const scored = await classifier!(
          url,
          LABELS.map((l) => l.prompt),
          { hypothesis_template: "{}" },
        );
        post({
          type: "result",
          id: msg.id,
          verdict: decide(scored),
          ms: Math.round(performance.now() - t0),
        });
      } finally {
        URL.revokeObjectURL(url);
      }
    }
  } catch (err) {
    post({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
