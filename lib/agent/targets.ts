import { sectionIds, site, type SectionId } from "@/content/site";

const sections = new Set<string>(sectionIds);

export function isSectionId(value: string): value is SectionId {
  return sections.has(value);
}

export function isCaseId(value: string): boolean {
  return site.cases.some((item) => item.id === value);
}

/** DOM id for a section or a case card. Unknown targets return null. */
export function resolveScrollElementId(target: string): string | null {
  if (isSectionId(target)) return target;
  if (isCaseId(target)) return `case-${target}`;
  return null;
}

export function allowedScrollTargets(): string[] {
  return [...sectionIds, ...site.cases.map((item) => item.id)];
}
