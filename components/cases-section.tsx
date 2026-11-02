import Link from "next/link";
import { CaseFacts } from "@/components/case-facts";
import { Tag } from "@/components/tag";
import { site } from "@/content/site";

export function CasesSection() {
  return (
    <section id={site.casesSection.id} className="scroll-mt-24" aria-labelledby="cases-title">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
        <h2 id="cases-title" className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          {site.casesSection.title}
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {site.cases.map((item) => (
            <article key={item.id} id={`case-${item.id}`} className="scroll-mt-28">
              <Link
                href={`/cases/${item.id}`}
                className="block h-full rounded-xl border border-border px-5 py-5 transition-colors hover:border-foreground/30 sm:px-6 sm:py-6"
              >
                <Tag>{item.client}</Tag>
                <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-[1.35rem]">
                  {item.title}
                </h3>
                <CaseFacts item={item} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
