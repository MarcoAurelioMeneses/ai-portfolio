import { Tag } from "@/components/tag";
import { site } from "@/content/site";

export function AboutSection() {
  const { about } = site;
  return (
    <section id={about.id} className="scroll-mt-24" aria-labelledby="about-title">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(0,1.15fr)_17rem] lg:items-center dark:lg:grid-cols-1">
        <div>
          <Tag>{about.label}</Tag>
          <h2
            id="about-title"
            className="mt-4 max-w-[11em] text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.35rem] dark:max-w-none dark:lg:text-5xl"
          >
            {about.title}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground sm:text-lg">
            {about.bio}
          </p>
        </div>
        <ul className="flex flex-col gap-4 dark:sm:flex-row">
          {about.facts.map((fact) => (
            <li
              key={fact}
              className="flex h-[4.5rem] items-center justify-center rounded-xl border border-border px-6 text-center text-lg font-medium dark:flex-1"
            >
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
