import {
  AutoProcessor,
  CLIPVisionModelWithProjection,
  env,
  load_image,
} from "@huggingface/transformers";
import { LABELS, decide } from "../lib/aggregate";
import type { FromWorker, ToWorker } from "../lib/messages";
import embeddings from "../data/text-embeddings.json";

env.allowLocalModels = false;
env.backends.onnx.wasm!.wasmPaths = "/ort/";

const MODEL = "Xenova/clip-vit-base-patch32";
const LOGIT_SCALE = 100; // CLIP's learned temperature

type Processor = (image: unknown) => Promise<Record<string, unknown>>;
type Vision = (
  inputs: Record<string, unknown>,
) => Promise<{ image_embeds: { data: Float32Array } }>;

let processor: Processor | null = null;
let vision: Vision | null = null;

const post = (m: FromWorker) =>
  (self as unknown as { postMessage: (m: FromWorker) => void }).postMessage(m);

function embeddingsFresh() {
  const prompts = LABELS.map((l) => l.prompt);
  return JSON.stringify(prompts) === JSON.stringify(embeddings.prompts);
}

async function load() {
  if (vision) return;
  if (!embeddingsFresh()) {
    throw new Error(
      "Text embeddings out of date. Open /dev/embeddings, generate, and replace src/data/text-embeddings.json",
    );
  }
  processor = (await AutoProcessor.from_pretrained(
    MODEL,
  )) as unknown as Processor;
  vision = (await CLIPVisionModelWithProjection.from_pretrained(MODEL, {
    device: "wasm",
    dtype: "q8",
    progress_callback: (p) => {
      if (p.status === "progress_total")
        post({ type: "progress", percent: p.progress });
    },
  })) as unknown as Vision;
}

function normalize(v: Float32Array): number[] {
  let s = 0;
  for (const x of v) s += x * x;
  const n = Math.sqrt(s) || 1;
  return Array.from(v, (x) => x / n);
}

function scoreImage(imageEmbed: Float32Array) {
  const img = normalize(imageEmbed);
  const logits = (embeddings.vectors as number[][]).map(
    (t) => LOGIT_SCALE * t.reduce((s, x, i) => s + x * img[i], 0),
  );
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return embeddings.prompts.map((label, i) => ({
    label,
    score: exps[i] / sum,
  }));
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
        const image = await load_image(url);
        const inputs = await processor!(image);
        const { image_embeds } = await vision!(inputs);
        post({
          type: "result",
          id: msg.id,
          verdict: decide(scoreImage(image_embeds.data)),
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
