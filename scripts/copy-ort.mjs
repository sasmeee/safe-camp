import { createRequire } from "node:module";
import { cpSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

const req = createRequire(import.meta.url);
const tjs = createRequire(req.resolve("@huggingface/transformers"));
const dist = dirname(tjs.resolve("onnxruntime-web"));
const files = readdirSync(dist).filter(
  (f) => f.startsWith("ort-wasm-simd-threaded") && /\.(mjs|wasm)$/.test(f),
);
if (files.length === 0) throw new Error(`no ort wasm files in ${dist}`);
mkdirSync("public/ort", { recursive: true });
for (const f of files) cpSync(join(dist, f), join("public/ort", f));
console.log("copied", files.length, "ort files from", dist);
