"use client";

import { useState } from "react";
import {
  PaperAirplaneIcon,
  CheckCircleIcon,
  BellAlertIcon,
  ArrowLeftIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { Field, controlClass } from "@/components/form/Field";
import { Stepper, type Step } from "@/components/form/Stepper";
import { SHOW_REVIEWER_PANEL } from "@/lib/config";

function stepsFor(submitted: boolean): Step[] {
  return [
    {
      title: "ส่งข้อเสนอ",
      detail: "ส่งข้อมูลเรียบร้อยแล้ว",
      state: submitted ? "done" : "active",
    },
    {
      title: "ชุมชนให้ข้อมูลเพิ่มเติม",
      detail: "เปิดให้สมาชิกในชุมชนร่วมแสดงความคิดเห็นและยกตัวอย่างการใช้เพิ่มเติม",
      state: submitted ? "active" : "pending",
    },
    {
      title: "ผู้เชี่ยวชาญตรวจสอบ",
      detail: "ทีมงานจะพิจารณาข้อมูลโดยรอบและสรุปผลการดำเนินการ",
      state: "pending",
    },
  ];
}

export function SubmitForm() {
  const [submitted, setSubmitted] = useState(false);
  const [agree, setAgree] = useState(false);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        {/* form */}
        <section className="rounded-card border border-line bg-surface p-5">
          <h2 className="font-semibold text-ink-900">ข้อมูลคำที่เสนอ</h2>
          <p className="mt-1 text-sm text-ink-600">
            กรอกข้อมูลให้ครบถ้วน เพื่อช่วยให้ทุกคนเข้าใจคำนี้ได้ดียิ่งขึ้น
          </p>

          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
              <Field label="คำหรือวลี" required helper="ระบุคำ วลี สำนวนที่ต้องการเสนอ">
                {(p) => <input {...p} className={controlClass} placeholder="เช่น จึ้ง" />}
              </Field>
              <div className="flex items-start gap-2 rounded-control bg-amber-50 p-3 text-sm text-amber-700">
                <LightBulbIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  เสนอได้ทั้ง “คำใหม่” หรือ “ความหมายใหม่ของคำเดิม” ทุกความคิดเห็นมีค่า
                </span>
              </div>
            </div>

            <Field
              label="ความหมายที่เสนอ"
              required
              helper="อธิบายความหมายให้ชัดเจน เข้าใจง่าย ด้วยภาษาของคุณ"
            >
              {(p) => (
                <input {...p} className={controlClass} placeholder="ความหมายของคำนี้" />
              )}
            </Field>

            <Field label="ตัวอย่างประโยค" required helper="ยกตัวอย่างการใช้ในประโยคจริง">
              {(p) => (
                <input {...p} className={controlClass} placeholder="ประโยคตัวอย่าง" />
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ใช้ในบริบทไหน?" required helper="เช่น การพูดคุยทั่วไป โซเชียลมีเดีย">
                {(p) => <input {...p} className={controlClass} placeholder="บริบทการใช้" />}
              </Field>
              <Field label="แหล่งที่พบ" helper="เช่น เว็บไซต์ โซเชียลมีเดีย (ถ้ามี)">
                {(p) => <input {...p} className={controlClass} placeholder="ลิงก์หรือแหล่งที่มา" />}
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ช่วงเวลาที่พบ (ถ้ามี)">
                {(p) => <input {...p} type="date" className={controlClass} />}
              </Field>
              <Field label="รูปสะกดอื่น (ถ้ามี)" helper="ระบุรูปแบบการสะกดอื่น ๆ ที่พบ">
                {(p) => <input {...p} className={controlClass} placeholder="เช่น จี้ง, จึ๊ง" />}
              </Field>
            </div>

            <label className="flex items-start gap-2 text-sm text-ink-600">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line"
              />
              <span>
                ยืนยันสิทธิ์ในการส่งข้อเสนอและตัวอย่างนี้เพื่อเผยแพร่ตาม{" "}
                <a href="#" className="text-primary-600 underline">
                  เงื่อนไขโครงการ
                </a>
              </span>
            </label>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-control border border-line px-4 py-2.5 text-sm font-medium text-ink-600 hover:border-primary-500"
              >
                บันทึกร่าง
              </button>
              <button
                type="submit"
                disabled={!agree}
                className="inline-flex items-center gap-2 rounded-control bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-500/50"
              >
                <PaperAirplaneIcon className="h-5 w-5" /> ส่งให้ตรวจสอบ
              </button>
            </div>
          </form>
        </section>

        {/* post-submit status */}
        <aside className="space-y-4">
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="mb-3 font-semibold text-ink-900">หลังส่งคำ</h2>

            <div
              className={`flex items-center gap-3 rounded-control p-3 ${
                submitted ? "bg-green-50" : "bg-slate100"
              }`}
            >
              <CheckCircleIcon
                className={`h-8 w-8 shrink-0 ${
                  submitted ? "text-green-500" : "text-ink-400"
                }`}
                aria-hidden="true"
              />
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
                  {submitted ? "ส่งคำเสนอแล้ว" : "ยังไม่ได้ส่ง"}
                  {submitted ? (
                    <span className="rounded-chip bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                      รอตรวจสอบ
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-ink-400">
                  คำนี้ยังไม่ใช่รายการที่ผ่านการยืนยัน
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Stepper steps={stepsFor(submitted)} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-control border border-line px-3 py-2 text-sm text-ink-600 hover:border-primary-500"
              >
                <BellAlertIcon className="h-4 w-4" /> ติดตามคำที่เสนอ
              </button>
              <a
                href="/klangkham"
                className="inline-flex items-center gap-1.5 rounded-control border border-line px-3 py-2 text-sm text-ink-600 hover:border-primary-500"
              >
                <ArrowLeftIcon className="h-4 w-4" /> กลับคลังคำ
              </a>
            </div>
          </section>

          {/* reviewer panel — staff only, gated out of the public build (§5) */}
          {SHOW_REVIEWER_PANEL ? (
            <section className="rounded-card border border-line bg-surface p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold text-ink-900">สำหรับผู้ตรวจ</h2>
                <span className="rounded-chip bg-slate100 px-2 py-0.5 text-xs text-ink-400">
                  เฉพาะทีมงาน
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded-control border border-line px-3 py-2 text-sm text-ink-600">
                  ขอข้อมูลเพิ่ม
                </button>
                <button type="button" className="rounded-control border border-line px-3 py-2 text-sm text-ink-600">
                  แก้ไข
                </button>
                <button type="button" className="rounded-control bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                  อนุมัติ
                </button>
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
