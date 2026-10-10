<p align="center">
  <img src="public/safecamp-logo-light.svg" alt="SafeCamp logo" width="120" />
</p>

<h1 align="center">SafeCamp</h1>

<p align="center">
  An offline campsite safety inspector. Take a photo of a plant, insect or piece of ground,
  and get a color-coded risk level and what to do about it, with no signal and no upload.
</p>

> Built for the [Hacktoberfest Open-Source AI Challenge, Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05).
> The repository was started on October 8, 2026, inside the challenge window.

- **Live demo:** `TODO: add deployed URL`
- **Demo video:** `TODO: add link`
- **DEV post:** `TODO: add link`

## Why this exists

Good camping spots tend to have bad phone signal. That is exactly where you meet an unfamiliar insect,
a plant you do not want to touch, or a dry gully you should not sleep in. Searching the web is not an option there,
and a photo of your campsite is not something everyone wants to upload anyway.

SafeCamp runs the whole check on the phone. The photo never leaves the device.

## What it does

1. Open the app once on Wi-Fi. It downloads a small vision model and caches it.
2. After that it works with zero signal, including in airplane mode.
3. Tap once to take a photo or pick one from the gallery.
4. Get a result card with a risk level, a short explanation, and concrete steps (for example
   "Move your tent pitch at least 30 m away").

The card has four levels: **Favorable**, **Caution**, **Danger**, **Critical**. Every result also has a
**Why?** panel that shows the top scores, so you can see how the app got there.

### Hazard database

41 entries in a local TypeScript file (`src/lib/hazards.ts`): 37 hazards and 4 favorable signs.

| Group | Examples |
| --- | --- |
| Plants and fungi | Poison ivy, stinging nettle, giant hogweed, wild berries, wild mushrooms |
| Insects and small creatures | Wasp and hornet nests, bee swarms, fire ants, ticks, leeches, scorpions |
| Animals | Snakes, bears, elephants and buffalo, monkeys, crocodiles |
| Terrain and water | Dead trees overhead, dry creek beds, rockfall, cliff edges, floodplains, fast water, thin ice |
| Weather and fire | Lightning exposure, wildfire smoke, unsafe campfires |
| Camp habits | Food and trash left out |
| Favorable signs | Flat dry tent site, clear flowing water, established fire ring, marked trail |

Each entry has image prompts, a one-line summary and action steps. There are also 25 everyday-scene
labels (grass, bark, bird nests, rocks and so on) so that ordinary things are not forced into a hazard.

## How it works

```
                  (once, at dev time)
 hazards.ts  ──►  text encoder  ──►  text-embeddings.json   (127 prompt vectors)

                  (on the phone, every scan)
 photo  ──►  image encoder (CLIP, quantized)  ──►  image vector
        └─ also a center crop of the same photo (small subjects get lost at 224 px)
                                   │
              compare to saved prompt vectors (cosine similarity)
                                   │
                         softmax over all classes
                                   │
        decide(): hazards beat favorable signs, uncertain results warn instead of reassure
                                   │
                              result card
```

- **Model:** [`Xenova/clip-vit-base-patch32`](https://huggingface.co/Xenova/clip-vit-base-patch32) (CLIP, ONNX, int8 quantized),
  run in the browser with [Transformers.js](https://huggingface.co/docs/transformers.js) on WebAssembly,
  inside a Web Worker so the UI stays responsive.
- **Zero-shot:** there is no training. CLIP compares the photo to text prompts such as
  "a photo of a paper wasp nest with hexagonal honeycomb cells". Adding a hazard means adding prompts.
- **Precomputed text vectors:** the text side never changes, so it is encoded once and saved to
  `src/data/text-embeddings.json`. Phones only run the image encoder. `scripts/gen-embeddings.ts`
  regenerates the file automatically when prompts change.
- **Decision rules** (`src/lib/aggregate.ts`):
  - A real hazard always outranks a favorable sign.
  - Related hazards pool their scores (a wasp-versus-bee split still counts as "stinging insects").
  - Below the match threshold the app says "possible, be careful" and names the runner-up.
  - Critical hazards (such as large predators) warn at a lower score than other hazards.
  - "No known hazard matched" is never shown as "safe".
- **Image quality check:** very dark or blurry photos are flagged instead of judged.
- **Offline PWA:** [Serwist](https://serwist.pages.dev) caches the app shell, and the ONNX runtime files are self-hosted
  under `/ort/` (they would otherwise load from a CDN and fail offline). Model files are cached by Transformers.js.

## Why open models

- **Privacy:** photos of someone's campsite, kids or tent are never uploaded.
- **Works with no signal:** the model is a file on the phone. A hosted vision API cannot do that.
- **Zero cost per scan:** no API key, no usage bill, nothing to rate-limit.
- **Changeable:** the hazard list is plain prompts and text. You can add a region, swap the model name,
  or tune thresholds without asking anyone for permission.
- **Inspectable:** the Why? panel exists because the scoring is ours. We can show exactly why a result came out as it did.

## Safety and limits

SafeCamp is a first-pass aid, not an authority.

- It cannot tell a harmless mushroom, snake or berry from a deadly one, so those entries always
  say "treat as dangerous". Never eat anything because of this app.
- CLIP is a general-purpose model. It can be wrong, especially with blurry, dark, far-away or unusual photos.
- The score is a relative share between the app's own labels, not a probability.
- "No known hazard matched" means only that nothing from the short list matched. It does not mean the site is safe.
- The advice is general. Follow local rangers, signs and emergency services.
- Hazards differ by region. A bear result in a region with no bears is a model error, not a warning.

<!--
## Test results

Screenshots of real scans.

| Scenario | Screenshot |
| --- | --- |
| Hornet nest, Critical or Danger result | `TODO: add screenshot` |
| Empty bird nest, harmless result | `TODO: add screenshot` |
| Favorable campsite | `TODO: add screenshot` |
| Why? panel | `TODO: add screenshot` |
| Dark or blurry photo warning | `TODO: add screenshot` |
| Offline, airplane mode | `TODO: add screenshot` |
-->

## Development notes

Found during development, and what changed:

- An early version matched a photo of an empty bird nest to "wasp nest" with a 97% score. The app had no
  "bird nest" class, so the closest hazard won. Adding everyday look-alike classes, including bird nests, fixed it.
- Growing the database from 5 to 41 entries pushed a scan from about 1.4 s to 3.6-5 s on a laptop,
  because every scan re-encoded every prompt. Precomputing the text vectors brought it to under 1.5 s.

## Run it locally

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev        # http://localhost:3000
```

The first load downloads the vision model (about 90 MB), so use Wi-Fi.

Production build, which is what you need to test the service worker and offline mode:

```bash
bun run build
bun run start
```

Offline test: open the app, wait for "Offline ready", turn on airplane mode, reload, take a photo.

### Changing hazards

1. Edit `src/lib/hazards.ts` (prompts, summaries, actions, risk).
2. Run `bun run dev`. The text vectors regenerate automatically when the prompts change.
   Run `bun run embeddings` to do it by hand.
3. If that fails, open `/dev/embeddings`, generate the vectors in the browser and replace
   `src/data/text-embeddings.json` with the download.

## Project structure

```
src/
  app/                  Next.js App Router: page, layout, manifest, service worker, /dev/embeddings tool
  components/           capture, result, status, layout and ui components
  hooks/useClassifier.ts   worker lifecycle, progress, results
  workers/classifier.worker.ts   model loading, image views, scoring
  lib/hazards.ts        hazard database
  lib/aggregate.ts      decision rules
  lib/risk.ts           risk levels and styling
  data/text-embeddings.json   precomputed prompt vectors
scripts/
  copy-ort.mjs          copies ONNX runtime files into public/ort for offline use
  gen-embeddings.ts     regenerates text vectors when prompts change
```

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · Bun · Tailwind CSS 4 · Serwist ·
Transformers.js (`@huggingface/transformers`) · ONNX Runtime Web · TypeScript

No cloud APIs (hosted LLMs, databases or text-to-speech) are used, so the offline and privacy promises stay true.

## Partner technology

- **Render:** hosts the PWA. `TODO: add detail (free web service, build and start commands)`
- **GitHub Actions:** CI runs lint and build on every push and pull request. `TODO: add detail or workflow link`

## Credits and licenses

SafeCamp is original work started during the challenge. It builds on these open projects:

- [CLIP](https://github.com/openai/CLIP) by OpenAI (MIT) and the ONNX conversion
  [`Xenova/clip-vit-base-patch32`](https://huggingface.co/Xenova/clip-vit-base-patch32)
- [Transformers.js](https://github.com/huggingface/transformers.js) (Apache-2.0)
- [ONNX Runtime](https://github.com/microsoft/onnxruntime) (MIT)
- [Serwist](https://github.com/serwist/serwist) (MIT)
- [Next.js](https://github.com/vercel/next.js), [React](https://github.com/facebook/react),
  [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) (MIT)

Built with AI assistance (Claude). The author reviewed, ran and tested the code.
Safety advice is written in general terms from public guidance of health and park agencies. Confirm it for your region.

## Contact

Sasmitha Ashinsana, [dev.sasmitha@gmail.com](mailto:dev.sasmitha@gmail.com)

## License

[MIT](LICENSE)