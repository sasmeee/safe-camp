import type { ClassifierStatus } from "@/hooks/useClassifier";

import logo from "@/../public/safecamp-logo-light.svg";
import Image from "next/image";

type Props = { status: ClassifierStatus; hasPhoto: boolean };

export function Header({ status, hasPhoto }: Props) {
  const loading = status === "loading";
  const label = loading
    ? "Downloading model"
    : hasPhoto
      ? "On this device"
      : "Offline ready";

  return (
    <header className="bg-forest text-sand sticky top-0 z-999">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-3.5 lg:px-6 lg:py-4">
        <div className="flex items-center gap-2.5">
          <Image src={logo} alt="" width={44} height={44} className="size-11" />
          <span className="text-lg font-bold tracking-tight lg:text-[19px]">
            SafeCamp
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-sand/15 px-3 py-1.5 text-xs font-medium lg:text-[13px]">
          <span
            className={`size-1.75 rounded-full ${loading ? "bg-[#f2c14e]" : "bg-[#7fd1a0]"}`}
          />
          {label}
        </div>
      </div>
    </header>
  );
}
