import { useId } from "react";

/**
 * Field — label (with required asterisk), control, helper text (§4 components).
 * Used across ปรับข้อความ and เสนอคำ. The control is provided via render-prop so
 * the id/aria wiring stays correct for inputs, selects and textareas alike.
 */
export function Field({
  label,
  required,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-required"?: boolean;
  }) => React.ReactNode;
}) {
  const id = useId();
  const helperId = helper ? `${id}-helper` : undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-900">
        {label}
        {required ? (
          <span className="ml-0.5 text-primary-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <div className="mt-1.5">
        {children({
          id,
          "aria-describedby": helperId,
          "aria-required": required,
        })}
      </div>
      {helper ? (
        <p id={helperId} className="mt-1 text-xs text-ink-400">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

/** Shared control classes so inputs/selects/textareas match. */
export const controlClass =
  "w-full rounded-control border border-line bg-surface px-4 py-2.5 text-[15px] text-ink-900 outline-none focus:border-primary-500";
