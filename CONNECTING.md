# Connecting the คำภีร์ frontend to the backend

Every screen talks to the backend, by default the deployed one at
**https://kumpee-be.vercel.app**. The backend source is `../thai-dic`. There
are no mocks left; `/read/demo` is the only labelled sample.

```
browser ──fetch("/api/kamphee/v1/…")──▶ Next route handler (server)
                                          adds Authorization: Bearer <token>
                                          ──▶ ${KAMPHEE_API_BASE}/v1/…  (backend)

/search (server component) ──────────────▶ ${KAMPHEE_API_BASE}/v1/…  (same token)
```

---

## 1. Set the environment

Copy `.env.example` to `.env.local` in this folder (not in `node_modules/`):

```bash
KAMPHEE_API_BASE=https://kumpee-be.vercel.app                 # optional; default
NEXT_PUBLIC_SUPABASE_URL=https://ywbvftgqxttodiybvhvs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon / publishable key>        # required for login
KAMPHEE_API_TOKEN=                                            # optional fallback, usually empty
```

Restart `npm run dev` after editing.

### How auth works

The backend has **no login endpoints**. It only verifies bearer tokens: Supabase
JWTs from the project in `KAMPHEE_AUTH_ISSUER`, or `kh_` API keys. So:

1. `/login` signs users in with **Supabase Auth**, using email/password,
   sign-up, or an email link. Email links land on `/auth/callback`. The session
   is stored in cookies, and `middleware.ts` keeps it refreshed.
2. The proxy and the `/search` page send the **signed-in user's JWT** as
   `Authorization: Bearer …`. Documents and results are then owned by that user.
3. If nobody is signed in, they use `KAMPHEE_API_TOKEN` if set. Otherwise the
   request goes out anonymously.

The anon key is safe to put in the browser. **Never** put the Supabase
`service_role` key in the frontend.

`KAMPHEE_API_TOKEN` is **not** needed for normal use. Setting it gives every
anonymous visitor AI access on one shared key, billed and rate-limited as that
key's owner. Use `kh_` keys for scripts and server-to-server calls. A
signed-in user creates one with `POST /v1/api-keys` (see
`thai-dic/docs/developer-api.md`).

### What works signed out

| Feature | Endpoint | Signed in? |
|---|---|---|
| Dictionary search (word found) | `GET /v1/entries?query=` | no |
| Word meaning in sentence sidebar / Live | `GET /v1/entries`, `GET /v1/entries/{id}` | no |
| Sources, capabilities | `GET /v1/sources`, `GET /v1/capabilities` | no |
| AI explanation, sentence analysis | `POST /v1/search` | **yes** |
| Translate card | `POST /v1/translate` | **yes** |
| ปรับข้อความ | `POST /v1/rewrite` | **yes** |
| คำแปล Live | `POST /v1/live/assist` | **yes** |
| คำอ่าน (upload, reader, assist, correction) | `/v1/documents/*` | **yes** |
| Audio button | `POST /v1/pronunciations/{id}/audio` | **yes** |

Signed out, `/search` falls back to the public dictionary and links to
`/login`. Other auth-only calls show "กรุณาเข้าสู่ระบบก่อนใช้งานส่วนนี้".

---

## 2. Code map

| File | Role |
|---|---|
| `lib/api/backend.ts` | Server-only base URL + credential (user JWT, else `KAMPHEE_API_TOKEN`). |
| `lib/supabase/*`, `middleware.ts` | Supabase Auth clients and session refresh. |
| `app/login`, `app/auth/callback` | Login page and email-link callback. |
| `app/api/kamphee/[...path]/route.ts` | Proxy for browser calls; only `/v1/*`; streams bodies (JSON, multipart, audio ranges). |
| `lib/api/server.ts` | Server-component calls (the `/search` page). |
| `lib/api/client.ts` | Browser calls through the proxy. |
| `lib/api/wire.ts` | Exact backend response types (from its OpenAPI). |
| `lib/api/documentTypes.ts` | Exact document/page/assist types. |
| `lib/api/adapt.ts` | Maps backend responses onto the display model. |
| `lib/api/types.ts` | Envelope, request bodies, and the display model components render. |

If the backend changes a response shape, update `wire.ts`/`documentTypes.ts`
and `adapt.ts`. Components should not need changes.

### How backend data maps to the UI

- **Dictionary entries** (`dictionary_results[]` / `GET /v1/entries`) become
  one `SourceBlock` per entry. Entries are never merged across sources.
  Dialect entries show their variety. Older-edition duplicates
  (`presentation: "secondary"`) are collapsed.
- **Generated sections** (`{status, content, creation_method, review_status}`)
  become `AiBlock`s labelled with `generation.provider` / `generation.model`.
  `intents`/`mood`/`tone`/`formality` feed the interpretation tiles.
- **`matched_terms`** (sentence view) are tappable spans. The sidebar loads
  the candidate entries with the public `GET /v1/entries/{id}`.
- **Web sources** (`sources[]` with `type: "web"`) appear in the web evidence
  card on AI-only results.
- **Warnings** (`data.warnings`, e.g. preservation checks on rewrite) are shown
  with the result.

---

## 3. Protocol notes

- **Live** follows §7. It debounces the selection, sends `analyze` (no
  `target`), and sends `rewrite` only on request. A response is rendered only
  if the echoed `document_revision` and `selection_sequence` still match the
  editor.
- **Documents**: upload returns `data.document.id`, then the reader polls
  `GET /v1/documents/{id}` until `state` is `ready`/`partial`. A selection
  sends `{revision, ranges:[{page_number,start,end}], selected_text_sha256,
  task}`. The hash is the hex SHA-256 of the selected text, and `revision` is
  the page's document `revision`. Corrections send that same revision as
  `expected_revision`.
- **Audio** is requested only on click. The button polls `GET /v1/audio/{id}`
  while preparing, then plays `playback_url` through the proxy. The deployed
  backend currently reports audio as unavailable, so the button stays disabled.
- Retry only when `error.retryable` is true. On 429, honor `Retry-After`.

---

## 4. Verify the connection

```bash
npm run dev

# public — works with no token
curl -s "http://localhost:3000/api/kamphee/v1/entries?query=%E0%B8%95%E0%B8%B2" | head -c 300
open "http://localhost:3000/search?q=ตา"

# auth-only — AUTHENTICATION_REQUIRED from curl (no session); works in the browser after /login
curl -s -X POST http://localhost:3000/api/kamphee/v1/search \
  -H 'content-type: application/json' -d '{"text":"ตา"}'
```

---

## 5. Still not backed by an endpoint

- **เสนอคำ** (`/klangkham/submit`): the backend has no public submission
  endpoint yet (only admin candidate review), so the form stays local.
- **Dataset export** on `/klangkham`: `/v1/dataset/exports` exists but is not
  public (`capabilities.tasks.dataset_exports.public_access: false`).
