export function AnalyzingNote() {
  return (
    <div
      role="status"
      className="flex flex-col gap-1.5 text-center lg:rounded-3xl lg:border lg:border-line lg:bg-white lg:p-6 lg:text-left"
    >
      <p className="text-lg font-semibold tracking-tight">
        Looking at your photo
      </p>
      <p className="text-sm leading-relaxed text-muted">
        Checking the full frame and a close-up of the middle. Nothing leaves
        your phone.
      </p>
    </div>
  );
}
