import { SparklesIcon } from "@heroicons/react/24/outline";
import { LoginLink } from "@/components/auth/LoginLink";

/** Free-trial status for signed-out visitors: remaining AI uses today, or that
 *  the limit is reached — always with a way to sign in for unlimited use. */
export function GuestBanner({
  remaining,
  limit,
  className = "",
}: {
  remaining: number;
  limit: number;
  className?: string;
}) {
  const exhausted = remaining <= 0;
  return (
    <div className={className}>
      <p
        className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-control px-4 py-2.5 text-sm ${
          exhausted ? "bg-amber-50 text-amber-700" : "bg-violet-50 text-ink-600"
        }`}
      >
        <SparklesIcon
          className={`h-4 w-4 shrink-0 ${exhausted ? "text-amber-700" : "text-violet-600"}`}
          aria-hidden="true"
        />
        <span>
          {exhausted
            ? `ใช้ AI ฟรีครบ ${limit} ครั้งสำหรับวันนี้แล้ว — ค้นพจนานุกรมได้ตามปกติ`
            : `ทดลองใช้ AI ฟรี: เหลือ ${remaining} จาก ${limit} ครั้งวันนี้`}
        </span>
        <span aria-hidden="true">·</span>
        <LoginLink>เข้าสู่ระบบเพื่อใช้ได้ไม่จำกัด</LoginLink>
      </p>
    </div>
  );
}
