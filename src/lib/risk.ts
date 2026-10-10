import type { Risk } from "./hazards";
import type { IconName } from "@/components/ui/Icon";

export type Tone = {
  icon: IconName;
  // 0 hides the meter, 1 to 3 fills that many bars
  level: 0 | 1 | 2 | 3;
  band: string;
  bar: string;
  step: string;
  meterOn: string;
  meterOff: string;
};

export const RISK: Record<Risk, Tone & { label: string }> = {
  good: {
    label: "Favorable",
    icon: "eye",
    level: 0,
    band: "bg-risk-good text-white",
    bar: "bg-risk-good",
    step: "bg-[#dcefe3] text-[#1f5c39]",
    meterOn: "bg-white",
    meterOff: "bg-white/35",
  },
  caution: {
    label: "Caution",
    icon: "triangle",
    level: 1,
    band: "bg-risk-caution text-[#1f1405]",
    bar: "bg-risk-caution",
    step: "bg-[#f6e7c4] text-[#6b4710]",
    meterOn: "bg-[#1f1405]",
    meterOff: "bg-[#1f1405]/30",
  },
  danger: {
    label: "Danger",
    icon: "octagon",
    level: 2,
    band: "bg-risk-danger text-white",
    bar: "bg-risk-danger",
    step: "bg-[#fbe4d6] text-[#9a3412]",
    meterOn: "bg-white",
    meterOff: "bg-white/35",
  },
  critical: {
    label: "Critical",
    icon: "octagon",
    level: 3,
    band: "bg-risk-critical text-white",
    bar: "bg-risk-critical",
    step: "bg-[#f6d5d5] text-[#7f1d1d]",
    meterOn: "bg-white",
    meterOff: "bg-white/35",
  },
};

// used when nothing matched
export const NONE_TONE: Tone = {
  icon: "eye",
  level: 0,
  band: "bg-moss text-forest",
  bar: "bg-forest",
  step: "bg-moss text-forest",
  meterOn: "bg-forest",
  meterOff: "bg-forest/30",
};
