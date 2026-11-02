import { site } from "@/content/site";
import { cn } from "@/lib/cn";

export function ExperienceSection() {
  return (
    <section
      id={site.experienceSection.id}
      className="scroll-mt-24"
      aria-labelledby="experience-title"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-10 md:py-24">
        <h2
          id="experience-title"
          className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
        >
          {site.experienceSection.title}
        </h2>
        <ol className="relative mt-12 max-w-3xl sm:mt-16">
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[calc(8.5rem+0.55rem)] hidden w-px bg-border sm:block"
          />
          {site.experience.map((item) => (
            <li
              key={item.id}
              className="grid gap-1 py-5 sm:grid-cols-[8.5rem_1.25rem_minmax(0,1fr)] sm:items-start sm:gap-x-6 sm:py-7"
            >
              <p className="text-sm text-foreground sm:pt-0.5 sm:text-right">{item.period}</p>
              <span className="relative hidden justify-center sm:flex" aria-hidden="true">
                <span
                  className={cn(
                    "z-10 mt-1.5 size-3 rounded-full",
                    item.current ? "bg-accent" : "bg-muted",
                  )}
                />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{item.role}</h3>
                <p className="mt-1 text-muted">{item.company}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
