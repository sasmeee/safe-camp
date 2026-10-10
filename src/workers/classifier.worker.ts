import {
  AutoProcessor,
  CLIPVisionModelWithProjection,
  env,
  load_image,
  type RawImage,
} from "@huggingface/transformers";
import { LABELS, decide } from "../lib/aggregate";
import type { FromWorker, ToWorker } from "../lib/messages";
import embeddings from "../data/text-embeddings.json";

env.allowLocalModels = false;
env.backends.onnx.wasm!.wasmPaths = "/ort/";

// low ram phones: one thread uses less memory
const { deviceMemory = 8 } = self.navigator as Navigator & {
  deviceMemory?: number;
};
if (deviceMemory <= 4) env.backends.onnx.wasm!.numThreads = 1;

const MODEL = "Xenova/clip-vit-base-patch32";
const DTYPES = ["q8", "q4"] as const; // q4 is smaller, used if q8 runs out of memory
const LOGIT_SCALE = 100; // clip temperature

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
  for (const dtype of DTYPES) {
    try {
      vision = (await CLIPVisionModelWithProjection.from_pretrained(MODEL, {
        device: "wasm",
        dtype,
        progress_callback: (p) => {
          if (p.status === "progress_total")
            post({ type: "progress", percent: p.progress });
        },
      })) as unknown as Vision;
      return;
    } catch (err) {
      const noMemory = /alloc|memory/i.test(String(err));
      if (!noMemory || dtype === DTYPES[DTYPES.length - 1]) throw err;
    }
  }
}

function normalize(v: Float32Array): number[] {
  let s = 0;
  for (const x of v) s += x * x;
  const n = Math.sqrt(s) || 1;
  return Array.from(v, (x) => x / n);
}

function imageQuality(image: RawImage) {
  const { data, width, height, channels } = image;
  const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 96));
  const luminance = (x: number, y: number) => {
    const offset = (y * width + x) * channels;
    const red = data[offset] ?? 0;
    const green = data[offset + 1] ?? red;
    const blue = data[offset + 2] ?? red;
    return 0.299 * red + 0.587 * green + 0.114 * blue;
  };

  let brightnessTotal = 0;
  let brightnessCount = 0;
  let laplacianTotal = 0;
  let laplacianSquaredTotal = 0;
  let laplacianCount = 0;

  for (let y = sampleStep; y < height - sampleStep; y += sampleStep) {
    for (let x = sampleStep; x < width - sampleStep; x += sampleStep) {
      const center = luminance(x, y);
      brightnessTotal += center;
      brightnessCount++;

      const laplacian =
        luminance(x - sampleStep, y) +
        luminance(x + sampleStep, y) +
        luminance(x, y - sampleStep) +
        luminance(x, y + sampleStep) -
        4 * center;
      laplacianTotal += laplacian;
      laplacianSquaredTotal += laplacian * laplacian;
      laplacianCount++;
    }
  }

  const brightness = brightnessTotal / Math.max(brightnessCount, 1);
  const laplacianMean = laplacianTotal / Math.max(laplacianCount, 1);
  const laplacianVariance =
    laplacianSquaredTotal / Math.max(laplacianCount, 1) -
    laplacianMean * laplacianMean;

  return {
    tooDark: brightness < 45,
    tooBlurry: brightness >= 45 && laplacianVariance < 25,
  };
}

// one logit per prompt, same order as LABELS
function logitsFor(imageEmbed: Float32Array): number[] {
  const img = normalize(imageEmbed);
  return (embeddings.vectors as number[][]).map(
    (t) => LOGIT_SCALE * t.reduce((s, x, i) => s + x * img[i], 0),
  );
}

// small subjects get lost at 224px, so also check a center crop
const CENTER_CROP = 0.6; // share of shorter side, 0 = off
const TILES = false; // true = 4 extra views, slower

async function viewsOf(image: RawImage): Promise<RawImage[]> {
  const views: RawImage[] = [image];
  const { width: w, height: h } = image;
  const crop = async (x0: number, y0: number, x1: number, y1: number) => {
    try {
      views.push(
        (await image.crop([
          Math.round(x0),
          Math.round(y0),
          Math.round(x1),
          Math.round(y1),
        ])) as RawImage,
      );
    } catch {
      // crop failed, use full image only
    }
  };
  if (CENTER_CROP > 0) {
    const s = Math.min(w, h) * CENTER_CROP;
    await crop((w - s) / 2, (h - s) / 2, (w + s) / 2 - 1, (h + s) / 2 - 1);
  }
  if (TILES) {
    const hw = w / 2;
    const hh = h / 2;
    await crop(0, 0, hw - 1, hh - 1);
    await crop(hw, 0, w - 1, hh - 1);
    await crop(0, hh, hw - 1, h - 1);
    await crop(hw, hh, w - 1, h - 1);
  }
  return views;
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
        const quality = imageQuality(image as RawImage);
        const logits: number[][] = [];
        for (const view of await viewsOf(image as RawImage)) {
          const inputs = await processor!(view);
          const { image_embeds } = await vision!(inputs);
          logits.push(logitsFor(image_embeds.data));
        }
        post({
          type: "result",
          id: msg.id,
          verdict: decide(logits),
          ms: Math.round(performance.now() - t0),
          quality,
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
