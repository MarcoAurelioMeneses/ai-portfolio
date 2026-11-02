"use client";

import { useState, type FormEvent } from "react";
import { SendIcon } from "@/components/ui/icons";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { useChatPanel } from "@/components/chat/chat-context";

export function HeroSection() {
  const { ask } = useChatPanel();
  const [question, setQuestion] = useState("");

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = question.trim();
    if (!value) return;
    track("cta_clicked", { cta: "pergunte_agente" });
    ask(value);
    setQuestion("");
  }

  return (
    <section
      id="inicio"
      className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-6xl flex-col justify-center px-5 py-16 md:px-10 md:py-24"
    >
      <h1 className="max-w-4xl text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
        {site.name}
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-foreground sm:text-xl">
        {site.tagline.lead}
        <span className="text-accent">{site.tagline.accent}</span>
        {site.tagline.tail}
      </p>

      <form className="mt-10 w-full max-w-3xl" onSubmit={submitQuestion}>
        <label htmlFor="hero-question" className="font-mono text-sm tracking-wide text-accent">
          / {site.hero.agentCta.label} /
        </label>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border py-1.5 pr-1.5 pl-4">
          <input
            id="hero-question"
            value={question}
            maxLength={2000}
            autoComplete="off"
            placeholder={site.hero.placeholder}
            className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted"
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button
            type="submit"
            aria-label={site.chat.sendLabel}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-white"
          >
            <SendIcon className="size-5" />
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={site.hero.primaryCta.href}
          className="inline-flex h-12 min-w-36 items-center justify-center rounded-lg bg-foreground px-6 text-sm font-medium text-background"
          onClick={() => track("cta_clicked", { cta: site.hero.primaryCta.id })}
        >
          {site.hero.primaryCta.label}
        </a>
        <a
          href={site.hero.secondaryCta.href}
          className="inline-flex h-12 min-w-36 items-center justify-center rounded-lg border border-foreground/70 px-6 text-sm font-medium text-foreground"
          onClick={() => track("cta_clicked", { cta: site.hero.secondaryCta.id })}
        >
          {site.hero.secondaryCta.label}
        </a>
      </div>
    </section>
  );
}
