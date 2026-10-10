"use client";

import { useState } from "react";
import { LABELS } from "@/lib/aggregate";

const MODEL = "Xenova/clip-vit-base-patch32";

export default function EmbeddingsPage() {
  const [log, setLog] = useState("Ready.");
  const [json, setJson] = useState<string | null>(null);

  async function generate() {
    setJson(null);
    setLog("Loading text model (needs internet)…");
    // load on demand, skip server rendering
    const tjs = await import("@huggingface/transformers");
    tjs.env.allowLocalModels = false;
    tjs.env.backends.onnx.wasm!.wasmPaths = "/ort/";

    const tokenizer = await tjs.AutoTokenizer.from_pretrained(MODEL);
    const model = await tjs.CLIPTextModelWithProjection.from_pretrained(MODEL, {
      device: "wasm",
      dtype: "q8",
    });

    const prompts = LABELS.map((l) => l.prompt);
    const vectors: number[][] = [];
    for (let i = 0; i < prompts.length; i += 16) {
      setLog(`Encoding ${i}/${prompts.length}…`);
      const batch = prompts.slice(i, i + 16);
      const inputs = tokenizer(batch, { padding: true, truncation: true });
      const { text_embeds } = await model(inputs);
      const dim: number = text_embeds.dims[1];
      for (let b = 0; b < batch.length; b++) {
        const row = Array.from(
          (text_embeds.data as Float32Array).slice(b * dim, (b + 1) * dim),
        );
        const norm = Math.sqrt(row.reduce((s, x) => s + x * x, 0)) || 1;
        vectors.push(row.map((x) => Math.round((x / norm) * 1e5) / 1e5));
      }
    }
    setJson(JSON.stringify({ model: MODEL, prompts, vectors }));
    setLog(
      `Done: ${prompts.length} prompts. Download and save as src/data/text-embeddings.json`,
    );
  }

  function download() {
    if (!json) return;
    const url = URL.createObjectURL(
      new Blob([json], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "text-embeddings.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="text-xl font-bold">Generate text embeddings</h1>
      <p className="text-sm">
        Run after editing prompts in hazards.ts. Replace
        src/data/text-embeddings.json.
      </p>
      <button
        onClick={generate}
        className="rounded-xl bg-forest px-4 py-3 text-sand"
      >
        Generate
      </button>
      {json && (
        <button
          onClick={download}
          className="ml-2 rounded-xl border-2 border-forest px-4 py-3"
        >
          Download JSON
        </button>
      )}
      <p>{log}</p>
    </div>
  );
}
