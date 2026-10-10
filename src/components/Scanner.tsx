"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useClassifier } from "@/hooks/useClassifier";
import { CaptureCard } from "./capture/CaptureCard";
import { DisclaimerBanner } from "./layout/DisclaimerBanner";
import { AnalyzingNote } from "./status/AnalyzingNote";
import { Button } from "./ui/Button";
import { Tips } from "./capture/Tips";
import { ScanAction } from "./capture/ScanAction";
import { ResultCard } from "./result/ResultCard";
import { Header } from "./layout/Header";
import { Hero } from "./layout/Hero";
import { ModelLoader } from "./status/ModelLoader";
import { QualityNotice } from "./result/QualityNotice";
import { ErrorNotice } from "./status/ErrorNotice";
import { PhotoPreview } from "./capture/PhotoPreview";

const Scanner = () => {
  const {
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
  } = useClassifier();

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // free the photo url when leaving the page
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  function clearPreview() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreview(null);
  }

  function pick(file: File) {
    if (status !== "ready" || workerFailed) return;
    clearPreview();
    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setPreview(url);
    classify(file);
  }

  function onInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) pick(file);
  }

  function handleRetry() {
    clearPreview();
    retry();
  }

  const openCamera = () => cameraRef.current?.click();
  const openGallery = () => galleryRef.current?.click();

  const busy = status === "busy";
  const loading = status === "loading";
  const hasPhoto = preview !== null;
  const inputsOff = status !== "ready" || workerFailed;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header status={status} hasPhoto={hasPhoto} />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-4 lg:gap-5 lg:px-6 lg:py-6">
        {!hasPhoto && !loading && <Hero />}
        <DisclaimerBanner />

        {loading ? (
          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4">
            <ModelLoader percent={percent} stuck={stuck} onReset={resetCache} />
            <div className="mt-auto">
              <Button icon="camera" disabled>
                Take photo
              </Button>
            </div>
          </div>
        ) : (
          <>
            <QualityNotice quality={quality} onRetake={openCamera} />
            {error && (
              <ErrorNotice
                message={error}
                canRetry={workerFailed}
                onRetry={handleRetry}
              />
            )}

            <div
              className={`flex flex-1 flex-col gap-4 lg:flex-none lg:grid lg:gap-5 ${
                hasPhoto
                  ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-start"
                  : "lg:grid-cols-2 lg:items-stretch"
              }`}
            >
              <div className="flex flex-col gap-4">
                {preview ? (
                  <>
                    <PhotoPreview src={preview} analyzing={busy} />
                    <ScanAction
                      busy={busy}
                      ms={ms}
                      onClick={openCamera}
                      className="hidden lg:flex"
                    />
                  </>
                ) : (
                  <CaptureCard
                    disabled={inputsOff}
                    onCamera={openCamera}
                    onGallery={openGallery}
                    onDropFile={pick}
                  />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-4">
                {busy && <AnalyzingNote />}
                {verdict && <ResultCard verdict={verdict} quality={quality} />}
                {preview ? (
                  <ScanAction
                    busy={busy}
                    ms={ms}
                    onClick={openCamera}
                    className="mt-auto flex lg:hidden"
                  />
                ) : (
                  <>
                    <Tips />
                    <p className="mt-auto text-center text-xs text-muted lg:hidden">
                      Runs on this device. Photos stay on your phone.
                    </p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        tabIndex={-1}
        disabled={inputsOff}
        onChange={onInput}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        disabled={inputsOff}
        onChange={onInput}
      />
    </div>
  );
};

export default Scanner;
