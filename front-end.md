# คำภีร์ (KamPhee) — Frontend Build Spec

Build the frontend for คำภีร์, a Thai dictionary and language-understanding web app. The
backend is already specified; this frontend must match its API contract exactly. The visual
design lives in Figma.

## Where the design lives — read this carefully

**Figma file:** https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00

- Everything you build from is on **Page 2**.
- The finished, real-layer designs are grouped as **"draft 2 real"** — these are proper
  auto-layout frames (not flattened images), named with a `D2 /` prefix for desktop and
  `M /` prefix for mobile. **Build only from the `D2 /` and `M /` frames.**
- Ignore the older reference material on the page: the raster mockup images inside **Frame 4**,
  and any frame that is a flat PNG/rectangle. Those were the first-draft screenshots and are
  superseded by the `D2 /` frames.
- Each screen below is linked by node id. If the Figma MCP is connected, open the node and read
  the real spacing, sizes and colors from it — do not build from this document's prose alone.

**Authoritative backend contract:** `KAMPHEE_BACKEND_SPEC.md` and `frontend-integration.md`.
Where this document or the Figma design disagrees with those two, **those win** — they describe
the real API. Figma is the source of truth for layout and visual detail only.

---

## 0. Non-negotiables (from the backend contract)

1. **Source fidelity.** Dictionary definitions stay separated by source, each carrying
   `source_id`, `source_record_id`, `source_locator`. Never merge them into one unlabeled
   definition. One spelling can return multiple entries across varieties.
2. **AI is always labeled.** Every generated section carries provider, model, creation method,
   and review state, and is visually distinct from verified content — the design reserves
   **violet** for this. Never render generated text in a plain container.
3. **Statuses are real answers.** `meta.status` of `unsupported`, `insufficient_evidence`,
   `needs_context`, `partial` are valid linguistic outcomes; render them, never swap in a
   fabricated substitute.
4. **No secret in the browser.** No provider or server key in the bundle. Auth is a Supabase
   JWT or `kh_` API key sent as `Authorization: Bearer <token>`.
5. **Cache flags are cosmetic.** Read `meta.cache.hit`/`layer` only for display, never for
   correctness.

---

## 1. Product shape

Three feature groups. คำใจ is **not** separate — its functions (meaning, intent, mood, tone,
formality) live inside คำแปล. Nav is **คำแปล / คำอ่าน / คลังคำ**, with a **ค้นหา / Live**
submenu under คำแปล. Every header has a เข้าสู่ระบบ entry point (language endpoints need a token).

| Group | Route | What it does |
|---|---|---|
| **คำแปล** | `/`, `/search` | One input: word, phrase, or sentence. Lookup, sentence understanding, translation, rewriting. |
| **คำแปล Live** | `/live` | Editor; highlight a passage for contextual help. An extension *inside* คำแปล. |
| **คำอ่าน** | `/read` | Upload image/PDF, highlight text on the document, same language help. |
| **คลังคำ** | `/klangkham` | Developer-facing: dataset access + language APIs + submit-a-word. |

---

## 2. Screens — desktop + mobile nodes

Both breakpoints are designed. Build responsive to match: use the `D2 /` frame for ≥1024px and
the `M /` frame for the mobile layout. On mobile, the two-column desktop layouts collapse to one
column with the result/side panels **stacked below** the main content (already reflected in the
`M /` frames — follow them rather than re-deriving).

| Screen | State | Route | Desktop (`D2 /`) | Mobile (`M /`) |
|---|---|---|---|---|
| หน้าแรก | home | `/` | [31-26](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=31-26) | [155-26](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=155-26) |
| คำแปล — found | sources present | `/search?q=` | [44-26](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=44-26) | [155-133](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=155-133) |
| คำแปล — not found | `insufficient_evidence` | `/search?q=` | [34-1234](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=34-1234) | [155-260](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=155-260) |
| คำแปล — AI-only | unverified generated | `/search?q=` | [34-1558](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=34-1558) | [155-363](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=155-363) |
| คำแปล — sentence | sentence view | `/search?q=` | [42-26](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=42-26) | [156-26](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=156-26) |
| คำแปล Live | editor | `/live` | [82-1734](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=82-1734) | [156-130](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=156-130) |
| ปรับข้อความ | rewrite | `/rewrite` | [45-26](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=45-26) | [156-231](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=156-231) |
| คำอ่าน — upload | empty | `/read` | [123-26](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=123-26) | [157-26](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=157-26) |
| คำอ่าน — reader | doc loaded | `/read/:docId` | [122-26](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=122-26) | [157-135](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=157-135) |
| คลังคำ — developer | dataset + API | `/klangkham` | [132-26](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=132-26) | [157-238](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=157-238) |
| เสนอคำ | community submit | `/klangkham/submit` | [49-26](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=49-26) | [157-404](https://www.figma.com/design/qkb4ckdnTceherDPmQbZ00/?node-id=157-404) |

The three คำแปล result screens are **one route in three states**, chosen by the response:
sources present → found; nothing found → not-found; only a generated meaning → AI-only. Drive
the state from the response shape, not from separate pages.

---

## 3. Stack

Next.js (App Router) + TypeScript + Tailwind + TanStack Query (with per-request abort). Rich-text
editor (Tiptap or similar) for Live. The token lives server-side (route handler / proxy); the
browser never sees a provider key.

Fonts: **Noto Sans Thai** for UI (400/500/600/700/800), a monospace (Roboto Mono) for code/API
samples only. Thai needs generous line-height — ~1.6 body, ~1.45 headings — diacritics stack and
tight leading collides.

Breakpoints: match the two designed layouts. Two-column → single-column below ~1024px, side
panels move below content, the four sentence tiles go 4 → 2 → 1, nav collapses to a hamburger +
bottom tab bar as shown in the `M /` frames.

---

## 4. API contract

Base URL `/v1`. JSON rejects unknown fields. Interactive docs at `/docs`.

### Endpoints
```
GET  /v1/entries?query=…             public   list entries, source-separated
GET  /v1/entries/{id}                public   entry detail with source fields
GET  /v1/entries/{id}/pronunciations public   readings + notation system
GET  /v1/sources                     public   source metadata + usage terms
GET  /v1/capabilities                public   actual supported tasks, varieties, limits
POST /v1/lookup                      auth     dictionary-oriented lookup
POST /v1/search                      auth     unified word/phrase/sentence
POST /v1/analyze                     auth     meaning/intent/mood/tone/formality (no target)
POST /v1/translate                   auth     translation (target required)
POST /v1/rewrite                     auth     contextual rewriting
POST /v1/live/assist                 auth     editor selection assistance
```

### Shared request body (search/lookup/analyze/translate/rewrite)
```json
{
  "text": "…",
  "selection": null,
  "source": { "language": "th", "variety_id": null },
  "target": { "language": "en", "variety_id": null },
  "context": { "recipient": null, "occasion": null, "additional_context": null },
  "preferences": { "formality": "preserve", "style": [], "explanation_language": "th" },
  "options": { "web_search": "auto", "cache": "use" }
}
```
`target` is **required for translate**, **omitted for analyze**. The target/language pickers in
the UI must expose `variety_id`, not just a language.

### Response envelope (every success)
```json
{ "request_id":"…", "data":{ … }, "meta":{ "schema_version":"1", "status":"complete",
  "cache":{ "hit":false, "layer":null }, "warnings":[] } }
```
Inspect `meta.status`. Render `unsupported` / `insufficient_evidence` / `needs_context` /
`partial` as designed states, never as fabricated content.

### Errors
```json
{ "request_id":"…", "error":{ "code":"INVALID_SELECTION", "message":"…",
  "retryable":false, "details":{} } }
```
Retry only when `retryable` is true. Honor `Retry-After` on 429 with exponential backoff. Never
retry 401/403/409/413/415/422 without changing the request.

### Auth
`Authorization: Bearer <Supabase JWT or kh_ key>`. Public source-metadata and published-entry
reads need no auth; everything generative does. `fixture:<id>` tokens work only when dev fixture
auth is enabled and are rejected in production.

---

## 5. Per-screen notes

**คำแปล (found)** — word, POS, pronunciation, then **one uniform SourceBlock per source**, each
with its provenance tag (`เชื่อถือได้` / `เฉพาะทาง` / `ชุมชน` / `ยังไม่ตรวจสอบ`). Official
dictionary gets no extra visual weight — only its tag differs. Right column (desktop) / stacked
section (mobile): translation with a language **and variety** picker. Include pronunciation +
the audio button (§6). Show `meta.cache` and dataset version as quiet metadata.

**คำแปล (not found)** — a designed state, not an error (`insufficient_evidence`). Say the word
is absent, state clearly that absence ≠ wrong, show a labeled AI hypothesis, list the **web
evidence** it was grounded in (source, quote, date, outbound link) marked ยังไม่ตรวจสอบ, and
invite submitting to คลังคำ.

**คำแปล (sentence)** — plain meaning + intent/mood/tone/formality tiles + a tokenized sentence
where each word is selectable. Use `matched_terms` (UTF-16 offsets + candidate sense IDs) to
build the spans. Mood/intent may have multiple labels and an unclear/context-dependent value;
never render a made-up confidence percentage.

**คำแปล Live** — editor + result rail (desktop) / editor with panels stacked below (mobile). See
§7 for the selection protocol.

**ปรับข้อความ** — form (message, recipient, occasion, formality, target language/variety, things
to preserve) → result with copy/listen/retry and a "what was preserved" checklist. The backend
must not invent facts/names/dates/numbers/negation — surface what was kept.

**คำอ่าน (upload)** — dropzone accepting **PDF, PNG, JPEG, WebP**. No size limit unless
`/capabilities` returns one. Recent documents + privacy note (uploads don't auto-publish).

**คำอ่าน (reader)** — viewer with **per-page processing status**, a highlightable passage, and a
rail reusing คำแปล capabilities: meaning, hard-word lookup, translation, OCR-correction. Deleting
a document deletes its private derived data.

**คลังคำ (developer)** — dataset stats, source/variety/review-status filters, the endpoint list
above with public/auth scope, a sample POST with the `request_id·data·meta` envelope and a `kh_`
key, the `meta.status` vocabulary, rate-limit gauge with 429/Retry-After, and a สถานะการพัฒนา
panel (§8). Dataset **export is not yet available** — JSONL/JSON shown as coming-soon.

**เสนอคำ** — submission form + review pipeline. The reviewer panel is staff-only; gate behind a
role check, don't render in the public build.

---

## 6. Audio button contract

Vocabulary audio is **designed ahead of the backend** — synthesis lands in a later milestone.
The Figma buttons are drawn enabled for demo; implement the three real states from each
pronunciation's `audio_availability`:

- `supported` → enabled request button (calls synthesis when it exists).
- `unavailable` → disabled, temporary-unavailability message.
- `unsupported` → visible, disabled, "ยังไม่พร้อมให้บริการเสียงอ่าน".

Never synthesize on load or selection, never autoplay. Keep pronunciation ID + revision with each
request, stop previous playback when the entry changes, label generated audio "เสียงสังเคราะห์".
Northern Thai must never route to the Isan provider.

---

## 7. คำแปล Live contract

Selections are **half-open JavaScript UTF-16 code-unit offsets** into the exact, unnormalized
editor text — not code-point indices. Send the sliced substring so the server can verify it. The
server rejects surrogate-pair and combining-mark splits and any `selection.text` mismatch.

```js
const body = {
  text: editorText,
  selection: { start, end, unit: "utf16", text: editorText.slice(start, end) },
  source: { language: "th", variety_id: null },
  target: { language: "en", variety_id: null },
  client_request_id: crypto.randomUUID(),
  document_id: null,
  document_revision: revision,
  selection_sequence: ++sequence,
  task: "translate"
};
await fetch("/v1/live/assist", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
  signal: abortController.signal
});
```

- Debounce settled selections ~300 ms; abort superseded fetches.
- Render a result only if `document_revision` **and** `selection_sequence` still match current
  editor state — otherwise discard it.
- Suggestions never mutate the document. Replace the selection **only** on an explicit user
  action (the แทนที่ button); provide copy as the non-destructive path.
- A dispatched provider call may still cost money after the browser aborts — expected; abort is
  about UI correctness, not cost.

Thai has no inter-word spaces — selection UI can't assume whitespace boundaries. Test with Thai
combining marks, emoji, repeated words, and newlines.

---

## 8. Implementation status (build honestly)

Some brief features are designed but the backend marks them not-yet-available. Consult
`IMPLEMENTATION_STATUS.md` before wiring these, and surface their state in the คลังคำ
สถานะการพัฒนา panel rather than faking success:

- Document upload / OCR / correction / job APIs — not advertised as working.
- Stable dataset releases / exports — not yet.
- Audio synthesis + playback — later milestone (§6).
- Some dialect varieties — support is **per-variety**; read `/v1/capabilities` and show real
  coverage, don't imply every variety works.

The UI may show these controls (product decision to design ahead), but they must reflect true
availability from `/capabilities` / `audio_availability` and never present fixture output as a
real result.

---

## 9. Data & fixtures

Build against typed fixtures shaped like the real envelope (`request_id·data·meta`,
source-separated definitions, labeled generated sections). Never let a fixture read as a verified
definition. All sample Thai content in Figma (ราชบัณฑิต definitions, dialect equivalents, usage
counts, evidence quotes) is **placeholder** and must be replaced with real API data — shipping
invented dictionary entries would violate the product's core promise of trustworthy provenance.

---

## 10. Quality floor

Both breakpoints designed (§2). Visible keyboard focus, reduced-motion respected, provenance
never communicated by color alone (the tag text carries it and belongs in the accessible name).
