// viewfinder corner marks, color comes from the text color
export function Corners({ className = "text-forest" }: { className?: string }) {
  const base = "absolute size-7 border-current";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      <span
        className={`${base} left-3.5 top-3.5 rounded-tl-lg border-l-[3px] border-t-[3px]`}
      />
      <span
        className={`${base} right-3.5 top-3.5 rounded-tr-lg border-r-[3px] border-t-[3px]`}
      />
      <span
        className={`${base} bottom-3.5 left-3.5 rounded-bl-lg border-b-[3px] border-l-[3px]`}
      />
      <span
        className={`${base} bottom-3.5 right-3.5 rounded-br-lg border-b-[3px] border-r-[3px]`}
      />
    </div>
  );
}
