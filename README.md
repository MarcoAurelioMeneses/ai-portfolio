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
components/                     page sections and the chat panel
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

About 20 messages per hashed IP per 24 hours (`CHAT_RATE_LIMIT_PER_DAY`). The raw IP is not stored. `RATE_LIMIT_PROVIDER`:

| Value | Behavior |
| --- | --- |
| `memory` | Process-local map. Default. Fine for one Node server, not shared across serverless instances. |
| `upstash` | Fixed window in Upstash Redis. Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. |
| `supabase` | `consume_rate_limit` RPC. Requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the migration. |

If the selected provider is missing credentials, the route logs a warning and uses memory so chat does not go down.

### Observability

All three are skipped when their env vars are empty.

- **Langfuse** (`LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, optional `LANGFUSE_BASE_URL`): one trace and one generation per reply, with input/output tokens, latency, and an estimated USD cost for `gpt-4o-mini`.
- **PostHog** (`NEXT_PUBLIC_POSTHOG_KEY`, optional `NEXT_PUBLIC_POSTHOG_HOST`): `cta_clicked`, `chat_opened`, `message_sent`. Message text is not sent, only the length.
- **Sentry** (`SENTRY_DSN` and/or `NEXT_PUBLIC_SENTRY_DSN`): server and client exceptions. The Next config is not wrapped with the Sentry webpack plugin, so builds do not need `SENTRY_AUTH_TOKEN`.

## Deploy

### Vercel

Import the repository. Framework preset is Next.js. Add the variables from `.env.example`. Use `RATE_LIMIT_PROVIDER=upstash` or `supabase` in production so the daily cap is shared across instances. The chat route sets `maxDuration` to 30 seconds.

### Railway

Create a service from this repo. Nixpacks detects Node and runs `npm run build`. Start command: `npm start` (`next start`). Set the same environment variables in the service. The in-memory limiter is acceptable on a single replica; switch providers before you scale out.

## Accessibility

The page uses one `main`, a skip link, labelled navigation, and a dialog for the chat (Escape to close, focus returns to the control that opened it). Theme follows the system until the visitor toggles it. Accent green matches the mockups; body text stays near-black or near-white so the long-form copy meets contrast, while the green labels follow the design.
