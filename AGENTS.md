<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Folder conventions

Keep imports on the `@/` alias and do not add barrel `index.ts` files. Import the module that owns the symbol.

- `components/layout` — header, footer, logo, providers
- `components/sections` — page sections and case facts
- `components/chat` — chat panel and its context
- `components/ui` — presentational pieces (tag, icons, theme toggle)
- `content` — Portuguese copy, the single source for the UI and the agent
- `lib/agent`, `lib/security`, `lib/rate-limit`, `lib/observability` — server-side chat behavior

`OPENAI_API_KEY` and other secrets stay in server modules (`import "server-only"`). Do not read them from a client component. See `SECURITY.md` before changing `/api/chat`.
