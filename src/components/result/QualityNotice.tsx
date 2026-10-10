import type { ImageQuality } from "@/lib/messages";
import { Icon } from "../ui/Icon";

type Props = { quality: ImageQuality | null; onRetake: () => void };

export function QualityNotice({ quality, onRetake }: Props) {
  const message = quality?.tooDark
    ? "Retake this photo in brighter light."
    : quality?.tooBlurry
      ? "Retake this photo with steadier focus."
      : null;
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-risk-caution bg-white px-3 py-2.5 text-sm font-medium leading-snug text-[#1f1405]"
    >
      <Icon
        name="triangle"
        size={20}
        strokeWidth={2}
        className="flex-none text-[#8a5a12]"
      />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onRetake}
        className="h-8.5 flex-none rounded-[10px] bg-forest px-3 text-[13px] font-semibold text-sand"
      >
        Retake
      </button>
    </div>
  );
}