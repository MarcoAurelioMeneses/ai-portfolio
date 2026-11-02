"use client";

import { SiteFooter } from "@/components/layout/site-footer";
import { ContactForm } from "@/components/sections/contact-form";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";

export function ContactSection() {
  return (
    <section id={site.contact.id} className="scroll-mt-24" aria-labelledby="contact-title">
      <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-6xl flex-col px-5 pt-20 md:px-10 md:pt-28">
        <h2
          id="contact-title"
          className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl"
        >
          {site.contact.title}
        </h2>
        <a
          href={`mailto:${site.contact.email}`}
          className="mt-8 w-fit text-lg text-accent sm:text-xl"
          onClick={() => track("cta_clicked", { cta: "email" })}
        >
          {site.contact.email}
        </a>
        <ul className="mt-8 space-y-3 text-lg">
          {site.contact.links.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-sm hover:text-accent"
                onClick={() => track("cta_clicked", { cta: link.id })}
              >
                {link.label}
                <ArrowUpRightIcon className="size-4 text-accent dark:text-foreground" />
              </a>
            </li>
          ))}
        </ul>
        <ContactForm />
        <div className="mt-auto pt-16">
          <SiteFooter />
        </div>
      </div>
    </section>
  );
}
