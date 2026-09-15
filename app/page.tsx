import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
  ShareIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { PlusIcon } from "@heroicons/react/24/outline";
import { AppShell } from "@/components/shell/AppShell";
import { HomeSearch } from "@/components/home/HomeSearch";
import { HeroBook } from "@/components/home/HeroBook";
import { WordCard } from "@/components/home/WordCard";
import { featuredWords } from "@/lib/api/server";

export const revalidate = 3600;

const FEATURES = [
  {
    href: "/search",
    title: "คำแปล",
    body: "ค้นคำ และความหมายจากทุกแหล่ง",
    Icon: MagnifyingGlassIcon,
    icon: "bg-primary-500",
    tint: "from-primary-50",
    arrow: "text-primary-600",
  },
  {
    href: "/rewrite",
    title: "ปรับข้อความ",
    body: "ปรับภาษาให้เหมาะกับผู้ฟัง",
    Icon: ChatBubbleLeftEllipsisIcon,
    icon: "bg-teal-500",
    tint: "from-teal-50",
    arrow: "text-teal-700",
  },
  {
    href: "/read",
    title: "คำอ่าน",
    body: "อ่านเอกสาร เลือกคำที่ยาก",
    Icon: DocumentTextIcon,
    icon: "bg-primary-700",
    tint: "from-primary-50",
    arrow: "text-primary-700",
  },
  {
    href: "/klangkham",
    title: "คลังคำ",
    body: "คลังข้อมูลเปิดสำหรับทุกคน",
    Icon: ShareIcon,
    icon: "bg-amber-500",
    tint: "from-amber-50",
    arrow: "text-amber-700",
  },
];

const FEATURED = ["น้ำใจ", "เกรงใจ", "อุ่นใจ"];

export default async function Home() {
  const words = await featuredWords(FEATURED);

  return (
    <AppShell>
      {/* hero */}
      <section className="relative overflow-hidden">
        <HeroBook className="pointer-events-none absolute -left-24 top-20 hidden w-[460px] opacity-90 lg:block" />
        <HeroBook className="pointer-events-none absolute -right-28 top-40 hidden w-[380px] -scale-x-100 opacity-40 lg:block" />
        <p
          className="pointer-events-none absolute left-8 top-[360px] hidden text-xs font-medium leading-6 tracking-[0.3em] text-ink-400 xl:block"
          aria-hidden="true"
        >
          <span className="mb-3 block h-[3px] w-6 rounded-chip bg-amber-400" />
          WORDS
          <br />
          PEOPLE
          <br />
          A BRIGHTER
          <br />
          TOMORROW
        </p>

        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-12 text-center sm:pt-16">
          <h1 className="text-4xl font-extrabold leading-[1.3] tracking-tight text-ink-900 sm:text-6xl sm:leading-[1.25]">
            ทุกคำมีความหมาย
            <br />
            <span className="bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
              เข้าใจได้ทุกวัน
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-ink-600">
            ค้นคำ เข้าใจบริบท สื่อสารได้ตรงใจ
          </p>

          <div className="mx-auto mt-8 max-w-2xl text-left">
            <HomeSearch />
          </div>
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-[1100px] px-4 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ href, title, body, Icon, icon, tint, arrow }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-4 rounded-card border border-line bg-gradient-to-br ${tint} to-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-float`}
            >
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${icon} text-white shadow-button`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold text-ink-900">{title}</span>
                <span className="block text-sm leading-snug text-ink-600">{body}</span>
              </span>
              <ArrowRightIcon
                className={`h-4 w-4 shrink-0 ${arrow} transition group-hover:translate-x-0.5`}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* words */}
      {words.length ? (
        <section className="mx-auto mt-12 max-w-[1100px] px-4 lg:px-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-ink-900">คำที่น่ารู้วันนี้</h2>
              <p className="mt-1 text-sm text-ink-600">
                คำจากพจนานุกรม เข้าใจวันนี้ สื่อสารได้ดียิ่งขึ้น
              </p>
            </div>
            <Link
              href="/klangkham/submit"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              เสนอคำใหม่
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-500 text-white">
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {words.map((w) => (
              <WordCard key={w.headword} word={w} />
            ))}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
