import "server-only";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function originOf(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function headerOrigin(request: Request, header: string, protoHeader: string): string | null {
  const host = request.headers.get(header)?.split(",")[0]?.trim();
  if (!host) return null;
  const proto = request.headers.get(protoHeader)?.split(",")[0]?.trim() || "https";
  return originOf(`${proto}://${host}`);
}

/** Origins this deployment will accept for a browser POST. */
export function allowedOrigins(request: Request): Set<string> {
  const origins = new Set<string>();
  const requestOrigin = originOf(request.url);
  if (requestOrigin) origins.add(requestOrigin);

  const configured = originOf(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) origins.add(configured);

  const trustProxy = process.env.TRUST_PROXY_HEADERS === "true";
  if (trustProxy) {
    const forwarded = headerOrigin(request, "x-forwarded-host", "x-forwarded-proto");
    if (forwarded) origins.add(forwarded);
  }

  const vercel = headerOrigin(request, "x-vercel-forwarded-host", "x-forwarded-proto");
  if (vercel) origins.add(vercel);

  return origins;
}

/**
 * Browser chat calls must come from this site. A missing Origin is rejected in
 * production so a cross-site page cannot spend the OpenAI key.
 */
export function isSameOriginRequest(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (origin) {
    const parsed = originOf(origin);
    return parsed !== null && allowedOrigins(request).has(parsed);
  }

  if (fetchSite === "same-origin" || fetchSite === "same-site") return true;

  const host = new URL(request.url).hostname;
  return process.env.NODE_ENV !== "production" && LOCAL_HOSTS.has(host);
}
