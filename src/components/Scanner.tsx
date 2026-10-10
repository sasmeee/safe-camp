"use client";

import { useEffect, useRef, useState } from "react";
import { HAZARDS, type Risk } from "@/lib/hazards";
import type { Verdict } from "@/lib/aggregate";
import type { FromWorker, ImageQuality, ToWorker } from "@/lib/messages";

const RISK_STYLE: Record<Risk, string> = {
  good: "border-risk-safe bg-risk-safe/10",
  caution: "border-risk-caution bg-risk-caution/10",
  danger: "border-risk-danger bg-risk-danger/10",
  critical: "border-risk-critical bg-risk-critical/10",
};

export default function Scanner() {
  const worker = useRef<Worker | null>(null);
  const previewRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "busy">("loading");
  const [percent, setPercent] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || status !== "ready") return;
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setPreview(url);
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
    e.target.value = "";
  }

  const hazard =
    verdict && verdict.status !== "none"
      ? HAZARDS.find((h) => h.id === verdict.hazardId)
      : undefined;

  const also =
    verdict && verdict.status !== "none" && verdict.alsoId
      ? HAZARDS.find((h) => h.id === verdict.alsoId)
      : undefined;

  const cardStyle =
    !verdict || verdict.status === "none"
      ? "border-forest/30 bg-white/50"
      : verdict.status === "unsure"
        ? RISK_STYLE.caution
        : RISK_STYLE[hazard?.risk ?? "caution"];

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="text-2xl font-bold">SafeCamp</h1>
      <p className="rounded-lg border border-risk-caution bg-risk-caution/10 p-3 text-sm">
        Visual guidance only. Check the whole site and follow local guidance.
      </p>

      {status === "loading" && (
        <p>Preparing offline model… {percent}% (first time needs internet)</p>
      )}

      {status === "loading" && stuck && (
        <div className="space-y-2 rounded-xl border-2 border-risk-caution p-3 text-sm">
          <p>
            Taking too long. Open the browser console (F12) for errors, or reset
            the app cache (keeps the downloaded model).
          </p>
          <button
            type="button"
            onClick={resetCache}
            className="rounded-lg bg-forest px-3 py-2 font-semibold text-sand"
          >
            Reset app cache
          </button>
        </div>
      )}

      <label className="block rounded-xl bg-forest p-4 text-center font-semibold text-sand">
        {status === "busy" ? "Analyzing…" : "Take or choose photo"}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={status !== "ready"}
          onChange={onFile}
        />
      </label>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Your photo"
          className="max-h-64 w-full rounded-xl object-cover"
        />
      )}

      {quality?.tooDark && (
        <p role="alert" className="text-risk-caution">
          Retake this photo in brighter light.
        </p>
      )}
      {quality?.tooBlurry && (
        <p role="alert" className="text-risk-caution">
          Retake this photo with steadier focus.
        </p>
      )}

      {error && (
        <div className="space-y-2" role="alert">
          <p className="text-risk-critical">{error}</p>
          {workerFailed && (
            <button
              type="button"
              onClick={() => {
                setVerdict(null);
                setStatus("loading");
                setPercent(0);
                setStuck(false);
                setError(null);
                setWorkerFailed(false);
                setWorkerAttempt((attempt) => attempt + 1);
              }}
              className="rounded-lg bg-forest px-3 py-2 font-semibold text-sand"
            >
              Retry model
            </button>
          )}
        </div>
      )}

      {verdict && (
        <div className={`space-y-2 rounded-xl border-2 p-4 ${cardStyle}`}>
          {verdict.status === "none" ? (
            <>
              <p className="text-lg font-bold">
                {quality?.tooDark
                  ? "Too dark to judge"
                  : quality?.tooBlurry
                    ? "Too blurry to judge"
                    : verdict.seen
                      ? `Looks like: ${verdict.seen}`
                      : "No known hazard matched"}
              </p>
              <p className="text-sm">
                {quality?.tooDark || quality?.tooBlurry
                  ? "Retake the photo before relying on this result."
                  : "No hazard spotted in this photo. Still check the whole site."}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold">
                {verdict.status === "match" && hazard?.risk === "good"
                  ? "No hazard spotted in this photo. Still check the whole site."
                  : verdict.status === "unsure"
                    ? `Possible: ${hazard?.name}. Treat with caution.`
                    : hazard?.name}
              </p>
              {verdict.status === "match" && hazard && (
                <p className="text-xs font-semibold uppercase">
                  {hazard.risk === "good"
                    ? "Looks favorable"
                    : `Risk: ${hazard.risk}`}
                </p>
              )}
              {also && (
                <p className="text-sm">
                  Could also be: {also.name}. Treat both with the same care.
                </p>
              )}
              <p>{hazard?.summary}</p>
              <ul className="list-disc pl-5">
                {hazard?.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </>
          )}
          <p className="text-sm">
            {verdict.status === "none" ? "Everyday-scene score" : "Match score"}{" "}
            {Math.round(verdict.confidence * 100)}% (relative, not a
            probability)
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer">Why?</summary>
            <ul className="pl-5">
              {verdict.breakdown.map((b) => (
                <li key={b.id}>
                  {b.id}: {Math.round(b.score * 100)}%
                </li>
              ))}
            </ul>
          </details>
          <p className="text-xs opacity-70">
            {ms} ms, on this device. Not a substitute for expert advice.
          </p>
        </div>
      )}
    </div>
  );
}
