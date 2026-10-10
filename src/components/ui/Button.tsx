import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Props = {
  variant?: "primary" | "outline";
  icon?: IconName;
  spin?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
};

const BASE =
  "flex w-full items-center justify-center gap-2.5 rounded-2xl font-semibold transition-opacity disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

const VARIANT = {
  primary: "h-14 bg-forest text-[17px] text-sand",
  outline:
    "h-[52px] border-[1.5px] border-forest bg-transparent text-base text-forest",
} as const;

export function Button({
  variant = "primary",
  icon,
  spin,
  disabled,
  onClick,
  className = "",
  children,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${BASE} ${VARIANT[variant]} ${className}`}
    >
      {icon && (
        <Icon
          name={icon}
          size={variant === "primary" ? 22 : 20}
          className={spin ? "animate-spin" : undefined}
        />
      )}
      {children}
    </button>
  );
}
