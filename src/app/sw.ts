/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith("/ort/"),
      handler: new CacheFirst({ cacheName: "ort-wasm" }),
    },
    ...defaultCache,
  ],
});

// cached response loses the worker #hash, so rebuild it
self.addEventListener("fetch", (event) => {
  const { destination, url } = event.request;
  if (destination !== "worker" || !url.includes("turbopack-worker")) return;
  event.respondWith(
    (async () => {
      const res =
        (await serwist.matchPrecache(event.request)) ??
        (await fetch(event.request));
      // clean headers, old ones can break the body
      return new Response(await res.blob(), {
        headers: {
          "Content-Type": res.headers.get("Content-Type") ?? "text/javascript",
          "Cross-Origin-Embedder-Policy": "require-corp",
          "Cross-Origin-Opener-Policy": "same-origin",
        },
      });
    })(),
  );
});

serwist.addEventListeners();