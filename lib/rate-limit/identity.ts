import { createHash } from "node:crypto";

export function hashClientKey(
  ip: string,
  salt: string = process.env.RATE_LIMIT_SALT ?? "portfolio-chat",
): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "local";
}
