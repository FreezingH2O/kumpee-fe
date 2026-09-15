import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { LoginLink } from "@/components/auth/LoginLink";

/** Inline error for a failed API call — the backend message plus its request id
 *  (useful when reporting a problem). */
export function ErrorNotice({
  message,
  requestId,
  className = "",
  showLogin = false,
}: {
  message: string;
  requestId?: string;
  className?: string;
  /** Add a เข้าสู่ระบบ link (auth / guest-limit errors). */
  showLogin?: boolean;
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
          {showLogin ? (
            <p className="mt-2">
              <LoginLink />
            </p>
          ) : null}
          {requestId && requestId !== "client" && requestId !== "server" ? (
            <p className="mt-1 text-xs opacity-70">request id: {requestId}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
