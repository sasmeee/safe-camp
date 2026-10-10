import { Corners } from "../ui/Corners";

type Props = { src: string; analyzing: boolean };

export function PhotoPreview({ src, analyzing }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-[18px] bg-moss lg:h-95 lg:rounded-3xl ${
        analyzing ? "h-95" : "h-37.5"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Your photo" className="size-full object-cover" />
      {analyzing && (
        <>
          <Corners className="text-sand" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[8%] h-0.75 animate-scan bg-sand shadow-[0_0_18px_6px_rgba(245,245,240,0.7)] motion-reduce:animate-none"
          />
        </>
      )}
    </div>
  );
}
