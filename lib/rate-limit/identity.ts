import "server-only";
import { createHash } from "node:crypto";

const IPV4 = /^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const IPV6 = /^[0-9a-f:.]{2,45}$/i;

export function hashClientKey(
  ip: string,
  salt: string = process.env.RATE_LIMIT_SALT ?? "portfolio-chat",
): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function firstValidIp(header: string | null): string | null {
  const candidate = header?.split(",")[0]?.trim();
  if (!candidate) return null;
  if (IPV4.test(candidate)) return candidate;
  if (candidate.includes(":") && IPV6.test(candidate)) return candidate;
  return null;
}

/**
 * Uses only headers that the platform overwrites, plus x-forwarded-for when
 * TRUST_PROXY_HEADERS=true. A client-supplied forwarding header cannot mint a
 * fresh rate-limit bucket.
 */
export function getClientIp(request: Request): string {
  const platform =
    firstValidIp(request.headers.get("x-vercel-forwarded-for")) ??
    firstValidIp(request.headers.get("cf-connecting-ip")) ??
    firstValidIp(request.headers.get("fly-client-ip"));
  if (platform) return platform;

  if (process.env.TRUST_PROXY_HEADERS === "true") {
    return (
      firstValidIp(request.headers.get("x-real-ip")) ??
      firstValidIp(request.headers.get("x-forwarded-for")) ??
      "direct"
    );
  }

  return "direct";
}
