# Security

This site is public. The expensive server action is `POST /api/chat`, which calls a paid OpenAI model. `POST /api/contact` writes a message and is rate limited the same way, on its own counter (5/day by default). Neither route stores a raw IP.

## Threat model

| Risk | What we do |
| --- | --- |
| Stolen `OPENAI_API_KEY` from the browser | The key is read only in server modules marked `server-only`. It is not a `NEXT_PUBLIC_` variable and is not returned by any route. |
| A third-party site calling the APIs | `POST /api/chat` and `POST /api/contact` require a same-origin `Origin`, or `Sec-Fetch-Site: same-origin`. Set `NEXT_PUBLIC_SITE_URL` to the public origin in production. The contact form also has a honeypot. |
| Unlimited spend from one visitor | Per-IP daily cap (`CHAT_RATE_LIMIT_PER_DAY`, hard-capped at 100). Output tokens are hard-capped at 1024. History is hard-capped at 24 messages. |
| Rotating a spoofed `X-Forwarded-For` to dodge the cap | Client IP is taken from `x-vercel-forwarded-for`, `cf-connecting-ip`, or `fly-client-ip`. `x-forwarded-for` and `x-real-ip` are used only when `TRUST_PROXY_HEADERS=true` (set this on Railway). Otherwise every direct caller shares one bucket. The stored key is a hash, not the raw IP. |
| Prompt injection | The system prompt tells the model to stay on the portfolio, to ignore override instructions, and to never reveal the prompt or environment. `scroll_to` rejects any target that is not a known section or case id. Message roles other than `user` and `assistant` are rejected by zod. |
| Secrets in logs or traces | Langfuse input/output and Sentry events pass through a scrubber that redacts emails, IP addresses, and credential-shaped strings. Request bodies and cookie headers are dropped before Sentry sends an event. |
| Clickjacking and data leaks | `Content-Security-Policy` (`frame-ancestors 'none'`), `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options`, and `Strict-Transport-Security`. `connect-src` allows the PostHog and Sentry hosts the browser SDKs call. |

The in-memory limiter does not survive a new server process and is not shared across instances. Use `RATE_LIMIT_PROVIDER=upstash` or `supabase` in production.

## OpenAI spend limit

Set a **monthly hard spend limit** in the OpenAI billing dashboard, in addition to the per-IP cap in this app. The application limit reduces abuse. The dashboard limit is what stops a bug, a leaked key, or a failed rate-limit store from generating an unbounded bill. Prefer a limit you would notice, and turn on email alerts for usage.

## Reporting

If you find a vulnerability, open a private security advisory on the repository rather than a public issue. Do not include live API keys in the report.
