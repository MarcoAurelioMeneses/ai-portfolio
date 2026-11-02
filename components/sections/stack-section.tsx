import { site, type StackItem } from "@/content/site";
import { cn } from "@/lib/cn";

function chipClass(item: StackItem): string {
  const light = item.featured === "light" || item.featured === "both";
  const dark = item.featured === "dark" || item.featured === "both";
  return cn(
    "flex h-[4.5rem] items-center justify-center rounded-xl border px-3 text-center text-[15px] font-medium text-foreground sm:text-base",
    light ? "border-accent" : "border-border",
    dark ? "dark:border-accent dark:text-accent" : "dark:border-border",
  );
}

export function StackSection() {
  return (
    <section id={site.stackSection.id} className="scroll-mt-24" aria-labelledby="stack-title">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-10 md:py-24">
        <h2 id="stack-title" className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          {site.stackSection.title}
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {site.stack.map((item) => (
            <li key={item.name} className={chipClass(item)}>
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
