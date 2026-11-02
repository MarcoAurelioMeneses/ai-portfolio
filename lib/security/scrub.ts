const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const IPV6 = /\b(?:[a-f0-9]{1,4}:){2,}[a-f0-9:]+\b/gi;
const SECRET = /\b(?:sk-[A-Za-z0-9_-]{8,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,})\b/g;

/** Redact emails, IP addresses, and credential-shaped strings before they are logged or traced. */
export function scrubText(value: string): string {
  return value
    .replace(EMAIL, "[email]")
    .replace(IPV4, "[ip]")
    .replace(IPV6, "[ip]")
    .replace(SECRET, "[secret]");
}

type ScrubbableEvent = {
  message?: string;
  extra?: unknown;
  request?: {
    cookies?: unknown;
    data?: unknown;
    headers?: Record<string, string | undefined>;
  };
  exception?: { values?: Array<{ value?: string }> };
};

/** Drops request bodies and redacts strings before Sentry stores an event. */
export function scrubSentryEvent<T extends ScrubbableEvent>(event: T): T {
  if (event.message) event.message = scrubText(event.message);
  for (const item of event.exception?.values ?? []) {
    if (item.value) item.value = scrubText(item.value);
  }
  if (event.extra) event.extra = scrubUnknown(event.extra);
  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;
    const headers = event.request.headers;
    if (headers) {
      for (const key of Object.keys(headers)) {
        if (/cookie|authorization|token|key/i.test(key)) delete headers[key];
      }
    }
  }
  return event;
}

export function scrubUnknown(value: unknown): unknown {
  if (typeof value === "string") return scrubText(value);
  if (Array.isArray(value)) return value.map((item) => scrubUnknown(item));
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      output[key] = scrubUnknown(item);
    }
    return output;
  }
  return value;
}
