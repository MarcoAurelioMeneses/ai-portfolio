import { site } from "@/content/site";
import { emptySubject, contactFormSchema } from "@/lib/contact/schema";
import { insertContactMessage, contactStoreConfigured } from "@/lib/contact/store";
import { chatConfig } from "@/lib/config";
import { reportServerError } from "@/lib/observability/sentry";
import { isSameOriginRequest } from "@/lib/security/origin";
import { getClientIp, hashClientKey } from "@/lib/rate-limit/identity";
import { getRateLimitStore } from "@/lib/rate-limit";

export const maxDuration = 15;

function jsonError(status: number, error: string, message: string, headers?: HeadersInit) {
  return Response.json({ error, message }, { status, headers });
}

function validationMessage(path: PropertyKey | undefined): string {
  if (path === "name") return site.contact.form.errors.name;
  if (path === "email") return site.contact.form.errors.email;
  if (path === "message") return site.contact.form.errors.message;
  return site.contact.form.errors.invalid;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return jsonError(403, "forbidden", site.contact.form.errors.generic);
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError(400, "invalid", site.contact.form.errors.invalid);
  }

  const parsed = contactFormSchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(400, "invalid", validationMessage(parsed.error.issues[0]?.path[0]));
  }

  if (!contactStoreConfigured()) {
    return jsonError(503, "unconfigured", site.contact.form.errors.unconfigured);
  }

  const config = chatConfig();
  const limiter = getRateLimitStore();
  const clientKey = `contact:${hashClientKey(getClientIp(request))}`;
  let rate: Awaited<ReturnType<typeof limiter.consume>>;
  try {
    rate = await limiter.consume(clientKey, config.contactDailyLimit, config.windowMs);
  } catch (error) {
    await reportServerError(error, { area: "contact-rate-limit", provider: limiter.name });
    return jsonError(500, "rate_limit_unavailable", site.contact.form.errors.generic);
  }

  if (!rate.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000));
    return jsonError(429, "rate_limited", site.contact.form.errors.rateLimited, {
      "Retry-After": String(retryAfter),
      "X-RateLimit-Remaining": "0",
    });
  }

  if (parsed.data.website?.trim()) {
    return Response.json({ ok: true });
  }

  try {
    await insertContactMessage({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: emptySubject(parsed.data.subject),
      message: parsed.data.message,
    });
  } catch (error) {
    await reportServerError(error, { area: "contact-insert" });
    return jsonError(500, "contact_failed", site.contact.form.errors.generic);
  }

  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store", "X-RateLimit-Remaining": String(rate.remaining) } },
  );
}
