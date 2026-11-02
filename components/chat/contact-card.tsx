import { ArrowUpRightIcon } from "@/components/icons";

export type ContactCardData = {
  email: string;
  links: Array<{ label: string; href: string }>;
};

export function ContactCard({ contact }: { contact: ContactCardData }) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-background p-3">
      <p className="font-mono text-xs tracking-wide text-accent">/ Contato /</p>
      <a href={`mailto:${contact.email}`} className="mt-2 block font-mono text-sm text-accent">
        {contact.email}
      </a>
      <ul className="mt-2 space-y-1 text-sm">
        {contact.links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-accent"
            >
              {link.label}
              <ArrowUpRightIcon className="size-3.5" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function readContactCard(output: unknown): ContactCardData | null {
  if (!output || typeof output !== "object") return null;
  const record = output as {
    action?: unknown;
    contact?: { email?: unknown; links?: unknown };
  };
  if (record.action !== "show_contact" || !record.contact) return null;
  if (typeof record.contact.email !== "string" || !Array.isArray(record.contact.links)) {
    return null;
  }
  const links = record.contact.links.flatMap((link) => {
    if (!link || typeof link !== "object") return [];
    const item = link as { label?: unknown; href?: unknown };
    if (typeof item.label !== "string" || typeof item.href !== "string") return [];
    return [{ label: item.label, href: item.href }];
  });
  return { email: record.contact.email, links };
}
