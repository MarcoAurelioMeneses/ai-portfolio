# Marco Aurélio — portfolio

Personal site for Marco Aurélio. The interface is a minimal black-and-white layout (graphite text, one green accent, monospace tags) and ships with a streaming chat agent that answers from the same content the page renders.

Visible copy is Brazilian Portuguese. Code, comments, and this document are English.

## Stack

- Next.js (App Router) and TypeScript
- Tailwind CSS v4 and `next-themes` for light and dark
- Vercel AI SDK streaming to OpenAI (`gpt-4o-mini` by default)
- Optional Langfuse, PostHog, and Sentry. The site builds and runs when none of them are set.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without `OPENAI_API_KEY` the page still renders. Opening the chat and sending a message shows a configuration notice instead of calling a model.

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

## Content

`content/site.ts` is the only copy of the biography, cases, experience, stack, and contact details. Sections and case pages import it directly. `content/knowledge.ts` turns that object into plain-text chunks. The chat system prompt is built from those chunks, so the agent and the page cannot drift.

Clients and employers are stored only as anonymized labels. Do not put real organization names back into `content/site.ts` or the system prompt. Context, solution, and stack on each case are placeholders (marked with a TODO in that file) until they are reviewed. Result lines keep only the agreed figures.

Update the GitHub URL in `content/site.ts` before launch. A public profile matching this name was not verified, so the current href is a placeholder.

## Folder conventions

Import the module you need with the `@/` alias. There are no barrel files: a barrel would hide the dependency graph and make circular imports easier.

| Path | Holds |
| --- | --- |
| `components/layout` | Header, footer, logo, providers |
| `components/sections` | Home sections and the shared case facts |
| `components/chat` | Panel, context, and the contact card the agent can show |
| `components/ui` | Tag, icons, theme toggle |
| `content` | Typed copy. The only source for the page and the agent |
| `lib/agent` | Prompt, tools, retrieval, message validation |
| `lib/security` | Origin check and log/trace scrubbing |
| `lib/rate-limit` | Pluggable daily limiter |
| `app/api/chat` | The only route that calls OpenAI |

## Architecture

```
content/site.ts                 typed portfolio content
content/knowledge.ts            chunks shared by the prompt and a future index
lib/agent/retriever.ts          KnowledgeRetriever (static now, pgvector later)
lib/agent/prompt.ts             system prompt
lib/agent/tools.ts              scroll_to, show_contact
app/api/chat/route.ts           streaming POST
lib/rate-limit/                 memory | upstash | supabase
app/cases/[slug]/page.tsx       one page per case
```

### Chat

`POST /api/chat` streams with the AI SDK (`streamText` → `toUIMessageStreamResponse`). The model is `OPENAI_MODEL` or `gpt-4o-mini`. Output length is capped by `CHAT_MAX_OUTPUT_TOKENS`.

The assistant replies in the visitor's language and may call two tools:

- `scroll_to` — scrolls to `sobre`, `cases`, `experiencia`, `stack`, or `contato` on the home page. A case id opens `/cases/[slug]`.
- `show_contact` — renders the contact card inside the chat

The hero field "Pergunte ao meu agente" sends the question into the panel. The floating button opens it as well. UI actions run in the browser from the tool results on the message stream. The assistant is instructed to keep the anonymized labels and not to invent metrics. No vector database is required.

### Retrieval, ready for pgvector

`KnowledgeRetriever.retrieve(query)` is the only read path the prompt uses.

- `KNOWLEDGE_PROVIDER=static` (default) returns every chunk. The corpus is small, so it is pasted into the system prompt.
- `KNOWLEDGE_PROVIDER=pgvector` embeds the query with `text-embedding-3-small` and calls the Supabase RPC `match_knowledge`. If the extension, table, or key is missing, it falls back to the static chunks.

`supabase/migrations/0001_rate_limit_and_knowledge.sql` creates `knowledge_chunks` (`vector(1536)`) and `match_knowledge`. Populate that table from `buildKnowledgeChunks()` when you turn retrieval on. Nothing in the chat route needs to change besides the env var.

### Rate limit

About 20 messages per hashed IP per 24 hours (`CHAT_RATE_LIMIT_PER_DAY`, hard-capped at 100). The raw IP is not stored. Forwarded IP headers are trusted only when the platform overwrites them, or when `TRUST_PROXY_HEADERS=true`. `RATE_LIMIT_PROVIDER`:

| Value | Behavior |
| --- | --- |
| `memory` | Process-local map. Default. Fine for one Node server, not shared across serverless instances. |
| `upstash` | Fixed window in Upstash Redis. Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. |
| `supabase` | `consume_rate_limit` RPC. Requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the migration. |

If the selected provider is missing credentials, the route logs a warning and uses memory so chat does not go down.

### Observability

All three are skipped when their env vars are empty.

- **Langfuse** (`LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, optional `LANGFUSE_BASE_URL`): one trace and one generation per reply, with token counts, latency, and an estimated USD cost for `gpt-4o-mini`. Emails, IP addresses, and credential-shaped strings are redacted before the trace is sent.

The public chat endpoint is the main cost and abuse surface. See [SECURITY.md](SECURITY.md) for the threat model, the same-origin check, and the recommendation to set a monthly spend limit in the OpenAI dashboard.
- **PostHog** (`NEXT_PUBLIC_POSTHOG_KEY`, optional `NEXT_PUBLIC_POSTHOG_HOST`): `cta_clicked`, `chat_opened`, `message_sent`, `contact_submitted`. Message text and contact details are not sent. `contact_submitted` only records whether a subject was filled in.

### Contact form

The Contato section posts to `POST /api/contact`. Zod checks name, email, optional subject, and message length. A honeypot field (`website`) returns success without writing a row. The same rate-limit store as chat applies, with a separate key and a default of 5 submissions per hashed IP per day (`CONTACT_RATE_LIMIT_PER_DAY`). The route uses the same origin check and does not store an IP address.

Rows go to `contact_messages` (`supabase/migrations/0002_contact_messages.sql`) with `status = 'new'`. RLS is enabled and there are no policies for the public roles; the API inserts with `SUPABASE_SERVICE_ROLE_KEY`. If those env vars are unset, the form shows a friendly error and the email link remains. A separate process should read `status = 'new'`, email Marco, then set `status = 'forwarded'` and `forwarded_at`.
- **Sentry** (`SENTRY_DSN` and/or `NEXT_PUBLIC_SENTRY_DSN`): server and client exceptions. The Next config is not wrapped with the Sentry webpack plugin, so builds do not need `SENTRY_AUTH_TOKEN`.

## Deploy

### Vercel

Import the repository. Framework preset is Next.js. Add the variables from `.env.example`. Use `RATE_LIMIT_PROVIDER=upstash` or `supabase` in production so the daily cap is shared across instances. The chat route sets `maxDuration` to 30 seconds.

### Railway

This is the intended host. `railway.json` tells Nixpacks to run `npm run build` and `npm run start` (`next start`, which listens on `PORT`).

1. Create a service from this repo. Railway reads `railway.json`.
2. Set the variables from `.env.example`. Set `TRUST_PROXY_HEADERS=true` so the per-IP limits use Railway's `x-forwarded-for`. Set `NEXT_PUBLIC_SITE_URL` to the public origin, for example `https://your-app.up.railway.app`.
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and apply `supabase/migrations` in the Supabase SQL editor. Without them the page still loads and the contact form explains that it is not configured.
4. Use `RATE_LIMIT_PROVIDER=upstash` or `supabase` before running more than one replica. One replica can stay on `memory`.
5. Health check is `GET /`.

A separate worker, not this web service, should forward new contact rows.

## Accessibility

The page uses one `main`, a skip link, labelled navigation, and a dialog for the chat (Escape to close, focus returns to the control that opened it). Theme follows the system until the visitor toggles it. Accent green matches the mockups; body text stays near-black or near-white so the long-form copy meets contrast, while the green labels follow the design.
