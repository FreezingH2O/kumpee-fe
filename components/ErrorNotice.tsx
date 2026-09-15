import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/** Inline error for a failed API call — the backend message plus its request id
 *  (useful when reporting a problem). */
export function ErrorNotice({
  message,
  requestId,
  className = "",
}: {
  message: string;
  requestId?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div
        role="alert"
        className="flex items-start gap-2 rounded-card border border-amber-700/30 bg-amber-50 p-4 text-sm text-amber-700"
      >
        <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <p>{message}</p>
          {requestId && requestId !== "client" && requestId !== "server" ? (
            <p className="mt-1 text-xs opacity-70">request id: {requestId}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
