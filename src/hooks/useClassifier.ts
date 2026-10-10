"use client";

import { useEffect, useRef, useState } from "react";
import type { Verdict } from "@/lib/aggregate";
import type { FromWorker, ImageQuality, ToWorker } from "@/lib/messages";

export type ClassifierStatus = "loading" | "ready" | "busy";

export function useClassifier() {
  const worker = useRef<Worker | null>(null);
  const [status, setStatus] = useState<ClassifierStatus>("loading");
  const [percent, setPercent] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stuck, setStuck] = useState(false);
  const [quality, setQuality] = useState<ImageQuality | null>(null);
  const [workerAttempt, setWorkerAttempt] = useState(0);
  const [workerFailed, setWorkerFailed] = useState(false);

  useEffect(() => {
    const w = new Worker(
      new URL("../workers/classifier.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.current = w;

    w.onmessage = (e: MessageEvent<FromWorker>) => {
      if (worker.current !== w) return;
      const m = e.data;
      if (m.type === "progress") setPercent(Math.round(m.percent));
      else if (m.type === "ready") setStatus("ready");
      else if (m.type === "result") {
        setVerdict(m.verdict);
        setMs(m.ms);
        setQuality(m.quality);
        setStatus("ready");
      } else if (m.type === "error") {
        setError(m.message);
        setStatus("ready");
      }
    };

    const handleWorkerFailure = (message: string) => {
      console.error(message);
      if (worker.current !== w) return;
      worker.current = null;
      w.terminate();
      setWorkerFailed(true);
      setStatus("ready");
      setError("The offline model stopped unexpectedly.");
    };

    w.onerror = () => handleWorkerFailure("Worker crashed");
    w.onmessageerror = () => handleWorkerFailure("Worker message error");
    w.postMessage({ type: "load" } satisfies ToWorker);
    navigator.storage?.persist?.();
    return () => {
      if (worker.current === w) worker.current = null;
      w.terminate();
    };
  }, [workerAttempt]);

  // show help if loading takes too long
  useEffect(() => {
    if (status !== "loading") return;
    const t = setTimeout(() => setStuck(true), 25000);
    return () => clearTimeout(t);
  }, [status]);

  function classify(file: File) {
    setStatus("busy");
    setVerdict(null);
    setQuality(null);
    setError(null);
    setWorkerFailed(false);
    worker.current?.postMessage({
      type: "classify",
      id: Date.now(),
      image: file,
    } satisfies ToWorker);
  }

  function retry() {
    setVerdict(null);
    setStatus("loading");
    setPercent(0);
    setStuck(false);
    setError(null);
    setWorkerFailed(false);
    setWorkerAttempt((attempt) => attempt + 1);
  }

  // clear app caches, keep the model
  async function resetCache() {
    const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
    await Promise.all(regs.map((r) => r.unregister()));
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => !k.includes("transformers"))
        .map((k) => caches.delete(k)),
    );
    location.reload();
  }

  return {
    status,
    percent,
    verdict,
    ms,
    error,
    stuck,
    quality,
    workerFailed,
    classify,
    retry,
    resetCache,
  };
}
