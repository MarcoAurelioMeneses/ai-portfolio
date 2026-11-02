"use client";

import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { useChatPanel } from "@/components/chat/chat-context";

export function HeroSection() {
  const { openChat } = useChatPanel();

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

      <div className="mt-12 flex flex-col items-start gap-4">
        <button
          type="button"
          className="inline-flex h-14 items-center justify-center rounded-lg bg-foreground px-8 text-base font-medium text-background"
          onClick={() => {
            track("cta_clicked", { cta: "pergunte_agente" });
            openChat("hero");
          }}
        >
          {site.hero.agentCta.label}
        </button>
        <div className="flex flex-wrap gap-3">
          <a
            href={site.hero.primaryCta.href}
            className="inline-flex h-12 min-w-36 items-center justify-center rounded-lg border border-foreground/30 px-6 text-sm font-medium text-foreground"
            onClick={() => track("cta_clicked", { cta: site.hero.primaryCta.id })}
          >
            {site.hero.primaryCta.label}
          </a>
          <a
            href={site.hero.secondaryCta.href}
            className="inline-flex h-12 min-w-36 items-center justify-center rounded-lg border border-foreground/30 px-6 text-sm font-medium text-foreground"
            onClick={() => track("cta_clicked", { cta: site.hero.secondaryCta.id })}
          >
            {site.hero.secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
