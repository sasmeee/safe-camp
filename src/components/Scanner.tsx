"use client";

import { useEffect, useRef, useState } from "react";
import { HAZARDS, type Risk } from "@/lib/hazards";
import type { Verdict } from "@/lib/aggregate";
import type { FromWorker, ToWorker } from "@/lib/messages";

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

  useEffect(() => {
    const w = new Worker(
      new URL("../workers/classifier.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.current = w;
    w.onmessage = (e: MessageEvent<FromWorker>) => {
      const m = e.data;
      if (m.type === "progress") setPercent(Math.round(m.percent));
      else if (m.type === "ready") setStatus("ready");
      else if (m.type === "result") {
        setVerdict(m.verdict);
        setMs(m.ms);
        setStatus("ready");
      } else if (m.type === "error") {
        setError(m.message);
        setStatus("ready");
      }
    };
    w.postMessage({ type: "load" } satisfies ToWorker);
    navigator.storage?.persist?.();
    return () => w.terminate();
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || status !== "ready") return;
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setPreview(url);
    setStatus("busy");
    setVerdict(null);
    setError(null);
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

  const cardStyle =
    !verdict || verdict.status === "none"
      ? "border-forest/30 bg-white/50"
      : verdict.status === "unsure"
        ? RISK_STYLE.caution
        : RISK_STYLE[hazard?.risk ?? "caution"];

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="text-2xl font-bold">SafeCamp</h1>

      {status === "loading" && (
        <p>Preparing offline model… {percent}% (first time needs internet)</p>
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

      {error && <p className="text-risk-critical">{error}</p>}

      {verdict && (
        <div className={`space-y-2 rounded-xl border-2 p-4 ${cardStyle}`}>
          {verdict.status === "none" ? (
            <>
              <p className="text-lg font-bold">No known hazard matched</p>
              <p className="text-sm">
                This does not mean it is safe. SafeCamp only knows a short list
                of hazards.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold">
                {verdict.status === "unsure"
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
