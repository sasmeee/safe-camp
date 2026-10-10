import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { LABELS } from "../src/lib/aggregate";

const MODEL = "Xenova/clip-vit-base-patch32";
const OUT = "src/data/text-embeddings.json";
const prompts = LABELS.map((l) => l.prompt);

// up to date? skip, no model load
if (existsSync(OUT)) {
  try {
    const cur = JSON.parse(readFileSync(OUT, "utf8"));
    if (
      cur.model === MODEL &&
      JSON.stringify(cur.prompts) === JSON.stringify(prompts)
    ) {
      console.log("embeddings up to date");
      process.exit(0);
    }
  } catch {
    // unreadable file: regenerate
  }
}

try {
  console.log(`generating embeddings for ${prompts.length} prompts…`);
  const { AutoTokenizer, CLIPTextModelWithProjection } =
    await import("@huggingface/transformers");
  const tokenizer = await AutoTokenizer.from_pretrained(MODEL);
  const model = await CLIPTextModelWithProjection.from_pretrained(MODEL, {
    dtype: "q8",
  });

  const vectors: number[][] = [];
  for (let i = 0; i < prompts.length; i += 16) {
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

  mkdirSync("src/data", { recursive: true });
  writeFileSync(OUT, JSON.stringify({ model: MODEL, prompts, vectors }));
  console.log(`wrote ${OUT}`);
} catch (err) {
  console.error("Embedding generation failed:", err);
  console.error(
    "Fallback: run dev, open /dev/embeddings, generate and download the JSON by hand.",
  );
  process.exit(1);
}
