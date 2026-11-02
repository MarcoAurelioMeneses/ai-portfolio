"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";

const inputClass =
  "mt-2 h-12 w-full rounded-lg border border-border bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted";

export function ContactForm() {
  const copy = site.contact.form;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, website }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string; ok?: boolean } | null;
      if (!response.ok || !data?.ok) {
        setStatus("error");
        setFeedback(typeof data?.message === "string" ? data.message : copy.errors.generic);
        return;
      }
      track("contact_submitted", { has_subject: subject.trim().length > 0 });
      setStatus("success");
      setFeedback(copy.success);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setWebsite("");
    } catch {
      setStatus("error");
      setFeedback(copy.errors.generic);
    }
  }

  return (
    <form className="relative mt-12 max-w-xl space-y-5" onSubmit={onSubmit} noValidate>
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

      <div>
        <label htmlFor="contact-name" className="text-sm">
          {copy.name}
        </label>
        <input
          id="contact-name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          value={name}
          className={inputClass}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="text-sm">
          {copy.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={200}
          autoComplete="email"
          value={email}
          className={inputClass}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="contact-subject" className="text-sm">
          {copy.subject} <span className="text-muted">({copy.optional})</span>
        </label>
        <input
          id="contact-subject"
          name="subject"
          maxLength={120}
          value={subject}
          className={inputClass}
          onChange={(event) => setSubject(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-sm">
          {copy.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          value={message}
          className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-3 text-base text-foreground outline-none placeholder:text-muted"
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-12 items-center justify-center rounded-lg bg-foreground px-6 text-sm font-medium text-background disabled:opacity-50"
      >
        {status === "sending" ? copy.sending : copy.submit}
      </button>

      {feedback ? (
        <p role="status" className="text-sm text-foreground">
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
