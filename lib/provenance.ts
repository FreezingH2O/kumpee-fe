import type {
  ProvenanceTag,
  CreationMethod,
  ReviewStatus,
  CoverageLevel,
} from "@/lib/api/types";

/**
 * Provenance is the product's core promise (§0). The tag is DERIVED from the
 * record's origin + review state, never trusted from a free-text field, so a
 * fixture can never accidentally present itself as verified.
 *
 * Tag → colour (verified against Figma 44:26 + §3 tokens). VIOLET IS RESERVED
 * FOR AI (§0.2): เฉพาะทาง uses blue so violet stays exclusive to unverified/AI.
 */
export type SourceKind =
  | "official" // ราชบัณฑิตยสถาน etc.
  | "specialist" // ศัพท์เฉพาะทาง
  | "community" // คลังคำ (ชุมชน)
  | "ai"; // คำภีร์ AI

export function tagForSource(
  kind: SourceKind,
  creation: CreationMethod,
  review: ReviewStatus
): ProvenanceTag {
  if (creation === "ai_generated" && review !== "approved") return "ยังไม่ตรวจสอบ";
  if (kind === "community") return "ชุมชน";
  if (kind === "specialist") return "เฉพาะทาง";
  if (kind === "ai") return review === "approved" ? "เฉพาะทาง" : "ยังไม่ตรวจสอบ";
  return "เชื่อถือได้";
}

export interface TagStyle {
  /** Tailwind classes for the pill. */
  className: string;
  /** Longer text for the accessible name — provenance must not rely on colour
   *  alone (§10). */
  accessibleLabel: string;
}

export const TAG_STYLES: Record<ProvenanceTag, TagStyle> = {
  เชื่อถือได้: {
    className: "bg-green-50 text-green-700",
    accessibleLabel: "แหล่งข้อมูลที่เชื่อถือได้ ตรวจสอบแล้ว",
  },
  เฉพาะทาง: {
    className: "bg-primary-50 text-primary-600",
    accessibleLabel: "พจนานุกรมเฉพาะทาง",
  },
  ชุมชน: {
    className: "bg-teal-50 text-teal-700",
    accessibleLabel: "ข้อมูลจากชุมชน",
  },
  ยังไม่ตรวจสอบ: {
    className: "bg-violet-50 text-violet-600",
    accessibleLabel: "เนื้อหาที่สร้างโดย AI ยังไม่ผ่านการตรวจสอบ",
  },
};

export const COVERAGE_LABEL: Record<CoverageLevel, string> = {
  covered: "ครอบคลุม",
  in_progress: "กำลังพัฒนา",
  unsupported: "ยังไม่รองรับ",
};
