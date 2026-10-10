import { Button } from "../ui/Button";

type Props = { message: string; canRetry: boolean; onRetry: () => void };

export function ErrorNotice({ message, canRetry, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2.5 rounded-xl border border-risk-critical bg-white p-3.5"
    >
      <p className="text-sm font-medium text-risk-critical">{message}</p>
      {canRetry && (
        <Button variant="outline" onClick={onRetry}>
          Retry model
        </Button>
      )}
    </div>
  );
}
