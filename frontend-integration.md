# คัมภีร์ frontend integration

Base URL: `/v1`. JSON schemas reject unknown fields. The interactive OpenAPI document is `/docs`;
generate a committed snapshot with `python scripts/export_openapi.py`.

## Authentication

Language and private-data endpoints require `Authorization: Bearer <Supabase JWT or kh_ API key>`.
Never ship a server or provider key in a browser bundle. Public source metadata and published entry
reads do not require authentication. `fixture:<id>` tokens work only when development fixture auth is
explicitly enabled and are rejected by production configuration validation.

## Response and errors

Every successful API result has `request_id`, `data`, and `meta`. Inspect `meta.status`; `unsupported`
and `insufficient_evidence` are valid linguistic outcomes, not generated substitutes. Inspect
`meta.cache.hit`/`layer` only for display or diagnostics—never for correctness.

Errors use:

```json
{"request_id":"...","error":{"code":"INVALID_SELECTION","message":"...","retryable":false,"details":{}}}
```

Retry only when `retryable` is true, honor `Retry-After` on 429, and use exponential backoff. Do not
retry 401/403/409/413/415/422 without changing the request.

## Entry lookup and source fidelity

```http
GET /v1/entries?query=ตา
GET /v1/entries/{entry_id}
GET /v1/entries/{entry_id}/pronunciations
GET /v1/sources
```

Definitions stay separated by source and carry `source_id`, `source_record_id`, and
`source_locator`. Do not merge them into an unlabeled definition. A word can produce multiple
entries for identical spelling in different varieties.

```http
POST /v1/lookup
Authorization: Bearer <token>
Content-Type: application/json

{"text":"ตา","source":{"language":"th","variety_id":null}}
```

## Shared language requests

`POST /search`, `/lookup`, `/analyze`, `/translate`, and `/rewrite` share this input. Translation
requires `target`; analysis forbids it.

```json
{
  "text": "พรุ่งนี้พบคุณมาลี 10:30 น.",
  "selection": null,
  "source": {"language": "th", "variety_id": null},
  "target": {"language": "en", "variety_id": null},
  "context": {"recipient": "client", "occasion": null, "additional_context": null},
  "preferences": {"formality": "formal", "style": ["clear"], "explanation_language": "th"},
  "options": {"web_search": "never", "cache": "use"}
}
```

Known dictionary lookups do not invoke the generation provider. Generated sections carry provider,
model, creation method, review state, and usage metadata. If the provider is not configured the API
returns 503 rather than fixture content.

## UTF-16 selections and คำแปล Live

Offsets are half-open JavaScript UTF-16 code units into the exact, unnormalized `text`. Do not send
Unicode code-point indices. The server rejects surrogate-pair splits, combining-mark splits, and a
`selection.text` that differs from the indexed substring.

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
const response = await fetch("/v1/live/assist", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
  signal: abortController.signal
});
```

Debounce settled selections around 300 ms and abort superseded fetches. Render only when both
`document_revision` and `selection_sequence` still match current editor state. Suggestions never
mutate server-side content; replace only after a user action. A provider call already dispatched may
still incur cost after browser cancellation.

## Vocabulary audio UI contract

Do not synthesize on page load/selection and do not autoplay. Drive the visible button from each
pronunciation's `audio_availability`:

- `supported`: enabled request button (the synthesis endpoint arrives in Milestone 7).
- `unavailable`: disabled temporary-unavailability message.
- `unsupported`: visible, disabled “ยังไม่พร้อมให้บริการเสียงอ่าน”.

Keep pronunciation ID/revision with every request, stop previous playback when the entry changes,
and label generated output “เสียงสังเคราะห์”. Northern Thai must never route to the Isan provider.

## Not-yet-available workflows

Document upload/page geometry/correction/job APIs, stable dataset releases/exports, and audio
synthesis/playback endpoints are intentionally not advertised as successful placeholders. Consult
`IMPLEMENTATION_STATUS.md` before integrating those workflows.

