"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-[4.5rem] md:px-10">
        <Link href="/" className="rounded-sm" aria-label={`${site.name}, início`}>
          <Logo />
        </Link>
        <nav aria-label="Seções">
          <ul className="flex items-center gap-4 text-sm text-foreground sm:gap-7 md:text-[15px]">
            {site.nav.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="rounded-sm hover:text-accent"
                  onClick={() => track("cta_clicked", { cta: `nav_${item.id}` })}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
