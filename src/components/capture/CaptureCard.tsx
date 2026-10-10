"use client";

import { useState, type DragEvent } from "react";
import { Button } from "../ui/Button";
import { Corners } from "../ui/Corners";
import { Icon } from "../ui/Icon";

type Props = {
  disabled?: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onDropFile: (file: File) => void;
};

export function CaptureCard({
  disabled,
  onCamera,
  onGallery,
  onDropFile,
}: Props) {
  const [over, setOver] = useState(false);

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onDropFile(file);
  }

  return (
    <section className="flex flex-col gap-4 lg:rounded-3xl lg:border lg:border-line lg:bg-white lg:p-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`relative flex h-50 flex-col items-center justify-center gap-2.5 rounded-[20px] text-center transition-colors lg:h-80 lg:rounded-[18px] lg:border-2 lg:border-dashed ${
          over ? "bg-[#d8e0d2] lg:border-forest" : "bg-moss lg:border-[#aab5a6]"
        }`}
      >
        <Corners />
        <div className="flex size-14 items-center justify-center rounded-full bg-forest text-sand lg:size-15">
          <Icon name="camera" size={26} />
        </div>
        <p className="text-base font-semibold lg:text-lg">
          <span className="lg:hidden">Frame one subject</span>
          <span className="hidden lg:inline">Drop a photo here</span>
        </p>
        <p className="max-w-57.5 text-[13px] leading-snug text-muted lg:max-w-70 lg:text-sm">
          A plant, bug, animal or the spot for your tent
        </p>
      </div>

      <div className="flex flex-col gap-2.5 lg:flex-row lg:gap-3">
        <Button
          icon="camera"
          onClick={onCamera}
          disabled={disabled}
          className="lg:flex-1"
        >
          Take photo
        </Button>
        <Button
          variant="outline"
          icon="image"
          onClick={onGallery}
          disabled={disabled}
          className="lg:flex-1"
        >
          Choose from gallery
        </Button>
      </div>
    </section>
  );
}
