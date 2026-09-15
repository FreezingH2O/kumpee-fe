import type { LabeledInterpretation } from "@/lib/api/types";

/**
 * One of the four sentence interpretation tiles: เจตนา / อารมณ์ / น้ำเสียง /
 * ระดับภาษา (§5). Multiple labels are allowed and "unclear/context-dependent"
 * is a valid value (§8.3) — we never show a made-up confidence percentage.
 *
 * NOTE (§0.2): the Figma tone tile uses a violet tint, but violet is reserved
 * for AI-content containers. These four analyses are all AI-derived, and the
 * card that holds them is AI-labeled; the tiles themselves use category tints
 * (blue / green / amber / teal) so violet stays exclusive to AiBlock.
 */
type Kind = "intent" | "mood" | "tone" | "formality";

const META: Record<Kind, { label: string; className: string }> = {
  intent: { label: "เจตนา", className: "bg-primary-50 text-primary-700" },
  mood: { label: "อารมณ์", className: "bg-green-50 text-green-700" },
  tone: { label: "น้ำเสียง", className: "bg-teal-50 text-teal-700" },
  formality: { label: "ระดับภาษา", className: "bg-amber-50 text-amber-700" },
};

export function InterpretationTile({
  kind,
  data,
}: {
  kind: Kind;
  data: LabeledInterpretation;
}) {
  const meta = META[kind];
  const value = data.unclear
    ? "ขึ้นกับบริบท"
    : data.labels.join(" · ") || "—";

  return (
    <div className={`rounded-control p-3 ${meta.className}`}>
      <div className="text-xs font-medium opacity-80">{meta.label}</div>
      <div className="mt-0.5 text-[15px] font-semibold leading-heading">
        {value}
      </div>
      {data.justification ? (
        <p className="mt-1 text-xs leading-body opacity-70">
          {data.justification}
        </p>
      ) : null}
    </div>
  );
}
