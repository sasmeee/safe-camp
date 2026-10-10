"use client";

import { useEffect, useRef, useState } from "react";
import { HAZARDS } from "@/lib/hazards";
import type { Verdict } from "@/lib/aggregate";
import type { FromWorker, ToWorker } from "@/lib/messages";

export default function Scanner() {
  const worker = useRef<Worker | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "busy">("loading");
  const [percent, setPercent] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
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
      : null;

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

      {error && <p className="text-risk-critical">{error}</p>}

      {verdict && (
        <div className="rounded-xl border border-forest/30 p-4">
          <p className="font-semibold">
            {verdict.status === "none"
              ? "No known hazard matched"
              : verdict.status === "unsure"
                ? `Unsure: could be ${hazard?.name}`
                : hazard?.name}
          </p>
          <p>Confidence {Math.round(verdict.confidence * 100)}%</p>
          {hazard && (
            <>
              <p>{hazard.summary}</p>
              <ul className="list-disc pl-5">
                {hazard.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-2 text-sm opacity-70">
            {ms} ms. Not a substitute for expert advice.
          </p>
        </div>
      )}
    </div>
  );
}
