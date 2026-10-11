"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onCapture: (file: File) => void;
  onClose: () => void;
  onUseCameraApp: () => void;
};

const MAX_SIDE = 1280;

export function CameraView({ onCapture, onClose, onUseCameraApp }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      })
      .then((s) => {
        if (stopped) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        if (video.current) video.current.srcObject = s;
      })
      .catch(() => setFailed(true));

    return () => {
      stopped = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function snap() {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const scale = Math.min(1, MAX_SIDE / Math.max(v.videoWidth, v.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(v.videoWidth * scale);
    canvas.height = Math.round(v.videoHeight * scale);
    canvas.getContext("2d")!.drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob)
          onCapture(new File([blob], "photo.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="fixed inset-0 z-1000 flex flex-col bg-black text-white">
      {failed ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-lg font-semibold">Camera is not available</p>
          <p className="text-sm text-white/70">
            Allow camera access in your browser, or use the camera app instead.
          </p>
          <button
            type="button"
            onClick={onUseCameraApp}
            className="h-12 rounded-2xl bg-white px-6 font-semibold text-black"
          >
            Use camera app
          </button>
        </div>
      ) : (
        <video
          ref={video}
          autoPlay
          playsInline
          muted
          onPlaying={() => setReady(true)}
          className="min-h-0 flex-1 object-cover"
        />
      )}

      <div className="flex items-center justify-between px-6 py-6">
        <button
          type="button"
          onClick={onClose}
          className="h-11 min-w-20 text-base font-medium"
        >
          Cancel
        </button>
        {!failed && (
          <button
            type="button"
            onClick={snap}
            disabled={!ready}
            aria-label="Take photo"
            className="size-18 rounded-full border-4 border-white bg-white/20 p-1 disabled:opacity-40"
          >
            <span className="block size-full rounded-full bg-white" />
          </button>
        )}
        <span className="min-w-20" />
      </div>
    </div>
  );
}
