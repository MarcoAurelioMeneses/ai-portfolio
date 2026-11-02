"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useTheme } from "next-themes";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";

const fieldClass =
  "mt-2 w-full rounded-md border border-border bg-transparent px-3 font-sans text-sm text-foreground outline-none placeholder:font-sans placeholder:text-muted";

function subscribe() {
  return () => {};
}

type FieldName = "name" | "email" | "message";

export function ContactForm() {
  const copy = site.contact.form;
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const messagePlaceholder =
    mounted && resolvedTheme === "dark" ? copy.placeholders.messageDark : copy.placeholders.message;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [banner, setBanner] = useState("");
  const [fieldError, setFieldError] = useState<FieldName | null>(null);

  function resetForm() {
    setStatus("idle");
    setBanner("");
    setFieldError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setBanner("");
    setFieldError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, website }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string; ok?: boolean } | null;
      if (!response.ok || !data?.ok) {
        const messageText = typeof data?.message === "string" ? data.message : copy.errors.banner;
        const field =
          messageText === copy.errors.name
            ? "name"
            : messageText === copy.errors.email
              ? "email"
              : messageText === copy.errors.message
                ? "message"
                : null;
        const specific =
          messageText === copy.errors.unconfigured || messageText === copy.errors.rateLimited
            ? messageText
            : copy.errors.banner;
        setFieldError(field);
        setBanner(field ? copy.errors.banner : specific);
        setStatus("error");
        return;
      }
      track("contact_submitted", { has_subject: subject.trim().length > 0 });
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setWebsite("");
    } catch {
      setBanner(copy.errors.banner);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div>
        <p className="text-center font-mono text-sm tracking-wide text-accent">/ {copy.successTag} /</p>
        <div className="mt-3 rounded-xl border border-border px-6 py-14 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent text-white" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12.5 10 16.5 18 8" />
            </svg>
          </div>
          <h3 className="mt-6 text-2xl font-semibold tracking-tight">{copy.successTitle}</h3>
          <p className="mt-2 text-sm text-muted">{copy.successBody}</p>
          <button
            type="button"
            className="mt-8 inline-flex h-10 items-center justify-center rounded-md border border-accent px-4 text-sm text-accent"
            onClick={resetForm}
          >
            {copy.another}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {status === "error" ? (
        <p className="text-center font-mono text-sm tracking-wide text-red-500">/ {copy.errorTag} /</p>
      ) : null}
      <form className={status === "error" ? "relative mt-3" : "relative"} onSubmit={onSubmit} noValidate>
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="contact-website">{copy.honeypot}</label>
          <input
            id="contact-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        <div className="rounded-xl border border-border p-5 sm:p-6">
          {banner ? (
            <p role="alert" className="mb-5 rounded-md bg-red-50 px-3 py-3 text-center text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {banner}
            </p>
          ) : null}

          <div>
            <label htmlFor="contact-name" className="text-sm font-medium">
              {copy.name}
            </label>
            <input
              id="contact-name"
              name="name"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              placeholder={copy.placeholders.name}
              value={name}
              aria-invalid={fieldError === "name"}
              className={`${fieldClass} h-11 ${fieldError === "name" ? "border-red-500" : ""}`}
              onChange={(event) => setName(event.target.value)}
            />
            {fieldError === "name" ? <p className="mt-1 text-xs text-red-500">{copy.errors.name}</p> : null}
          </div>

          <div className="mt-4">
            <label htmlFor="contact-email" className="text-sm font-medium">
              {copy.email}
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              placeholder={copy.placeholders.email}
              value={email}
              aria-invalid={fieldError === "email"}
              className={`${fieldClass} h-11 ${fieldError === "email" ? "border-red-500" : ""}`}
              onChange={(event) => setEmail(event.target.value)}
            />
            {fieldError === "email" ? <p className="mt-1 text-xs text-red-500">{copy.errors.email}</p> : null}
          </div>

          <div className="mt-4">
            <label htmlFor="contact-subject" className="text-sm font-medium">
              {copy.subject} <span className="font-normal text-muted">({copy.optional})</span>
            </label>
            <input
              id="contact-subject"
              name="subject"
              maxLength={120}
              placeholder={copy.placeholders.subject}
              value={subject}
              className={`${fieldClass} h-11`}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="contact-message" className="text-sm font-medium">
              {copy.message}
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              placeholder={messagePlaceholder}
              value={message}
              aria-invalid={fieldError === "message"}
              className={`${fieldClass} py-3 ${fieldError === "message" ? "border-red-500" : ""}`}
              onChange={(event) => setMessage(event.target.value)}
            />
            {fieldError === "message" ? <p className="mt-1 text-xs text-red-500">{copy.errors.message}</p> : null}
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-foreground text-sm font-medium text-background disabled:opacity-60"
          >
            {status === "sending" ? copy.sending : copy.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
