import { CheckIcon } from "@heroicons/react/24/solid";

/**
 * Stepper — the 3-step review pipeline on เสนอคำ (§4 components): done / active /
 * pending. State is carried in text + icon, not colour alone (§10).
 */
export type StepState = "done" | "active" | "pending";

export interface Step {
  title: string;
  detail: string;
  state: StepState;
}

export function Stepper({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                  s.state === "done"
                    ? "bg-green-500 text-white"
                    : s.state === "active"
                      ? "bg-primary-500 text-white"
                      : "border border-line bg-surface text-ink-400"
                }`}
                aria-hidden="true"
              >
                {s.state === "done" ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </span>
              {!last ? (
                <span
                  className={`w-px flex-1 ${
                    s.state === "done" ? "bg-green-500" : "bg-line"
                  }`}
                  style={{ minHeight: 28 }}
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div className={last ? "" : "pb-5"}>
              <p
                className={`text-sm font-medium ${
                  s.state === "pending" ? "text-ink-400" : "text-ink-900"
                }`}
              >
                {s.title}
                <span className="sr-only">
                  {s.state === "done"
                    ? " (เสร็จแล้ว)"
                    : s.state === "active"
                      ? " (กำลังดำเนินการ)"
                      : " (รอดำเนินการ)"}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-ink-400">{s.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
