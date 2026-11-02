import { site, type SiteContent } from "@/content/site";

export type KnowledgeChunk = {
  id: string;
  source: string;
  content: string;
};

/**
 * Flat text chunks derived from the site content.
 * The static retriever returns all of them. A pgvector retriever can embed the
 * same shape later without changing the prompt builder.
 */
export function buildKnowledgeChunks(
  content: SiteContent = site,
): KnowledgeChunk[] {
  const tagline = `${content.tagline.lead}${content.tagline.accent}${content.tagline.tail}`;

  const about: KnowledgeChunk = {
    id: "about",
    source: "about",
    content: [
      `Name: ${content.name}`,
      `Tagline: ${tagline}`,
      `Title: ${content.about.title}`,
      `Bio: ${content.about.bio}`,
      `Facts: ${content.about.facts.join("; ")}`,
    ].join("\n"),
  };

  const cases = content.cases.map((item) => ({
    id: `case:${item.id}`,
    source: `case:${item.id}`,
    content: [
      `Case id: ${item.id}`,
      `Client: ${item.client}`,
      `Title: ${item.title}`,
      `Context: ${item.context}`,
      `Solution: ${item.solution}`,
      `Stack: ${item.stack}`,
      `Result: ${item.result}`,
    ].join("\n"),
  }));

  const experience: KnowledgeChunk = {
    id: "experience",
    source: "experience",
    content: content.experience
      .map(
        (item) =>
          `${item.period} — ${item.role} at ${item.company}${item.current ? " (current)" : ""}`,
      )
      .join("\n"),
  };

  const stack: KnowledgeChunk = {
    id: "stack",
    source: "stack",
    content: `Stack: ${content.stack.map((item) => item.name).join(", ")}`,
  };

  const contact: KnowledgeChunk = {
    id: "contact",
    source: "contact",
    content: [
      `Email: ${content.contact.email}`,
      ...content.contact.links.map((link) => `${link.label}: ${link.href}`),
    ].join("\n"),
  };

  return [about, ...cases, experience, stack, contact];
}
