import { Fragment } from "react";
import { site, type CaseStudy } from "@/content/site";

const rows = [
  { key: "context", accent: false },
  { key: "solution", accent: false },
  { key: "stack", accent: false },
  { key: "result", accent: true },
] as const;

export function CaseFacts({ item }: { item: CaseStudy }) {
  return (
    <dl className="mt-5 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-y-2.5 text-sm sm:text-[15px]">
      {rows.map((row) => (
        <Fragment key={row.key}>
          <dt className={row.accent ? "text-accent" : "text-foreground/80"}>
            {site.caseFields[row.key]}
          </dt>
          <dd>{item[row.key]}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
