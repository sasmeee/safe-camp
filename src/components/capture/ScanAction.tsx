import { Button } from "../ui/Button";

type Props = {
  busy: boolean;
  ms: number | null;
  onClick: () => void;
  onGallery: () => void;
  className: string;
};

export function ScanAction({ busy, ms, onClick, onGallery, className }: Props) {
  return (
    <div className={`flex-col gap-2 ${className}`}>
      <Button
        icon={busy ? "spinner" : "camera"}
        spin={busy}
        disabled={busy}
        onClick={onClick}
      >
        {busy ? "Analyzing…" : "Scan another photo"}
      </Button>
      <Button
        variant="outline"
        icon="image"
        disabled={busy}
        onClick={onGallery}
      >
        Upload from gallery
      </Button>
      {!busy && ms !== null && (
        <p className="text-center text-xs text-muted">
          {ms} ms, on this device. Not a substitute for expert advice.
        </p>
      )}
    </div>
  );
}
