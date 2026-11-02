"use client";

import posthog from "posthog-js";

let started = false;

export function initAnalytics(): void {
  if (started || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: true,
    persistence: "localStorage",
    person_profiles: "identified_only",
  });
  started = true;
}

export function track(
  event: "cta_clicked" | "chat_opened" | "message_sent",
  properties?: Record<string, string | number | boolean>,
): void {
  if (!started) return;
  posthog.capture(event, properties);
}
