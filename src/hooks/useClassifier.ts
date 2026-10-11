"use client";

import { useEffect, useRef, useState } from "react";
import type { Verdict } from "@/lib/aggregate";
import type { FromWorker, ImageQuality, ToWorker } from "@/lib/messages";

export type ClassifierStatus = "loading" | "ready" | "busy";

export function useClassifier() {
  const worker = useRef<Worker | null>(null);
  const startWorker = useRef<(() => void) | null>(null);
  const asleep = useRef(false);
  const statusRef = useRef<ClassifierStatus>("loading");
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
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    function start() {
      const w = new Worker(
        new URL("../workers/classifier.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.current = w;
      asleep.current = false;

      w.onmessage = (e: MessageEvent<FromWorker>) => {
        if (worker.current !== w) return;
        const m = e.data;
        if (m.type === "progress") setPercent(Math.round(m.percent));
        else if (m.type === "ready")
          setStatus((s) => (s === "busy" ? s : "ready"));
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

      w.onerror = (ev) =>
        handleWorkerFailure(
          `Worker crashed: ${ev.message} at ${ev.filename}:${ev.lineno}`,
        );
      w.onmessageerror = () => handleWorkerFailure("Worker message error");
      w.postMessage({ type: "load" } satisfies ToWorker);
    }

    startWorker.current = start;
    start();
    navigator.storage?.persist?.();

    // phones kill the page when the camera opens, so free memory while hidden
    function onVisibility() {
      if (document.hidden) {
        if (statusRef.current === "ready" && worker.current) {
          worker.current.terminate();
          worker.current = null;
          asleep.current = true;
        }
      } else if (asleep.current) {
        start();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      const w = worker.current;
      worker.current = null;
      w?.terminate();
    };
  }, [workerAttempt]);

  // show help if loading takes too long
  useEffect(() => {
    if (status !== "loading") return;
    const t = setTimeout(() => setStuck(true), 25000);
    return () => clearTimeout(t);
  }, [status]);

  // progress frozen for 20s, clear caches once and reload
  useEffect(() => {
    if (status !== "loading") return;
    const t = setTimeout(() => {
      if (!navigator.onLine) return; // reset offline would remove the app
      try {
        if (sessionStorage.getItem("auto-reset")) return;
        sessionStorage.setItem("auto-reset", "1");
      } catch {
        return;
      }
      void resetCache();
    }, 20000);
    return () => clearTimeout(t);
  }, [status, percent]);

  function classify(file: File) {
    setStatus("busy");
    setVerdict(null);
    setQuality(null);
    setError(null);
    setWorkerFailed(false);
    if (!worker.current) startWorker.current?.();
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
